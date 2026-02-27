"use client"

import * as React from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash2, AlertCircle } from "lucide-react"
import { Product } from "@/types/product"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ProductTableProps {
    products: Product[]
    onEdit: (product: Product) => void
    onDelete: (id: string) => void
}

export function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
    return (
        <div className="rounded-md border border-border/50 bg-background/95 backdrop-blur overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[100px]">SKU</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Stock</TableHead>
                        <TableHead className="w-[70px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                No products found. Start by adding one!
                            </TableCell>
                        </TableRow>
                    ) : (
                        products.map((product) => {
                            const isLowStock = product.stock_quantity <= product.min_stock_level
                            return (
                                <TableRow
                                    key={product.id}
                                    className={cn(
                                        "group transition-colors",
                                        isLowStock && "bg-amber-500/5 hover:bg-amber-500/10"
                                    )}
                                >
                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                        {product.sku || "—"}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            {product.name}
                                            {isLowStock && (
                                                <AlertCircle className="h-4 w-4 text-amber-500" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="font-normal">
                                            {product.category || "Uncategorized"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        ${product.selling_price?.toFixed(2) || "0.00"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex flex-col items-end gap-1">
                                            <span className={cn(
                                                "font-bold",
                                                isLowStock ? "text-amber-600 dark:text-amber-400" : "text-foreground"
                                            )}>
                                                {product.stock_quantity}
                                            </span>
                                            {isLowStock && (
                                                <span className="text-[10px] text-amber-600/70 dark:text-amber-400/70 font-medium uppercase tracking-wider">
                                                    Low Stock
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-32">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => onEdit(product)} className="cursor-pointer">
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
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
