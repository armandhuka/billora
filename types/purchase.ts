import { Product } from "./product"

export type PurchaseStatus = "received" | "pending" | "cancelled"

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
    total_amount: number
    created_at: string
    supplier?: Supplier
}

export interface PurchaseItem {
    id: string
    purchase_id: string
    product_id: string | null
    quantity: number
    cost_price: number
    total: number
    created_at: string
    product?: Product
}

export interface CreatePurchaseInput {
    supplier_id: string
    purchase_number: string
    items: {
        product_id: string
        quantity: number
        cost_price: number
        total: number
    }[]
    total_amount: number
}
