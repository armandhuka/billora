import { getProductDetail } from "@/app/actions/products"
import { getStockLogs } from "@/app/actions/stock-logs"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
    ArrowLeft, Package, Barcode, Tag,
    ShoppingCart, ShoppingBag, AlertTriangle, Image as ImageIcon,
} from "lucide-react"
import { StockHistorySection } from "@/components/dashboard/stock-history-section"

interface PageProps {
    params: { id: string }
}

export default async function ProductDetailPage({ params }: PageProps) {
    const [detailResult, stockLogsResult] = await Promise.all([
        getProductDetail(params.id),
        getStockLogs(params.id),
    ])

    if ("error" in detailResult && detailResult.error) notFound()

    const detail = detailResult as Awaited<ReturnType<typeof getProductDetail>>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!detail || !(detail as any).product) notFound()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { product, salesHistory, purchaseHistory } = detail as any
    const stockLogs = stockLogsResult.data ?? []

    const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= product.min_stock_level
    const isOutOfStock = product.stock_quantity === 0
    const totalSold = (salesHistory as { quantity: number }[]).reduce((s, i) => s + i.quantity, 0)
    const stockValue = product.stock_quantity * (product.purchase_price ?? 0)

    return (
        <div className="space-y-6 max-w-5xl">
            {/* Back */}
            <Button variant="ghost" size="sm" asChild className="gap-1.5 -ml-2 text-muted-foreground">
                <Link href="/products">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Products
                </Link>
            </Button>

            {/* Header */}
            <div className="flex items-start gap-4">
                {product.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.image_url} alt={product.name} className="h-20 w-20 rounded-xl object-cover border border-border/50 shadow shrink-0" />
                ) : (
                    <div className="h-20 w-20 rounded-xl bg-muted/40 border border-border/30 flex items-center justify-center shrink-0">
                        <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                )}
                <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-2xl font-bold">{product.name}</h1>
                        <Badge variant={product.is_active ? "default" : "secondary"} className={product.is_active ? "bg-emerald-500" : ""}>
                            {product.is_active ? "Active" : "Inactive"}
                        </Badge>
                        {isOutOfStock && <Badge variant="destructive">Out of Stock</Badge>}
                        {isLowStock && <Badge className="bg-amber-500 hover:bg-amber-500">Low Stock</Badge>}
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        {product.sku && <span className="font-mono bg-muted px-2 py-0.5 rounded text-xs">{product.sku}</span>}
                        {product.category && <span className="flex items-center gap-1"><Tag className="h-3.5 w-3.5" />{product.category}</span>}
                        {product.barcode && <span className="flex items-center gap-1"><Barcode className="h-3.5 w-3.5" />{product.barcode}</span>}
                    </div>
                    {product.description && <p className="text-sm text-muted-foreground">{product.description}</p>}
                </div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: "Current Stock", val: product.stock_quantity, sub: product.unit || "pcs", icon: Package, color: isOutOfStock ? "text-rose-500" : isLowStock ? "text-amber-500" : "text-primary" },
                    { label: "Min Stock Level", val: product.min_stock_level, sub: product.unit || "pcs", icon: AlertTriangle, color: "text-muted-foreground" },
                    { label: "Total Sold", val: totalSold, sub: "units", icon: ShoppingCart, color: "text-emerald-600" },
                    { label: "Stock Value", val: `₹${stockValue.toLocaleString()}`, sub: "", icon: ShoppingBag, color: "text-violet-600" },
                ].map(s => (
                    <div key={s.label} className="bg-background border border-border/50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <s.icon className={`h-4 w-4 ${s.color}`} />
                            <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
                        </div>
                        <p className={`text-xl font-bold ${s.color}`}>{s.val}</p>
                        {s.sub && <p className="text-[11px] text-muted-foreground">{s.sub}</p>}
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Pricing */}
                <div className="bg-background border border-border/50 rounded-xl p-5 space-y-3">
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Pricing</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-muted-foreground">Purchase Price</span><span className="font-semibold">₹{product.purchase_price?.toFixed(2) ?? "—"}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Selling Price</span><span className="font-semibold text-primary">₹{product.selling_price?.toFixed(2) ?? "—"}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">GST Rate</span><span className="font-semibold">{product.gst_rate}%</span></div>
                        {product.purchase_price && product.selling_price && (
                            <div className="flex justify-between border-t border-border/50 pt-2">
                                <span className="text-muted-foreground">Margin</span>
                                <span className="font-bold text-emerald-600">
                                    ₹{(product.selling_price - product.purchase_price).toFixed(2)} ({(((product.selling_price - product.purchase_price) / product.purchase_price) * 100).toFixed(1)}%)
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Variants */}
                {product.variants && product.variants.length > 0 && (
                    <div className="bg-background border border-border/50 rounded-xl p-5 space-y-3">
                        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Variants ({product.variants.length})</h3>
                        <div className="space-y-2">
                            {product.variants.map((v: { id: string; name: string; sku?: string | null; price?: number | null; stock_quantity: number }) => (
                                <div key={v.id} className="flex items-center justify-between text-sm bg-muted/30 rounded-lg px-3 py-2">
                                    <div>
                                        <span className="font-medium">{v.name}</span>
                                        {v.sku && <span className="ml-2 text-xs text-muted-foreground font-mono">{v.sku}</span>}
                                    </div>
                                    <div className="flex items-center gap-3 text-muted-foreground text-xs">
                                        {v.price && <span>₹{v.price}</span>}
                                        <span>Stock: {v.stock_quantity}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ── STOCK HISTORY (Client component for adjust button) ── */}
            <StockHistorySection
                productId={params.id}
                productName={product.name}
                currentStock={product.stock_quantity}
                initialLogs={stockLogs}
            />

            {/* Sales History */}
            <div className="bg-background border border-border/50 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border/50">
                    <h3 className="font-semibold flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4 text-primary" />
                        Sales History
                    </h3>
                </div>
                {(salesHistory as unknown[]).length === 0 ? (
                    <div className="py-10 text-center text-muted-foreground text-sm">No sales recorded yet</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-muted/30">
                            <tr>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Invoice</th>
                                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Qty</th>
                                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Price</th>
                                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {(salesHistory as any[]).map((item, i) => (
                                <tr key={i} className="hover:bg-muted/20">
                                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{item.invoice?.invoice_number || "—"}</td>
                                    <td className="px-5 py-3 text-right font-semibold">{item.quantity}</td>
                                    <td className="px-5 py-3 text-right">₹{item.price?.toFixed(2)}</td>
                                    <td className="px-5 py-3 text-right text-muted-foreground text-xs">{item.invoice?.created_at ? format(new Date(item.invoice.created_at), "dd MMM yyyy") : "—"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Purchase History */}
            <div className="bg-background border border-border/50 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border/50">
                    <h3 className="font-semibold flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 text-violet-600" />
                        Purchase History
                    </h3>
                </div>
                {(purchaseHistory as unknown[]).length === 0 ? (
                    <div className="py-10 text-center text-muted-foreground text-sm">No purchases recorded yet</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-muted/30">
                            <tr>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reference</th>
                                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Qty</th>
                                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Price</th>
                                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {(purchaseHistory as any[]).map((item, i) => (
                                <tr key={i} className="hover:bg-muted/20">
                                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{item.purchase?.reference_number || "—"}</td>
                                    <td className="px-5 py-3 text-right font-semibold">{item.quantity}</td>
                                    <td className="px-5 py-3 text-right">₹{item.price?.toFixed(2) || "—"}</td>
                                    <td className="px-5 py-3 text-right text-muted-foreground text-xs">{item.purchase?.created_at ? format(new Date(item.purchase.created_at), "dd MMM yyyy") : "—"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
