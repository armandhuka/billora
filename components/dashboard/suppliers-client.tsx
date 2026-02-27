"use client"

import * as React from "react"
import { Plus, Download, Filter, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { SupplierTable } from "@/components/dashboard/supplier-table"
import { SupplierDialog } from "@/components/dashboard/supplier-dialog"
import { Supplier } from "@/types/purchase"
import { createSupplier, updateSupplier, deleteSupplier } from "@/app/actions/suppliers"

interface SuppliersClientProps {
    initialSuppliers: Supplier[]
}

export function SuppliersClient({ initialSuppliers }: SuppliersClientProps) {
    const [open, setOpen] = React.useState(false)
    const [editingSupplier, setEditingSupplier] = React.useState<Supplier | null>(null)
    const [searchQuery, setSearchQuery] = React.useState("")

    const filteredSuppliers = initialSuppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.phone?.includes(searchQuery)
    )

    const handleAdd = () => {
        setEditingSupplier(null)
        setOpen(true)
    }

    const handleEdit = (supplier: Supplier) => {
        setEditingSupplier(supplier)
        setOpen(true)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSave = async (data: any) => {
        const res = editingSupplier
            ? await updateSupplier(editingSupplier.id, data)
            : await createSupplier(data)

        if (res.error) {
            toast.error(`Error: ${res.error}`)
            throw new Error(res.error)
        }

        toast.success(editingSupplier ? "Supplier updated!" : "Supplier registered!")
    }

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this supplier? This may affect linked purchases.")) {
            const res = await deleteSupplier(id)
            if (res.error) {
                toast.error(`Error: ${res.error}`)
            } else {
                toast.success("Supplier removed successfully.")
            }
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-emerald-700">Suppliers</h1>
                    <p className="text-muted-foreground">
                        Manage your vendor network and procurement contacts.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="hidden sm:flex">
                        <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                    <Button onClick={handleAdd} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                        <Plus className="mr-2 h-4 w-4" /> New Supplier
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

            <SupplierTable
                suppliers={filteredSuppliers}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <SupplierDialog
                open={open}
                onOpenChange={setOpen}
                onSave={handleSave}
                supplier={editingSupplier}
            />
        </div>
    )
}
