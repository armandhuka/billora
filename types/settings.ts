export interface BusinessSettings {
    id: string
    business_id: string
    business_name: string | null
    gst_number: string | null
    address: string | null
    phone: string | null
    email: string | null
    country: string | null
    currency_code: string | null
    currency_symbol: string | null
    created_at: string
}

export type UpdateSettingsInput = Omit<BusinessSettings, "id" | "business_id" | "created_at">
