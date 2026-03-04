'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { Product, CreateProductInput, UpdateProductInput, Category, ProductVariant } from '@/types/product'

async function getAuthedClient() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { supabase, user: null }
    return { supabase, user }
}

// ─── Core CRUD ───────────────────────────────────────────────────────────────

export async function getProducts() {
    const { supabase, user } = await getAuthedClient()
    if (!user) return { error: 'Unauthorized' }

    const { data, error } = await supabase
        .from('products')
        .select('*, variants:product_variants(*)')
        .eq('business_id', user.id)
        .order('created_at', { ascending: false })

    if (error) return { error: error.message }
    return { data: data as Product[] }
}

export async function searchProducts(
    query: string,
    filters?: { status?: 'active' | 'inactive' | 'all'; stock?: 'low' | 'out' | 'all'; category?: string }
) {
    const { supabase, user } = await getAuthedClient()
    if (!user) return { error: 'Unauthorized' }

    const q = query.trim()
    let request = supabase
        .from('products')
        .select('*, variants:product_variants(*)')
        .eq('business_id', user.id)
        .order('created_at', { ascending: false })

    if (q) {
        request = request.or(`name.ilike.%${q}%,sku.ilike.%${q}%,category.ilike.%${q}%,barcode.ilike.%${q}%`)
    }

    if (filters?.status === 'active') request = request.eq('is_active', true)
    if (filters?.status === 'inactive') request = request.eq('is_active', false)
    if (filters?.category && filters.category !== 'all') request = request.eq('category', filters.category)

    const { data, error } = await request
    if (error) return { error: error.message }

    let result = data as Product[]

    // Stock filters applied client-side since they need comparison
    if (filters?.stock === 'low') {
        result = result.filter(p => p.stock_quantity > 0 && p.stock_quantity <= p.min_stock_level)
    } else if (filters?.stock === 'out') {
        result = result.filter(p => p.stock_quantity === 0)
    }

    return { data: result }
}

export async function saveProduct(input: CreateProductInput | UpdateProductInput) {
    const { supabase, user } = await getAuthedClient()
    if (!user) return { error: 'Unauthorized' }

    const isUpdate = 'id' in input

    if (isUpdate) {
        const { id, ...updateData } = input as UpdateProductInput
        const { error } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', id)
            .eq('business_id', user.id)
        if (error) return { error: error.message }
    } else {
        // Auto-generate SKU if not provided
        const sku = (input as CreateProductInput).sku?.trim() ||
            `SKU-${Date.now().toString(36).toUpperCase()}`
        const { error } = await supabase
            .from('products')
            .insert({ ...input, sku, business_id: user.id })
        if (error) return { error: error.message }
    }

    revalidatePath('/products')
    return { success: true }
}

export async function deleteProduct(id: string) {
    const { supabase, user } = await getAuthedClient()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .eq('business_id', user.id)

    if (error) return { error: error.message }
    revalidatePath('/products')
    return { success: true }
}

// ─── Status Toggle ────────────────────────────────────────────────────────────

export async function toggleProductActive(id: string, isActive: boolean) {
    const { supabase, user } = await getAuthedClient()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('products')
        .update({ is_active: isActive })
        .eq('id', id)
        .eq('business_id', user.id)

    if (error) return { error: error.message }
    revalidatePath('/products')
    return { success: true }
}

// ─── Bulk Actions ─────────────────────────────────────────────────────────────

export async function bulkDeleteProducts(ids: string[]) {
    const { supabase, user } = await getAuthedClient()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('products')
        .delete()
        .in('id', ids)
        .eq('business_id', user.id)

    if (error) return { error: error.message }
    revalidatePath('/products')
    return { success: true }
}

export async function bulkToggleActive(ids: string[], isActive: boolean) {
    const { supabase, user } = await getAuthedClient()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('products')
        .update({ is_active: isActive })
        .in('id', ids)
        .eq('business_id', user.id)

    if (error) return { error: error.message }
    revalidatePath('/products')
    return { success: true }
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories() {
    const { supabase, user } = await getAuthedClient()
    if (!user) return { error: 'Unauthorized', data: [] as Category[] }

    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('business_id', user.id)
        .order('name')

    if (error) return { error: error.message, data: [] as Category[] }
    return { data: data as Category[] }
}

export async function saveCategory(name: string) {
    const { supabase, user } = await getAuthedClient()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('categories')
        .insert({ name: name.trim(), business_id: user.id })

    if (error) return { error: error.message }
    return { success: true }
}

export async function deleteCategory(id: string) {
    const { supabase, user } = await getAuthedClient()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('business_id', user.id)

    if (error) return { error: error.message }
    return { success: true }
}

// ─── Variants ─────────────────────────────────────────────────────────────────

export async function saveVariant(productId: string, variant: Partial<ProductVariant> & { name: string }) {
    const { supabase, user } = await getAuthedClient()
    if (!user) return { error: 'Unauthorized' }

    if (variant.id) {
        const { id, ...updateData } = variant
        const { error } = await supabase.from('product_variants').update(updateData).eq('id', id)
        if (error) return { error: error.message }
    } else {
        const { error } = await supabase.from('product_variants').insert({ ...variant, product_id: productId })
        if (error) return { error: error.message }
    }
    return { success: true }
}

export async function deleteVariant(id: string) {
    const { supabase } = await getAuthedClient()
    const { error } = await supabase.from('product_variants').delete().eq('id', id)
    if (error) return { error: error.message }
    return { success: true }
}

// ─── Image Upload ─────────────────────────────────────────────────────────────

export async function updateProductImage(productId: string, imageUrl: string) {
    const { supabase, user } = await getAuthedClient()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('products')
        .update({ image_url: imageUrl })
        .eq('id', productId)
        .eq('business_id', user.id)

    if (error) return { error: error.message }
    return { success: true }
}

// ─── CSV Import ───────────────────────────────────────────────────────────────

export async function importProductsFromCsv(rows: CreateProductInput[]) {
    const { supabase, user } = await getAuthedClient()
    if (!user) return { error: 'Unauthorized' }

    const withBusiness = rows.map(row => ({
        ...row,
        business_id: user.id,
        sku: row.sku?.trim() || `SKU-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
        is_active: true,
    }))

    const { error } = await supabase.from('products').insert(withBusiness)
    if (error) return { error: error.message }

    revalidatePath('/products')
    return { success: true, count: rows.length }
}

// ─── Product Detail (for detail page) ────────────────────────────────────────

export async function getProductDetail(id: string) {
    const { supabase, user } = await getAuthedClient()
    if (!user) return { error: 'Unauthorized' }

    const { data: product, error } = await supabase
        .from('products')
        .select('*, variants:product_variants(*)')
        .eq('id', id)
        .eq('business_id', user.id)
        .single()

    if (error) return { error: error.message }

    // Fetch sales history (invoice items)
    const { data: salesHistory } = await supabase
        .from('invoice_items')
        .select('*, invoice:invoices(invoice_number, created_at, payment_status)')
        .eq('product_id', id)
        .order('created_at', { ascending: false })
        .limit(20)

    // Fetch purchase history
    const { data: purchaseHistory } = await supabase
        .from('purchase_items')
        .select('*, purchase:purchases(reference_number, created_at)')
        .eq('product_id', id)
        .order('created_at', { ascending: false })
        .limit(20)

    return {
        product: product as Product,
        salesHistory: salesHistory || [],
        purchaseHistory: purchaseHistory || [],
    }
}
