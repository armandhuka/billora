"use client"

import * as React from "react"
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    AlertTriangle,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    Package,
    Users
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
import { createClient } from "@/lib/supabase/client"

export default function DashboardPage() {
    const [userName, setUserName] = React.useState<string | null>(null)
    const supabase = createClient()

    React.useEffect(() => {
        async function getUser() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUserName(user.user_metadata.name || user.email?.split('@')[0] || "there")
            }
        }
        getUser()
    }, [supabase.auth])

    const stats = [
        {
            title: "Total Sales",
            value: "$12,450.00",
            description: "+12.5% from last month",
            icon: DollarSign,
            trend: "up",
            color: "text-green-600 dark:text-green-400",
            bg: "bg-green-100 dark:bg-green-900/30"
        },
        {
            title: "Total Purchases",
            value: "$8,230.50",
            description: "+8.2% from last month",
            icon: TrendingDown,
            trend: "down",
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-100 dark:bg-blue-900/30"
        },
        {
            title: "Net Profit",
            value: "$4,219.50",
            description: "+15.3% from last month",
            icon: TrendingUp,
            trend: "up",
            color: "text-primary",
            bg: "bg-primary/10"
        },
        {
            title: "Low Stock",
            value: "12 Items",
            description: "Requires immediate reorder",
            icon: AlertTriangle,
            trend: "warning",
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-100 dark:bg-amber-900/30"
        },
        {
            title: "Pending Payments",
            value: "$3,100.00",
            description: "5 invoices outstanding",
            icon: Clock,
            trend: "neutral",
            color: "text-slate-600 dark:text-slate-400",
            bg: "bg-slate-100 dark:bg-slate-900/30"
        }
    ]

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight">Welcome, {userName}!</h2>
                <p className="text-muted-foreground">
                    Here&apos;s a quick overview of your business performance today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {stats.map((stat, index) => (
                    <Card key={index} className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <div className={`${stat.bg} p-2 rounded-lg`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                {stat.trend === "up" && <ArrowUpRight className="h-3 w-3 text-green-500" />}
                                {stat.trend === "down" && <ArrowDownRight className="h-3 w-3 text-blue-500" />}
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Placeholder for deeper analytics */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-border/50 shadow-sm">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>
                            Your most recent business operations and updates.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center border-dashed border-2 rounded-lg m-4 mt-0 bg-muted/20">
                        <div className="text-center space-y-2">
                            <p className="text-muted-foreground text-sm font-medium">Activity graph will appear here</p>
                            <Badge variant="outline">Coming Soon</Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50 shadow-sm">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>
                            Launch frequent operations instantly.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-2">
                        <Button variant="outline" className="justify-start h-12 hover:bg-primary/5 hover:text-primary transition-all">
                            <ArrowUpRight className="mr-2 h-4 w-4 text-primary" />
                            Create New Invoice
                        </Button>
                        <Button variant="outline" className="justify-start h-12 hover:bg-primary/5 hover:text-primary transition-all">
                            <Package className="mr-2 h-4 w-4 text-primary" />
                            Add New Product
                        </Button>
                        <Button variant="outline" className="justify-start h-12 hover:bg-primary/5 hover:text-primary transition-all">
                            <Users className="mr-2 h-4 w-4 text-primary" />
                            Register Customer
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
