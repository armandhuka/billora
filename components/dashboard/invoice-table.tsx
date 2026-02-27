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
import { Badge } from "@/components/ui/badge"
import { Invoice } from "@/types/invoice"
import { format } from "date-fns"
import { MoreHorizontal, Eye, FileDown, Trash2, Pencil } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface InvoiceTableProps {
    invoices: Invoice[]
    onEdit: (invoice: Invoice) => void
    onDelete: (id: string) => void
    onView: (invoice: Invoice) => void
    onDownload: (invoice: Invoice) => void
}

export function InvoiceTable({ invoices, onEdit, onDelete, onView, onDownload }: InvoiceTableProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case "paid":
                return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
            case "pending":
                return "bg-amber-500/10 text-amber-500 border-amber-500/20"
            case "overdue":
                return "bg-rose-500/10 text-rose-500 border-rose-500/20"
            default:
                return "bg-slate-500/10 text-slate-500 border-slate-500/20"
        }
    }

    if (invoices.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-dashed border-border/60">
                <div className="p-4 bg-muted rounded-full mb-4">
                    <FileDown className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No invoices found</h3>
                <p className="text-muted-foreground text-sm max-w-[300px] text-center mt-1">
                    Start by creating your first invoice to track your sales and payments.
                </p>
            </div>
        )
    }

    return (
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
            <Table>
                <TableHeader className="bg-muted/30">
                    <TableRow>
                        <TableHead className="font-semibold">Invoice</TableHead>
                        <TableHead className="font-semibold">Customer</TableHead>
                        <TableHead className="font-semibold">Date</TableHead>
                        <TableHead className="font-semibold text-right">Amount</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoices.map((invoice) => (
                        <TableRow key={invoice.id} className="group hover:bg-muted/20 transition-colors">
                            <TableCell className="font-medium">
                                <div className="flex flex-col">
                                    <span>{invoice.invoice_number}</span>
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-tighter">REF: {invoice.id.slice(0, 8)}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium">{invoice.customer?.name || "Guest Customer"}</span>
                                    <span className="text-xs text-muted-foreground">{invoice.customer?.email || "No email"}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {format(new Date(invoice.created_at), "MMM dd, yyyy")}
                            </TableCell>
                            <TableCell className="text-right font-bold text-primary">
                                ${invoice.total_amount.toFixed(2)}
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className={`capitalize px-2 py-0 border ${getStatusColor(invoice.payment_status)}`}>
                                    {invoice.payment_status}
                                </Badge>
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
                                        <DropdownMenuItem onClick={() => onView(invoice)}>
                                            <Eye className="mr-2 h-4 w-4" /> View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onEdit(invoice)}>
                                            <Pencil className="mr-2 h-4 w-4" /> Edit Invoice
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onDownload(invoice)}>
                                            <FileDown className="mr-2 h-4 w-4" /> Download PDF
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="text-destructive"
                                            onClick={() => onDelete(invoice.id)}
                                        >
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
