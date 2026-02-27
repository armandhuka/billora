export interface BusinessSettings {
    id: string
    business_id: string
    business_name: string | null
    gst_number: string | null
    address: string | null
    phone: string | null
    email: string | null
    created_at: string
}

export type UpdateSettingsInput = Omit<BusinessSettings, "id" | "business_id" | "created_at">
