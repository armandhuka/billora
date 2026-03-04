import { getProducts } from "@/app/actions/products"
import { getCategories } from "@/app/actions/products"
import { ProductsClient } from "@/components/dashboard/products-client"

export const dynamic = "force-dynamic"

export default async function ProductsPage() {
    const [productsResult, categoriesResult] = await Promise.all([
        getProducts(),
        getCategories(),
    ])

    const products = productsResult.data ?? []
    const categories = categoriesResult.data ?? []

    return <ProductsClient initialProducts={products} categories={categories} />
}
