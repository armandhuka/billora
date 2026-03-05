"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { CreatePurchaseInput, PurchaseStatus } from "@/types/purchase"
import { logStockMovement } from "@/app/actions/stock-logs"

export async function getPurchases() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Not authenticated" }
    }

    return supabase
        .from("purchases")
        .select(`
            *,
            supplier:suppliers(*),
            items:purchase_items(*, product:products(*))
        `)
        .eq("business_id", user.id)
        .order("created_at", { ascending: false })
}

export async function searchPurchases(query: string, statusFilter?: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    const q = query.trim()
    let request = supabase
        .from("purchases")
        .select(`
            *,
            supplier:suppliers(*),
            items:purchase_items(*, product:products(*))
        `)
        .eq("business_id", user.id)
        .order("created_at", { ascending: false })

    if (q) {
        request = request.ilike("purchase_number", `%${q}%`)
    }

    if (statusFilter && statusFilter !== "all") {
        request = request.eq("status", statusFilter)
    }

    const { data, error } = await request
    if (error) return { error: error.message }
    return { data }
}

export async function createPurchase(input: CreatePurchaseInput) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Not authenticated" }
    }

    // 1. Create the purchase record
    const { data: purchase, error: purchaseError } = await supabase
        .from("purchases")
        .insert({
            business_id: user.id,
            supplier_id: input.supplier_id,
            purchase_number: input.purchase_number,
            status: input.status || "ordered",
            payment_status: input.payment_status || "unpaid",
            subtotal: input.subtotal || 0,
            discount_amount: input.discount_amount || 0,
            tax_total: input.tax_total || 0,
            total_amount: input.total_amount,
            paid_amount: input.paid_amount || 0,
            payment_method: input.payment_method || null,
            payment_date: input.payment_date || null,
            expected_delivery_date: input.expected_delivery_date || null,
            notes: input.notes || null,
        })
        .select()
        .single()

    if (purchaseError) {
        return { error: purchaseError.message }
    }

    // 2. Create the purchase items
    const itemsWithId = input.items.map(item => ({
        purchase_id: purchase.id,
        product_id: item.product_id,
        quantity: item.quantity,
        cost_price: item.cost_price,
        discount: item.discount || 0,
        tax_rate: item.tax_rate || 0,
        total: item.total,
    }))

    const { error: itemsError } = await supabase
        .from("purchase_items")
        .insert(itemsWithId)

    if (itemsError) {
        return { error: `Purchase created but items failed: ${itemsError.message}` }
    }

    // 3. Log stock movements only when status is "received"
    if (input.status === "received") {
        for (const item of input.items) {
            if (item.product_id) {
                await logStockMovement({
                    supabase,
                    businessId: user.id,
                    productId: item.product_id,
                    type: 'purchase',
                    quantity: item.quantity,
                    referenceId: purchase.id,
                    note: `Purchase ${input.purchase_number}`,
                })
            }
        }
    }

    revalidatePath("/purchases")
    revalidatePath("/products")
    return { data: purchase }
}

export async function updatePurchase(id: string, input: CreatePurchaseInput) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Not authenticated" }
    }

    // 1. Update the purchase record
    const { error: purchaseError } = await supabase
        .from("purchases")
        .update({
            supplier_id: input.supplier_id,
            purchase_number: input.purchase_number,
            status: input.status || "ordered",
            payment_status: input.payment_status || "unpaid",
            subtotal: input.subtotal || 0,
            discount_amount: input.discount_amount || 0,
            tax_total: input.tax_total || 0,
            total_amount: input.total_amount,
            paid_amount: input.paid_amount || 0,
            payment_method: input.payment_method || null,
            payment_date: input.payment_date || null,
            expected_delivery_date: input.expected_delivery_date || null,
            notes: input.notes || null,
        })
        .eq("id", id)
        .eq("business_id", user.id)

    if (purchaseError) {
        return { error: purchaseError.message }
    }

    // 2. Handle purchase items: delete old ones and insert new ones
    const { error: deleteError } = await supabase
        .from("purchase_items")
        .delete()
        .eq("purchase_id", id)

    if (deleteError) {
        return { error: `Failed to update items: ${deleteError.message}` }
    }

    const itemsWithId = input.items.map(item => ({
        purchase_id: id,
        product_id: item.product_id,
        quantity: item.quantity,
        cost_price: item.cost_price,
        discount: item.discount || 0,
        tax_rate: item.tax_rate || 0,
        total: item.total,
    }))

    const { error: itemsError } = await supabase
        .from("purchase_items")
        .insert(itemsWithId)

    if (itemsError) {
        return { error: `Purchase items failed to update: ${itemsError.message}` }
    }

    revalidatePath("/purchases")
    revalidatePath("/products")
    revalidatePath("/reports")
    return { success: true }
}

export async function deletePurchase(id: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Not authenticated" }
    }

    const { error } = await supabase
        .from("purchases")
        .delete()
        .eq("id", id)
        .eq("business_id", user.id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath("/purchases")
    revalidatePath("/products")
    revalidatePath("/reports")
    return { success: true }
}

// ── Duplicate a purchase ──
export async function duplicatePurchase(sourceId: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    // Fetch source purchase + items
    const { data: source, error: fetchErr } = await supabase
        .from("purchases")
        .select("*, items:purchase_items(*)")
        .eq("id", sourceId)
        .eq("business_id", user.id)
        .single()

    if (fetchErr || !source) return { error: fetchErr?.message ?? "Not found" }

    // Create clone as draft
    const newNumber = `PO-${Date.now().toString().slice(-6)}`
    const { data: newPurchase, error: createErr } = await supabase
        .from("purchases")
        .insert({
            business_id: user.id,
            supplier_id: source.supplier_id,
            purchase_number: newNumber,
            status: "draft" as PurchaseStatus,
            payment_status: "unpaid",
            subtotal: source.subtotal ?? source.total_amount,
            discount_amount: source.discount_amount ?? 0,
            tax_total: source.tax_total ?? 0,
            total_amount: source.total_amount,
            paid_amount: 0,
            expected_delivery_date: null,
            notes: `Duplicated from ${source.purchase_number}`,
        })
        .select()
        .single()

    if (createErr || !newPurchase) return { error: createErr?.message ?? "Failed to duplicate" }

    // Clone items
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clonedItems = (source.items || []).map((item: any) => ({
        purchase_id: newPurchase.id,
        product_id: item.product_id,
        quantity: item.quantity,
        cost_price: item.cost_price,
        discount: item.discount ?? 0,
        tax_rate: item.tax_rate ?? 0,
        total: item.total,
    }))

    if (clonedItems.length > 0) {
        await supabase.from("purchase_items").insert(clonedItems)
    }

    revalidatePath("/purchases")
    return { data: newPurchase }
}

// ── Update status only ──
export async function updatePurchaseStatus(id: string, status: PurchaseStatus) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    // If marking as received, log stock movements
    if (status === "received") {
        const { data: purchase } = await supabase
            .from("purchases")
            .select("*, items:purchase_items(*)")
            .eq("id", id)
            .eq("business_id", user.id)
            .single()

        if (purchase && purchase.status !== "received") {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            for (const item of (purchase.items || []) as any[]) {
                if (item.product_id) {
                    await logStockMovement({
                        supabase,
                        businessId: user.id,
                        productId: item.product_id,
                        type: 'purchase',
                        quantity: item.quantity,
                        referenceId: id,
                        note: `Purchase ${purchase.purchase_number} received`,
                    })
                }
            }
        }
    }

    const { error } = await supabase
        .from("purchases")
        .update({ status })
        .eq("id", id)
        .eq("business_id", user.id)

    if (error) return { error: error.message }

    revalidatePath("/purchases")
    revalidatePath("/products")
    return { success: true }
}

// ── Purchase Analytics ──
export async function getPurchaseAnalytics() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    const { data: purchases, error } = await supabase
        .from("purchases")
        .select("id, total_amount, status, supplier_id, created_at, supplier:suppliers(name)")
        .eq("business_id", user.id)

    if (error) return { error: error.message }

    const list = purchases ?? []
    const now = new Date()
    const thisMonth = list.filter(p => {
        const d = new Date(p.created_at)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })

    // Top supplier
    const supplierTotals: Record<string, { name: string; amount: number }> = {}
    for (const p of list) {
        const sid = p.supplier_id || "unknown"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sname = (p.supplier as any)?.name || "Unknown"
        if (!supplierTotals[sid]) supplierTotals[sid] = { name: sname, amount: 0 }
        supplierTotals[sid].amount += Number(p.total_amount)
    }
    const topSupplier = Object.values(supplierTotals).sort((a, b) => b.amount - a.amount)[0] ?? null

    return {
        data: {
            totalPurchases: list.length,
            totalSpent: list.reduce((s, p) => s + Number(p.total_amount), 0),
            monthlyPurchases: thisMonth.length,
            monthlySpent: thisMonth.reduce((s, p) => s + Number(p.total_amount), 0),
            topSupplier,
            received: list.filter(p => p.status === "received").length,
            ordered: list.filter(p => p.status === "ordered").length,
            draft: list.filter(p => p.status === "draft").length,
        },
    }
}
