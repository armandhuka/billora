"use server"

import { createClient } from "@/lib/supabase/server"
import { BusinessSettings, UpdateSettingsInput } from "@/types/settings"
import { revalidatePath } from "next/cache"

export async function getSettings(): Promise<{ data?: BusinessSettings; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Not authenticated" }
    }

    try {
        const { data, error } = await supabase
            .from("business_settings")
            .select("*")
            .eq("business_id", user.id)
            .single()

        if (error) {
            if (error.code === "PGRST116") {
                // If no settings exist yet, create a default entry
                const { data: newData, error: createError } = await supabase
                    .from("business_settings")
                    .insert([{ business_id: user.id }])
                    .select("*")
                    .single()

                if (createError) throw createError
                return { data: newData }
            }
            throw error
        }

        return { data }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        return { error: err.message }
    }
}

export async function updateSettings(data: UpdateSettingsInput): Promise<{ success?: boolean; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Not authenticated" }
    }

    try {
        const { error } = await supabase
            .from("business_settings")
            .upsert({
                business_id: user.id,
                ...data
            }, {
                onConflict: "business_id"
            })

        if (error) throw error

        revalidatePath("/(dashboard)/settings", "page")
        revalidatePath("/(dashboard)/invoices", "page") // Invoices might use settings data
        return { success: true }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        return { error: err.message }
    }
}
