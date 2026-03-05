"use client"

import * as React from "react"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Purchase } from "@/types/purchase"
import { format } from "date-fns"
import { Package, Calendar, User, Hash, CreditCard, Truck, Tag } from "lucide-react"
import { useCurrency } from "@/context/currency-context"
import { cn } from "@/lib/utils"

const statusConfig: Record<string, { label: string; className: string }> = {
    draft: { label: "Draft", className: "bg-slate-500/10 text-slate-500 border-slate-300/40" },
    ordered: { label: "Ordered", className: "bg-blue-500/10 text-blue-600 border-blue-300/40" },
    received: { label: "Received", className: "bg-emerald-500/10 text-emerald-600 border-emerald-300/40" },
    cancelled: { label: "Cancelled", className: "bg-rose-500/10 text-rose-600 border-rose-300/40" },
}

const paymentConfig: Record<string, { label: string; className: string }> = {
    unpaid: { label: "Unpaid", className: "bg-rose-500/10 text-rose-600 border-rose-300/40" },
    partial: { label: "Partial", className: "bg-amber-500/10 text-amber-600 border-amber-300/40" },
    paid: { label: "Paid", className: "bg-emerald-500/10 text-emerald-600 border-emerald-300/40" },
}

interface PurchaseViewDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    purchase: Purchase | null
}

export function PurchaseViewDialog({ open, onOpenChange, purchase }: PurchaseViewDialogProps) {
    const { symbol } = useCurrency()

    if (!purchase) return null

    const sc = statusConfig[purchase.status] ?? statusConfig.draft
    const pc = paymentConfig[purchase.payment_status] ?? paymentConfig.unpaid

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto p-0 border-none bg-background/95 backdrop-blur-sm">
                <div className="p-8">
                    <DialogHeader className="mb-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="text-[10px]">PURCHASE ORDER</Badge>
                                    <Badge variant="outline" className={cn("text-[10px] capitalize", sc.className)}>{sc.label}</Badge>
                                    <Badge variant="outline" className={cn("text-[10px] capitalize", pc.className)}>{pc.label}</Badge>
                                </div>
                                <DialogTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
                                    <Hash className="h-5 w-5 text-muted-foreground" />
                                    {purchase.purchase_number}
                                </DialogTitle>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-primary font-mono">{symbol}{Number(purchase.total_amount).toFixed(2)}</div>
                                <div className="text-xs text-muted-foreground uppercase tracking-widest">Total Amount</div>
                            </div>
                        </div>
                    </DialogHeader>

                    {/* Info cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <User className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Supplier</p>
                                <p className="font-medium text-base">{purchase.supplier?.name || "N/A"}</p>
                                <p className="text-sm text-muted-foreground">{purchase.supplier?.email || "No email"}</p>
                                <p className="text-sm text-muted-foreground">{purchase.supplier?.phone || "No phone"}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Calendar className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date Recorded</p>
                                <p className="font-medium text-base">{format(new Date(purchase.created_at), "MMMM dd, yyyy")}</p>
                                <p className="text-sm text-muted-foreground">{format(new Date(purchase.created_at), "hh:mm a")}</p>
                            </div>
                        </div>

                        {purchase.expected_delivery_date && (
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                    <Truck className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Expected Delivery</p>
                                    <p className="font-medium text-base">{format(new Date(purchase.expected_delivery_date), "MMMM dd, yyyy")}</p>
                                </div>
                            </div>
                        )}

                        {(purchase.payment_status === "paid" || purchase.payment_status === "partial") && (
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-emerald-500/10 rounded-lg">
                                    <CreditCard className="h-4 w-4 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment Info</p>
                                    <p className="font-medium text-base">{symbol}{Number(purchase.paid_amount || 0).toFixed(2)} paid</p>
                                    {purchase.payment_method && (
                                        <p className="text-sm text-muted-foreground capitalize">via {purchase.payment_method.replace("_", " ")}</p>
                                    )}
                                    {purchase.payment_date && (
                                        <p className="text-sm text-muted-foreground">on {format(new Date(purchase.payment_date), "MMM dd, yyyy")}</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    {purchase.notes && (
                        <div className="mb-6 p-3 rounded-lg bg-muted/30 border border-border/50">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Notes</p>
                            <p className="text-sm">{purchase.notes}</p>
                        </div>
                    )}

                    {/* Items table */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-primary" />
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Purchased Items</h3>
                        </div>

                        <div className="border border-border/50 rounded-xl overflow-hidden bg-card/50">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 border-b border-border/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Product / SKU</th>
                                        <th className="px-4 py-3 text-right font-medium">Qty</th>
                                        <th className="px-4 py-3 text-right font-medium">Cost</th>
                                        <th className="px-4 py-3 text-right font-medium">Disc.</th>
                                        <th className="px-4 py-3 text-right font-medium">Tax%</th>
                                        <th className="px-4 py-3 text-right font-medium">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {(purchase.items || []).map((item, idx) => (
                                        <tr key={idx} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-primary">{item.product?.name || "Product"}</p>
                                                <p className="text-xs text-muted-foreground">{item.product?.sku || "N/A"}</p>
                                            </td>
                                            <td className="px-4 py-3 text-right">{item.quantity}</td>
                                            <td className="px-4 py-3 text-right font-mono">{symbol}{item.cost_price.toFixed(2)}</td>
                                            <td className="px-4 py-3 text-right font-mono text-rose-600">
                                                {(item.discount || 0) > 0 ? `-${symbol}${(item.discount || 0).toFixed(2)}` : "—"}
                                            </td>
                                            <td className="px-4 py-3 text-right">{(item.tax_rate || 0)}%</td>
                                            <td className="px-4 py-3 text-right font-bold text-primary font-mono">{symbol}{item.total.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    {(!purchase.items || purchase.items.length === 0) && (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                                No items found for this purchase.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="mt-6 pt-4 border-t border-border/50 flex flex-col items-end space-y-2">
                        <div className="flex w-64 justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span className="font-mono">{symbol}{Number(purchase.subtotal || purchase.total_amount).toFixed(2)}</span>
                        </div>
                        {(purchase.tax_total || 0) > 0 && (
                            <div className="flex w-64 justify-between text-sm">
                                <span className="text-muted-foreground">Tax Total</span>
                                <span className="font-mono">{symbol}{Number(purchase.tax_total).toFixed(2)}</span>
                            </div>
                        )}
                        {(purchase.discount_amount || 0) > 0 && (
                            <div className="flex w-64 justify-between text-sm text-rose-600">
                                <span className="flex items-center gap-1"><Tag className="h-3 w-3" />Discount</span>
                                <span className="font-mono">-{symbol}{Number(purchase.discount_amount).toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex w-64 justify-between border-t border-border/50 pt-2">
                            <span className="text-lg font-bold">Grand Total</span>
                            <span className="text-xl font-black text-primary font-mono">{symbol}{Number(purchase.total_amount).toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="mt-10 flex items-center justify-center gap-2 text-[10px] text-muted-foreground font-medium uppercase tracking-[0.2em]">
                        <div className="h-px w-8 bg-border"></div>
                        <span>Official Purchase Record</span>
                        <div className="h-px w-8 bg-border"></div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
