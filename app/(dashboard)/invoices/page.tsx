import { getInvoices, getCustomers } from "@/app/actions/invoices"
import { getProducts } from "@/app/actions/products"
import { getSettings } from "@/app/actions/settings"
import { InvoicesClient } from "@/components/dashboard/invoices-client"

export default async function InvoicesPage() {
    const [invoicesRes, customersRes, productsRes, settingsRes] = await Promise.all([
        getInvoices(),
        getCustomers(),
        getProducts(),
        getSettings(),
    ])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const invoices = (invoicesRes as any).data || []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const customers = (customersRes as any).data || []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const products = (productsRes as any).data || []
    const settings = settingsRes.data || null

    return (
        <InvoicesClient
            initialInvoices={invoices}
            customers={customers}
            products={products}
            settings={settings}
        />
    )
}
