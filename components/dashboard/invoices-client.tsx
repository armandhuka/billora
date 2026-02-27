"use client"

import * as React from "react"
import { Plus, Download, Filter, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { InvoiceTable } from "@/components/dashboard/invoice-table"
import { InvoiceDialog } from "@/components/dashboard/invoice-dialog"
import { InvoiceViewDialog } from "@/components/dashboard/invoice-view-dialog"
import { Invoice, CreateInvoiceInput, Customer } from "@/types/invoice"
import { Product } from "@/types/product"
import { createInvoice, updateInvoice, deleteInvoice } from "@/app/actions/invoices"

interface InvoicesClientProps {
    initialInvoices: Invoice[]
    customers: Customer[]
    products: Product[]
}

export function InvoicesClient({ initialInvoices, customers, products }: InvoicesClientProps) {
    const [open, setOpen] = React.useState(false)
    const [viewOpen, setViewOpen] = React.useState(false)
    const [selectedInvoice, setSelectedInvoice] = React.useState<Invoice | null>(null)
    const [searchQuery, setSearchQuery] = React.useState("")

    const filteredInvoices = initialInvoices.filter(invoice =>
        invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.customer?.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleAdd = () => {
        setSelectedInvoice(null)
        setOpen(true)
    }

    const handleEdit = (invoice: Invoice) => {
        setSelectedInvoice(invoice)
        setOpen(true)
    }

    const handleView = (invoice: Invoice) => {
        setSelectedInvoice(invoice)
        setViewOpen(true)
    }

    const handleSave = async (data: CreateInvoiceInput) => {
        const res = selectedInvoice
            ? await updateInvoice(selectedInvoice.id, data)
            : await createInvoice(data)

        if (res.error) {
            toast.error(`Error: ${res.error}`)
            throw new Error(res.error)
        }

        toast.success(selectedInvoice ? "Invoice updated!" : "Invoice created!")
    }

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this invoice? This will also revert stock changes if applicable.")) {
            const res = await deleteInvoice(id)
            if (res.error) {
                toast.error(`Error: ${res.error}`)
            } else {
                toast.success("Invoice deleted successfully.")
            }
        }
    }

    const handleDownload = (invoice: Invoice) => {
        toast.info(`Generating PDF for ${invoice.invoice_number}...`)
        // Simple print-based PDF generation
        const printWindow = window.open('', '_blank')
        if (printWindow) {
            // We can inject a styled HTML here for printing
            // For now, let's keep it simple or implement a dedicated PDF action
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Invoice ${invoice.invoice_number}</title>
                        <style>
                            body { font-family: sans-serif; padding: 40px; }
                            .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
                            .invoice-title { font-size: 24px; font-bold; }
                            .details { display: grid; grid-template-cols: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
                            table { width: 100%; border-collapse: collapse; }
                            th, td { padding: 12px; border-bottom: 1px solid #eee; text-align: left; }
                            th { background: #f9f9f9; }
                            .totals { margin-top: 40px; text-align: right; }
                            .total-row { font-size: 18px; font-weight: bold; margin-top: 10px; }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <div class="invoice-title">INVOICE: ${invoice.invoice_number}</div>
                            <div>Date: ${new Date(invoice.created_at).toLocaleDateString()}</div>
                        </div>
                        <div class="details">
                            <div>
                                <strong>From:</strong><br>
                                Your Business Name<br>
                                Business Address Line
                            </div>
                            <div>
                                <strong>Bill To:</strong><br>
                                ${invoice.customer?.name || 'Guest'}<br>
                                ${invoice.customer?.address || ''}<br>
                                ${invoice.customer?.email || ''}
                            </div>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Qty</th>
                                    <th>Price</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${(invoice.items || []).map((item, idx) => `
                                    <tr key="${idx}" class="hover:bg-muted/30 transition-colors">
                                        <td class="px-4 py-4">
                                            <p class="font-medium text-primary">${item.product?.name || "Product"}</p>
                                            <p class="text-xs text-muted-foreground">${item.product?.sku || ""}</p>
                                        </td>
                                        <td>${item.quantity}</td>
                                        <td>$${item.price.toFixed(2)}</td>
                                        <td>$${item.total.toFixed(2)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        <div class="totals">
                            <div>Subtotal: $${invoice.subtotal.toFixed(2)}</div>
                            <div>GST: $${invoice.gst_total.toFixed(2)}</div>
                            <div class="total-row">Total: $${invoice.total_amount.toFixed(2)}</div>
                        </div>
                    </body>
                </html>
            `)
            printWindow.document.close()
            printWindow.print()
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
                    <p className="text-muted-foreground">
                        Manage your sales invoices, track payments, and generate receipts.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="hidden sm:flex">
                        <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                    <Button onClick={handleAdd} size="sm" className="bg-primary hover:bg-primary/90">
                        <Plus className="mr-2 h-4 w-4" /> Create Invoice
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search invoices..."
                        className="pl-9 bg-card"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" size="icon" className="h-10 w-10">
                    <Filter className="h-4 w-4" />
                </Button>
            </div>

            <InvoiceTable
                invoices={filteredInvoices}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
                onDownload={handleDownload}
            />

            <InvoiceDialog
                open={open}
                onOpenChange={setOpen}
                onSave={handleSave}
                customers={customers}
                products={products}
                invoice={selectedInvoice}
            />

            <InvoiceViewDialog
                open={viewOpen}
                onOpenChange={setViewOpen}
                invoice={selectedInvoice}
            />
        </div>
    )
}
