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
import { Loader2, Truck, Save } from "lucide-react"
import { Supplier } from "@/types/purchase"

const supplierSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    phone: z.string().optional(),
    address: z.string().optional(),
})

type SupplierFormValues = z.infer<typeof supplierSchema>

interface SupplierDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave: (data: SupplierFormValues) => Promise<void>
    supplier?: Supplier | null
}

export function SupplierDialog({ open, onOpenChange, onSave, supplier }: SupplierDialogProps) {
    const [loading, setLoading] = React.useState(false)

    const form = useForm<SupplierFormValues>({
        resolver: zodResolver(supplierSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            address: "",
        },
    })

    React.useEffect(() => {
        if (supplier) {
            form.reset({
                name: supplier.name,
                email: supplier.email || "",
                phone: supplier.phone || "",
                address: supplier.address || "",
            })
        } else {
            form.reset({
                name: "",
                email: "",
                phone: "",
                address: "",
            })
        }
    }, [supplier, form])

    async function onSubmit(values: SupplierFormValues) {
        setLoading(true)
        try {
            await onSave(values)
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
                    <DialogTitle>{supplier ? "Edit Supplier" : "Add Supplier"}</DialogTitle>
                    <DialogDescription>
                        {supplier ? "Update vendor contact details." : "Register a new supplier for your inventory."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Supplier Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Acme Corp" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="orders@acme.com" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="+1..." />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder="Warehouse 4, Industrial Park"
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
                            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
                                {loading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : supplier ? (
                                    <Save className="mr-2 h-4 w-4" />
                                ) : (
                                    <Truck className="mr-2 h-4 w-4" />
                                )}
                                {supplier ? "Save Changes" : "Register Supplier"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
