"use server"

import { createClient } from "@/lib/supabase/server"
import { startOfMonth, endOfMonth, subMonths } from "date-fns"
import { DashboardData } from "@/types/dashboard"
import { Invoice } from "@/types/invoice"

interface InvoiceRow {
    id: string
    invoice_number: string
    total_amount: number
    created_at: string
    payment_status: string
    customer?: { name: string } | null
}

interface ProductRow {
    id: string
    name: string
    sku: string | null
    category: string | null
    stock_quantity: number | null
    min_stock_level: number | null
    selling_price: number | null
}

export async function getDashboardData(): Promise<{ data?: DashboardData; error?: string }> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Not authenticated" }

    try {
        const now = new Date()
        const currentStart = startOfMonth(now).toISOString()
        const currentEnd = endOfMonth(now).toISOString()
        const lastMonthStart = startOfMonth(subMonths(now, 1)).toISOString()
        const lastMonthEnd = endOfMonth(subMonths(now, 1)).toISOString()

        // 1. Fetch Sales (Invoices)
        const { data: currentInvoices } = await supabase.from("invoices").select("total_amount").eq("business_id", user.id).gte("created_at", currentStart).lte("created_at", currentEnd) as { data: { total_amount: number }[] | null }
        const { data: lastInvoices } = await supabase.from("invoices").select("total_amount").eq("business_id", user.id).gte("created_at", lastMonthStart).lte("created_at", lastMonthEnd) as { data: { total_amount: number }[] | null }

        // 2. Fetch Purchases
        const { data: currentPurchases } = await supabase.from("purchases").select("total_amount").eq("business_id", user.id).gte("created_at", currentStart).lte("created_at", currentEnd) as { data: { total_amount: number }[] | null }
        const { data: lastPurchases } = await supabase.from("purchases").select("total_amount").eq("business_id", user.id).gte("created_at", lastMonthStart).lte("created_at", lastMonthEnd) as { data: { total_amount: number }[] | null }

        // 3. Fetch Expenses
        const { data: currentExpenses } = await supabase.from("expenses").select("amount").eq("business_id", user.id).gte("created_at", currentStart).lte("created_at", currentEnd) as { data: { amount: number }[] | null }
        const { data: lastExpenses } = await supabase.from("expenses").select("amount").eq("business_id", user.id).gte("created_at", lastMonthStart).lte("created_at", lastMonthEnd) as { data: { amount: number }[] | null }

        // 4. Fetch All Products for Inventory Stats
        const { data: products } = await supabase
            .from("products")
            .select("id, name, sku, category, stock_quantity, min_stock_level, selling_price")
            .eq("business_id", user.id) as { data: ProductRow[] | null }

        // 5. Fetch Recent Invoices (Last 5)
        const { data: recentInvoices } = await supabase
            .from("invoices")
            .select(`
                *,
                customer:customers(name)
            `)
            .eq("business_id", user.id)
            .order("created_at", { ascending: false })
            .limit(5) as { data: InvoiceRow[] | null }

        const curSales = (currentInvoices || []).reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0)
        const lastSales = (lastInvoices || []).reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0)
        const salesTrend = lastSales === 0 ? 0 : ((curSales - lastSales) / lastSales) * 100

        const curPur = (currentPurchases || []).reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0)
        const lastPur = (lastPurchases || []).reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0)
        const purchaseTrend = lastPur === 0 ? 0 : ((curPur - lastPur) / lastPur) * 100

        const curExp = (currentExpenses || []).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)
        const lastExp = (lastExpenses || []).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)
        const expenseTrend = lastExp === 0 ? 0 : ((curExp - lastExp) / lastExp) * 100

        const curProfit = curSales - curPur - curExp
        const lastProfit = lastSales - lastPur - lastExp
        const profitTrend = lastProfit === 0 ? 0 : ((curProfit - lastProfit) / Math.abs(lastProfit)) * 100

        const allProducts = products || []
        const outOfStockItems = allProducts.filter(p => (p.stock_quantity ?? 0) <= 0)
        const lowStockItems = allProducts.filter(p => {
            const qty = p.stock_quantity ?? 0
            const threshold = p.min_stock_level ?? 0
            return qty > 0 && qty <= threshold
        })
        // Items to show in alerts = both low stock AND out of stock, sorted by urgency
        const alertItems = [
            ...outOfStockItems.map(p => ({ ...p, isOutOfStock: true })),
            ...lowStockItems.map(p => ({ ...p, isOutOfStock: false }))
        ]

        const pendingAmountData = (await supabase.from("invoices").select("total_amount").eq("business_id", user.id).eq("payment_status", "pending")).data as { total_amount: number }[] | null
        const pendingTotal = (pendingAmountData || []).reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0)

        return {
            data: {
                stats: {
                    totalSales: Number(curSales.toFixed(2)),
                    salesTrend: Number(salesTrend.toFixed(1)),
                    totalPurchases: Number(curPur.toFixed(2)),
                    purchaseTrend: Number(purchaseTrend.toFixed(1)),
                    totalExpenses: Number(curExp.toFixed(2)),
                    expenseTrend: Number(expenseTrend.toFixed(1)),
                    netProfit: Number(curProfit.toFixed(2)),
                    profitTrend: Number(profitTrend.toFixed(1)),
                    lowStockCount: lowStockItems.length,
                    outOfStockCount: outOfStockItems.length,
                    totalProducts: allProducts.length,
                    pendingPayments: Number(pendingTotal.toFixed(2))
                },
                recentInvoices: (recentInvoices || []) as unknown as Invoice[],
                lowStockProducts: alertItems.map(p => ({
                    id: p.id,
                    name: p.name,
                    sku: p.sku,
                    category: p.category,
                    stock_quantity: p.stock_quantity ?? 0,
                    min_stock_level: p.min_stock_level ?? 0,
                    isOutOfStock: p.isOutOfStock
                }))
            }
        }
    } catch (err) {
        console.error("Dashboard data fetch error:", err)
        return { error: "Failed to fetch dashboard data" }
    }
}
