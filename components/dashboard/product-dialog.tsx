"use client"

import * as React from "react"
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Wand2, Plus, Trash2, Upload } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Product, CreateProductInput, Category, ProductVariant } from "@/types/product"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { saveVariant, deleteVariant } from "@/app/actions/products"
import { useCurrency } from "@/context/currency-context"

const productSchema = z.object({
    name: z.string().min(2, "Name is required"),
    sku: z.string().default(""),
    category: z.string().default(""),
    description: z.string().default(""),
    unit: z.string().default("pcs"),
    barcode: z.string().default(""),
    purchase_price: z.coerce.number().min(0).default(0),
    selling_price: z.coerce.number().min(0).default(0),
    gst_rate: z.coerce.number().min(0).max(100).default(0),
    stock_quantity: z.coerce.number().int().min(0).default(0),
    min_stock_level: z.coerce.number().int().min(0).default(5),
    is_active: z.boolean().default(true),
})

type FormValues = z.infer<typeof productSchema>

interface ProductDialogProps {
    product?: Product | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave: (data: CreateProductInput) => Promise<void>
    categories: Category[]
}

export function ProductDialog({ product, open, onOpenChange, onSave, categories }: ProductDialogProps) {
    const { symbol } = useCurrency()
    const [loading, setLoading] = React.useState(false)
    const [uploadingImage, setUploadingImage] = React.useState(false)
    const [imageUrl, setImageUrl] = React.useState<string | null>(null)
    const [variants, setVariants] = React.useState<Partial<ProductVariant>[]>([])
    const [activeTab, setActiveTab] = React.useState<"basic" | "inventory" | "variants">("basic")
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const form = useForm<FormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(productSchema) as any,
        defaultValues: {
            name: "", sku: "", category: "", description: "", unit: "pcs",
            barcode: "", purchase_price: 0, selling_price: 0, gst_rate: 0,
            stock_quantity: 0, min_stock_level: 5, is_active: true,
        },
    })

    React.useEffect(() => {
        if (product) {
            form.reset({
                name: product.name,
                sku: product.sku || "",
                category: product.category || "",
                description: product.description || "",
                unit: product.unit || "pcs",
                barcode: product.barcode || "",
                purchase_price: product.purchase_price || 0,
                selling_price: product.selling_price || 0,
                gst_rate: product.gst_rate,
                stock_quantity: product.stock_quantity,
                min_stock_level: product.min_stock_level,
                is_active: product.is_active ?? true,
            })
            setImageUrl(product.image_url || null)
            setVariants(product.variants || [])
        } else {
            form.reset({
                name: "", sku: "", category: "", description: "", unit: "pcs",
                barcode: "", purchase_price: 0, selling_price: 0, gst_rate: 0,
                stock_quantity: 0, min_stock_level: 5, is_active: true,
            })
            setImageUrl(null)
            setVariants([])
        }
        setActiveTab("basic")
    }, [product, form])

    function autoGenerateSku() {
        const name = form.getValues("name")
        const prefix = name.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, "X")
        const suffix = Date.now().toString(36).slice(-4).toUpperCase()
        form.setValue("sku", `${prefix}-${suffix}`)
    }

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.size > 2 * 1024 * 1024) {
            toast.error("Image must be under 2MB")
            return
        }
        setUploadingImage(true)
        try {
            const supabase = createClient()
            const ext = file.name.split(".").pop()
            const path = `${Date.now()}.${ext}`
            const { error } = await supabase.storage.from("product-images").upload(path, file)
            if (error) throw error
            const { data } = supabase.storage.from("product-images").getPublicUrl(path)
            setImageUrl(data.publicUrl)
            toast.success("Image uploaded!")
        } catch {
            toast.error("Image upload failed")
        } finally {
            setUploadingImage(false)
        }
    }

    function addVariant() {
        setVariants(prev => [...prev, { name: "", sku: "", price: 0, stock_quantity: 0 }])
    }

    function updateVariant(idx: number, field: string, value: string | number) {
        setVariants(prev => prev.map((v, i) => i === idx ? { ...v, [field]: value } : v))
    }

    async function removeVariant(idx: number) {
        const variant = variants[idx]
        if (variant.id) {
            await deleteVariant(variant.id)
        }
        setVariants(prev => prev.filter((_, i) => i !== idx))
    }

    async function onSubmit(values: FormValues) {
        setLoading(true)
        try {
            const data: CreateProductInput = { ...values, image_url: imageUrl }
            await onSave(data)

            // Save variants if product exists (for edit mode)
            if (product?.id) {
                for (const v of variants) {
                    if (v.name?.trim()) {
                        await saveVariant(product.id, v as Partial<ProductVariant> & { name: string })
                    }
                }
            }

            onOpenChange(false)
        } finally {
            setLoading(false)
        }
    }

    const tabs = [
        { id: "basic" as const, label: "Basic Info" },
        { id: "inventory" as const, label: "Inventory" },
        { id: "variants" as const, label: `Variants${variants.length > 0 ? ` (${variants.length})` : ""}` },
    ]

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[640px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <div className="px-6 pt-6 pb-3 border-b border-border/50">
                    <DialogHeader>
                        <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
                        <DialogDescription>
                            {product ? "Update product details below." : "Fill in the product details."}
                        </DialogDescription>
                    </DialogHeader>
                    {/* Tabs */}
                    <div className="flex gap-1 mt-4 bg-muted/40 rounded-lg p-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === tab.id
                                    ? "bg-background shadow text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
                        <div className="flex-1 overflow-y-auto px-6 py-4">
                            {/* ── BASIC INFO ── */}
                            {activeTab === "basic" && (
                                <div className="space-y-4">
                                    {/* Image upload */}
                                    <div className="flex items-start gap-4">
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="relative w-20 h-20 rounded-xl border-2 border-dashed border-border hover:border-primary cursor-pointer flex items-center justify-center bg-muted/30 overflow-hidden shrink-0 transition-colors"
                                        >
                                            {uploadingImage ? (
                                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                            ) : imageUrl ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={imageUrl} alt="product" className="w-full h-full object-cover" />
                                            ) : (
                                                <Upload className="h-5 w-5 text-muted-foreground" />
                                            )}
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleImageUpload}
                                            />
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <FormField control={form.control} name="name" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Product Name *</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. Wireless Mouse" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            {/* is_active toggle */}
                                            <FormField control={form.control} name="is_active" render={({ field }) => (
                                                <FormItem className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        role="switch"
                                                        aria-checked={field.value}
                                                        onClick={() => field.onChange(!field.value)}
                                                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none ${field.value ? "bg-emerald-500" : "bg-muted"}`}
                                                    >
                                                        <span className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg transition-transform ${field.value ? "translate-x-4" : "translate-x-0"}`} />
                                                    </button>
                                                    <FormLabel className="!mt-0 cursor-pointer" onClick={() => field.onChange(!field.value)}>
                                                        {field.value ? (
                                                            <Badge className="bg-emerald-500 hover:bg-emerald-500 text-xs">Active</Badge>
                                                        ) : (
                                                            <Badge variant="secondary" className="text-xs">Inactive</Badge>
                                                        )}
                                                    </FormLabel>
                                                </FormItem>
                                            )} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={form.control} name="sku" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>SKU</FormLabel>
                                                <FormControl>
                                                    <div className="flex gap-1">
                                                        <Input placeholder="PROD-001" {...field} />
                                                        <Button type="button" size="icon" variant="outline" onClick={autoGenerateSku} title="Auto-generate SKU">
                                                            <Wand2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="barcode" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Barcode</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. 8901234567890" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="category" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Category</FormLabel>
                                                <FormControl>
                                                    {categories.length > 0 ? (
                                                        <select
                                                            value={field.value || ""}
                                                            onChange={e => field.onChange(e.target.value)}
                                                            className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                                        >
                                                            <option value="">Uncategorized</option>
                                                            {categories.map(c => (
                                                                <option key={c.id} value={c.name}>{c.name}</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <Input placeholder="e.g. Electronics" {...field} />
                                                    )}
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="unit" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Unit</FormLabel>
                                                <FormControl>
                                                    <select
                                                        value={field.value || "pcs"}
                                                        onChange={e => field.onChange(e.target.value)}
                                                        className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                                    >
                                                        {["pcs", "kg", "g", "ltr", "ml", "box", "pack", "pair", "set", "meter"].map(u => (
                                                            <option key={u} value={u}>{u}</option>
                                                        ))}
                                                    </select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>

                                    <FormField control={form.control} name="description" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Product description..." className="resize-none min-h-[80px]" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                            )}

                            {/* ── INVENTORY ── */}
                            {activeTab === "inventory" && (
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="purchase_price" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Purchase Price ({symbol})</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="selling_price" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Selling Price ({symbol})</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="gst_rate" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>GST Rate (%)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="stock_quantity" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Current Stock</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="min_stock_level" render={({ field }) => (
                                        <FormItem className="col-span-2">
                                            <FormLabel>Min Stock Level</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormDescription>Alert triggers when stock falls to or below this level.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                            )}

                            {/* ── VARIANTS ── */}
                            {activeTab === "variants" && (
                                <div className="space-y-3">
                                    <p className="text-xs text-muted-foreground">
                                        Add variants like Size: S/M/L, Color: Red/Blue, or Pack: 6pk/12pk.
                                        {!product && " Variants can be saved after creating the product."}
                                    </p>
                                    {variants.map((v, idx) => (
                                        <div key={idx} className="grid grid-cols-5 gap-2 items-center p-3 bg-muted/30 rounded-lg">
                                            <Input
                                                className="col-span-2"
                                                placeholder="Variant name"
                                                value={v.name || ""}
                                                onChange={e => updateVariant(idx, "name", e.target.value)}
                                            />
                                            <Input
                                                placeholder="SKU"
                                                value={v.sku || ""}
                                                onChange={e => updateVariant(idx, "sku", e.target.value)}
                                            />
                                            <Input
                                                type="number"
                                                placeholder="Stock"
                                                value={v.stock_quantity || 0}
                                                onChange={e => updateVariant(idx, "stock_quantity", Number(e.target.value))}
                                            />
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                onClick={() => removeVariant(idx)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" size="sm" onClick={addVariant} className="w-full gap-1.5">
                                        <Plus className="h-4 w-4" />
                                        Add Variant
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-4 border-t border-border/50 flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {product ? "Update Product" : "Save Product"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
