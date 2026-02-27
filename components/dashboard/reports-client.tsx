"use client"

import * as React from "react"
import { Calendar as CalendarIcon, AlertTriangle, Package2, ArrowRight, TrendingUp, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ReportsData } from "@/types/reports"
import { ReportSummaryCards } from "@/components/dashboard/report-summary-cards"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { getReportsData } from "@/app/actions/reports"
import { toast } from "sonner"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface ReportsClientProps {
    initialData: ReportsData
}

export function ReportsClient({ initialData }: ReportsClientProps) {
    const [data, setData] = React.useState<ReportsData>(initialData)
    const [loading, setLoading] = React.useState(false)
    const [dateRange, setDateRange] = React.useState({
        from: format(startOfMonth(new Date()), "yyyy-MM-dd"),
        to: format(endOfMonth(new Date()), "yyyy-MM-dd")
    })

    const handleFilter = async () => {
        setLoading(true)
        try {
            const res = await getReportsData(dateRange.from, dateRange.to)
            if (res.error) {
                toast.error(res.error)
            } else if (res.data) {
                setData(res.data)
                toast.success("Reports updated")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Analytics & Reports</h1>
                    <p className="text-muted-foreground">
                        Comprehensive overview of your business performance and inventory.
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-card p-1.5 rounded-lg border border-border/50 shadow-sm">
                    <div className="flex items-center gap-2 px-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <Input
                            type="date"
                            className="w-[140px] h-8 text-xs border-none bg-transparent focus-visible:ring-0 p-0"
                            value={dateRange.from}
                            onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                        />
                        <span className="text-muted-foreground text-xs uppercase font-bold">to</span>
                        <Input
                            type="date"
                            className="w-[140px] h-8 text-xs border-none bg-transparent focus-visible:ring-0 p-0"
                            value={dateRange.to}
                            onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                        />
                    </div>
                    <Button
                        size="sm"
                        onClick={handleFilter}
                        disabled={loading}
                        className="h-8 bg-primary hover:bg-primary/90"
                    >
                        {loading ? "Updating..." : "Update"}
                    </Button>
                </div>
            </div>

            <ReportSummaryCards financials={data.financials} />

            <div className="grid gap-6 md:grid-cols-2">
                {/* Inventory Health Card */}
                <Card className="border-border/50 shadow-sm">
                    <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                        <div className="p-2 bg-amber-500/10 rounded-lg">
                            <Package2 className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <CardTitle>Inventory Health</CardTitle>
                            <CardDescription>Status of your stock levels</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-muted/30 rounded-lg border border-border/20">
                                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total SKUs</div>
                                <div className="text-2xl font-bold">{data.inventory.totalProducts}</div>
                            </div>
                            <div className="p-3 bg-muted/30 rounded-lg border border-border/20">
                                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Out of Stock</div>
                                <div className="text-2xl font-bold text-rose-600">{data.inventory.outOfStockCount}</div>
                            </div>
                        </div>

                        {data.inventory.lowStockItems.length > 0 ? (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-semibold flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-amber-500" /> Low Stock Alerts
                                    </h4>
                                    <Badge variant="outline" className="text-[10px] uppercase">{data.inventory.lowStockCount} items</Badge>
                                </div>
                                <div className="rounded-md border border-border/50 divide-y divide-border/30 overflow-hidden">
                                    {data.inventory.lowStockItems.slice(0, 5).map(item => (
                                        <div key={item.id} className="flex items-center justify-between p-2.5 text-sm bg-muted/10 group hover:bg-muted/20 transition-colors">
                                            <span className="font-medium truncate max-w-[180px]">{item.name}</span>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <div className="text-[10px] text-muted-foreground leading-none">Stock</div>
                                                    <div className="font-bold text-amber-600">{item.stock_quantity}</div>
                                                </div>
                                                <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100" asChild>
                                                    <Link href="/products">
                                                        <ArrowRight className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {data.inventory.lowStockItems.length > 5 && (
                                        <Link href="/products" className="block p-2 text-center text-xs text-primary hover:bg-primary/5 transition-colors font-semibold uppercase tracking-widest">
                                            View all {data.inventory.lowStockItems.length} alerts
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="py-8 text-center bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                                <p className="text-sm text-emerald-600 font-medium italic">All stock levels are optimal</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Performance Summary */}
                <Card className="border-border/50 shadow-sm overflow-hidden">
                    <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle>Performance Overview</CardTitle>
                            <CardDescription>Financial breakdown for selected period</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="px-6 py-4 space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Gross Revenue</span>
                                    <span className="font-bold text-emerald-600">${data.financials.totalSales.toFixed(2)}</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500" style={{ width: '100%' }} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Total Outgoings (Purchases + Expenses)</span>
                                    <span className="font-bold text-rose-600">
                                        ${(data.financials.totalPurchases + data.financials.totalExpenses).toFixed(2)}
                                    </span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-rose-500"
                                        style={{
                                            width: `${Math.min(100, ((data.financials.totalPurchases + data.financials.totalExpenses) / (data.financials.totalSales || 1)) * 100)}%`
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-border/50">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">Net Profit</span>
                                        <span className={cn(
                                            "text-3xl font-bold",
                                            data.financials.netProfit >= 0 ? "text-primary" : "text-rose-600"
                                        )}>
                                            ${data.financials.netProfit.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className={cn(
                                        "p-4 rounded-xl border-2 transition-transform hover:scale-105",
                                        data.financials.netProfit >= 0 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20"
                                    )}>
                                        {data.financials.netProfit >= 0 ? (
                                            <TrendingUp className="h-8 w-8 text-emerald-600" />
                                        ) : (
                                            <TrendingDown className="h-8 w-8 text-rose-600" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-muted/30 px-6 py-4 border-t border-border/50">
                            <p className="text-[10px] text-muted-foreground italic text-center">
                                * Data calculated based on completed invoices, recorded purchases, and logged expenses within the selected timeframe.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
