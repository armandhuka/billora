"use client"

import * as React from "react"
import { Plus, Download, Search, Loader2, PackageCheck, TrendingUp, Truck, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { PurchaseTable } from "@/components/dashboard/purchase-table"
import { PurchaseDialog } from "@/components/dashboard/purchase-dialog"
import { PurchaseViewDialog } from "@/components/dashboard/purchase-view-dialog"
import { CreatePurchaseInput, Purchase, Supplier } from "@/types/purchase"
import { Product } from "@/types/product"
import { createPurchase, updatePurchase, deletePurchase, searchPurchases, duplicatePurchase, getPurchaseAnalytics } from "@/app/actions/purchases"
import { exportToCsv } from "@/lib/export"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { useCurrency } from "@/context/currency-context"
import { cn } from "@/lib/utils"

interface PurchasesClientProps {
    initialPurchases: Purchase[]
    suppliers: Supplier[]
    products: Product[]
}

interface Analytics {
    totalPurchases: number
    totalSpent: number
    monthlyPurchases: number
    monthlySpent: number
    topSupplier: { name: string; amount: number } | null
    received: number
    ordered: number
    draft: number
}

export function PurchasesClient({
    initialPurchases,
    suppliers,
    products
}: PurchasesClientProps) {
    const { symbol } = useCurrency()
    const [open, setOpen] = React.useState(false)
    const [viewOpen, setViewOpen] = React.useState(false)
    const [selectedPurchase, setSelectedPurchase] = React.useState<Purchase | null>(null)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [statusFilter, setStatusFilter] = React.useState("all")
    const [purchases, setPurchases] = React.useState<Purchase[]>(initialPurchases)
    const [isSearching, setIsSearching] = React.useState(false)
    const [analytics, setAnalytics] = React.useState<Analytics | null>(null)

    // Load analytics on mount
    React.useEffect(() => {
        getPurchaseAnalytics().then(res => {
            if (res.data) setAnalytics(res.data)
        })
    }, [])

    // Search + filter
    React.useEffect(() => {
        const timer = setTimeout(async () => {
            setIsSearching(true)
            const res = await searchPurchases(searchQuery, statusFilter)
            if (!res.error && res.data) {
                setPurchases(res.data as Purchase[])
            }
            setIsSearching(false)
        }, 300)
        return () => clearTimeout(timer)
    }, [searchQuery, statusFilter])

    const refreshAnalytics = () => {
        getPurchaseAnalytics().then(res => {
            if (res.data) setAnalytics(res.data)
        })
    }

    const handleExport = () => {
        exportToCsv(
            [
                { key: "purchase_number", label: "Purchase #" },
                { key: "supplier_name", label: "Supplier" },
                { key: "status", label: "Status" },
                { key: "payment_status", label: "Payment" },
                { key: "date", label: "Date" },
                { key: "subtotal", label: "Subtotal" },
                { key: "discount", label: "Discount" },
                { key: "tax", label: "Tax" },
                { key: "total_amount", label: "Total Amount" },
                { key: "paid_amount", label: "Paid Amount" },
            ],
            purchases.map(p => ({
                purchase_number: p.purchase_number,
                supplier_name: p.supplier?.name ?? "",
                status: p.status || "ordered",
                payment_status: p.payment_status || "unpaid",
                date: new Date(p.created_at).toLocaleDateString(),
                subtotal: Number(p.subtotal || p.total_amount).toFixed(2),
                discount: Number(p.discount_amount || 0).toFixed(2),
                tax: Number(p.tax_total || 0).toFixed(2),
                total_amount: Number(p.total_amount).toFixed(2),
                paid_amount: Number(p.paid_amount || 0).toFixed(2),
            })),
            `purchases_export_${new Date().toISOString().slice(0, 10)}`
        )
    }

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
        refreshAnalytics()
    }

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this purchase?")) {
            const res = await deletePurchase(id)
            if (res.error) {
                toast.error(`Error: ${res.error}`)
            } else {
                toast.success("Purchase deleted successfully.")
                refreshAnalytics()
            }
        }
    }

    const handleDuplicate = async (purchase: Purchase) => {
        const res = await duplicatePurchase(purchase.id)
        if (res.error) {
            toast.error(`Error: ${res.error}`)
        } else {
            toast.success(`Duplicated as Draft — ${res.data?.purchase_number}`)
            refreshAnalytics()
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
                            .badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 11px; font-weight: bold; }
                            .details { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
                            .section-title { font-size: 12px; font-weight: bold; color: #666; text-transform: uppercase; margin-bottom: 8px; }
                            table { width: 100%; border-collapse: collapse; }
                            th, td { padding: 12px; border-bottom: 1px solid #eee; text-align: left; }
                            th { background: #f9fafb; font-size: 12px; color: #666; text-transform: uppercase; }
                            .totals { margin-top: 40px; text-align: right; }
                            .total-row { font-size: 20px; font-weight: bold; color: #059669; margin-top: 10px; }
                            .discount { color: #e11d48; }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <div>
                                <div class="title">PURCHASE ORDER</div>
                                <div style="margin-top: 4px; color: #666;"># ${purchase.purchase_number}</div>
                                <div style="margin-top: 4px;">Status: ${(purchase.status || "ordered").toUpperCase()} | Payment: ${(purchase.payment_status || "unpaid").toUpperCase()}</div>
                            </div>
                            <div style="text-align: right;">
                                <div class="section-title">Date</div>
                                <div>${new Date(purchase.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                ${purchase.expected_delivery_date ? `<div class="section-title" style="margin-top:8px;">Expected Delivery</div><div>${new Date(purchase.expected_delivery_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>` : ''}
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
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Qty</th>
                                    <th style="text-align: right;">Cost</th>
                                    <th style="text-align: right;">Disc.</th>
                                    <th style="text-align: right;">Tax%</th>
                                    <th style="text-align: right;">Total</th>
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
                                        <td style="text-align: right;">${symbol}${item.cost_price.toFixed(2)}</td>
                                        <td style="text-align: right;" class="discount">${(item.discount || 0) > 0 ? `-${symbol}${(item.discount || 0).toFixed(2)}` : '—'}</td>
                                        <td style="text-align: right;">${(item.tax_rate || 0)}%</td>
                                        <td style="text-align: right; font-weight: bold;">${symbol}${item.total.toFixed(2)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        <div class="totals">
                            <div>Subtotal: ${symbol}${Number(purchase.subtotal || purchase.total_amount).toFixed(2)}</div>
                            ${(purchase.tax_total || 0) > 0 ? `<div>Tax: ${symbol}${Number(purchase.tax_total).toFixed(2)}</div>` : ''}
                            ${(purchase.discount_amount || 0) > 0 ? `<div class="discount">Discount: -${symbol}${Number(purchase.discount_amount).toFixed(2)}</div>` : ''}
                            <div class="total-row">Grand Total: ${symbol}${Number(purchase.total_amount).toFixed(2)}</div>
                            ${(purchase.paid_amount || 0) > 0 ? `<div style="margin-top:8px; color:#666;">Paid: ${symbol}${Number(purchase.paid_amount).toFixed(2)} ${purchase.payment_method ? `via ${purchase.payment_method.replace('_', ' ')}` : ''}</div>` : ''}
                        </div>
                        ${purchase.notes ? `<div style="margin-top:30px; padding:12px; border:1px solid #eee; border-radius:8px;"><strong>Notes:</strong> ${purchase.notes}</div>` : ''}
                        <div style="margin-top: 60px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px;">
                            This is a computer generated document.
                        </div>
                    </body>
                </html>
            `)
            printWindow.document.close()
            printWindow.print()
        }
    }

    const statCards = analytics ? [
        { label: "Total Purchases", value: analytics.totalPurchases, sub: `${symbol}${analytics.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: ShoppingBag, color: "text-primary", bg: "bg-primary/5" },
        { label: "This Month", value: analytics.monthlyPurchases, sub: `${symbol}${analytics.monthlySpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-500/5" },
        { label: "Received", value: analytics.received, sub: `${analytics.ordered} ordered · ${analytics.draft} drafts`, icon: PackageCheck, color: "text-blue-600", bg: "bg-blue-500/5" },
        { label: "Top Supplier", value: analytics.topSupplier?.name ?? "—", sub: analytics.topSupplier ? `${symbol}${analytics.topSupplier.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "No data", icon: Truck, color: "text-amber-600", bg: "bg-amber-500/5" },
    ] : []

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Purchases</h1>
                    <p className="text-muted-foreground">
                        Track acquisitions, manage suppliers, and control purchase workflows.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="hidden sm:flex" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                    <Button onClick={handleAdd} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                        <Plus className="mr-2 h-4 w-4" /> New Purchase
                    </Button>
                </div>
            </div>

            {/* Analytics Cards */}
            {analytics && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {statCards.map(s => (
                        <div key={s.label} className={cn("rounded-xl border border-border/50 p-4", s.bg)}>
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <s.icon className={cn("h-4 w-4", s.color)} />
                                <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
                            </div>
                            <p className={cn("text-xl font-bold truncate", s.color)}>{s.value}</p>
                            <p className="text-[11px] text-muted-foreground font-mono mt-0.5 truncate">{s.sub}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Search + Filter */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    {isSearching
                        ? <Loader2 className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground animate-spin" />
                        : <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    }
                    <Input
                        placeholder="Search by purchase #..."
                        className="pl-9 bg-card"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px] bg-card">
                        <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="ordered">Ordered</SelectItem>
                        <SelectItem value="received">Received</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <PurchaseTable
                purchases={purchases}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
                onDownload={handleDownload}
                onDuplicate={handleDuplicate}
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
