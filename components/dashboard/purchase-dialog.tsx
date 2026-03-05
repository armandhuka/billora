"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Trash2, Loader2, PackageCheck, Tag, Percent } from "lucide-react"
import { CreatePurchaseInput, Purchase, Supplier } from "@/types/purchase"
import { Product } from "@/types/product"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useCurrency } from "@/context/currency-context"

const purchaseItemSchema = z.object({
    product_id: z.string().min(1, "Required"),
    quantity: z.coerce.number().int().min(1, "Min 1"),
    cost_price: z.coerce.number().min(0),
    discount: z.coerce.number().min(0).default(0),
    tax_rate: z.coerce.number().min(0).default(0),
    total: z.coerce.number().min(0),
})

const purchaseSchema = z.object({
    supplier_id: z.string().min(1, "Please select a supplier"),
    purchase_number: z.string().min(1, "Required"),
    status: z.enum(["draft", "ordered", "received", "cancelled"] as const).default("ordered"),
    payment_status: z.enum(["unpaid", "partial", "paid"] as const).default("unpaid"),
    items: z.array(purchaseItemSchema).min(1, "Add at least one item"),
    subtotal: z.coerce.number().min(0),
    discount_amount: z.coerce.number().min(0).default(0),
    tax_total: z.coerce.number().min(0),
    total_amount: z.coerce.number().min(0),
    paid_amount: z.coerce.number().min(0).default(0),
    payment_method: z.string().optional().nullable(),
    payment_date: z.string().optional().nullable(),
    expected_delivery_date: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
})

type PurchaseFormValues = z.infer<typeof purchaseSchema>

interface PurchaseDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave: (data: CreatePurchaseInput) => Promise<void>
    suppliers: Supplier[]
    products: Product[]
    purchase?: Purchase | null
}

export function PurchaseDialog({ open, onOpenChange, onSave, suppliers, products, purchase }: PurchaseDialogProps) {
    const { symbol } = useCurrency()
    const [loading, setLoading] = React.useState(false)
    const [invoiceDiscountMode, setInvoiceDiscountMode] = React.useState<"flat" | "percent">("flat")
    const [invoiceDiscountInput, setInvoiceDiscountInput] = React.useState("")

    const form = useForm<PurchaseFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(purchaseSchema) as any,
        defaultValues: {
            supplier_id: "",
            purchase_number: `PO-${Date.now().toString().slice(-6)}`,
            status: "ordered",
            payment_status: "unpaid",
            items: [{ product_id: "", quantity: 1, cost_price: 0, discount: 0, tax_rate: 0, total: 0 }],
            subtotal: 0,
            discount_amount: 0,
            tax_total: 0,
            total_amount: 0,
            paid_amount: 0,
            payment_method: null,
            payment_date: null,
            expected_delivery_date: null,
            notes: null,
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    })

    React.useEffect(() => {
        if (purchase) {
            form.reset({
                supplier_id: purchase.supplier_id || "",
                purchase_number: purchase.purchase_number,
                status: purchase.status || "ordered",
                payment_status: purchase.payment_status || "unpaid",
                subtotal: purchase.subtotal || purchase.total_amount,
                discount_amount: purchase.discount_amount || 0,
                tax_total: purchase.tax_total || 0,
                total_amount: purchase.total_amount,
                paid_amount: purchase.paid_amount || 0,
                payment_method: purchase.payment_method || null,
                payment_date: purchase.payment_date || null,
                expected_delivery_date: purchase.expected_delivery_date || null,
                notes: purchase.notes || null,
                items: (purchase.items || []).map(item => ({
                    product_id: item.product_id || "",
                    quantity: item.quantity,
                    cost_price: item.cost_price,
                    discount: item.discount || 0,
                    tax_rate: item.tax_rate || 0,
                    total: item.total,
                })),
            })
            setInvoiceDiscountInput(String(purchase.discount_amount || 0))
            setInvoiceDiscountMode("flat")
        } else if (open) {
            form.reset({
                supplier_id: "",
                purchase_number: `PO-${Date.now().toString().slice(-6)}`,
                status: "ordered",
                payment_status: "unpaid",
                items: [{ product_id: "", quantity: 1, cost_price: 0, discount: 0, tax_rate: 0, total: 0 }],
                subtotal: 0,
                discount_amount: 0,
                tax_total: 0,
                total_amount: 0,
                paid_amount: 0,
                payment_method: null,
                payment_date: null,
                expected_delivery_date: null,
                notes: null,
            })
            setInvoiceDiscountInput("")
            setInvoiceDiscountMode("flat")
        }
    }, [purchase, form, open])

    const watchedItems = form.watch("items")

    React.useEffect(() => {
        let subtotal = 0
        let taxTotal = 0

        watchedItems.forEach((item) => {
            const effectivePrice = Math.max(0, (item.cost_price || 0) - (item.discount || 0))
            const lineSubtotal = effectivePrice * (item.quantity || 0)
            const lineTax = lineSubtotal * ((item.tax_rate || 0) / 100)

            subtotal += lineSubtotal
            taxTotal += lineTax
        })

        const discountInputVal = parseFloat(invoiceDiscountInput) || 0
        let invoiceDiscount = 0
        if (invoiceDiscountMode === "percent") {
            invoiceDiscount = (subtotal + taxTotal) * (discountInputVal / 100)
        } else {
            invoiceDiscount = discountInputVal
        }
        invoiceDiscount = Math.max(0, invoiceDiscount)

        const total = Math.max(0, subtotal + taxTotal - invoiceDiscount)

        form.setValue("subtotal", Number(subtotal.toFixed(2)))
        form.setValue("tax_total", Number(taxTotal.toFixed(2)))
        form.setValue("discount_amount", Number(invoiceDiscount.toFixed(2)))
        form.setValue("total_amount", Number(total.toFixed(2)))
    }, [watchedItems, form, invoiceDiscountInput, invoiceDiscountMode])

    const handleProductChange = (index: number, productId: string) => {
        const product = products.find(p => p.id === productId)
        if (product) {
            form.setValue(`items.${index}.cost_price`, product.purchase_price || 0)
            form.setValue(`items.${index}.tax_rate`, product.gst_rate || 0)
            form.setValue(`items.${index}.discount`, 0)
            recalcItemTotal(index)
        }
    }

    const recalcItemTotal = (index: number) => {
        const item = form.getValues(`items.${index}`)
        const effectivePrice = Math.max(0, (item.cost_price || 0) - (item.discount || 0))
        const lineSubtotal = effectivePrice * (item.quantity || 0)
        const lineTax = lineSubtotal * ((item.tax_rate || 0) / 100)
        form.setValue(`items.${index}.total`, Number((lineSubtotal + lineTax).toFixed(2)))
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
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{purchase ? "Edit Purchase" : "Create Purchase Order"}</DialogTitle>
                    <DialogDescription>
                        {purchase ? "Update the details of your purchase." : "Record a new purchase from your supplier."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-4">
                        {/* Row 1: Supplier + PO Number */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="supplier_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Supplier</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue placeholder="Select a supplier" /></SelectTrigger>
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
                                            <Input {...field} readOnly={!!purchase} className={purchase ? "bg-muted cursor-not-allowed" : ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Row 2: Status + Payment Status */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="draft">Draft</SelectItem>
                                                <SelectItem value="ordered">Ordered</SelectItem>
                                                <SelectItem value="received">Received</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="payment_status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Payment Status</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="unpaid">Unpaid</SelectItem>
                                                <SelectItem value="partial">Partial</SelectItem>
                                                <SelectItem value="paid">Paid</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="expected_delivery_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Expected Delivery</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value || null)} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Row 3: Payment details (conditional) */}
                        {(form.watch("payment_status") === "paid" || form.watch("payment_status") === "partial") && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-muted/30 rounded-lg border border-border/50">
                                <FormField
                                    control={form.control}
                                    name="paid_amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Paid Amount</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" min="0" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="payment_method"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Payment Method</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value ?? ""}>
                                                <FormControl>
                                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="cash">Cash</SelectItem>
                                                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                                    <SelectItem value="upi">UPI</SelectItem>
                                                    <SelectItem value="cheque">Cheque</SelectItem>
                                                    <SelectItem value="card">Card</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="payment_date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Payment Date</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value || null)} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        {/* Items table */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Items</h3>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => append({ product_id: "", quantity: 1, cost_price: 0, discount: 0, tax_rate: 0, total: 0 })}
                                >
                                    <Plus className="h-4 w-4 mr-1" /> Add Item
                                </Button>
                            </div>

                            <div className="border rounded-lg overflow-hidden border-border/50">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50 border-b border-border/50">
                                        <tr>
                                            <th className="px-3 py-2 text-left font-medium">Product</th>
                                            <th className="px-3 py-2 text-right font-medium w-16">Qty</th>
                                            <th className="px-3 py-2 text-right font-medium w-24">Cost</th>
                                            <th className="px-3 py-2 text-right font-medium w-20">
                                                <div className="flex items-center justify-end gap-1"><Tag className="h-3 w-3" />Disc.</div>
                                            </th>
                                            <th className="px-3 py-2 text-right font-medium w-16">Tax%</th>
                                            <th className="px-3 py-2 text-right font-medium w-24">Total</th>
                                            <th className="px-3 py-2 w-9"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {fields.map((item, index) => (
                                            <tr key={item.id} className="group hover:bg-muted/30 transition-colors">
                                                <td className="px-3 py-2">
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${index}.product_id`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <Select onValueChange={(val) => { field.onChange(val); handleProductChange(index, val) }} defaultValue={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger className="border-none bg-transparent shadow-none focus:ring-0">
                                                                            <SelectValue placeholder="Select" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        {products.map((p) => (
                                                                            <SelectItem key={p.id} value={p.id}>
                                                                                <div className="flex justify-between items-center w-44">
                                                                                    <span className="truncate">{p.name}</span>
                                                                                    <Badge variant="outline" className="text-[10px] ml-2">
                                                                                        {symbol}{(p.purchase_price || 0).toFixed(0)}
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
                                                <td className="px-2 py-2">
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${index}.quantity`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Input type="number" className="text-right border-none bg-transparent shadow-none focus-visible:ring-1 w-full" {...field} onChange={(e) => { field.onChange(Number(e.target.value)); setTimeout(() => recalcItemTotal(index), 0) }} />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </td>
                                                <td className="px-2 py-2">
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${index}.cost_price`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Input type="number" step="0.01" className="text-right border-none bg-transparent shadow-none focus-visible:ring-1 w-full" {...field} onChange={(e) => { field.onChange(Number(e.target.value)); setTimeout(() => recalcItemTotal(index), 0) }} />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </td>
                                                <td className="px-2 py-2">
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${index}.discount`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Input type="number" step="0.01" min="0" placeholder="0" className="text-right border-none bg-transparent shadow-none focus-visible:ring-1 text-rose-600 w-full" {...field} onChange={(e) => { field.onChange(Number(e.target.value)); setTimeout(() => recalcItemTotal(index), 0) }} />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </td>
                                                <td className="px-2 py-2">
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${index}.tax_rate`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Input type="number" step="0.01" min="0" className="text-right border-none bg-transparent shadow-none focus-visible:ring-1 w-full" {...field} onChange={(e) => { field.onChange(Number(e.target.value)); setTimeout(() => recalcItemTotal(index), 0) }} />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </td>
                                                <td className="px-3 py-2 text-right font-medium font-mono">
                                                    {symbol}{watchedItems[index]?.total?.toFixed(2) || "0.00"}
                                                </td>
                                                <td className="px-2 py-2">
                                                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => remove(index)} disabled={fields.length === 1}>
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Notes */}
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Internal notes (optional)" className="h-16 resize-none" {...field} value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value || null)} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {/* Totals + Invoice Discount */}
                        <div className="flex flex-col items-end space-y-3 pt-4 border-t">
                            <div className="flex w-72 justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-mono">{symbol}{form.watch("subtotal").toFixed(2)}</span>
                            </div>
                            <div className="flex w-72 justify-between text-sm">
                                <span className="text-muted-foreground">Tax Total</span>
                                <span className="font-mono">{symbol}{form.watch("tax_total").toFixed(2)}</span>
                            </div>

                            {/* Purchase-level discount */}
                            <div className="w-72 space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                                        <Tag className="h-3.5 w-3.5 text-rose-500" />
                                        Purchase Discount
                                    </span>
                                    <div className="flex items-center gap-1 bg-muted/40 rounded-md p-0.5">
                                        <button type="button" onClick={() => setInvoiceDiscountMode("flat")} className={`px-2 py-0.5 text-[11px] font-medium rounded transition-all ${invoiceDiscountMode === "flat" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                                            {symbol}
                                        </button>
                                        <button type="button" onClick={() => setInvoiceDiscountMode("percent")} className={`px-2 py-0.5 text-[11px] font-medium rounded transition-all ${invoiceDiscountMode === "percent" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                                            <Percent className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <Input type="number" step="0.01" min="0" placeholder="0" value={invoiceDiscountInput} onChange={(e) => setInvoiceDiscountInput(e.target.value)} className="text-right text-rose-600 h-8" />
                                    {form.watch("discount_amount") > 0 && (
                                        <Badge variant="outline" className="text-rose-600 border-rose-200 text-[10px] whitespace-nowrap shrink-0">
                                            -{symbol}{form.watch("discount_amount").toFixed(2)}
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            <div className="w-72 h-px bg-border" />
                            <div className="flex w-72 justify-between text-lg font-bold">
                                <span>Total Amount</span>
                                <span className="text-primary font-mono">{symbol}{form.watch("total_amount").toFixed(2)}</span>
                            </div>
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <PackageCheck className="mr-2 h-4 w-4" />
                                {purchase ? "Update Purchase" : "Create Purchase"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
