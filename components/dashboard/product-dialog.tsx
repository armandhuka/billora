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
import { Product, CreateProductInput } from "@/types/product"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

const productSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    sku: z.string().default(""),
    category: z.string().default(""),
    purchase_price: z.coerce.number().min(0).default(0),
    selling_price: z.coerce.number().min(0).default(0),
    gst_rate: z.coerce.number().min(0).default(0),
    stock_quantity: z.coerce.number().int().min(0).default(0),
    min_stock_level: z.coerce.number().int().min(0).default(5),
})

type ProductFormValues = z.infer<typeof productSchema>

interface ProductDialogProps {
    product?: Product | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave: (data: CreateProductInput) => Promise<void>
}

export function ProductDialog({ product, open, onOpenChange, onSave }: ProductDialogProps) {
    const [loading, setLoading] = React.useState(false)

    const form = useForm<ProductFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(productSchema) as any,
        defaultValues: {
            name: "",
            sku: "",
            category: "",
            purchase_price: 0,
            selling_price: 0,
            gst_rate: 0,
            stock_quantity: 0,
            min_stock_level: 5,
        },
    })

    // Update form values when product changes
    React.useEffect(() => {
        if (product) {
            form.reset({
                name: product.name,
                sku: product.sku || "",
                category: product.category || "",
                purchase_price: product.purchase_price || 0,
                selling_price: product.selling_price || 0,
                gst_rate: product.gst_rate,
                stock_quantity: product.stock_quantity,
                min_stock_level: product.min_stock_level,
            })
        } else {
            form.reset({
                name: "",
                sku: "",
                category: "",
                purchase_price: 0,
                selling_price: 0,
                gst_rate: 0,
                stock_quantity: 0,
                min_stock_level: 5,
            })
        }
    }, [product, form])

    async function onSubmit(values: ProductFormValues) {
        setLoading(true)
        try {
            // Cast values to CreateProductInput explicitly if needed, but schema should align
            await onSave(values as CreateProductInput)
            onOpenChange(false)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
                    <DialogDescription>
                        {product ? "Update your product details below." : "Enter the details for your new product."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Product Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Wireless Mouse" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="sku"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>SKU</FormLabel>
                                        <FormControl>
                                            <Input placeholder="PROD-001" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Electronics" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="purchase_price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Purchase Price ($)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="selling_price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Selling Price ($)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="stock_quantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Current Stock</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="min_stock_level"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Min Stock Level</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {product ? "Update Product" : "Save Product"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
