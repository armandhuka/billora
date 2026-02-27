"use client"

import * as React from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Purchase } from "@/types/purchase"
import { format } from "date-fns"
import { MoreHorizontal, Eye, FileDown, Trash2, PackageCheck } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface PurchaseTableProps {
    purchases: Purchase[]
}

export function PurchaseTable({ purchases }: PurchaseTableProps) {
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
                        <TableHead className="font-semibold">Date</TableHead>
                        <TableHead className="font-semibold text-right">Total Amount</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {purchases.map((purchase) => (
                        <TableRow key={purchase.id} className="group hover:bg-muted/20 transition-colors">
                            <TableCell className="font-medium">
                                <div className="flex flex-col">
                                    <span>{purchase.purchase_number}</span>
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-tighter">REF: {purchase.id.slice(0, 8)}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium">{purchase.supplier?.name || "Unknown Supplier"}</span>
                                    <span className="text-xs text-muted-foreground">{purchase.supplier?.email || "No email"}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {format(new Date(purchase.created_at), "MMM dd, yyyy")}
                            </TableCell>
                            <TableCell className="text-right font-bold text-primary">
                                ${purchase.total_amount.toFixed(2)}
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-[160px]">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem>
                                            <Eye className="mr-2 h-4 w-4" /> View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <FileDown className="mr-2 h-4 w-4" /> Download PDF
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
