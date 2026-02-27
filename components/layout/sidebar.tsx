"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Package,
    FileText,
    ShoppingCart,
    Users,
    Truck,
    Receipt,
    BarChart3,
    Settings,
    Zap,
    X
} from "lucide-react"
import { Button } from "@/components/ui/button"

export const navItems = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Products", href: "/products", icon: Package },
    { title: "Invoices", href: "/invoices", icon: FileText },
    { title: "Purchases", href: "/purchases", icon: ShoppingCart },
    { title: "Customers", href: "/customers", icon: Users },
    { title: "Suppliers", href: "/suppliers", icon: Truck },
    { title: "Expenses", href: "/expenses", icon: Receipt },
    { title: "Reports", href: "/reports", icon: BarChart3 },
    { title: "Settings", href: "/settings", icon: Settings },
]

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    onClose?: () => void
}

export function Sidebar({ className, onClose, ...props }: SidebarProps) {
    const pathname = usePathname()

    return (
        <aside className={cn("flex flex-col h-full border-r bg-background", className)} {...props}>
            <div className="flex h-16 items-center justify-between px-6 border-b">
                <Link href="/dashboard" className="flex items-center space-x-2 group">
                    <div className="bg-primary text-primary-foreground p-1 rounded-md group-hover:rotate-12 transition-transform">
                        <Zap className="h-5 w-5 fill-current" />
                    </div>
                    <span className="font-bold text-xl tracking-tight">
                        Billora
                    </span>
                </Link>
                {onClose && (
                    <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto py-4">
                <nav className="grid gap-1 px-4">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
                                    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                                )}
                                onClick={() => onClose?.()}
                            >
                                <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "")} />
                                {item.title}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            <div className="p-4 border-t mt-auto">
                <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Account</p>
                    <Link
                        href="/settings"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all"
                        onClick={() => onClose?.()}
                    >
                        <Settings className="h-4 w-4" />
                        Manage Settings
                    </Link>
                </div>
            </div>
        </aside>
    )
}
