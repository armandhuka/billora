"use client"

import * as React from "react"
import { Product, Category, CreateProductInput } from "@/types/product"
import { ProductTable } from "@/components/dashboard/product-table"
import { ProductDialog } from "@/components/dashboard/product-dialog"
import { ProductStatsBar } from "@/components/dashboard/product-stats-bar"
import { ProductFilters } from "@/components/dashboard/product-filters"
import { BulkActionBar } from "@/components/dashboard/bulk-action-bar"
import { CsvImportDialog } from "@/components/dashboard/csv-import-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Plus, Search, RefreshCw, Loader2, Download, Upload,
} from "lucide-react"
import { toast } from "sonner"
import {
    searchProducts, saveProduct, deleteProduct, toggleProductActive,
    bulkDeleteProducts, bulkToggleActive,
} from "@/app/actions/products"
import { buildCsvString, downloadCsv } from "@/lib/export"
import { useCurrency } from "@/context/currency-context"

type StatusFilter = "all" | "active" | "inactive"
type StockFilter = "all" | "low" | "out"

interface ProductsClientProps {
    initialProducts: Product[]
    categories: Category[]
}

export function ProductsClient({ initialProducts, categories }: ProductsClientProps) {
    const { symbol } = useCurrency()
    const [products, setProducts] = React.useState<Product[]>(initialProducts)
    const [loading, setLoading] = React.useState(false)
    const [isSearching, setIsSearching] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all")
    const [stockFilter, setStockFilter] = React.useState<StockFilter>("all")
    const [categoryFilter, setCategoryFilter] = React.useState("all")
    const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
    const [dialogOpen, setDialogOpen] = React.useState(false)
    const [importOpen, setImportOpen] = React.useState(false)
    const [editingProduct, setEditingProduct] = React.useState<Product | null>(null)

    // Debounced search + filter
    React.useEffect(() => {
        const timer = setTimeout(async () => {
            setIsSearching(true)
            const result = await searchProducts(searchQuery, {
                status: statusFilter,
                stock: stockFilter,
                category: categoryFilter,
            })
            if (result.data) setProducts(result.data)
            setIsSearching(false)
        }, 300)
        return () => clearTimeout(timer)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, statusFilter, stockFilter, categoryFilter])

    async function fetchProducts() {
        setLoading(true)
        const result = await searchProducts("", { status: statusFilter, stock: stockFilter, category: categoryFilter })
        if (result.data) setProducts(result.data)
        setLoading(false)
    }

    async function handleSave(data: CreateProductInput) {
        const result = await saveProduct(editingProduct ? { ...data, id: editingProduct.id } : data)
        if (result.error) {
            toast.error(result.error)
            throw new Error(result.error)
        }
        toast.success(editingProduct ? "Product updated!" : "Product created!")
        fetchProducts()
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this product?")) return
        const result = await deleteProduct(id)
        if (result.error) toast.error(result.error)
        else { toast.success("Product deleted"); fetchProducts() }
    }

    async function handleToggleActive(id: string, isActive: boolean) {
        const result = await toggleProductActive(id, isActive)
        if (result.error) toast.error(result.error)
        else {
            toast.success(isActive ? "Product activated" : "Product deactivated")
            setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: isActive } : p))
        }
    }

    // Bulk actions
    async function handleBulkActivate() {
        const ids = Array.from(selectedIds)
        const result = await bulkToggleActive(ids, true)
        if (result.error) toast.error(result.error)
        else { toast.success(`${ids.length} products activated`); fetchProducts(); setSelectedIds(new Set()) }
    }

    async function handleBulkDeactivate() {
        const ids = Array.from(selectedIds)
        const result = await bulkToggleActive(ids, false)
        if (result.error) toast.error(result.error)
        else { toast.success(`${ids.length} products deactivated`); fetchProducts(); setSelectedIds(new Set()) }
    }

    async function handleBulkDelete() {
        const ids = Array.from(selectedIds)
        if (!confirm(`Delete ${ids.length} product(s)?`)) return
        const result = await bulkDeleteProducts(ids)
        if (result.error) toast.error(result.error)
        else { toast.success(`${ids.length} products deleted`); fetchProducts(); setSelectedIds(new Set()) }
    }

    function handleBulkExport() {
        const selected = products.filter(p => selectedIds.has(p.id))
        handleExportProducts(selected)
        setSelectedIds(new Set())
    }

    function handleExportProducts(toExport?: Product[]) {
        const list = toExport ?? products
        const csv = buildCsvString(
            [
                { key: "name", label: "Name" },
                { key: "sku", label: "SKU" },
                { key: "category", label: "Category" },
                { key: "barcode", label: "Barcode" },
                { key: "purchase_price", label: `Purchase Price (${symbol})` },
                { key: "selling_price", label: `Selling Price (${symbol})` },
                { key: "gst_rate", label: "GST Rate (%)" },
                { key: "stock_quantity", label: "Stock" },
                { key: "min_stock_level", label: "Min Stock" },
                { key: "is_active", label: "Active" },
            ],
            list as unknown as Record<string, unknown>[]
        )
        downloadCsv(csv, `products_${new Date().toISOString().slice(0, 10)}`)
    }

    // Selection helpers
    function handleSelectAll(checked: boolean) {
        setSelectedIds(checked ? new Set(products.map(p => p.id)) : new Set())
    }

    function handleSelectOne(id: string, checked: boolean) {
        setSelectedIds(prev => {
            const next = new Set(prev)
            if (checked) next.add(id)
            else next.delete(id)
            return next
        })
    }

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                    <p className="text-muted-foreground text-sm mt-0.5">
                        {products.length} product{products.length !== 1 ? "s" : ""} · Inventory management
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <Button variant="outline" size="sm" onClick={() => setImportOpen(true)} className="gap-1.5">
                        <Upload className="h-4 w-4" />
                        Import CSV
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleExportProducts()} className="gap-1.5">
                        <Download className="h-4 w-4" />
                        Export
                    </Button>
                    <Button variant="outline" size="icon" onClick={fetchProducts} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    </Button>
                    <Button onClick={() => { setEditingProduct(null); setDialogOpen(true) }} className="gap-1.5">
                        <Plus className="h-4 w-4" />
                        Add Product
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <ProductStatsBar products={products} />

            {/* Search + Filters */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        {isSearching
                            ? <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
                            : <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        }
                        <Input
                            placeholder="Search by name, SKU, barcode or category…"
                            className="pl-9"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <ProductFilters
                    statusFilter={statusFilter}
                    stockFilter={stockFilter}
                    categoryFilter={categoryFilter}
                    categories={categories}
                    onStatusChange={setStatusFilter}
                    onStockChange={setStockFilter}
                    onCategoryChange={setCategoryFilter}
                />
            </div>

            {/* Bulk action bar */}
            <BulkActionBar
                selectedCount={selectedIds.size}
                onActivate={handleBulkActivate}
                onDeactivate={handleBulkDeactivate}
                onDelete={handleBulkDelete}
                onExport={handleBulkExport}
                onClearSelection={() => setSelectedIds(new Set())}
            />

            {/* Table */}
            <ProductTable
                products={products}
                selectedIds={selectedIds}
                onSelectAll={handleSelectAll}
                onSelectOne={handleSelectOne}
                onEdit={p => { setEditingProduct(p); setDialogOpen(true) }}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
            />

            {/* Dialogs */}
            <ProductDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                product={editingProduct}
                onSave={handleSave}
                categories={categories}
            />
            <CsvImportDialog
                open={importOpen}
                onOpenChange={setImportOpen}
                onImported={fetchProducts}
            />
        </div>
    )
}
