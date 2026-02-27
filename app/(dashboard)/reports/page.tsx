import { getReportsData } from "@/app/actions/reports"
import { ReportsClient } from "@/components/dashboard/reports-client"

export default async function ReportsPage() {
    const res = await getReportsData()

    // Default fallback if error occurs
    const defaultData = {
        financials: { totalSales: 0, totalPurchases: 0, totalExpenses: 0, netProfit: 0 },
        inventory: { totalProducts: 0, lowStockCount: 0, outOfStockCount: 0, lowStockItems: [] }
    }

    const reportsData = res.data || defaultData

    return <ReportsClient initialData={reportsData} />
}
