"use client"

import * as React from "react"
import { Package, AlertTriangle, TrendingUp, CheckCircle2, BarChart3 } from "lucide-react"
import { Product } from "@/types/product"
import { useCurrency } from "@/context/currency-context"

interface ProductStatsBarProps {
    products: Product[]
}

export function ProductStatsBar({ products }: ProductStatsBarProps) {
    const { symbol } = useCurrency()

    const totalProducts = products.length
    const activeProducts = products.filter(p => p.is_active).length
    const lowStockItems = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= p.min_stock_level).length
    const outOfStock = products.filter(p => p.stock_quantity === 0).length
    const totalStockValue = products.reduce((sum, p) => {
        return sum + (p.stock_quantity * (p.purchase_price ?? 0))
    }, 0)

    const stats = [
        {
            label: "Total Products",
            value: totalProducts,
            icon: Package,
            color: "text-primary",
            bg: "bg-primary/10",
        },
        {
            label: "Active",
            value: activeProducts,
            icon: CheckCircle2,
            color: "text-emerald-600",
            bg: "bg-emerald-500/10",
        },
        {
            label: "Low Stock",
            value: lowStockItems,
            icon: AlertTriangle,
            color: "text-amber-600",
            bg: "bg-amber-500/10",
            pulse: lowStockItems > 0,
        },
        {
            label: "Out of Stock",
            value: outOfStock,
            icon: TrendingUp,
            color: "text-rose-600",
            bg: "bg-rose-500/10",
            pulse: outOfStock > 0,
        },
        {
            label: "Stock Value",
            value: `${symbol}${totalStockValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
            icon: BarChart3,
            color: "text-violet-600",
            bg: "bg-violet-500/10",
        },
    ]

    return (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className="bg-background rounded-xl border border-border/50 p-4 flex items-center gap-3"
                >
                    <div className={`${stat.bg} p-2.5 rounded-lg shrink-0`}>
                        <stat.icon className={`h-5 w-5 ${stat.color} ${stat.pulse ? "animate-pulse" : ""}`} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
                            {stat.label}
                        </p>
                        <p className="text-xl font-bold leading-tight">{stat.value}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}
