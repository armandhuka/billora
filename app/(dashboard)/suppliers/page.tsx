import { getSuppliers } from "@/app/actions/suppliers"
import { SuppliersClient } from "@/components/dashboard/suppliers-client"

export default async function SuppliersPage() {
    const res = await getSuppliers()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const suppliers = (res as any).data || []

    return <SuppliersClient initialSuppliers={suppliers} />
}
