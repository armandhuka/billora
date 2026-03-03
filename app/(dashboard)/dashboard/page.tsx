import { getDashboardData } from "@/app/actions/dashboard"
import { DashboardClient } from "@/components/dashboard/dashboard-client"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const res = await getDashboardData()
    const dashboardData = res.data || {
        stats: {
            totalSales: 0,
            salesTrend: 0,
            totalPurchases: 0,
            purchaseTrend: 0,
            totalExpenses: 0,
            expenseTrend: 0,
            netProfit: 0,
            profitTrend: 0,
            lowStockCount: 0,
            outOfStockCount: 0,
            totalProducts: 0,
            pendingPayments: 0
        },
        recentInvoices: [],
        lowStockProducts: []
    }

    const userName = user.user_metadata?.name || user.email?.split('@')[0] || "User"

    return <DashboardClient data={dashboardData} userName={userName} />
}
