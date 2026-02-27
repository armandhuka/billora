import { getExpenses } from "@/app/actions/expenses"
import { ExpensesClient } from "@/components/dashboard/expenses-client"

export default async function ExpensesPage() {
    const res = await getExpenses()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const expenses = (res as any).data || []

    return <ExpensesClient initialExpenses={expenses} />
}
