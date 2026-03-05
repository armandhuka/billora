"use client"

import * as React from "react"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Purchase } from "@/types/purchase"
import { format } from "date-fns"
import { MoreHorizontal, Eye, FileDown, Trash2, PackageCheck, Pencil, Copy } from "lucide-react"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCurrency } from "@/context/currency-context"
import { cn } from "@/lib/utils"

const statusConfig: Record<string, { label: string; className: string }> = {
    draft: { label: "Draft", className: "bg-slate-500/10 text-slate-500 border-slate-300/40" },
    ordered: { label: "Ordered", className: "bg-blue-500/10 text-blue-600 border-blue-300/40" },
    received: { label: "Received", className: "bg-emerald-500/10 text-emerald-600 border-emerald-300/40" },
    cancelled: { label: "Cancelled", className: "bg-rose-500/10 text-rose-600 border-rose-300/40" },
}

const paymentConfig: Record<string, { label: string; className: string }> = {
    unpaid: { label: "Unpaid", className: "bg-rose-500/10 text-rose-600 border-rose-300/40" },
    partial: { label: "Partial", className: "bg-amber-500/10 text-amber-600 border-amber-300/40" },
    paid: { label: "Paid", className: "bg-emerald-500/10 text-emerald-600 border-emerald-300/40" },
}

interface PurchaseTableProps {
    purchases: Purchase[]
    onEdit: (purchase: Purchase) => void
    onDelete: (id: string) => void
    onView: (purchase: Purchase) => void
    onDownload: (purchase: Purchase) => void
    onDuplicate: (purchase: Purchase) => void
}

export function PurchaseTable({ purchases, onEdit, onDelete, onView, onDownload, onDuplicate }: PurchaseTableProps) {
    const { symbol } = useCurrency()

    if (purchases.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-dashed border-border/60">
                <div className="p-4 bg-muted rounded-full mb-4">
                    <PackageCheck className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No purchases found</h3>
                <p className="text-muted-foreground text-sm max-w-[300px] text-center mt-1">
                    Record your first stock purchase to update your inventory levels.
                </p>
            </div>
        )
    }

    return (
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
            <Table>
                <TableHeader className="bg-muted/30">
                    <TableRow>
                        <TableHead className="font-semibold">Purchase #</TableHead>
                        <TableHead className="font-semibold">Supplier</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Payment</TableHead>
                        <TableHead className="font-semibold">Date</TableHead>
                        <TableHead className="font-semibold text-right">Total</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {purchases.map((purchase) => {
                        const sc = statusConfig[purchase.status] ?? statusConfig.draft
                        const pc = paymentConfig[purchase.payment_status] ?? paymentConfig.unpaid
                        return (
                            <TableRow key={purchase.id} className="group hover:bg-muted/20 transition-colors">
                                <TableCell className="font-medium">
                                    <div className="flex flex-col">
                                        <span className="text-primary">{purchase.purchase_number}</span>
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-tighter">REF: {purchase.id.slice(0, 8)}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{purchase.supplier?.name || "Unknown"}</span>
                                        <span className="text-xs text-muted-foreground">{purchase.supplier?.email || ""}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={cn("text-[10px] capitalize", sc.className)}>
                                        {sc.label}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={cn("text-[10px] capitalize", pc.className)}>
                                        {pc.label}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {format(new Date(purchase.created_at), "MMM dd, yyyy")}
                                </TableCell>
                                <TableCell className="text-right">
                                    <span className="font-bold text-primary font-mono">{symbol}{Number(purchase.total_amount).toFixed(2)}</span>
                                    {(purchase.discount_amount || 0) > 0 && (
                                        <span className="block text-[10px] text-rose-500">
                                            disc. -{symbol}{Number(purchase.discount_amount).toFixed(2)}
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-[180px]">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => onView(purchase)}>
                                                <Eye className="mr-2 h-4 w-4" /> View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onEdit(purchase)}>
                                                <Pencil className="mr-2 h-4 w-4" /> Edit Purchase
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onDuplicate(purchase)}>
                                                <Copy className="mr-2 h-4 w-4" /> Duplicate
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onDownload(purchase)}>
                                                <FileDown className="mr-2 h-4 w-4" /> Download PDF
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                                onClick={() => onDelete(purchase.id)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}
