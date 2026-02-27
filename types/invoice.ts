import { Product } from './product'

export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled'

export interface Customer {
    id: string
    business_id: string
    name: string
    email?: string | null
    phone?: string | null
    address?: string | null
    created_at: string
}

export interface Invoice {
    id: string
    business_id: string
    customer_id?: string | null
    invoice_number: string
    subtotal: number
    gst_total: number
    total_amount: number
    payment_status: PaymentStatus
    created_at: string
    customer?: Customer | null
    items?: InvoiceItem[]
}

export interface InvoiceItem {
    id: string
    invoice_id: string
    product_id?: string | null
    quantity: number
    price: number
    gst_rate: number
    total: number
    created_at: string
    product?: Product | null
}

export interface CreateInvoiceInput {
    customer_id?: string | null
    invoice_number: string
    subtotal: number
    gst_total: number
    total_amount: number
    payment_status: PaymentStatus
    items: {
        product_id?: string | null
        quantity: number
        price: number
        gst_rate: number
        total: number
    }[]
}
