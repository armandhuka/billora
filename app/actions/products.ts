'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { Product, CreateProductInput, UpdateProductInput } from '@/types/product'

export async function getProducts() {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching products:', error)
        return { error: error.message }
    }

    return { data: data as Product[] }
}

export async function saveProduct(input: CreateProductInput | UpdateProductInput) {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const isUpdate = 'id' in input

    if (isUpdate) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...updateData } = input as UpdateProductInput
        const { error } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', id)
            .eq('business_id', user.id)

        if (error) return { error: error.message }
    } else {
        const { error } = await supabase
            .from('products')
            .insert({
                ...input,
                business_id: user.id
            })

        if (error) return { error: error.message }
    }

    revalidatePath('/products')
    return { success: true }
}

export async function deleteProduct(id: string) {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .eq('business_id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/products')
    return { success: true }
}
