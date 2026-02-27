'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { Invoice, CreateInvoiceInput, Customer } from '@/types/invoice'

export async function getInvoices() {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('invoices')
        .select(`
            *,
            customer:customers(*)
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching invoices:', error)
        return { error: error.message }
    }

    return { data: data as Invoice[] }
}

export async function getCustomers() {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name', { ascending: true })

    if (error) {
        console.error('Error fetching customers:', error)
        return { error: error.message }
    }

    return { data: data as Customer[] }
}

export async function createInvoice(input: CreateInvoiceInput) {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Start a transaction-like approach using Supabase
    // Note: Supabase doesn't support multi-table transactions via the JS client easily 
    // without using RPC. However, we'll perform a multi-insert which is somewhat atomic 
    // for the invoice items if the invoice is created first.

    // 1. Create Invoice
    const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
            business_id: user.id,
            customer_id: input.customer_id,
            invoice_number: input.invoice_number,
            subtotal: input.subtotal,
            gst_total: input.gst_total,
            total_amount: input.total_amount,
            payment_status: input.payment_status
        })
        .select()
        .single()

    if (invoiceError) {
        console.error('Error creating invoice:', invoiceError)
        return { error: invoiceError.message }
    }

    // 2. Create Invoice Items
    const itemsToInsert = input.items.map(item => ({
        invoice_id: invoice.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        gst_rate: item.gst_rate,
        total: item.total
    }))

    const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsToInsert)

    if (itemsError) {
        console.error('Error creating invoice items:', itemsError)
        // Note: In a real production app, you might want to rollback the invoice creation 
        // if items fail, or use an RPC function for true atomicity.
        return { error: itemsError.message }
    }

    revalidatePath('/invoices')
    revalidatePath('/products') // Stock changes via trigger
    return { success: true, data: invoice }
}
