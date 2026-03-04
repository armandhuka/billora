"use server"

import { createClient } from "@/lib/supabase/server"

/**
 * Public read-only invoice fetch.
 * No authentication required — only reads public invoice data by ID.
 */
export async function getPublicInvoice(invoiceId: string) {
    const supabase = await createClient()

    try {
        const { data: invoice, error } = await supabase
            .from("invoices")
            .select(`
                id,
                invoice_number,
                subtotal,
                gst_total,
                total_amount,
                payment_status,
                created_at,
                business_id,
                customer:customers(id, name, email, phone, address),
                items:invoice_items(
                    id,
                    quantity,
                    price,
                    gst_rate,
                    total,
                    product:products(id, name, sku)
                )
            `)
            .eq("id", invoiceId)
            .single()

        if (error) throw error

        // Fetch business settings for branding (UPI ID, name, address etc.)
        const { data: settings } = await supabase
            .from("business_settings")
            .select("business_name, address, phone, email, gst_number, upi_id, currency_code, currency_symbol")
            .eq("business_id", invoice.business_id)
            .single()

        return { invoice, settings: settings ?? null }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        return { invoice: null, settings: null, error: err.message }
    }
}
