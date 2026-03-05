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

export async function searchCustomers(query: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    const q = query.trim()
    let request = supabase
        .from("customers")
        .select("*")
        .eq("business_id", user.id)
        .order("name")

    if (q) {
        request = request.or(`name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`)
    }

    const { data, error } = await request
    if (error) return { error: error.message }
    return { data }
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

export async function getCustomerLedger(customerId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    // Fetch all invoices for this customer
    const { data: invoices, error } = await supabase
        .from("invoices")
        .select("id, invoice_number, subtotal, discount_amount, gst_total, total_amount, payment_status, created_at")
        .eq("business_id", user.id)
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false })

    if (error) return { error: error.message }

    const list = invoices ?? []

    const totalInvoices = list.length
    const totalPaid = list.filter(i => i.payment_status === "paid").length
    const totalPending = list.filter(i => i.payment_status === "pending").length
    const totalOverdue = list.filter(i => i.payment_status === "overdue").length
    const amountPaid = list.filter(i => i.payment_status === "paid").reduce((s, i) => s + Number(i.total_amount), 0)
    const amountPending = list.filter(i => i.payment_status === "pending").reduce((s, i) => s + Number(i.total_amount), 0)
    const amountOverdue = list.filter(i => i.payment_status === "overdue").reduce((s, i) => s + Number(i.total_amount), 0)
    const totalAmount = list.reduce((s, i) => s + Number(i.total_amount), 0)

    return {
        data: {
            invoices: list,
            stats: {
                totalInvoices,
                totalPaid,
                totalPending,
                totalOverdue,
                amountPaid,
                amountPending,
                amountOverdue,
                totalAmount,
            },
        },
    }
}
