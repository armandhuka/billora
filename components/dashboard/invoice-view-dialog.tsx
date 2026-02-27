"use client"

import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Invoice } from "@/types/invoice"
import { format } from "date-fns"

interface InvoiceViewDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    invoice: Invoice | null
}

export function InvoiceViewDialog({ open, onOpenChange, invoice }: InvoiceViewDialogProps) {
    if (!invoice) return null

    const getStatusColor = (status: string) => {
        switch (status) {
            case "paid":
                return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
            case "pending":
                return "bg-amber-500/10 text-amber-500 border-amber-500/20"
            case "overdue":
                return "bg-rose-500/10 text-rose-500 border-rose-500/20"
            default:
                return "bg-slate-500/10 text-slate-500 border-slate-500/20"
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <div className="p-6 pb-2">
                    <DialogHeader className="flex flex-row items-center justify-between space-y-0">
                        <div>
                            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                                {invoice.invoice_number}
                                <Badge variant="outline" className={`capitalize ${getStatusColor(invoice.payment_status)}`}>
                                    {invoice.payment_status}
                                </Badge>
                            </DialogTitle>
                            <DialogDescription className="mt-1">
                                Generated on {format(new Date(invoice.created_at), "MMMM dd, yyyy")}
                            </DialogDescription>
                        </div>
                    </DialogHeader>
                </div>

                <div className="flex-1 p-6 pt-2 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">From</h4>
                            <div className="space-y-1">
                                <p className="font-bold text-lg">Your Business Name</p>
                                <p className="text-sm text-muted-foreground">Business Address Line</p>
                                <p className="text-sm text-muted-foreground">GST: YOUR-GST-NUMBER</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Bill To</h4>
                            <div className="space-y-1">
                                <p className="font-bold text-lg">{invoice.customer?.name || "Guest Customer"}</p>
                                <p className="text-sm text-muted-foreground">{invoice.customer?.address || "No address provided"}</p>
                                <p className="text-sm text-muted-foreground">{invoice.customer?.email || "No email"}</p>
                                <p className="text-sm text-muted-foreground">{invoice.customer?.phone || "No phone"}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Invoice Items</h4>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-semibold">Item & Description</th>
                                        <th className="px-4 py-3 text-right font-semibold w-24">Qty</th>
                                        <th className="px-4 py-3 text-right font-semibold w-32">Price</th>
                                        <th className="px-4 py-3 text-right font-semibold w-32">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {(invoice.items || []).map((item, idx) => (
                                        <tr key={idx} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-4">
                                                <p className="font-medium text-primary">{item.product?.name || "Product"}</p>
                                                <p className="text-xs text-muted-foreground">{item.product?.sku || ""}</p>
                                            </td>
                                            <td className="px-4 py-4 text-right">{item.quantity}</td>
                                            <td className="px-4 py-4 text-right font-mono">${item.price.toFixed(2)}</td>
                                            <td className="px-4 py-4 text-right font-bold font-mono">${item.total.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <div className="w-64 space-y-3 bg-muted/30 p-4 rounded-xl border border-border/50">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-mono">${invoice.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">GST Total</span>
                                <span className="font-mono">${invoice.gst_total.toFixed(2)}</span>
                            </div>
                            <div className="h-px bg-border my-3" />
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span className="text-primary font-mono">${invoice.total_amount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t bg-muted/20">
                    <p className="text-xs text-center text-muted-foreground italic">
                        Thank you for your business!
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}
