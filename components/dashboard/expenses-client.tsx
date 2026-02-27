"use client"

import * as React from "react"
import { Plus, Download, Filter, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { ExpenseTable } from "@/components/dashboard/expense-table"
import { ExpenseDialog } from "@/components/dashboard/expense-dialog"
import { Expense } from "@/types/expense"
import { createExpense, updateExpense, deleteExpense } from "@/app/actions/expenses"

interface ExpensesClientProps {
    initialExpenses: Expense[]
}

export function ExpensesClient({ initialExpenses }: ExpensesClientProps) {
    const [open, setOpen] = React.useState(false)
    const [editingExpense, setEditingExpense] = React.useState<Expense | null>(null)
    const [searchQuery, setSearchQuery] = React.useState("")

    const filteredExpenses = initialExpenses.filter(expense =>
        expense.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.note?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.amount.toString().includes(searchQuery)
    )

    const handleAdd = () => {
        setEditingExpense(null)
        setOpen(true)
    }

    const handleEdit = (expense: Expense) => {
        setEditingExpense(expense)
        setOpen(true)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSave = async (data: any) => {
        const res = editingExpense
            ? await updateExpense(editingExpense.id, data)
            : await createExpense(data)

        if (res.error) {
            toast.error(`Error: ${res.error}`)
            throw new Error(res.error)
        }

        toast.success(editingExpense ? "Expense updated!" : "Expense recorded!")
    }

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this expense?")) {
            const res = await deleteExpense(id)
            if (res.error) {
                toast.error(`Error: ${res.error}`)
            } else {
                toast.success("Expense removed successfully.")
            }
        }
    }

    const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0)

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-destructive/80">Expenses</h1>
                    <p className="text-muted-foreground">
                        Monitor your business spending and manage your cash flow.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="hidden lg:flex flex-col items-end mr-4">
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Total Filtered</span>
                        <span className="text-xl font-bold text-destructive">-${totalExpenses.toFixed(2)}</span>
                    </div>
                    <Button variant="outline" size="sm" className="hidden sm:flex">
                        <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                    <Button onClick={handleAdd} size="sm" className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                        <Plus className="mr-2 h-4 w-4" /> New Expense
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by category or note..."
                        className="pl-9 bg-card"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" size="icon" className="h-10 w-10">
                    <Filter className="h-4 w-4" />
                </Button>
            </div>

            <ExpenseTable
                expenses={filteredExpenses}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <ExpenseDialog
                open={open}
                onOpenChange={setOpen}
                onSave={handleSave}
                expense={editingExpense}
            />
        </div>
    )
}
