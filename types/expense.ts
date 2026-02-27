export type ExpenseCategory =
    | "Marketing"
    | "Utilities"
    | "Rent"
    | "Salary"
    | "Software"
    | "Travel"
    | "Supplies"
    | "Tax"
    | "Other"

export interface Expense {
    id: string
    business_id: string
    category: ExpenseCategory
    amount: number
    note?: string | null
    created_at: string
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
    "Marketing",
    "Utilities",
    "Rent",
    "Salary",
    "Software",
    "Travel",
    "Supplies",
    "Tax",
    "Other"
]
