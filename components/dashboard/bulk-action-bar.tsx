"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Trash2, Download, X } from "lucide-react"

interface BulkActionBarProps {
    selectedCount: number
    onActivate: () => void
    onDeactivate: () => void
    onDelete: () => void
    onExport: () => void
    onClearSelection: () => void
}

export function BulkActionBar({
    selectedCount,
    onActivate,
    onDeactivate,
    onDelete,
    onExport,
    onClearSelection,
}: BulkActionBarProps) {
    if (selectedCount === 0) return null

    return (
        <div className="flex items-center gap-2 flex-wrap bg-primary/5 border border-primary/20 rounded-xl px-4 py-2.5 animate-in slide-in-from-top-2">
            <Badge variant="default" className="text-xs font-bold">
                {selectedCount} selected
            </Badge>
            <div className="h-4 w-px bg-border mx-1" />
            <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1.5 text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                onClick={onActivate}
            >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Activate
            </Button>
            <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1.5 text-amber-600 border-amber-200 hover:bg-amber-50 dark:hover:bg-amber-950"
                onClick={onDeactivate}
            >
                <XCircle className="h-3.5 w-3.5" />
                Deactivate
            </Button>
            <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1.5"
                onClick={onExport}
            >
                <Download className="h-3.5 w-3.5" />
                Export
            </Button>
            <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={onDelete}
            >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
            </Button>
            <div className="ml-auto">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onClearSelection}>
                    <X className="h-3.5 w-3.5" />
                </Button>
            </div>
        </div>
    )
}
