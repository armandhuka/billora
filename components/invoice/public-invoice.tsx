"use client"

import * as React from "react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import QRCode from "react-qr-code"
import { CheckCircle2, Smartphone, Building2, MapPin, Phone, Mail } from "lucide-react"

// Minimal inline types so this component has no auth dependencies
interface PublicInvoiceItem {
    id: string
    quantity: number
    price: number
    discount?: number
    gst_rate: number
    total: number
    product?: { id: string; name: string; sku?: string | null } | null
}

interface PublicInvoiceData {
    id: string
    invoice_number: string
    subtotal: number
    discount_amount?: number
    gst_total: number
    total_amount: number
    payment_status: string
    created_at: string
    customer?: { id: string; name: string; email?: string | null; phone?: string | null; address?: string | null } | null
    items?: PublicInvoiceItem[]
}

interface PublicSettings {
    business_name?: string | null
    address?: string | null
    phone?: string | null
    email?: string | null
    gst_number?: string | null
    upi_id?: string | null
    currency_code?: string | null
    currency_symbol?: string | null
}

interface PublicInvoiceProps {
    invoice: PublicInvoiceData
    settings: PublicSettings | null
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        paid: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
        pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
        overdue: "bg-rose-500/10 text-rose-600 border-rose-500/20",
        cancelled: "bg-slate-500/10 text-slate-500 border-slate-500/20",
    }
    return (
        <Badge variant="outline" className={`capitalize ${styles[status] ?? styles.cancelled}`}>
            {status}
        </Badge>
    )
}

export function PublicInvoice({ invoice, settings }: PublicInvoiceProps) {
    const symbol = settings?.currency_symbol ?? "₹"
    const currencyCode = settings?.currency_code ?? "INR"
    const businessName = settings?.business_name ?? "Business"
    const upiId = settings?.upi_id?.trim()

    const upiString = upiId
        ? `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(businessName)}&am=${Number(invoice.total_amount).toFixed(2)}&cu=${currencyCode}&tn=${encodeURIComponent(`Invoice ${invoice.invoice_number}`)}`
        : null

    const isPaid = invoice.payment_status === "paid"

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-10 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header / Branding */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                            {businessName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="font-bold text-base leading-tight">{businessName}</p>
                            {settings?.email && (
                                <p className="text-xs text-muted-foreground">{settings.email}</p>
                            )}
                        </div>
                    </div>
                    <StatusBadge status={invoice.payment_status} />
                </div>

                {/* Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-border/50 overflow-hidden">
                    {/* Invoice header */}
                    <div className="px-8 py-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <h1 className="text-2xl font-bold text-primary">{invoice.invoice_number}</h1>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                    Issued on {format(new Date(invoice.created_at), "MMMM dd, yyyy")}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Amount</p>
                                <p className="text-3xl font-bold text-primary">{symbol}{Number(invoice.total_amount).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* From / To */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 px-8 py-6 border-b border-border/50">
                        {/* From */}
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">FROM</p>
                            <div className="space-y-1.5">
                                <p className="font-semibold text-sm">{businessName}</p>
                                {settings?.address && (
                                    <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                                        <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                                        <span>{settings.address}</span>
                                    </div>
                                )}
                                {settings?.phone && (
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Phone className="h-3 w-3 shrink-0" />
                                        <span>{settings.phone}</span>
                                    </div>
                                )}
                                {settings?.email && (
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Mail className="h-3 w-3 shrink-0" />
                                        <span>{settings.email}</span>
                                    </div>
                                )}
                                {settings?.gst_number && (
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Building2 className="h-3 w-3 shrink-0" />
                                        <span>GST: {settings.gst_number}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* To */}
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">BILL TO</p>
                            <div className="space-y-1.5">
                                <p className="font-semibold text-sm">{invoice.customer?.name ?? "Guest Customer"}</p>
                                {invoice.customer?.address && (
                                    <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                                        <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                                        <span>{invoice.customer.address}</span>
                                    </div>
                                )}
                                {invoice.customer?.phone && (
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Phone className="h-3 w-3 shrink-0" />
                                        <span>{invoice.customer.phone}</span>
                                    </div>
                                )}
                                {invoice.customer?.email && (
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Mail className="h-3 w-3 shrink-0" />
                                        <span>{invoice.customer.email}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Items table */}
                    <div className="px-8 py-6 border-b border-border/50">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">ITEMS</p>
                        <div className="rounded-xl border border-border/50 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/40 border-b border-border/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wide">Item</th>
                                        <th className="px-4 py-3 text-right font-semibold text-xs uppercase tracking-wide w-20">Qty</th>
                                        <th className="px-4 py-3 text-right font-semibold text-xs uppercase tracking-wide w-24">Price</th>
                                        <th className="px-4 py-3 text-right font-semibold text-xs uppercase tracking-wide w-24">Disc.</th>
                                        <th className="px-4 py-3 text-right font-semibold text-xs uppercase tracking-wide w-28">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {(invoice.items ?? []).map((item, idx) => (
                                        <tr key={idx} className="hover:bg-muted/20 transition-colors">
                                            <td className="px-4 py-3.5">
                                                <p className="font-medium">{item.product?.name ?? "Product"}</p>
                                                {item.product?.sku && (
                                                    <p className="text-[11px] text-muted-foreground mt-0.5">{item.product.sku}</p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5 text-right text-muted-foreground">{item.quantity}</td>
                                            <td className="px-4 py-3.5 text-right font-mono">{symbol}{item.price.toFixed(2)}</td>
                                            <td className="px-4 py-3.5 text-right font-mono text-rose-600">
                                                {(item.discount || 0) > 0 ? `-${symbol}${(item.discount || 0).toFixed(2)}` : "—"}
                                            </td>
                                            <td className="px-4 py-3.5 text-right font-bold font-mono">{symbol}{item.total.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Totals + QR */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-8 px-8 py-6">
                        {/* UPI QR */}
                        {upiString ? (
                            <div className="flex-shrink-0">
                                {isPaid ? (
                                    <div className="w-40 h-40 flex flex-col items-center justify-center rounded-xl border-2 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 gap-2">
                                        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                                        <span className="text-xs font-bold text-emerald-600 text-center">Payment Received</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="p-3 bg-white rounded-xl border shadow-sm">
                                            <QRCode value={upiString} size={128} bgColor="#ffffff" fgColor="#111827" level="M" />
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Smartphone className="h-3.5 w-3.5" />
                                            <span>Scan to pay via UPI</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : null}

                        {/* Subtotal / GST / Total */}
                        <div className="ml-auto w-full sm:w-64 space-y-2.5 bg-muted/30 rounded-xl p-5 border border-border/50">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-mono">{symbol}{Number(invoice.subtotal).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">GST Total</span>
                                <span className="font-mono">{symbol}{Number(invoice.gst_total).toFixed(2)}</span>
                            </div>
                            {(invoice.discount_amount || 0) > 0 && (
                                <div className="flex justify-between text-sm text-rose-600">
                                    <span>Discount</span>
                                    <span className="font-mono">-{symbol}{Number(invoice.discount_amount || 0).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="h-px bg-border" />
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span className="text-primary font-mono">{symbol}{Number(invoice.total_amount).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-5 border-t border-border/50 bg-muted/20 text-center">
                        <p className="text-xs text-muted-foreground italic">Thank you for your business!</p>
                    </div>
                </div>

                <p className="text-center text-xs text-muted-foreground mt-6 opacity-60">
                    Powered by Billora · This is a read-only invoice
                </p>
            </div>
        </div>
    )
}
