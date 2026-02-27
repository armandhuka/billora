"use client"

import * as React from "react"
import { Plus, Download, Filter, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { CustomerTable } from "@/components/dashboard/customer-table"
import { CustomerDialog } from "@/components/dashboard/customer-dialog"
import { Customer } from "@/types/invoice"
import { createCustomer, updateCustomer, deleteCustomer } from "@/app/actions/customers"

interface CustomersClientProps {
    initialCustomers: Customer[]
}

export function CustomersClient({ initialCustomers }: CustomersClientProps) {
    const [open, setOpen] = React.useState(false)
    const [editingCustomer, setEditingCustomer] = React.useState<Customer | null>(null)
    const [searchQuery, setSearchQuery] = React.useState("")

    const filteredCustomers = initialCustomers.filter(customer =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone?.includes(searchQuery)
    )

    const handleAdd = () => {
        setEditingCustomer(null)
        setOpen(true)
    }

    const handleEdit = (customer: Customer) => {
        setEditingCustomer(customer)
        setOpen(true)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSave = async (data: any) => {
        const res = editingCustomer
            ? await updateCustomer(editingCustomer.id, data)
            : await createCustomer(data)

        if (res.error) {
            toast.error(`Error: ${res.error}`)
            throw new Error(res.error)
        }

        toast.success(editingCustomer ? "Customer updated!" : "Customer registered!")
    }

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this customer? This may affect linked invoices.")) {
            const res = await deleteCustomer(id)
            if (res.error) {
                toast.error(`Error: ${res.error}`)
            } else {
                toast.success("Customer removed successfully.")
            }
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
                    <p className="text-muted-foreground">
                        Manage your client database and contact information.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="hidden sm:flex">
                        <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                    <Button onClick={handleAdd} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                        <Plus className="mr-2 h-4 w-4" /> New Customer
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, email, or phone..."
                        className="pl-9 bg-card"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" size="icon" className="h-10 w-10">
                    <Filter className="h-4 w-4" />
                </Button>
            </div>

            <CustomerTable
                customers={filteredCustomers}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <CustomerDialog
                open={open}
                onOpenChange={setOpen}
                onSave={handleSave}
                customer={editingCustomer}
            />
        </div>
    )
}
