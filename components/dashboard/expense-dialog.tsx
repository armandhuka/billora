"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2, Receipt, Save } from "lucide-react"
import { Expense, EXPENSE_CATEGORIES } from "@/types/expense"

const expenseSchema = z.object({
    category: z.string().min(1, "Category is required"),
    amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
    note: z.string().optional(),
})

type ExpenseFormValues = z.infer<typeof expenseSchema>

interface ExpenseDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave: (data: ExpenseFormValues) => Promise<void>
    expense?: Expense | null
}

export function ExpenseDialog({ open, onOpenChange, onSave, expense }: ExpenseDialogProps) {
    const [loading, setLoading] = React.useState(false)

    const form = useForm<ExpenseFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(expenseSchema) as any,
        defaultValues: {
            category: "Other",
            amount: 0,
            note: "",
        },
    })

    React.useEffect(() => {
        if (expense) {
            form.reset({
                category: expense.category,
                amount: Number(expense.amount),
                note: expense.note || "",
            })
        } else if (open) {
            form.reset({
                category: "Other",
                amount: 0,
                note: "",
            })
        }
    }, [expense, form, open])

    async function onSubmit(values: ExpenseFormValues) {
        setLoading(true)
        try {
            // Ensure amount is definitely a number
            const submissionData = {
                ...values,
                amount: Number(values.amount)
            }
            await onSave(submissionData)
            onOpenChange(false)
            form.reset()
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{expense ? "Edit Expense" : "Record Expense"}</DialogTitle>
                    <DialogDescription>
                        {expense ? "Update the details of your expense." : "Log a new business expenditure."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {EXPENSE_CATEGORIES.map((cat) => (
                                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Amount ($)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            placeholder="0.00"
                                            className="font-bold text-lg"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="note"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Note / Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder="What was this for?"
                                            className="resize-none"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                                {loading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : expense ? (
                                    <Save className="mr-2 h-4 w-4" />
                                ) : (
                                    <Receipt className="mr-2 h-4 w-4" />
                                )}
                                {expense ? "Save Changes" : "Log Expense"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
