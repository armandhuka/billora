"use client"

import * as React from "react"
import {
    TrendingUp,
    DollarSign,
    AlertTriangle,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    Package,
    Users,
    ShoppingCart,
    Receipt,
    ExternalLink
} from "lucide-react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DashboardData } from "@/types/dashboard"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useCurrency } from "@/context/currency-context"

interface DashboardClientProps {
    data: DashboardData
    userName: string
}

export function DashboardClient({ data, userName }: DashboardClientProps) {
    const { stats, recentInvoices, lowStockProducts } = data
    const { symbol } = useCurrency()

    const statCards = [
        {
            title: "Total Sales",
            value: `${symbol}${stats.totalSales.toLocaleString()}`,
            description: `${stats.salesTrend >= 0 ? "+" : ""}${stats.salesTrend}% from last month`,
            icon: DollarSign,
            trend: stats.salesTrend >= 0 ? "up" : "down",
            color: stats.salesTrend >= 0 ? "text-emerald-600" : "text-rose-600",
            bg: stats.salesTrend >= 0 ? "bg-emerald-500/10" : "bg-rose-500/10"
        },
        {
            title: "Total Purchases",
            value: `${symbol}${stats.totalPurchases.toLocaleString()}`,
            description: `${stats.purchaseTrend >= 0 ? "+" : ""}${stats.purchaseTrend}% from last month`,
            icon: ShoppingCart,
            trend: stats.purchaseTrend >= 0 ? "up" : "down",
            color: "text-blue-600",
            bg: "bg-blue-500/10"
        },
        {
            title: "Net Profit",
            value: `${symbol}${stats.netProfit.toLocaleString()}`,
            description: `${stats.profitTrend >= 0 ? "+" : ""}${stats.profitTrend}% from last month`,
            icon: TrendingUp,
            trend: stats.profitTrend >= 0 ? "up" : "down",
            color: "text-primary",
            bg: "bg-primary/10"
        },
        {
            title: "Low Stock",
            value: `${stats.lowStockCount} Items`,
            description: stats.lowStockCount > 0 ? "Needs reorder soon" : "All levels optimal",
            icon: AlertTriangle,
            trend: stats.lowStockCount > 0 ? "warning" : "neutral",
            color: stats.lowStockCount > 0 ? "text-amber-600" : "text-emerald-600",
            bg: stats.lowStockCount > 0 ? "bg-amber-500/10" : "bg-emerald-500/10"
        },
        {
            title: "Out of Stock",
            value: `${stats.outOfStockCount} Items`,
            description: stats.outOfStockCount > 0 ? "Immediate action required" : "No stockouts",
            icon: Package,
            trend: stats.outOfStockCount > 0 ? "warning" : "neutral",
            color: stats.outOfStockCount > 0 ? "text-rose-600" : "text-emerald-600",
            bg: stats.outOfStockCount > 0 ? "bg-rose-500/10" : "bg-emerald-500/10"
        },
        {
            title: "Pending Payments",
            value: `${symbol}${stats.pendingPayments.toLocaleString()}`,
            description: "Total outstanding from invoices",
            icon: Clock,
            trend: "neutral",
            color: "text-slate-600",
            bg: "bg-slate-500/10"
        }
    ]

    return (
        <div className="space-y-8 pb-8">
            {/* Welcome Section */}
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight text-primary">Welcome back, {userName}!</h2>
                <p className="text-muted-foreground">
                    Here&apos;s a snapshot of your business performance for {format(new Date(), "MMMM yyyy")}.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {statCards.map((stat, index) => (
                    <Card key={index} className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300 group">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                {stat.title}
                            </CardTitle>
                            <div className={cn(stat.bg, "p-2 rounded-xl group-hover:scale-110 transition-transform")}>
                                <stat.icon className={cn("h-4 w-4", stat.color)} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
                            <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1 font-medium italic">
                                {stat.trend === "up" && <ArrowUpRight className="h-3 w-3 text-emerald-500" />}
                                {stat.trend === "down" && <ArrowDownRight className="h-3 w-3 text-rose-500" />}
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-7">
                {/* Recent Invoices */}
                <Card className="lg:col-span-4 border-border/50 shadow-sm overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Receipt className="h-5 w-5 text-primary" />
                                Recent Invoices
                            </CardTitle>
                            <CardDescription>Latest 5 transactions from your business.</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary hover:bg-primary/10">
                            <Link href="/invoices">View All <ArrowUpRight className="ml-1 h-3 w-3" /></Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border/30">
                            {recentInvoices.length > 0 ? (
                                recentInvoices.map((invoice) => (
                                    <div key={invoice.id} className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors group">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-semibold text-sm group-hover:text-primary transition-colors">#{invoice.invoice_number}</span>
                                            <span className="text-xs text-muted-foreground">{invoice.customer?.name || "No Customer"}</span>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="flex flex-col items-end">
                                                <span className="font-bold text-sm">{symbol}{Number(invoice.total_amount).toLocaleString()}</span>
                                                <span className="text-[10px] text-muted-foreground font-medium uppercase">{format(new Date(invoice.created_at), "MMM dd, hh:mm a")}</span>
                                            </div>
                                            <Badge
                                                variant={invoice.payment_status === "paid" ? "default" : "outline"}
                                                className={cn(
                                                    "text-[9px] uppercase font-bold tracking-widest h-5",
                                                    invoice.payment_status === "paid" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                                )}
                                            >
                                                {invoice.payment_status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center text-muted-foreground italic text-sm">No recent activity found.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Left Side Column */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Inventory Alerts */}
                    <Card className="border-border/50 shadow-sm overflow-hidden">
                        <CardHeader className="bg-amber-500/5 border-b border-amber-500/10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-500">
                                        <AlertTriangle className="h-5 w-5" />
                                        Inventory Alerts
                                    </CardTitle>
                                    <CardDescription className="text-amber-600/70 mt-1">
                                        {stats.outOfStockCount > 0 && (
                                            <span className="text-rose-600 font-semibold">{stats.outOfStockCount} out of stock</span>
                                        )}
                                        {stats.outOfStockCount > 0 && stats.lowStockCount > 0 && " · "}
                                        {stats.lowStockCount > 0 && (
                                            <span className="text-amber-600 font-semibold">{stats.lowStockCount} running low</span>
                                        )}
                                        {stats.outOfStockCount === 0 && stats.lowStockCount === 0 && (
                                            <span className="text-emerald-600 font-semibold">{stats.totalProducts} products · All healthy</span>
                                        )}
                                    </CardDescription>
                                </div>
                                <Button variant="ghost" size="sm" asChild className="text-amber-600 hover:text-amber-700 hover:bg-amber-500/10">
                                    <Link href="/products">Manage</Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border/30">
                                {lowStockProducts.length > 0 ? (
                                    lowStockProducts.slice(0, 6).map((product) => (
                                        <div key={product.id} className={cn(
                                            "flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors group",
                                            product.isOutOfStock && "bg-rose-500/5 hover:bg-rose-500/8"
                                        )}>
                                            <div className="flex flex-col gap-0.5 min-w-0">
                                                <span className="font-medium text-sm truncate">{product.name}</span>
                                                <span className="text-[10px] text-muted-foreground font-mono">
                                                    {product.sku && `SKU: ${product.sku}`}
                                                    {product.sku && product.category && " · "}
                                                    {product.category && product.category}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 ml-2 shrink-0">
                                                {product.isOutOfStock ? (
                                                    <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 text-[9px] font-bold uppercase tracking-wider">
                                                        Out of Stock
                                                    </Badge>
                                                ) : (
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-xs font-bold text-amber-600">{product.stock_quantity} left</span>
                                                        <span className="text-[9px] text-muted-foreground">min: {product.min_stock_level}</span>
                                                    </div>
                                                )}
                                                <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-all" asChild>
                                                    <Link href="/products"><ExternalLink className="h-3.5 w-3.5" /></Link>
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-10 text-center bg-emerald-500/5">
                                        <div className="flex flex-col items-center gap-2">
                                            <Package className="h-8 w-8 text-emerald-500/40" />
                                            <p className="text-emerald-600 font-medium text-sm">All {stats.totalProducts} products are in stock</p>
                                            <p className="text-xs text-muted-foreground">Inventory is healthy!</p>
                                        </div>
                                    </div>
                                )}
                                {lowStockProducts.length > 6 && (
                                    <Button variant="ghost" className="w-full h-9 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/5 rounded-none" asChild>
                                        <Link href="/products">View All {lowStockProducts.length} Alerts →</Link>
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Actions</CardTitle>
                            <CardDescription>Common business operations.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-3">
                            <Button variant="outline" className="flex flex-col items-center gap-2 h-24 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all group" asChild>
                                <Link href="/invoices">
                                    <div className="p-2 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform">
                                        <ArrowUpRight className="h-5 w-5 text-primary" />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-wider">New Invoice</span>
                                </Link>
                            </Button>
                            <Button variant="outline" className="flex flex-col items-center gap-2 h-24 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all group" asChild>
                                <Link href="/products">
                                    <div className="p-2 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform">
                                        <Package className="h-5 w-5 text-primary" />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-wider">Add Product</span>
                                </Link>
                            </Button>
                            <Button variant="outline" className="flex flex-col items-center gap-2 h-24 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all group" asChild>
                                <Link href="/customers">
                                    <div className="p-2 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform">
                                        <Users className="h-5 w-5 text-primary" />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-wider">Customers</span>
                                </Link>
                            </Button>
                            <Button variant="outline" className="flex flex-col items-center gap-2 h-24 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all group" asChild>
                                <Link href="/reports">
                                    <div className="p-2 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform">
                                        <TrendingUp className="h-5 w-5 text-primary" />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-wider">Full Report</span>
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
