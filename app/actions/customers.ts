"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getCustomers() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Not authenticated" }
    }

    return supabase
        .from("customers")
        .select("*")
        .eq("business_id", user.id)
        .order("name")
}

export async function createCustomer(data: {
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

    const { data: customer, error } = await supabase
        .from("customers")
        .insert({
            ...data,
            business_id: user.id
        })
        .select()
        .single()

    if (error) return { error: error.message }

    revalidatePath("/customers")
    revalidatePath("/invoices")
    return { data: customer }
}

export async function updateCustomer(id: string, data: {
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

    const { data: customer, error } = await supabase
        .from("customers")
        .update(data)
        .eq("id", id)
        .eq("business_id", user.id)
        .select()
        .single()

    if (error) return { error: error.message }

    revalidatePath("/customers")
    revalidatePath("/invoices")
    return { data: customer }
}

export async function deleteCustomer(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Not authenticated" }
    }

    const { error } = await supabase
        .from("customers")
        .delete()
        .eq("id", id)
        .eq("business_id", user.id)

    if (error) return { error: error.message }

    revalidatePath("/customers")
    revalidatePath("/invoices")
    return { success: true }
}
