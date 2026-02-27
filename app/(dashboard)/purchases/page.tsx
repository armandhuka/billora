import { getPurchases, getSuppliers } from "@/app/actions/purchases"
import { getProducts } from "@/app/actions/products"
import { PurchasesClient } from "@/components/dashboard/purchases-client"

export default async function PurchasesPage() {
    const [purchasesRes, suppliersRes, productsRes] = await Promise.all([
        getPurchases(),
        getSuppliers(),
        getProducts()
    ])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const purchases = (purchasesRes as any).data || []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const suppliers = (suppliersRes as any).data || []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const products = (productsRes as any).data || []

    return (
        <PurchasesClient
            initialPurchases={purchases}
            suppliers={suppliers}
            products={products}
        />
    )
}
