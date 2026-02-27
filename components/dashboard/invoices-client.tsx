"use client"

import * as React from "react"
import { Plus, Download, Filter, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { InvoiceTable } from "@/components/dashboard/invoice-table"
import { InvoiceDialog } from "@/components/dashboard/invoice-dialog"
import { CreateInvoiceInput, Invoice, Customer } from "@/types/invoice"
import { Product } from "@/types/product"
import { createInvoice } from "@/app/actions/invoices"

interface InvoicesClientProps {
    initialInvoices: Invoice[]
    customers: Customer[]
    products: Product[]
}

export function InvoicesClient({
    initialInvoices,
    customers,
    products
}: InvoicesClientProps) {
    const [open, setOpen] = React.useState(false)

    async function handleSave(data: CreateInvoiceInput) {
        const res = await createInvoice(data)
        if (res.error) {
            toast.error(`Error: ${res.error}`)
            throw new Error(res.error)
        }
        toast.success("Invoice created successfully!")
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
                    <p className="text-muted-foreground">
                        Manage your billing, track payments, and generate invoices.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="hidden sm:flex">
                        <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                    <Button onClick={() => setOpen(true)} size="sm">
                        <Plus className="mr-2 h-4 w-4" /> New Invoice
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search invoices..."
                        className="pl-9 bg-card"
                    />
                </div>
                <Button variant="outline" size="icon" className="h-10 w-10">
                    <Filter className="h-4 w-4" />
                </Button>
            </div>

            <InvoiceTable invoices={initialInvoices} />

            <InvoiceDialog
                open={open}
                onOpenChange={setOpen}
                onSave={handleSave}
                customers={customers}
                products={products}
            />
        </div>
    )
}
