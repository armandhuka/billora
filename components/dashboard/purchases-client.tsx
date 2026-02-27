"use client"

import * as React from "react"
import { Plus, Download, Filter, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { PurchaseTable } from "@/components/dashboard/purchase-table"
import { PurchaseDialog } from "@/components/dashboard/purchase-dialog"
import { PurchaseViewDialog } from "@/components/dashboard/purchase-view-dialog"
import { CreatePurchaseInput, Purchase, Supplier } from "@/types/purchase"
import { Product } from "@/types/product"
import { createPurchase, updatePurchase, deletePurchase } from "@/app/actions/purchases"

interface PurchasesClientProps {
    initialPurchases: Purchase[]
    suppliers: Supplier[]
    products: Product[]
}

export function PurchasesClient({
    initialPurchases,
    suppliers,
    products
}: PurchasesClientProps) {
    const [open, setOpen] = React.useState(false)
    const [viewOpen, setViewOpen] = React.useState(false)
    const [selectedPurchase, setSelectedPurchase] = React.useState<Purchase | null>(null)
    const [searchQuery, setSearchQuery] = React.useState("")

    const filteredPurchases = initialPurchases.filter(purchase =>
        purchase.purchase_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        purchase.supplier?.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleAdd = () => {
        setSelectedPurchase(null)
        setOpen(true)
    }

    const handleEdit = (purchase: Purchase) => {
        setSelectedPurchase(purchase)
        setOpen(true)
    }

    const handleView = (purchase: Purchase) => {
        setSelectedPurchase(purchase)
        setViewOpen(true)
    }

    const handleSave = async (data: CreatePurchaseInput) => {
        const res = selectedPurchase
            ? await updatePurchase(selectedPurchase.id, data)
            : await createPurchase(data)

        if (res.error) {
            toast.error(`Error: ${res.error}`)
            throw new Error(res.error)
        }

        toast.success(selectedPurchase ? "Purchase updated!" : "Purchase recorded successfully!")
    }

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this purchase? This will also revert stock changes if applicable.")) {
            const res = await deletePurchase(id)
            if (res.error) {
                toast.error(`Error: ${res.error}`)
            } else {
                toast.success("Purchase deleted successfully.")
            }
        }
    }

    const handleDownload = (purchase: Purchase) => {
        toast.info(`Generating PDF for ${purchase.purchase_number}...`)
        const printWindow = window.open('', '_blank')
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Purchase ${purchase.purchase_number}</title>
                        <style>
                            body { font-family: sans-serif; padding: 40px; color: #333; }
                            .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
                            .title { font-size: 28px; font-weight: bold; color: #059669; }
                            .details { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
                            .section-title { font-size: 12px; font-weight: bold; color: #666; text-transform: uppercase; margin-bottom: 8px; }
                            table { width: 100%; border-collapse: collapse; }
                            th, td { padding: 12px; border-bottom: 1px solid #eee; text-align: left; }
                            th { background: #f9fafb; font-size: 12px; color: #666; text-transform: uppercase; }
                            .totals { margin-top: 40px; text-align: right; }
                            .total-row { font-size: 20px; font-weight: bold; color: #059669; margin-top: 10px; }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <div>
                                <div class="title">PURCHASE ORDER</div>
                                <div style="margin-top: 4px; color: #666;"># ${purchase.purchase_number}</div>
                            </div>
                            <div style="text-align: right;">
                                <div class="section-title">Date</div>
                                <div>${new Date(purchase.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                            </div>
                        </div>
                        <div class="details">
                            <div>
                                <div class="section-title">Purchased From</div>
                                <div style="font-size: 16px; font-weight: bold;">${purchase.supplier?.name || 'N/A'}</div>
                                <div>${purchase.supplier?.address || ''}</div>
                                <div>${purchase.supplier?.email || ''}</div>
                                <div>${purchase.supplier?.phone || ''}</div>
                            </div>
                            <div>
                                <div class="section-title">Ship To</div>
                                <div style="font-size: 16px; font-weight: bold;">Your Business Name</div>
                                <div>Your Business Address</div>
                                <div>GST: Your GST Number</div>
                            </div>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Product / Item</th>
                                    <th>Quantity</th>
                                    <th style="text-align: right;">Unit Cost</th>
                                    <th style="text-align: right;">Total Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${(purchase.items || []).map(item => `
                                    <tr>
                                        <td>
                                            <div style="font-weight: bold;">${item.product?.name || 'Product'}</div>
                                            <div style="font-size: 11px; color: #666;">SKU: ${item.product?.sku || 'N/A'}</div>
                                        </td>
                                        <td>${item.quantity}</td>
                                        <td style="text-align: right;">$${item.cost_price.toFixed(2)}</td>
                                        <td style="text-align: right; font-weight: bold;">$${item.total.toFixed(2)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        <div class="totals">
                            <div style="color: #666;">Subtotal: $${purchase.total_amount.toFixed(2)}</div>
                            <div class="total-row">Grand Total: $${purchase.total_amount.toFixed(2)}</div>
                        </div>
                        <div style="margin-top: 60px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; pt: 20px;">
                            This is a computer generated document.
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
                    <h1 className="text-3xl font-bold tracking-tight">Purchases</h1>
                    <p className="text-muted-foreground">
                        Track stock acquisitions and manage your relationships with suppliers.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="hidden sm:flex">
                        <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                    <Button onClick={handleAdd} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                        <Plus className="mr-2 h-4 w-4" /> New Purchase
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search purchases..."
                        className="pl-9 bg-card"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" size="icon" className="h-10 w-10">
                    <Filter className="h-4 w-4" />
                </Button>
            </div>

            <PurchaseTable
                purchases={filteredPurchases}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
                onDownload={handleDownload}
            />

            <PurchaseDialog
                open={open}
                onOpenChange={setOpen}
                onSave={handleSave}
                suppliers={suppliers}
                products={products}
                purchase={selectedPurchase}
            />

            <PurchaseViewDialog
                open={viewOpen}
                onOpenChange={setViewOpen}
                purchase={selectedPurchase}
            />
        </div>
    )
}
