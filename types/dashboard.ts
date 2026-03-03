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
    outOfStockCount: number
    totalProducts: number
    pendingPayments: number
}

export interface LowStockProduct {
    id: string
    name: string
    sku?: string | null
    category?: string | null
    stock_quantity: number
    min_stock_level: number
    isOutOfStock: boolean
}

export interface DashboardData {
    stats: DashboardStats
    recentInvoices: Invoice[]
    lowStockProducts: LowStockProduct[]
}
