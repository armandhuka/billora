"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Trash2, Loader2, Calculator } from "lucide-react"
import { Customer, CreateInvoiceInput } from "@/types/invoice"
import { Product } from "@/types/product"
import { Badge } from "@/components/ui/badge"

const invoiceItemSchema = z.object({
    product_id: z.string().min(1, "Required"),
    quantity: z.coerce.number().int().min(1, "Min 1"),
    price: z.coerce.number().min(0),
    gst_rate: z.coerce.number().min(0),
    total: z.coerce.number().min(0),
})

const invoiceSchema = z.object({
    customer_id: z.string().min(1, "Please select a customer"),
    invoice_number: z.string().min(1, "Required"),
    payment_status: z.enum(['pending', 'paid', 'overdue', 'cancelled'] as const).default('pending'),
    items: z.array(invoiceItemSchema).min(1, "Add at least one item"),
    subtotal: z.coerce.number().min(0),
    gst_total: z.coerce.number().min(0),
    total_amount: z.coerce.number().min(0),
})

type InvoiceFormValues = z.infer<typeof invoiceSchema>

interface InvoiceDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave: (data: CreateInvoiceInput) => Promise<void>
    customers: Customer[]
    products: Product[]
}

export function InvoiceDialog({ open, onOpenChange, onSave, customers, products }: InvoiceDialogProps) {
    const [loading, setLoading] = React.useState(false)

    const form = useForm<InvoiceFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(invoiceSchema) as any,
        defaultValues: {
            customer_id: "",
            invoice_number: `INV-${Date.now().toString().slice(-6)}`,
            payment_status: 'pending',
            items: [{ product_id: "", quantity: 1, price: 0, gst_rate: 0, total: 0 }],
            subtotal: 0,
            gst_total: 0,
            total_amount: 0,
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    })

    // Watch items to calculate totals
    const watchedItems = form.watch("items")

    React.useEffect(() => {
        let subtotal = 0
        let gst_total = 0

        watchedItems.forEach((item) => {
            const lineSubtotal = (item.price || 0) * (item.quantity || 0)
            const lineGst = lineSubtotal * ((item.gst_rate || 0) / 100)

            subtotal += lineSubtotal
            gst_total += lineGst
        })

        form.setValue("subtotal", Number(subtotal.toFixed(2)))
        form.setValue("gst_total", Number(gst_total.toFixed(2)))
        form.setValue("total_amount", Number((subtotal + gst_total).toFixed(2)))
    }, [watchedItems, form])

    const handleProductChange = (index: number, productId: string) => {
        const product = products.find(p => p.id === productId)
        if (product) {
            form.setValue(`items.${index}.price`, product.selling_price || 0)
            form.setValue(`items.${index}.gst_rate`, product.gst_rate || 0)

            const quantity = form.getValues(`items.${index}.quantity`)
            const total = (product.selling_price || 0) * quantity * (1 + (product.gst_rate || 0) / 100)
            form.setValue(`items.${index}.total`, Number(total.toFixed(2)))
        }
    }

    const handleQuantityChange = (index: number, quantity: number) => {
        const item = form.getValues(`items.${index}`)
        const lineSubtotal = (item.price || 0) * quantity
        const lineGst = lineSubtotal * ((item.gst_rate || 0) / 100)
        form.setValue(`items.${index}.total`, Number((lineSubtotal + lineGst).toFixed(2)))
    }

    async function onSubmit(values: InvoiceFormValues) {
        setLoading(true)
        try {
            await onSave(values as CreateInvoiceInput)
            onOpenChange(false)
            form.reset()
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Invoice</DialogTitle>
                    <DialogDescription>
                        Generate a professional invoice for your business.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="customer_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Customer</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a customer" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {customers.map((c) => (
                                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="invoice_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Invoice Number</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Invoice Items</h3>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => append({ product_id: "", quantity: 1, price: 0, gst_rate: 0, total: 0 })}
                                >
                                    <Plus className="h-4 w-4 mr-1" /> Add Item
                                </Button>
                            </div>

                            <div className="border rounded-lg overflow-hidden border-border/50">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50 border-b border-border/50">
                                        <tr>
                                            <th className="px-4 py-2 text-left font-medium">Product</th>
                                            <th className="px-4 py-2 text-right font-medium w-24">Qty</th>
                                            <th className="px-4 py-2 text-right font-medium w-32">Price</th>
                                            <th className="px-4 py-2 text-right font-medium w-32">Total</th>
                                            <th className="px-4 py-2 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {fields.map((item, index) => (
                                            <tr key={item.id} className="group hover:bg-muted/30 transition-colors">
                                                <td className="px-4 py-3">
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${index}.product_id`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <Select
                                                                    onValueChange={(val) => {
                                                                        field.onChange(val)
                                                                        handleProductChange(index, val)
                                                                    }}
                                                                    defaultValue={field.value}
                                                                >
                                                                    <FormControl>
                                                                        <SelectTrigger className="border-none bg-transparent shadow-none focus:ring-0">
                                                                            <SelectValue placeholder="Select Product" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        {products.map((p) => (
                                                                            <SelectItem key={p.id} value={p.id}>
                                                                                <div className="flex justify-between items-center w-64">
                                                                                    <span>{p.name}</span>
                                                                                    <Badge variant="outline" className="text-[10px]">
                                                                                        Stock: {p.stock_quantity}
                                                                                    </Badge>
                                                                                </div>
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${index}.quantity`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Input
                                                                        type="number"
                                                                        className="text-right border-none bg-transparent shadow-none focus-visible:ring-1"
                                                                        {...field}
                                                                        onChange={(e) => {
                                                                            const val = Number(e.target.value)
                                                                            field.onChange(val)
                                                                            handleQuantityChange(index, val)
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${index}.price`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Input
                                                                        type="number"
                                                                        readOnly
                                                                        className="text-right border-none bg-transparent shadow-none focus-visible:ring-0 cursor-default"
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium">
                                                    ${watchedItems[index]?.total?.toFixed(2) || "0.00"}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => remove(index)}
                                                        disabled={fields.length === 1}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex flex-col items-end space-y-2 pt-4 border-t">
                            <div className="flex w-64 justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>${form.watch("subtotal").toFixed(2)}</span>
                            </div>
                            <div className="flex w-64 justify-between text-sm">
                                <span className="text-muted-foreground">GST Total</span>
                                <span>${form.watch("gst_total").toFixed(2)}</span>
                            </div>
                            <div className="flex w-64 justify-between text-lg font-bold">
                                <span>Total Amount</span>
                                <span className="text-primary">${form.watch("total_amount").toFixed(2)}</span>
                            </div>
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <Calculator className="mr-2 h-4 w-4" />
                                Create Invoice
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
