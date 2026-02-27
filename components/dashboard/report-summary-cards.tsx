"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FinancialSummary } from "@/types/reports"
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Receipt, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"

interface ReportSummaryCardsProps {
    financials: FinancialSummary
}

export function ReportSummaryCards({ financials }: ReportSummaryCardsProps) {
    const items = [
        {
            title: "Total Sales",
            value: financials.totalSales,
            icon: DollarSign,
            color: "text-emerald-600",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20"
        },
        {
            title: "Total Purchases",
            value: financials.totalPurchases,
            icon: ShoppingCart,
            color: "text-amber-600",
            bg: "bg-amber-500/10",
            border: "border-amber-500/20"
        },
        {
            title: "Total Expenses",
            value: financials.totalExpenses,
            icon: Receipt,
            color: "text-rose-600",
            bg: "bg-rose-500/10",
            border: "border-rose-500/20"
        },
        {
            title: "Net Profit",
            value: financials.netProfit,
            icon: Wallet,
            color: financials.netProfit >= 0 ? "text-blue-600" : "text-rose-600",
            bg: financials.netProfit >= 0 ? "bg-blue-500/10" : "bg-rose-500/10",
            border: financials.netProfit >= 0 ? "border-blue-500/20" : "border-rose-500/20"
        }
    ]

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {items.map((item, index) => (
                <Card key={index} className={cn("overflow-hidden border-2 transition-all hover:shadow-md", item.border)}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {item.title}
                        </CardTitle>
                        <div className={cn("rounded-full p-2", item.bg)}>
                            <item.icon className={cn("h-4 w-4", item.color)} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline space-x-2">
                            <span className="text-2xl font-bold">
                                ${item.value.toFixed(2)}
                            </span>
                        </div>
                        <div className="mt-2 flex items-center text-[10px] font-medium text-muted-foreground">
                            {item.title === "Net Profit" && (
                                financials.netProfit >= 0 ? (
                                    <div className="flex items-center text-emerald-600">
                                        <TrendingUp className="mr-1 h-3 w-3" /> Positive Growth
                                    </div>
                                ) : (
                                    <div className="flex items-center text-rose-600">
                                        <TrendingDown className="mr-1 h-3 w-3" /> Net Loss
                                    </div>
                                )
                            )}
                            {item.title !== "Net Profit" && "Activity in selected period"}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
