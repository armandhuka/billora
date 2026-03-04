import { getPublicInvoice } from "@/app/actions/public-invoice"
import { PublicInvoice } from "@/components/invoice/public-invoice"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

interface PageProps {
    params: { id: string }
}

export async function generateMetadata({ params }: PageProps) {
    const { invoice } = await getPublicInvoice(params.id)
    if (!invoice) return { title: "Invoice Not Found" }
    return {
        title: `Invoice ${invoice.invoice_number}`,
        description: `View and pay invoice ${invoice.invoice_number}`,
    }
}

export default async function PublicInvoicePage({ params }: PageProps) {
    const { invoice, settings, error } = await getPublicInvoice(params.id)

    if (error || !invoice) notFound()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <PublicInvoice invoice={invoice as any} settings={settings} />
}
