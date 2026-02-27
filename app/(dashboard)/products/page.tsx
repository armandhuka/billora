"use client"

import * as React from "react"
import { getProducts, saveProduct, deleteProduct } from "@/app/actions/products"
import { Product, CreateProductInput } from "@/types/product"
import { ProductTable } from "@/components/dashboard/product-table"
import { ProductDialog } from "@/components/dashboard/product-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Package, AlertTriangle, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

export default function ProductsPage() {
    const [products, setProducts] = React.useState<Product[]>([])
    const [loading, setLoading] = React.useState(true)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [dialogOpen, setDialogOpen] = React.useState(false)
    const [editingProduct, setEditingProduct] = React.useState<Product | null>(null)

    const fetchProducts = React.useCallback(async () => {
        setLoading(true)
        const result = await getProducts()
        if (result.error) {
            toast.error(result.error)
        } else {
            setProducts(result.data || [])
        }
        setLoading(false)
    }, [])

    React.useEffect(() => {
        fetchProducts()
    }, [fetchProducts])

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const lowStockCount = products.filter(p => p.stock_quantity <= p.min_stock_level).length

    async function handleSave(data: CreateProductInput) {
        const result = await saveProduct(editingProduct ? { ...data, id: editingProduct.id } : data)
        if (result.error) {
            toast.error(result.error)
            throw new Error(result.error)
        } else {
            toast.success(editingProduct ? "Product updated" : "Product created")
            fetchProducts()
        }
    }

    async function handleDelete(id: string) {
        if (confirm("Are you sure you want to delete this product?")) {
            const result = await deleteProduct(id)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Product deleted")
                fetchProducts()
            }
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                    <p className="text-muted-foreground">Manage your inventory and product details.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={fetchProducts} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button onClick={() => { setEditingProduct(null); setDialogOpen(true); }}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Product
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-background rounded-xl border border-border/50 p-4 flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                        <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Products</p>
                        <p className="text-2xl font-bold">{products.length}</p>
                    </div>
                </div>
                <div className="bg-background rounded-xl border border-border/50 p-4 flex items-center gap-4">
                    <div className="bg-amber-500/10 p-3 rounded-lg">
                        <AlertTriangle className="h-6 w-6 text-amber-500" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Low Stock Items</p>
                        <div className="flex items-center gap-2">
                            <p className="text-2xl font-bold">{lowStockCount}</p>
                            {lowStockCount > 0 && <Badge variant="destructive" className="animate-pulse">Action Required</Badge>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, SKU or category..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <ProductTable
                products={filteredProducts}
                onEdit={(p) => { setEditingProduct(p); setDialogOpen(true); }}
                onDelete={handleDelete}
            />

            <ProductDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                product={editingProduct}
                onSave={handleSave}
            />
        </div>
    )
}
