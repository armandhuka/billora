export interface FinancialSummary {
    totalSales: number
    totalPurchases: number
    totalExpenses: number
    netProfit: number
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
