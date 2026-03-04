"use client"

import * as React from "react"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
    MoreHorizontal, Pencil, Trash2, AlertCircle, AlertTriangle,
    CheckCircle2, XCircle, ExternalLink, Image as ImageIcon,
} from "lucide-react"
import { Product } from "@/types/product"
import { cn } from "@/lib/utils"
import { useCurrency } from "@/context/currency-context"
import Link from "next/link"

interface ProductTableProps {
    products: Product[]
    selectedIds: Set<string>
    onSelectAll: (checked: boolean) => void
    onSelectOne: (id: string, checked: boolean) => void
    onEdit: (product: Product) => void
    onDelete: (id: string) => void
    onToggleActive: (id: string, isActive: boolean) => void
}

export function ProductTable({
    products,
    selectedIds,
    onSelectAll,
    onSelectOne,
    onEdit,
    onDelete,
    onToggleActive,
}: ProductTableProps) {
    const { symbol } = useCurrency()
    const allSelected = products.length > 0 && selectedIds.size === products.length
    const someSelected = selectedIds.size > 0 && selectedIds.size < products.length

    return (
        <div className="rounded-xl border border-border/50 bg-background overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent border-b border-border/50">
                        <TableHead className="w-10 pl-4">
                            <Checkbox
                                checked={allSelected}
                                ref={(el) => {
                                    if (el) (el as HTMLInputElement).indeterminate = someSelected
                                }}
                                onCheckedChange={(v) => onSelectAll(!!v)}
                            />
                        </TableHead>
                        <TableHead className="w-14">Image</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead className="hidden sm:table-cell">Category</TableHead>
                        <TableHead className="hidden md:table-cell">Barcode</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Stock</TableHead>
                        <TableHead className="w-24 text-center">Status</TableHead>
                        <TableHead className="w-10" />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={9} className="h-36 text-center text-muted-foreground">
                                <div className="flex flex-col items-center gap-2">
                                    <AlertCircle className="h-8 w-8 opacity-30" />
                                    <span>No products found</span>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        products.map((product) => {
                            const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= product.min_stock_level
                            const isOutOfStock = product.stock_quantity === 0
                            const isSelected = selectedIds.has(product.id)

                            return (
                                <TableRow
                                    key={product.id}
                                    className={cn(
                                        "group transition-colors",
                                        isSelected && "bg-primary/5",
                                        isOutOfStock && !isSelected && "bg-rose-500/5",
                                        isLowStock && !isSelected && "bg-amber-500/5",
                                    )}
                                >
                                    <TableCell className="pl-4">
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={(v) => onSelectOne(product.id, !!v)}
                                        />
                                    </TableCell>

                                    <TableCell>
                                        {product.image_url ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className="h-10 w-10 rounded-lg object-cover border border-border/50"
                                            />
                                        ) : (
                                            <div className="h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center border border-border/30">
                                                <ImageIcon className="h-4 w-4 text-muted-foreground/50" />
                                            </div>
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-semibold text-sm leading-tight">{product.name}</span>
                                                {isLowStock && (
                                                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                                )}
                                                {isOutOfStock && (
                                                    <AlertCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                                                )}
                                            </div>
                                            <span className="text-[11px] text-muted-foreground font-mono">
                                                {product.sku || "—"}
                                            </span>
                                        </div>
                                    </TableCell>

                                    <TableCell className="hidden sm:table-cell">
                                        {product.category ? (
                                            <Badge variant="secondary" className="font-normal text-[11px]">
                                                {product.category}
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground text-xs">—</span>
                                        )}
                                    </TableCell>

                                    <TableCell className="hidden md:table-cell">
                                        <span className="font-mono text-[11px] text-muted-foreground">
                                            {product.barcode || "—"}
                                        </span>
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <span className="font-semibold text-sm">
                                            {symbol}{product.selling_price?.toFixed(2) ?? "0.00"}
                                        </span>
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <div className="flex flex-col items-end gap-0.5">
                                            <span className={cn(
                                                "font-bold text-sm",
                                                isOutOfStock && "text-rose-500",
                                                isLowStock && "text-amber-500",
                                            )}>
                                                {product.stock_quantity}
                                            </span>
                                            {isOutOfStock && (
                                                <Badge variant="destructive" className="text-[9px] px-1 py-0 h-4">OUT</Badge>
                                            )}
                                            {isLowStock && (
                                                <Badge className="text-[9px] px-1 py-0 h-4 bg-amber-500 hover:bg-amber-500">LOW</Badge>
                                            )}
                                        </div>
                                    </TableCell>

                                    <TableCell className="text-center">
                                        <button
                                            onClick={() => onToggleActive(product.id, !product.is_active)}
                                            className={cn(
                                                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold transition-colors",
                                                product.is_active
                                                    ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                                                    : "bg-slate-500/10 text-slate-500 hover:bg-slate-500/20"
                                            )}
                                        >
                                            {product.is_active
                                                ? <><CheckCircle2 className="h-3 w-3" />Active</>
                                                : <><XCircle className="h-3 w-3" />Inactive</>
                                            }
                                        </button>
                                    </TableCell>

                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/products/${product.id}`} className="flex items-center cursor-pointer">
                                                        <ExternalLink className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onEdit(product)} className="cursor-pointer">
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => onToggleActive(product.id, !product.is_active)}
                                                    className="cursor-pointer"
                                                >
                                                    {product.is_active
                                                        ? <><XCircle className="mr-2 h-4 w-4" />Deactivate</>
                                                        : <><CheckCircle2 className="mr-2 h-4 w-4" />Activate</>
                                                    }
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => onDelete(product.id)}
                                                    className="text-destructive focus:bg-destructive/10 cursor-pointer"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
