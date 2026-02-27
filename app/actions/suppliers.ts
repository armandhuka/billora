"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

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

export async function createSupplier(data: {
    name: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Not authenticated" }
    }

    const { data: supplier, error } = await supabase
        .from("suppliers")
        .insert({
            ...data,
            business_id: user.id
        })
        .select()
        .single()

    if (error) return { error: error.message }

    revalidatePath("/suppliers")
    revalidatePath("/purchases")
    return { data: supplier }
}

export async function updateSupplier(id: string, data: {
    name?: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Not authenticated" }
    }

    const { data: supplier, error } = await supabase
        .from("suppliers")
        .update(data)
        .eq("id", id)
        .eq("business_id", user.id)
        .select()
        .single()

    if (error) return { error: error.message }

    revalidatePath("/suppliers")
    revalidatePath("/purchases")
    return { data: supplier }
}

export async function deleteSupplier(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Not authenticated" }
    }

    const { error } = await supabase
        .from("suppliers")
        .delete()
        .eq("id", id)
        .eq("business_id", user.id)

    if (error) return { error: error.message }

    revalidatePath("/suppliers")
    revalidatePath("/purchases")
    return { success: true }
}
