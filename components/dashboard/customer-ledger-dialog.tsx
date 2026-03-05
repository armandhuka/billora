"use client"

import * as React from "react"
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Loader2, FileText, CheckCircle2, AlertTriangle,
    Download, ArrowUpRight, ArrowDownLeft, Wallet, CalendarDays,
} from "lucide-react"
import { Customer } from "@/types/invoice"
import { getCustomerLedgerFull } from "@/app/actions/payments"
import { useCurrency } from "@/context/currency-context"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { exportToCsv } from "@/lib/export"

interface CustomerLedgerDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    customer: Customer | null
}

const statusConfig: Record<string, { label: string; className: string }> = {
    paid: { label: "Paid", className: "bg-emerald-500/10 text-emerald-600 border-emerald-300/40" },
    partial: { label: "Partial", className: "bg-blue-500/10 text-blue-600 border-blue-300/40" },
    pending: { label: "Pending", className: "bg-amber-500/10 text-amber-600 border-amber-300/40" },
    overdue: { label: "Overdue", className: "bg-rose-500/10 text-rose-600 border-rose-300/40" },
    cancelled: { label: "Cancelled", className: "bg-slate-500/10 text-slate-500 border-slate-300/40" },
}

export function CustomerLedgerDialog({ open, onOpenChange, customer }: CustomerLedgerDialogProps) {
    const { symbol } = useCurrency()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [ledger, setLedger] = React.useState<any>(null)
    const [loading, setLoading] = React.useState(false)

    React.useEffect(() => {
        if (open && customer) {
            setLoading(true)
            setLedger(null)
            getCustomerLedgerFull(customer.id).then(result => {
                if (result.data) setLedger(result.data)
                setLoading(false)
            })
        }
    }, [open, customer])

    if (!customer) return null

    const stats = ledger?.stats
    const transactions = ledger?.transactions ?? []

    const handleExportCsv = () => {
        if (!transactions.length) return
        exportToCsv(
            [
                { key: "date", label: "Date" },
                { key: "type", label: "Type" },
                { key: "reference", label: "Reference" },
                { key: "amount", label: "Amount" },
                { key: "method", label: "Method" },
                { key: "note", label: "Note" },
            ],
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            transactions.map((t: any) => ({
                date: format(new Date(t.date), "yyyy-MM-dd"),
                type: t.type === "invoice" ? "Invoice" : "Payment",
                reference: t.reference,
                amount: t.type === "invoice" ? Number(t.amount).toFixed(2) : `-${Number(t.amount).toFixed(2)}`,
                method: t.method || "",
                note: t.note || "",
            })),
            `ledger_${customer.name.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}`
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
                {/* Header */}
                <div className="p-6 pb-3 flex items-start justify-between">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Customer Ledger</DialogTitle>
                        <DialogDescription>
                            Financial overview for <span className="font-semibold text-foreground">{customer.name}</span>
                        </DialogDescription>
                    </DialogHeader>
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 shrink-0" onClick={handleExportCsv} disabled={!transactions.length}>
                        <Download className="h-3.5 w-3.5" /> Export CSV
                    </Button>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center py-20">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-5">
                        {/* Financial Summary Cards */}
                        {stats && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    {
                                        label: "Total Invoices",
                                        value: stats.totalInvoices,
                                        sub: `${symbol}${stats.totalInvoiced.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                                        icon: FileText,
                                        color: "text-primary",
                                        bg: "bg-primary/5",
                                    },
                                    {
                                        label: "Total Paid",
                                        value: `${symbol}${stats.totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                                        sub: `${stats.invoicesPaid} invoices paid`,
                                        icon: CheckCircle2,
                                        color: "text-emerald-600",
                                        bg: "bg-emerald-500/5",
                                    },
                                    {
                                        label: "Outstanding",
                                        value: `${symbol}${Math.max(0, stats.outstanding).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                                        sub: `${stats.invoicesPending} unpaid`,
                                        icon: stats.outstanding > 0 ? AlertTriangle : CheckCircle2,
                                        color: stats.outstanding > 0 ? "text-rose-600" : "text-emerald-600",
                                        bg: stats.outstanding > 0 ? "bg-rose-500/5" : "bg-emerald-500/5",
                                    },
                                    {
                                        label: "Last Payment",
                                        value: stats.lastPayment ? format(new Date(stats.lastPayment), "dd MMM") : "—",
                                        sub: stats.lastPayment ? format(new Date(stats.lastPayment), "yyyy") : "No payments yet",
                                        icon: CalendarDays,
                                        color: "text-blue-600",
                                        bg: "bg-blue-500/5",
                                    },
                                ].map(s => (
                                    <div key={s.label} className={cn("rounded-xl border border-border/50 p-3.5", s.bg)}>
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <s.icon className={cn("h-3.5 w-3.5", s.color)} />
                                            <span className="text-[11px] font-medium text-muted-foreground">{s.label}</span>
                                        </div>
                                        <p className={cn("text-lg font-bold truncate", s.color)}>{s.value}</p>
                                        <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{s.sub}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Outstanding Balance Bar */}
                        {stats && stats.totalInvoiced > 0 && (
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>Payment Progress</span>
                                    <span className="font-mono">{Math.min(100, Math.round((stats.totalPaid / stats.totalInvoiced) * 100))}%</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(100, (stats.totalPaid / stats.totalInvoiced) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Transaction Ledger */}
                        {transactions.length === 0 ? (
                            <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
                                <Wallet className="h-10 w-10 opacity-20" />
                                <p className="text-sm">No transactions found for this customer.</p>
                            </div>
                        ) : (
                            <div className="rounded-xl border border-border/50 overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/30 border-b border-border/50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Date</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Type</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reference</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Details</th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/30">
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {transactions.map((t: any) => (
                                            <tr key={`${t.type}-${t.id}`} className="hover:bg-muted/20 transition-colors">
                                                <td className="px-4 py-3 text-muted-foreground text-xs">
                                                    {format(new Date(t.date), "dd MMM yyyy")}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {t.type === "invoice" ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <ArrowUpRight className="h-3.5 w-3.5 text-amber-600" />
                                                            <span className="text-xs font-medium text-amber-600">Invoice</span>
                                                            {t.status && (
                                                                <Badge variant="outline" className={cn("text-[9px] capitalize ml-1", statusConfig[t.status]?.className)}>
                                                                    {statusConfig[t.status]?.label || t.status}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1.5">
                                                            <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-600" />
                                                            <span className="text-xs font-medium text-emerald-600">Payment</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="font-semibold text-primary text-xs">{t.reference}</span>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-muted-foreground">
                                                    {t.type === "payment" && t.method && (
                                                        <span className="capitalize">{t.method.replace("_", " ")}</span>
                                                    )}
                                                    {t.type === "payment" && t.note && (
                                                        <span className="block text-[10px] italic truncate max-w-[120px]">{t.note}</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {t.type === "invoice" ? (
                                                        <span className="font-bold font-mono text-amber-600">+{symbol}{Number(t.amount).toFixed(2)}</span>
                                                    ) : (
                                                        <span className="font-bold font-mono text-emerald-600">-{symbol}{Number(t.amount).toFixed(2)}</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
