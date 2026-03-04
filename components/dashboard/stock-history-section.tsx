"use client"

import * as React from "react"
import { StockLog, getStockLogs } from "@/app/actions/stock-logs"
import { StockHistoryTable } from "@/components/dashboard/stock-history-table"
import { StockAdjustDialog } from "@/components/dashboard/stock-adjust-dialog"
import { Button } from "@/components/ui/button"
import { RefreshCw, SlidersHorizontal, History } from "lucide-react"
import { toast } from "sonner"

interface StockHistorySectionProps {
    productId: string
    productName: string
    currentStock: number
    initialLogs: StockLog[]
}

export function StockHistorySection({
    productId,
    productName,
    currentStock,
    initialLogs,
}: StockHistorySectionProps) {
    const [logs, setLogs] = React.useState<StockLog[]>(initialLogs)
    const [stock, setStock] = React.useState(currentStock)
    const [adjustOpen, setAdjustOpen] = React.useState(false)
    const [refreshing, setRefreshing] = React.useState(false)

    async function refresh() {
        setRefreshing(true)
        const result = await getStockLogs(productId)
        if (result.data) setLogs(result.data)
        else toast.error("Failed to refresh stock logs")
        setRefreshing(false)
    }

    function handleAdjusted() {
        refresh()
    }

    return (
        <div className="bg-background border border-border/50 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">Stock Movement History</h3>
                    {logs.length > 0 && (
                        <span className="inline-flex items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold px-2 h-5">
                            {logs.length}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={refresh}
                        disabled={refreshing}
                        className="gap-1.5"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => setAdjustOpen(true)}
                        className="gap-1.5"
                    >
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                        Adjust Stock
                    </Button>
                </div>
            </div>

            {/* Table */}
            <StockHistoryTable logs={logs} />

            {/* Adjustment dialog */}
            <StockAdjustDialog
                open={adjustOpen}
                onOpenChange={setAdjustOpen}
                productId={productId}
                productName={productName}
                currentStock={stock}
                onAdjusted={handleAdjusted}
            />
        </div>
    )
}
