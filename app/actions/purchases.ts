"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { CreatePurchaseInput } from "@/types/purchase"

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
        return { error: `Purchase created but items failed: ${itemsError.message}` }
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
            total_amount: input.total_amount,
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
        ...item,
        purchase_id: id
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
