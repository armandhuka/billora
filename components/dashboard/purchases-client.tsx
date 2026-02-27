"use client"

import * as React from "react"
import { Plus, Download, Filter, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { PurchaseTable } from "@/components/dashboard/purchase-table"
import { PurchaseDialog } from "@/components/dashboard/purchase-dialog"
import { CreatePurchaseInput, Purchase, Supplier } from "@/types/purchase"
import { Product } from "@/types/product"
import { createPurchase } from "@/app/actions/purchases"

interface PurchasesClientProps {
    initialPurchases: Purchase[]
    suppliers: Supplier[]
    products: Product[]
}

export function PurchasesClient({
    initialPurchases,
    suppliers,
    products
}: PurchasesClientProps) {
    const [open, setOpen] = React.useState(false)

    async function handleSave(data: CreatePurchaseInput) {
        const res = await createPurchase(data)
        if (res.error) {
            toast.error(`Error: ${res.error}`)
            throw new Error(res.error)
        }
        toast.success("Purchase recorded successfully! Stock updated.")
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Purchases</h1>
                    <p className="text-muted-foreground">
                        Track stock acquisitions and manage your relationships with suppliers.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="hidden sm:flex">
                        <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                    <Button onClick={() => setOpen(true)} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                        <Plus className="mr-2 h-4 w-4" /> New Purchase
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search purchases..."
                        className="pl-9 bg-card"
                    />
                </div>
                <Button variant="outline" size="icon" className="h-10 w-10">
                    <Filter className="h-4 w-4" />
                </Button>
            </div>

            <PurchaseTable purchases={initialPurchases} />

            <PurchaseDialog
                open={open}
                onOpenChange={setOpen}
                onSave={handleSave}
                suppliers={suppliers}
                products={products}
            />
        </div>
    )
}
