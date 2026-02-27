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
import { Expense } from "@/types/expense"
import { format } from "date-fns"
import { MoreHorizontal, Trash2, Edit, Receipt } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ExpenseTableProps {
    expenses: Expense[]
    onEdit: (expense: Expense) => void
    onDelete: (id: string) => void
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSave?: (data: any) => Promise<void>
}

export function ExpenseTable({ expenses, onEdit, onDelete }: ExpenseTableProps) {
    if (expenses.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-dashed border-border/60">
                <div className="p-4 bg-muted rounded-full mb-4">
                    <Receipt className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No expenses found</h3>
                <p className="text-muted-foreground text-sm max-w-[300px] text-center mt-1">
                    Keep track of your business spending by recording your first expense.
                </p>
            </div>
        )
    }

    return (
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
            <Table>
                <TableHeader className="bg-muted/30">
                    <TableRow>
                        <TableHead className="font-semibold">Date</TableHead>
                        <TableHead className="font-semibold">Category</TableHead>
                        <TableHead className="font-semibold">Note</TableHead>
                        <TableHead className="font-semibold text-right">Amount</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {expenses.map((expense) => (
                        <TableRow key={expense.id} className="group hover:bg-muted/20 transition-colors">
                            <TableCell className="text-muted-foreground">
                                {format(new Date(expense.created_at), "MMM dd, yyyy")}
                            </TableCell>
                            <TableCell>
                                <Badge variant="secondary" className="font-medium bg-primary/5 text-primary border-primary/10">
                                    {expense.category}
                                </Badge>
                            </TableCell>
                            <TableCell className="max-w-[300px] truncate text-sm">
                                {expense.note || <span className="text-muted-foreground/50 italic text-xs">No description</span>}
                            </TableCell>
                            <TableCell className="text-right font-bold text-destructive">
                                -${Number(expense.amount).toFixed(2)}
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
                                        <DropdownMenuItem onClick={() => onEdit(expense)}>
                                            <Edit className="mr-2 h-4 w-4" /> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                            onClick={() => onDelete(expense.id)}
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
