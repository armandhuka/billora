"use client"

import * as React from "react"
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, FileText, CheckCircle2, Clock, AlertTriangle, IndianRupee } from "lucide-react"
import { Customer } from "@/types/invoice"
import { getCustomerLedger } from "@/app/actions/customers"
import { useCurrency } from "@/context/currency-context"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface CustomerLedgerDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    customer: Customer | null
}

const statusConfig: Record<string, { label: string; className: string }> = {
    paid: { label: "Paid", className: "bg-emerald-500/10 text-emerald-600 border-emerald-300/40" },
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
            getCustomerLedger(customer.id).then(result => {
                if (result.data) setLedger(result.data)
                setLoading(false)
            })
        }
    }, [open, customer])

    if (!customer) return null

    const stats = ledger?.stats
    const invoices = ledger?.invoices ?? []

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col p-0 overflow-hidden">
                {/* Header */}
                <div className="p-6 pb-4">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Payment History</DialogTitle>
                        <DialogDescription>
                            All invoices for <span className="font-semibold text-foreground">{customer.name}</span>
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center py-20">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-5">
                        {/* Stats Cards */}
                        {stats && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    {
                                        label: "Total Invoices",
                                        value: stats.totalInvoices,
                                        sub: `${symbol}${stats.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                                        icon: FileText,
                                        color: "text-primary",
                                        bg: "bg-primary/5",
                                    },
                                    {
                                        label: "Paid",
                                        value: stats.totalPaid,
                                        sub: `${symbol}${stats.amountPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                                        icon: CheckCircle2,
                                        color: "text-emerald-600",
                                        bg: "bg-emerald-500/5",
                                    },
                                    {
                                        label: "Pending",
                                        value: stats.totalPending,
                                        sub: `${symbol}${stats.amountPending.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                                        icon: Clock,
                                        color: "text-amber-600",
                                        bg: "bg-amber-500/5",
                                    },
                                    {
                                        label: "Overdue",
                                        value: stats.totalOverdue,
                                        sub: `${symbol}${stats.amountOverdue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                                        icon: AlertTriangle,
                                        color: stats.totalOverdue > 0 ? "text-rose-600" : "text-muted-foreground",
                                        bg: stats.totalOverdue > 0 ? "bg-rose-500/5" : "bg-muted/30",
                                    },
                                ].map(s => (
                                    <div key={s.label} className={cn("rounded-xl border border-border/50 p-3.5", s.bg)}>
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <s.icon className={cn("h-3.5 w-3.5", s.color)} />
                                            <span className="text-[11px] font-medium text-muted-foreground">{s.label}</span>
                                        </div>
                                        <p className={cn("text-xl font-bold", s.color)}>{s.value}</p>
                                        <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{s.sub}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Invoice List */}
                        {invoices.length === 0 ? (
                            <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
                                <FileText className="h-10 w-10 opacity-20" />
                                <p className="text-sm">No invoices found for this customer.</p>
                            </div>
                        ) : (
                            <div className="rounded-xl border border-border/50 overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/30 border-b border-border/50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Invoice</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Date</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/30">
                                        {invoices.map((inv: {
                                            id: string
                                            invoice_number: string
                                            total_amount: number
                                            discount_amount?: number
                                            payment_status: string
                                            created_at: string
                                        }) => {
                                            const sc = statusConfig[inv.payment_status] ?? statusConfig.cancelled
                                            return (
                                                <tr key={inv.id} className="hover:bg-muted/20 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <span className="font-semibold text-primary">{inv.invoice_number}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground text-xs">
                                                        {format(new Date(inv.created_at), "dd MMM yyyy")}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <Badge variant="outline" className={cn("text-[10px] capitalize", sc.className)}>
                                                            {sc.label}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <span className="font-bold font-mono">{symbol}{Number(inv.total_amount).toFixed(2)}</span>
                                                        {(inv.discount_amount || 0) > 0 && (
                                                            <span className="block text-[10px] text-rose-500">
                                                                disc. -{symbol}{Number(inv.discount_amount).toFixed(2)}
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })}
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
