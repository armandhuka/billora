"use client"

import * as React from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { SidebarTopbar } from "@/components/dashboard/topbar"
import { Sheet, SheetContent } from "@/components/ui/sheet"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)

    return (
        <div className="flex min-h-screen bg-background text-foreground uppercase-none">
            {/* Desktop Sidebar */}
            <Sidebar className="hidden lg:flex w-64 fixed inset-y-0 z-50" />

            {/* Mobile Sidebar */}
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetContent side="left" className="p-0 border-none w-64">
                    <Sidebar onClose={() => setIsSidebarOpen(false)} />
                </SheetContent>
            </Sheet>

            <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
                <SidebarTopbar onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 p-6 md:p-8 lg:p-10">
                    <div className="mx-auto max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
