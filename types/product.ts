export interface Product {
    id: string
    business_id: string
    name: string
    sku?: string | null
    category?: string | null
    purchase_price?: number | null
    selling_price?: number | null
    gst_rate: number
    stock_quantity: number
    min_stock_level: number
    created_at: string
}

export interface CreateProductInput {
    name: string
    sku?: string | null
    category?: string | null
    purchase_price?: number | null
    selling_price?: number | null
    gst_rate?: number
    stock_quantity?: number
    min_stock_level?: number
}

export type UpdateProductInput = Partial<CreateProductInput> & { id: string }
