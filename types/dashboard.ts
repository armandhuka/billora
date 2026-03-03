import { Invoice } from "./invoice"

export interface DashboardStats {
    totalSales: number
    salesTrend: number // percentage change
    totalPurchases: number
    purchaseTrend: number // percentage change
    totalExpenses: number
    expenseTrend: number // percentage change
    netProfit: number
    profitTrend: number // percentage change
    lowStockCount: number
    pendingPayments: number
}

export interface DashboardData {
    stats: DashboardStats
    recentInvoices: Invoice[]
    lowStockProducts: {
        id: string
        name: string
        stock_quantity: number
        low_stock_threshold: number
    }[]
}
