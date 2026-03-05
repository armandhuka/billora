import { Product } from "./product"

export type PurchaseStatus = "draft" | "ordered" | "received" | "cancelled"
export type PurchasePaymentStatus = "unpaid" | "partial" | "paid"

export interface Supplier {
    id: string
    business_id: string
    name: string
    email?: string
    phone?: string
    address?: string
    created_at: string
}

export interface Purchase {
    id: string
    business_id: string
    supplier_id: string | null
    purchase_number: string
    status: PurchaseStatus
    payment_status: PurchasePaymentStatus
    subtotal: number
    discount_amount: number
    tax_total: number
    total_amount: number
    paid_amount: number
    payment_method?: string | null
    payment_date?: string | null
    expected_delivery_date?: string | null
    notes?: string | null
    created_at: string
    supplier?: Supplier
    items?: PurchaseItem[]
}

export interface PurchaseItem {
    id: string
    purchase_id: string
    product_id: string | null
    quantity: number
    cost_price: number
    discount: number
    tax_rate: number
    total: number
    created_at: string
    product?: Product
}

export interface CreatePurchaseInput {
    supplier_id: string
    purchase_number: string
    status: PurchaseStatus
    payment_status: PurchasePaymentStatus
    subtotal: number
    discount_amount: number
    tax_total: number
    total_amount: number
    paid_amount: number
    payment_method?: string | null
    payment_date?: string | null
    expected_delivery_date?: string | null
    notes?: string | null
    items: {
        product_id: string
        quantity: number
        cost_price: number
        discount: number
        tax_rate: number
        total: number
    }[]
}
