'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type StockMovementType = 'purchase' | 'sale' | 'adjustment'

export interface StockLog {
    id: string
    business_id: string
    product_id: string
    type: StockMovementType
    quantity: number          // positive = stock in, negative = stock out
    reference_id?: string | null
    note?: string | null
    created_at: string
    product?: { name: string; sku?: string | null } | null
}

// ─── Read ──────────────────────────────────────────────────────────────────

export async function getStockLogs(productId?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized', data: [] as StockLog[] }

    let query = supabase
        .from('stock_logs')
        .select('*, product:products(name, sku)')
        .eq('business_id', user.id)
        .order('created_at', { ascending: false })
        .limit(200)

    if (productId) {
        query = query.eq('product_id', productId)
    }

    const { data, error } = await query
    if (error) return { error: error.message, data: [] as StockLog[] }
    return { data: data as StockLog[] }
}

// ─── Write (internal helper used by purchase/invoice actions) ─────────────

export async function logStockMovement(params: {
    supabase: Awaited<ReturnType<typeof createClient>>
    businessId: string
    productId: string
    type: StockMovementType
    quantity: number          // positive = in, negative = out
    referenceId?: string
    note?: string
}) {
    const { supabase, businessId, productId, type, quantity, referenceId, note } = params

    // 1. Insert stock_log entry
    const { error: logError } = await supabase.from('stock_logs').insert({
        business_id: businessId,
        product_id: productId,
        type,
        quantity,
        reference_id: referenceId ?? null,
        note: note ?? null,
    })

    if (logError) {
        console.error('stock_log insert failed:', logError.message)
        // Non-fatal: log error but don't block the parent operation
        return
    }

    // 2. Update product stock_quantity using RPC increment
    const { error: stockError } = await supabase.rpc('increment_stock', {
        p_product_id: productId,
        p_delta: quantity,
    })

    if (stockError) {
        console.error('increment_stock failed:', stockError.message)
        // Fallback: manual update
        const { data: product } = await supabase
            .from('products')
            .select('stock_quantity')
            .eq('id', productId)
            .single()

        if (product) {
            const newQty = Math.max(0, (product.stock_quantity || 0) + quantity)
            await supabase
                .from('products')
                .update({ stock_quantity: newQty })
                .eq('id', productId)
        }
    }
}

// ─── Manual Stock Adjustment ──────────────────────────────────────────────

export async function adjustStock(input: {
    productId: string
    quantity: number      // signed: +10 means add 10, -5 means remove 5
    note?: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    await logStockMovement({
        supabase,
        businessId: user.id,
        productId: input.productId,
        type: 'adjustment',
        quantity: input.quantity,
        note: input.note || 'Manual adjustment',
    })

    revalidatePath('/products')
    revalidatePath(`/products/${input.productId}`)
    return { success: true }
}
