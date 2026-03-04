export interface Product {
    id: string
    business_id: string
    name: string
    sku?: string | null
    category?: string | null
    description?: string | null
    unit?: string | null
    barcode?: string | null
    purchase_price?: number | null
    selling_price?: number | null
    gst_rate: number
    stock_quantity: number
    min_stock_level: number
    is_active: boolean
    image_url?: string | null
    created_at: string
    variants?: ProductVariant[]
}

export interface ProductVariant {
    id: string
    product_id: string
    name: string
    sku?: string | null
    price?: number | null
    stock_quantity: number
    created_at: string
}

export interface Category {
    id: string
    business_id: string
    name: string
    created_at: string
}

export interface CreateProductInput {
    name: string
    sku?: string | null
    category?: string | null
    description?: string | null
    unit?: string | null
    barcode?: string | null
    purchase_price?: number | null
    selling_price?: number | null
    gst_rate?: number
    stock_quantity?: number
    min_stock_level?: number
    is_active?: boolean
    image_url?: string | null
}

export type UpdateProductInput = Partial<CreateProductInput> & { id: string }
