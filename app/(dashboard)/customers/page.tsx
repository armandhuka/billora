import { getCustomers } from "@/app/actions/customers"
import { CustomersClient } from "@/components/dashboard/customers-client"

export default async function CustomersPage() {
    const res = await getCustomers()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const customers = (res as any).data || []

    return <CustomersClient initialCustomers={customers} />
}
