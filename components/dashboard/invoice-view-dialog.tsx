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
import { BusinessSettings } from "@/types/settings"
import { format } from "date-fns"
import QRCode from "react-qr-code"
import { useCurrency } from "@/context/currency-context"
import { Smartphone, CheckCircle2, Share2, Copy, Check, MessageCircle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface InvoiceViewDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    invoice: Invoice | null
    settings: BusinessSettings | null
}

export function InvoiceViewDialog({ open, onOpenChange, invoice, settings }: InvoiceViewDialogProps) {
    const { symbol } = useCurrency()
    const [copied, setCopied] = React.useState(false)

    if (!invoice) return null

    const shareUrl = typeof window !== "undefined"
        ? `${window.location.origin}/invoice/${invoice.id}`
        : `/invoice/${invoice.id}`

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl)
            setCopied(true)
            toast.success("Link copied to clipboard!")
            setTimeout(() => setCopied(false), 2000)
        } catch {
            toast.error("Failed to copy link")
        }
    }

    const handleWebShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Invoice ${invoice.invoice_number}`,
                    text: `View and pay invoice ${invoice.invoice_number} — ${symbol}${Number(invoice.total_amount).toFixed(2)}`,
                    url: shareUrl,
                })
            } catch {
                // user dismissed — no error needed
            }
        } else {
            handleCopyLink()
        }
    }

    const handleWhatsApp = () => {
        const msg = encodeURIComponent(
            `Hi! Here is invoice ${invoice.invoice_number} for ${symbol}${Number(invoice.total_amount).toFixed(2)}. View & pay here: ${shareUrl}`
        )
        window.open(`https://wa.me/?text=${msg}`, "_blank")
    }

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

    // Build UPI deep link
    const upiId = settings?.upi_id?.trim()
    const businessName = settings?.business_name?.trim() || "Business"
    const currencyCode = settings?.currency_code || "INR"
    const upiString = upiId
        ? `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(businessName)}&am=${Number(invoice.total_amount).toFixed(2)}&cu=${currencyCode}&tn=${encodeURIComponent(`Invoice ${invoice.invoice_number}`)}`
        : null

    const isPaid = invoice.payment_status === "paid"

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[760px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
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
                        {/* Share actions */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 text-xs"
                                onClick={handleCopyLink}
                            >
                                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                                {copied ? "Copied!" : "Copy Link"}
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 text-green-600 border-green-200 hover:bg-green-50 dark:hover:bg-green-950"
                                title="Share via WhatsApp"
                                onClick={handleWhatsApp}
                            >
                                <MessageCircle className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                title="Share"
                                onClick={handleWebShare}
                            >
                                <Share2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                title="Open public link"
                                onClick={() => window.open(shareUrl, "_blank")}
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </DialogHeader>
                </div>

                <div className="flex-1 p-6 pt-2 overflow-y-auto space-y-6">
                    {/* From / Bill To */}
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">From</h4>
                            <div className="space-y-1">
                                <p className="font-bold text-lg">{businessName}</p>
                                <p className="text-sm text-muted-foreground">{settings?.address || "Business Address"}</p>
                                {settings?.gst_number && (
                                    <p className="text-sm text-muted-foreground">GST: {settings.gst_number}</p>
                                )}
                                {settings?.phone && (
                                    <p className="text-sm text-muted-foreground">{settings.phone}</p>
                                )}
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

                    {/* Invoice Items */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Invoice Items</h4>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-semibold">Item &amp; Description</th>
                                        <th className="px-4 py-3 text-right font-semibold w-24">Qty</th>
                                        <th className="px-4 py-3 text-right font-semibold w-28">Price</th>
                                        <th className="px-4 py-3 text-right font-semibold w-28">Disc.</th>
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
                                            <td className="px-4 py-4 text-right font-mono">{symbol}{item.price.toFixed(2)}</td>
                                            <td className="px-4 py-4 text-right font-mono text-rose-600">
                                                {(item.discount || 0) > 0 ? `-${symbol}${(item.discount || 0).toFixed(2)}` : "—"}
                                            </td>
                                            <td className="px-4 py-4 text-right font-bold font-mono">{symbol}{item.total.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Totals + QR side by side */}
                    <div className="flex flex-col sm:flex-row justify-between gap-6 items-start">
                        {/* UPI QR code */}
                        {upiString ? (
                            <div className="flex-shrink-0">
                                {isPaid ? (
                                    <div className="w-44 h-44 flex flex-col items-center justify-center border rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 gap-3">
                                        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                                        <span className="text-xs font-semibold text-emerald-600 text-center">Payment Received</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="p-3 bg-white rounded-xl border border-border/50 shadow-sm">
                                            <QRCode
                                                value={upiString}
                                                size={140}
                                                bgColor="#ffffff"
                                                fgColor="#111827"
                                                level="M"
                                            />
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <Smartphone className="h-3.5 w-3.5" />
                                            <span>Scan to pay via UPI</span>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded max-w-[160px] truncate">
                                            {upiId}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex-shrink-0 flex items-center gap-2 text-xs text-muted-foreground border rounded-lg p-3 bg-muted/30 max-w-[180px]">
                                <Smartphone className="h-4 w-4 shrink-0" />
                                <span>Add UPI ID in Settings to show payment QR</span>
                            </div>
                        )}

                        {/* Totals */}
                        <div className="w-full sm:w-64 space-y-3 bg-muted/30 p-4 rounded-xl border border-border/50 self-end">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-mono">{symbol}{invoice.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">GST Total</span>
                                <span className="font-mono">{symbol}{invoice.gst_total.toFixed(2)}</span>
                            </div>
                            {(invoice.discount_amount || 0) > 0 && (
                                <div className="flex justify-between text-sm text-rose-600">
                                    <span>Discount</span>
                                    <span className="font-mono">-{symbol}{(invoice.discount_amount || 0).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="h-px bg-border my-3" />
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span className="text-primary font-mono">{symbol}{invoice.total_amount.toFixed(2)}</span>
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
