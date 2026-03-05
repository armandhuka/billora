export interface Payment {
    id: string
    business_id: string
    customer_id: string
    invoice_id: string
    amount: number
    payment_method: string
    payment_date: string
    note?: string | null
    created_at: string
    invoice?: {
        id: string
        invoice_number: string
        total_amount: number
    } | null
}

export interface CreatePaymentInput {
    customer_id: string
    invoice_id: string
    amount: number
    payment_method: string
    payment_date: string
    note?: string | null
}
