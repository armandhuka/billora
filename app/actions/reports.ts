"use server"

import { createClient } from "@/lib/supabase/server"
import { ReportsData } from "@/types/reports"
import { startOfDay, endOfDay, parseISO, startOfMonth, endOfMonth, format } from "date-fns"
import * as fs from "fs"
import * as path from "path"

const LOG_FILE = path.join(process.cwd(), "reports_debug.log")

function logDebug(message: string, data?: unknown) {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] ${message} ${data ? JSON.stringify(data, null, 2) : ""}\n`
    fs.appendFileSync(LOG_FILE, logMessage)
}

export async function getReportsData(startDate?: string, endDate?: string): Promise<{ data?: ReportsData; error?: string }> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        logDebug("Auth Error: Not authenticated")
        return { error: "Not authenticated" }
    }

    logDebug("Reports Debug - User Email:", user.email)
    logDebug("Reports Debug - User ID:", user.id)

    // Use current month if no dates provided
    const now = new Date()
    const start = startDate
        ? startOfDay(parseISO(startDate)).toISOString()
        : startOfMonth(now).toISOString()
    const end = endDate
        ? endOfDay(parseISO(endDate)).toISOString()
        : endOfMonth(now).toISOString()

    logDebug("Reports Debug - Date Range:", { start, end })

    try {
        // 1. Fetch Sales (Invoices)
        const { data: invoices, error: salesError } = await supabase
            .from("invoices")
            .select("total_amount, created_at")
            .eq("business_id", user.id)
            .gte("created_at", start)
            .lte("created_at", end)

        if (salesError) {
            logDebug("Sales Error:", salesError)
            throw salesError
        }
        logDebug("Reports Debug - Invoices Fetched:", invoices?.length || 0)
        logDebug("Reports Debug - Sample Invoices:", invoices?.slice(0, 2))

        // 2. Fetch Purchases
        const { data: purchases, error: purchasesError } = await supabase
            .from("purchases")
            .select("total_amount, created_at")
            .eq("business_id", user.id)
            .gte("created_at", start)
            .lte("created_at", end)

        if (purchasesError) {
            logDebug("Purchases Error:", purchasesError)
            throw purchasesError
        }
        logDebug("Reports Debug - Purchases Fetched:", purchases?.length || 0)

        // 3. Fetch Expenses
        const { data: expenses, error: expensesError } = await supabase
            .from("expenses")
            .select("amount, category, created_at")
            .eq("business_id", user.id)
            .gte("created_at", start)
            .lte("created_at", end)

        if (expensesError) {
            logDebug("Expenses Error:", expensesError)
            throw expensesError
        }
        logDebug("Reports Debug - Expenses Fetched:", expenses?.length || 0)

        // 4. Fetch Products for Inventory Status
        const { data: products, error: productsError } = await supabase
            .from("products")
            .select("id, name, stock_quantity, low_stock_threshold")
            .eq("business_id", user.id)

        if (productsError) throw productsError
        console.log("Reports Debug - Products Fetched:", products?.length || 0)

        // Calculations with robust numeric conversion
        const totalSales = (invoices || []).reduce((sum: number, inv) => sum + (Number(inv.total_amount) || 0), 0)
        const totalPurchases = (purchases || []).reduce((sum: number, pur) => sum + (Number(pur.total_amount) || 0), 0)
        const totalExpenses = (expenses || []).reduce((sum: number, exp) => sum + (Number(exp.amount) || 0), 0)
        const netProfit = totalSales - totalPurchases - totalExpenses

        // Trends and Breakdowns
        const salesTrendMap: Record<string, number> = {}
        invoices?.forEach((inv) => {
            const date = format(parseISO(inv.created_at), "MMM dd")
            salesTrendMap[date] = (salesTrendMap[date] || 0) + (Number(inv.total_amount) || 0)
        })
        const salesTrend = Object.entries(salesTrendMap)
            .map(([date, amount]) => ({
                date,
                amount: Number(amount.toFixed(2))
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        const expenseBreakdownMap: Record<string, number> = {}
        expenses?.forEach((exp) => {
            const cat = exp.category || "Other"
            expenseBreakdownMap[cat] = (expenseBreakdownMap[cat] || 0) + (Number(exp.amount) || 0)
        })
        const expenseBreakdown = Object.entries(expenseBreakdownMap).map(([category, amount]) => ({
            category,
            amount: Number(amount.toFixed(2))
        }))

        const items = products || []
        const lowStockItems = items.filter((p) => (p.stock_quantity || 0) <= (p.low_stock_threshold || 0) && (p.stock_quantity || 0) > 0)
        const outOfStockItems = items.filter((p) => (p.stock_quantity || 0) <= 0)

        const results = {
            financials: {
                totalSales: Number(totalSales.toFixed(2)),
                totalPurchases: Number(totalPurchases.toFixed(2)),
                totalExpenses: Number(totalExpenses.toFixed(2)),
                netProfit: Number(netProfit.toFixed(2)),
                salesTrend,
                expenseBreakdown
            },
            inventory: {
                totalProducts: items.length,
                lowStockCount: lowStockItems.length,
                outOfStockCount: outOfStockItems.length,
                lowStockItems: lowStockItems.map((p) => ({
                    id: p.id,
                    name: p.name,
                    stock_quantity: p.stock_quantity || 0,
                    low_stock_threshold: p.low_stock_threshold || 0
                }))
            }
        }

        logDebug("Reports Debug - Final Results:", results)

        return {
            data: results
        }
    } catch (err) {
        console.error("Report generation error:", err)
        return { error: (err as Error).message || "Failed to generate report" }
    }
}
