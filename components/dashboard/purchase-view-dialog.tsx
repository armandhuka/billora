"use client"

import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Purchase } from "@/types/purchase"
import { format } from "date-fns"
import { Package, Calendar, User, Hash } from "lucide-react"

interface PurchaseViewDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    purchase: Purchase | null
}

export function PurchaseViewDialog({ open, onOpenChange, purchase }: PurchaseViewDialogProps) {
    if (!purchase) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0 border-none bg-background/95 backdrop-blur-sm">
                <div className="p-8">
                    <DialogHeader className="mb-8">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Badge variant="secondary" className="mb-2">PURCHASE ORDER</Badge>
                                <DialogTitle className="text-3xl font-bold tracking-tight flex items-center gap-2">
                                    <Hash className="h-6 w-6 text-muted-foreground" />
                                    {purchase.purchase_number}
                                </DialogTitle>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-primary">${purchase.total_amount.toFixed(2)}</div>
                                <div className="text-xs text-muted-foreground uppercase tracking-widest">Total Amount</div>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <User className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Supplier</p>
                                    <p className="font-medium text-lg">{purchase.supplier?.name || "N/A"}</p>
                                    <p className="text-sm text-muted-foreground">{purchase.supplier?.email || "No email"}</p>
                                    <p className="text-sm text-muted-foreground">{purchase.supplier?.phone || "No phone"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Calendar className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date Recorded</p>
                                    <p className="font-medium text-lg">{format(new Date(purchase.created_at), "MMMM dd, yyyy")}</p>
                                    <p className="text-sm text-muted-foreground">{format(new Date(purchase.created_at), "HH:mm a")}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Package className="h-4 w-4 text-primary" />
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Purchased Items</h3>
                        </div>

                        <div className="border border-border/50 rounded-xl overflow-hidden bg-card/50">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 border-b border-border/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Product / SKU</th>
                                        <th className="px-4 py-3 text-right font-medium">Quantity</th>
                                        <th className="px-4 py-3 text-right font-medium">Cost Price</th>
                                        <th className="px-4 py-3 text-right font-medium">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {(purchase.items || []).map((item, idx) => (
                                        <tr key={idx} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-4">
                                                <p className="font-medium text-primary">{item.product?.name || "Product"}</p>
                                                <p className="text-xs text-muted-foreground">{item.product?.sku || "N/A"}</p>
                                            </td>
                                            <td className="px-4 py-4 text-right">{item.quantity}</td>
                                            <td className="px-4 py-4 text-right font-mono">${item.cost_price.toFixed(2)}</td>
                                            <td className="px-4 py-4 text-right font-bold text-primary">${item.total.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    {(!purchase.items || purchase.items.length === 0) && (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                                No items found for this purchase.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-border/50 flex flex-col items-end space-y-3">
                        <div className="flex w-64 justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal Amount</span>
                            <span className="font-medium">${purchase.total_amount.toFixed(2)}</span>
                        </div>
                        <div className="flex w-64 justify-between border-t border-border/50 pt-3">
                            <span className="text-lg font-bold">Grand Total</span>
                            <span className="text-2xl font-black text-primary">${purchase.total_amount.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="mt-12 flex items-center justify-center gap-2 text-[10px] text-muted-foreground font-medium uppercase tracking-[0.2em]">
                        <div className="h-px w-8 bg-border"></div>
                        <span>Official Purchase Record</span>
                        <div className="h-px w-8 bg-border"></div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
