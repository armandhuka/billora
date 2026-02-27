"use server"

import { createClient } from "@/lib/supabase/server"
import { ReportsData } from "@/types/reports"
import { startOfMonth, endOfMonth } from "date-fns"

export async function getReportsData(startDate?: string, endDate?: string): Promise<{ data?: ReportsData; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Not authenticated" }
    }

    const start = startDate ? new Date(startDate).toISOString() : startOfMonth(new Date()).toISOString()
    const end = endDate ? new Date(endDate).toISOString() : endOfMonth(new Date()).toISOString()

    try {
        // 1. Fetch Sales (Invoices)
        const { data: invoices, error: salesError } = await supabase
            .from("invoices")
            .select("total_amount")
            .eq("business_id", user.id)
            .gte("created_at", start)
            .lte("created_at", end)

        if (salesError) throw salesError

        // 2. Fetch Purchases
        const { data: purchases, error: purchasesError } = await supabase
            .from("purchases")
            .select("total_amount")
            .eq("business_id", user.id)
            .gte("created_at", start)
            .lte("created_at", end)

        if (purchasesError) throw purchasesError

        // 3. Fetch Expenses
        const { data: expenses, error: expensesError } = await supabase
            .from("expenses")
            .select("amount")
            .eq("business_id", user.id)
            .gte("created_at", start)
            .lte("created_at", end)

        if (expensesError) throw expensesError

        // 4. Fetch Products for Inventory Status
        const { data: products, error: productsError } = await supabase
            .from("products")
            .select("id, name, stock_quantity, low_stock_threshold")
            .eq("business_id", user.id)

        if (productsError) throw productsError

        // Calculations
        const totalSales = invoices.reduce((sum, inv) => sum + Number(inv.total_amount), 0)
        const totalPurchases = purchases.reduce((sum, pur) => sum + Number(pur.total_amount), 0)
        const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0)
        const netProfit = totalSales - totalPurchases - totalExpenses

        const lowStockItems = products.filter(p => p.stock_quantity <= p.low_stock_threshold && p.stock_quantity > 0)
        const outOfStockItems = products.filter(p => (p.stock_quantity || 0) <= 0)

        return {
            data: {
                financials: {
                    totalSales,
                    totalPurchases,
                    totalExpenses,
                    netProfit
                },
                inventory: {
                    totalProducts: products.length,
                    lowStockCount: lowStockItems.length,
                    outOfStockCount: outOfStockItems.length,
                    lowStockItems: lowStockItems.map(p => ({
                        id: p.id,
                        name: p.name,
                        stock_quantity: p.stock_quantity,
                        low_stock_threshold: p.low_stock_threshold
                    }))
                }
            }
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        return { error: err.message }
    }
}
