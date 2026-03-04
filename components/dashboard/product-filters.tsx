"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Category } from "@/types/product"

type StatusFilter = "all" | "active" | "inactive"
type StockFilter = "all" | "low" | "out"

interface ProductFiltersProps {
    statusFilter: StatusFilter
    stockFilter: StockFilter
    categoryFilter: string
    categories: Category[]
    onStatusChange: (v: StatusFilter) => void
    onStockChange: (v: StockFilter) => void
    onCategoryChange: (v: string) => void
}

const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
]

const stockOptions: { value: StockFilter; label: string }[] = [
    { value: "all", label: "All Stock" },
    { value: "low", label: "Low Stock" },
    { value: "out", label: "Out of Stock" },
]

export function ProductFilters({
    statusFilter,
    stockFilter,
    categoryFilter,
    categories,
    onStatusChange,
    onStockChange,
    onCategoryChange,
}: ProductFiltersProps) {
    const activeCount = [
        statusFilter !== "all",
        stockFilter !== "all",
        categoryFilter !== "all",
    ].filter(Boolean).length

    return (
        <div className="flex flex-wrap items-center gap-2">
            {/* Status */}
            <div className="flex items-center bg-muted/40 rounded-lg p-0.5 gap-0.5">
                {statusOptions.map(opt => (
                    <button
                        key={opt.value}
                        onClick={() => onStatusChange(opt.value)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${statusFilter === opt.value
                                ? "bg-background shadow text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* Stock */}
            <div className="flex items-center bg-muted/40 rounded-lg p-0.5 gap-0.5">
                {stockOptions.map(opt => (
                    <button
                        key={opt.value}
                        onClick={() => onStockChange(opt.value)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${stockFilter === opt.value
                                ? "bg-background shadow text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* Category */}
            {categories.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                    <button
                        onClick={() => onCategoryChange("all")}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${categoryFilter === "all"
                                ? "bg-primary text-primary-foreground border-primary"
                                : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                            }`}
                    >
                        All Categories
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => onCategoryChange(cat.name)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${categoryFilter === cat.name
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            )}

            {activeCount > 0 && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground"
                    onClick={() => {
                        onStatusChange("all")
                        onStockChange("all")
                        onCategoryChange("all")
                    }}
                >
                    Clear filters
                    <Badge variant="secondary" className="ml-1.5 text-[10px] h-4 px-1.5">{activeCount}</Badge>
                </Button>
            )}
        </div>
    )
}
