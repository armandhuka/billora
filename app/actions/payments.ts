"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { CreatePaymentInput } from "@/types/payment"

// ── Record a payment ──
export async function recordPayment(input: CreatePaymentInput) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    // 1. Insert payment record
    const { data: payment, error: payErr } = await supabase
        .from("payments")
        .insert({
            business_id: user.id,
            customer_id: input.customer_id,
            invoice_id: input.invoice_id,
            amount: input.amount,
            payment_method: input.payment_method,
            payment_date: input.payment_date,
            note: input.note || null,
        })
        .select()
        .single()

    if (payErr) return { error: payErr.message }

    // 2. Get total paid for this invoice
    const { data: payments } = await supabase
        .from("payments")
        .select("amount")
        .eq("invoice_id", input.invoice_id)
        .eq("business_id", user.id)

    const totalPaid = (payments || []).reduce((s, p) => s + Number(p.amount), 0)

    // 3. Get invoice total
    const { data: invoice } = await supabase
        .from("invoices")
        .select("total_amount")
        .eq("id", input.invoice_id)
        .single()

    if (invoice) {
        const invoiceTotal = Number(invoice.total_amount)
        let newStatus: string = "pending"
        if (totalPaid >= invoiceTotal) {
            newStatus = "paid"
        } else if (totalPaid > 0) {
            newStatus = "partial"
        }

        // 4. Update invoice payment status
        await supabase
            .from("invoices")
            .update({ payment_status: newStatus })
            .eq("id", input.invoice_id)
            .eq("business_id", user.id)
    }

    revalidatePath("/invoices")
    revalidatePath("/customers")
    return { data: payment }
}

// ── Get payments for an invoice ──
export async function getInvoicePayments(invoiceId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("invoice_id", invoiceId)
        .eq("business_id", user.id)
        .order("payment_date", { ascending: false })

    if (error) return { error: error.message }
    return { data }
}

// ── Full customer ledger with invoices + payments merged ──
export async function getCustomerLedgerFull(customerId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    // Fetch invoices
    const { data: invoices, error: invErr } = await supabase
        .from("invoices")
        .select("id, invoice_number, subtotal, discount_amount, gst_total, total_amount, payment_status, created_at")
        .eq("business_id", user.id)
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false })

    if (invErr) return { error: invErr.message }

    // Fetch payments
    const { data: payments, error: payErr } = await supabase
        .from("payments")
        .select("id, invoice_id, amount, payment_method, payment_date, note, created_at")
        .eq("business_id", user.id)
        .eq("customer_id", customerId)
        .order("payment_date", { ascending: false })

    if (payErr) return { error: payErr.message }

    const invList = invoices ?? []
    const payList = payments ?? []

    // Build transaction timeline
    type Transaction = {
        id: string
        date: string
        type: "invoice" | "payment"
        reference: string
        amount: number
        status?: string
        method?: string
        note?: string
    }

    const transactions: Transaction[] = [
        ...invList.map(inv => ({
            id: inv.id,
            date: inv.created_at,
            type: "invoice" as const,
            reference: inv.invoice_number,
            amount: Number(inv.total_amount),
            status: inv.payment_status,
        })),
        ...payList.map(pay => ({
            id: pay.id,
            date: pay.payment_date || pay.created_at,
            type: "payment" as const,
            reference: invList.find(i => i.id === pay.invoice_id)?.invoice_number || "—",
            amount: Number(pay.amount),
            method: pay.payment_method,
            note: pay.note ?? undefined,
        })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Stats
    const totalInvoiced = invList.reduce((s, i) => s + Number(i.total_amount), 0)
    const totalPaid = payList.reduce((s, p) => s + Number(p.amount), 0)
    const outstanding = totalInvoiced - totalPaid
    const lastPayment = payList.length > 0 ? payList[0].payment_date || payList[0].created_at : null
    const totalInvoices = invList.length
    const invoicesPaid = invList.filter(i => i.payment_status === "paid").length
    const invoicesPending = invList.filter(i => i.payment_status === "pending" || i.payment_status === "partial").length

    return {
        data: {
            transactions,
            invoices: invList,
            payments: payList,
            stats: {
                totalInvoices,
                totalInvoiced,
                totalPaid,
                outstanding,
                invoicesPaid,
                invoicesPending,
                lastPayment,
            },
        },
    }
}
