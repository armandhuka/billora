"use client"

import * as React from "react"
import { format } from "date-fns"
import { StockLog } from "@/app/actions/stock-logs"
import { Badge } from "@/components/ui/badge"
import {
    ShoppingBag, ShoppingCart, Settings2, ArrowUp, ArrowDown,
    Package,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface StockHistoryTableProps {
    logs: StockLog[]
}

function MovementTypeBadge({ type, quantity }: { type: string; quantity: number }) {
    const config = {
        purchase: {
            label: "Purchase",
            icon: ShoppingBag,
            className: "bg-emerald-500/10 text-emerald-700 border-emerald-300/50 dark:text-emerald-400",
        },
        sale: {
            label: "Sale",
            icon: ShoppingCart,
            className: "bg-rose-500/10 text-rose-700 border-rose-300/50 dark:text-rose-400",
        },
        adjustment: {
            label: quantity >= 0 ? "Adj. In" : "Adj. Out",
            icon: Settings2,
            className: quantity >= 0
                ? "bg-blue-500/10 text-blue-700 border-blue-300/50 dark:text-blue-400"
                : "bg-amber-500/10 text-amber-700 border-amber-300/50 dark:text-amber-400",
        },
    }

    const c = config[type as keyof typeof config] ?? config.adjustment
    const Icon = c.icon

    return (
        <Badge variant="outline" className={cn("flex items-center gap-1 text-[11px] font-semibold w-fit", c.className)}>
            <Icon className="h-3 w-3" />
            {c.label}
        </Badge>
    )
}

export function StockHistoryTable({ logs }: StockHistoryTableProps) {
    if (logs.length === 0) {
        return (
            <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
                <Package className="h-10 w-10 opacity-20" />
                <p className="text-sm">No stock movements recorded yet.</p>
                <p className="text-xs opacity-60">Movements are tracked when purchases or invoices are created.</p>
            </div>
        )
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="bg-muted/30 border-b border-border/50">
                    <tr>
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Date & Time</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Type</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Note / Reference</th>
                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Quantity</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                    {logs.map((log) => {
                        const isPositive = log.quantity >= 0
                        return (
                            <tr key={log.id} className="hover:bg-muted/20 transition-colors group">
                                <td className="px-5 py-3.5">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-medium text-xs">
                                            {format(new Date(log.created_at), "dd MMM yyyy")}
                                        </span>
                                        <span className="text-[11px] text-muted-foreground">
                                            {format(new Date(log.created_at), "hh:mm a")}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-5 py-3.5">
                                    <MovementTypeBadge type={log.type} quantity={log.quantity} />
                                </td>
                                <td className="px-5 py-3.5">
                                    <div className="flex flex-col gap-0.5">
                                        {log.note && (
                                            <span className="text-sm text-foreground/80">{log.note}</span>
                                        )}
                                        {log.reference_id && (
                                            <span className="text-[11px] font-mono text-muted-foreground truncate max-w-[200px]">
                                                ref: {log.reference_id}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-5 py-3.5 text-right">
                                    <div className={cn(
                                        "inline-flex items-center gap-1 font-bold text-sm",
                                        isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                                    )}>
                                        {isPositive
                                            ? <ArrowUp className="h-3.5 w-3.5" />
                                            : <ArrowDown className="h-3.5 w-3.5" />
                                        }
                                        {isPositive ? "+" : ""}{log.quantity}
                                    </div>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}
