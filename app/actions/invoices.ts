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
            customer:customers(*),
            items:invoice_items(*, product:products(*))
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
        return { error: itemsError.message }
    }

    revalidatePath('/invoices')
    revalidatePath('/products')
    return { success: true, data: invoice }
}

export async function updateInvoice(id: string, input: CreateInvoiceInput) {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // 1. Update Invoice
    const { error: invoiceError } = await supabase
        .from('invoices')
        .update({
            customer_id: input.customer_id,
            invoice_number: input.invoice_number,
            subtotal: input.subtotal,
            gst_total: input.gst_total,
            total_amount: input.total_amount,
            payment_status: input.payment_status
        })
        .eq('id', id)
        .eq('business_id', user.id)

    if (invoiceError) {
        console.error('Error updating invoice:', invoiceError)
        return { error: invoiceError.message }
    }

    // 2. Delete existing items and re-insert (simplest way to update)
    const { error: deleteError } = await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', id)

    if (deleteError) {
        console.error('Error deleting old items:', deleteError)
        return { error: deleteError.message }
    }

    // 3. Insert new items
    const itemsToInsert = input.items.map(item => ({
        invoice_id: id,
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
        console.error('Error updating invoice items:', itemsError)
        return { error: itemsError.message }
    }

    revalidatePath('/invoices')
    revalidatePath('/products')
    return { success: true }
}

export async function deleteInvoice(id: string) {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // RLS and Cascade Delete should handle items, but triggers handle stock.
    // We should ensure stock is reverted if necessary, but current trigger only REDUCES on insert.
    // If we want to REVERT stock on delete, we'd need a delete trigger. 
    // For now, let's just delete the invoice.

    const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id)
        .eq('business_id', user.id)

    if (error) {
        console.error('Error deleting invoice:', error)
        return { error: error.message }
    }

    revalidatePath('/invoices')
    revalidatePath('/products')
    return { success: true }
}
