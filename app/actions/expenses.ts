"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { ExpenseCategory } from "@/types/expense"

export async function getExpenses() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Not authenticated" }
    }

    return supabase
        .from("expenses")
        .select("*")
        .eq("business_id", user.id)
        .order("created_at", { ascending: false })
}

export async function createExpense(data: {
    category: ExpenseCategory;
    amount: number;
    note?: string | null
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Not authenticated" }
    }

    const { data: expense, error } = await supabase
        .from("expenses")
        .insert({
            ...data,
            business_id: user.id
        })
        .select()
        .single()

    if (error) return { error: error.message }

    revalidatePath("/expenses")
    return { data: expense }
}

export async function updateExpense(id: string, data: {
    category?: ExpenseCategory;
    amount?: number;
    note?: string | null
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Not authenticated" }
    }

    const { data: expense, error } = await supabase
        .from("expenses")
        .update(data)
        .eq("id", id)
        .eq("business_id", user.id)
        .select()
        .single()

    if (error) return { error: error.message }

    revalidatePath("/expenses")
    return { data: expense }
}

export async function deleteExpense(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Not authenticated" }
    }

    const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", id)
        .eq("business_id", user.id)

    if (error) return { error: error.message }

    revalidatePath("/expenses")
    return { success: true }
}
