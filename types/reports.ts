export interface SalesTrendItem {
    date: string
    amount: number
}

export interface ExpenseBreakdownItem {
    category: string
    amount: number
}

export interface FinancialSummary {
    totalSales: number
    totalPurchases: number
    totalExpenses: number
    netProfit: number
    salesTrend: SalesTrendItem[]
    expenseBreakdown: ExpenseBreakdownItem[]
}

export interface InventoryStatus {
    totalProducts: number
    lowStockCount: number
    outOfStockCount: number
    lowStockItems: {
        id: string
        name: string
        stock_quantity: number
        low_stock_threshold: number
    }[]
}

export interface ReportsData {
    financials: FinancialSummary
    inventory: InventoryStatus
}
