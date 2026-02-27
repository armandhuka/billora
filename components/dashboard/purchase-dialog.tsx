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
import { Plus, Trash2, Loader2, PackagePlus } from "lucide-react"
import { Supplier, CreatePurchaseInput } from "@/types/purchase"
import { Product } from "@/types/product"
import { Badge } from "@/components/ui/badge"

const purchaseItemSchema = z.object({
    product_id: z.string().min(1, "Required"),
    quantity: z.coerce.number().int().min(1, "Min 1"),
    cost_price: z.coerce.number().min(0),
    total: z.coerce.number().min(0),
})

const purchaseSchema = z.object({
    supplier_id: z.string().min(1, "Please select a supplier"),
    purchase_number: z.string().min(1, "Required"),
    items: z.array(purchaseItemSchema).min(1, "Add at least one item"),
    total_amount: z.coerce.number().min(0),
})

type PurchaseFormValues = z.infer<typeof purchaseSchema>

interface PurchaseDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave: (data: CreatePurchaseInput) => Promise<void>
    suppliers: Supplier[]
    products: Product[]
}

export function PurchaseDialog({ open, onOpenChange, onSave, suppliers, products }: PurchaseDialogProps) {
    const [loading, setLoading] = React.useState(false)

    const form = useForm<PurchaseFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(purchaseSchema) as any,
        defaultValues: {
            supplier_id: "",
            purchase_number: `PO-${Date.now().toString().slice(-6)}`,
            items: [{ product_id: "", quantity: 1, cost_price: 0, total: 0 }],
            total_amount: 0,
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    })

    const watchedItems = form.watch("items")

    React.useEffect(() => {
        let grandTotal = 0
        watchedItems.forEach((item) => {
            grandTotal += (item.total || 0)
        })
        form.setValue("total_amount", Number(grandTotal.toFixed(2)))
    }, [watchedItems, form])

    const handleProductChange = (index: number, productId: string) => {
        const product = products.find(p => p.id === productId)
        if (product) {
            form.setValue(`items.${index}.cost_price`, product.purchase_price || 0)
            const quantity = form.getValues(`items.${index}.quantity`)
            form.setValue(`items.${index}.total`, Number(((product.purchase_price || 0) * quantity).toFixed(2)))
        }
    }

    const handleQuantityPriceChange = (index: number) => {
        const item = form.getValues(`items.${index}`)
        form.setValue(`items.${index}.total`, Number(((item.cost_price || 0) * (item.quantity || 0)).toFixed(2)))
    }

    async function onSubmit(values: PurchaseFormValues) {
        setLoading(true)
        try {
            await onSave(values as CreatePurchaseInput)
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
                    <DialogTitle>Record Purchase</DialogTitle>
                    <DialogDescription>
                        Update your inventory by recording a new purchase from a supplier.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="supplier_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Supplier</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a supplier" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {suppliers.map((s) => (
                                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="purchase_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Purchase Order #</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="PO-123456" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Purchase Items</h3>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => append({ product_id: "", quantity: 1, cost_price: 0, total: 0 })}
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
                                            <th className="px-4 py-2 text-right font-medium w-32">Cost</th>
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
                                                                <FormMessage />
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
                                                                            field.onChange(Number(e.target.value))
                                                                            handleQuantityPriceChange(index)
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
                                                        name={`items.${index}.cost_price`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Input
                                                                        type="number"
                                                                        step="0.01"
                                                                        className="text-right border-none bg-transparent shadow-none focus-visible:ring-1"
                                                                        {...field}
                                                                        onChange={(e) => {
                                                                            field.onChange(Number(e.target.value))
                                                                            handleQuantityPriceChange(index)
                                                                        }}
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
                            <div className="flex w-64 justify-between text-lg font-bold">
                                <span>Grand Total</span>
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
                                <PackagePlus className="mr-2 h-4 w-4" />
                                Record Purchase
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
