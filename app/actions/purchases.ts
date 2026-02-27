"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { CreatePurchaseInput } from "@/types/purchase"

export async function getSuppliers() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Not authenticated" }
    }

    return supabase
        .from("suppliers")
        .select("*")
        .eq("business_id", user.id)
        .order("name")
}

export async function getPurchases() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Not authenticated" }
    }

    return supabase
        .from("purchases")
        .select(`
            *,
            supplier:suppliers(*)
        `)
        .eq("business_id", user.id)
        .order("created_at", { ascending: false })
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
            total_amount: input.total_amount,
        })
        .select()
        .single()

    if (purchaseError) {
        return { error: purchaseError.message }
    }

    // 2. Create the purchase items
    const itemsWithId = input.items.map(item => ({
        ...item,
        purchase_id: purchase.id
    }))

    const { error: itemsError } = await supabase
        .from("purchase_items")
        .insert(itemsWithId)

    if (itemsError) {
        // Since we don't have transactions in the JS client easily, we should handle this
        // In a real app, you'd want to use an RPC function for atomicity
        return { error: `Purchase created but items failed: ${itemsError.message}` }
    }

    revalidatePath("/purchases")
    revalidatePath("/products")
    return { data: purchase }
}

export async function createSupplier(data: { name: string; email?: string; phone?: string; address?: string }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Not authenticated" }
    }

    return supabase
        .from("suppliers")
        .insert({
            ...data,
            business_id: user.id
        })
        .select()
        .single()
}
