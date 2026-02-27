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
import { Loader2, UserPlus, Save } from "lucide-react"
import { Customer } from "@/types/invoice"

const customerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    phone: z.string().optional(),
    address: z.string().optional(),
})

type CustomerFormValues = z.infer<typeof customerSchema>

interface CustomerDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave: (data: CustomerFormValues) => Promise<void>
    customer?: Customer | null
}

export function CustomerDialog({ open, onOpenChange, onSave, customer }: CustomerDialogProps) {
    const [loading, setLoading] = React.useState(false)

    const form = useForm<CustomerFormValues>({
        resolver: zodResolver(customerSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            address: "",
        },
    })

    React.useEffect(() => {
        if (customer) {
            form.reset({
                name: customer.name,
                email: customer.email || "",
                phone: customer.phone || "",
                address: customer.address || "",
            })
        } else {
            form.reset({
                name: "",
                email: "",
                phone: "",
                address: "",
            })
        }
    }, [customer, form])

    async function onSubmit(values: CustomerFormValues) {
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
                    <DialogTitle>{customer ? "Edit Customer" : "Add Customer"}</DialogTitle>
                    <DialogDescription>
                        {customer ? "Update customer contact details." : "Register a new client for your business."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="John Doe" />
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
                                            <Input {...field} placeholder="john@example.com" />
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
                                            placeholder="123 Main St, City, Country"
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
                            <Button type="submit" disabled={loading}>
                                {loading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : customer ? (
                                    <Save className="mr-2 h-4 w-4" />
                                ) : (
                                    <UserPlus className="mr-2 h-4 w-4" />
                                )}
                                {customer ? "Save Changes" : "Register Customer"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
