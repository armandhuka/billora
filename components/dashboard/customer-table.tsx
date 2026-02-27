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
import { Customer } from "@/types/invoice"
import { MoreHorizontal, Mail, Phone, MapPin, Edit, Trash2, User } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface CustomerTableProps {
    customers: Customer[]
    onEdit: (customer: Customer) => void
    onDelete: (id: string) => void
}

export function CustomerTable({ customers, onEdit, onDelete }: CustomerTableProps) {
    if (customers.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-dashed border-border/60">
                <div className="p-4 bg-muted rounded-full mb-4">
                    <User className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No customers found</h3>
                <p className="text-muted-foreground text-sm max-w-[300px] text-center mt-1">
                    Add your clients to manage their details and generate invoices faster.
                </p>
            </div>
        )
    }

    return (
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
            <Table>
                <TableHeader className="bg-muted/30">
                    <TableRow>
                        <TableHead className="font-semibold">Customer</TableHead>
                        <TableHead className="font-semibold">Contact</TableHead>
                        <TableHead className="font-semibold">Address</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {customers.map((customer) => (
                        <TableRow key={customer.id} className="group hover:bg-muted/20 transition-colors">
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9 border border-border/50">
                                        <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold uppercase">
                                            {customer.name.slice(0, 2)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-foreground/90">{customer.name}</span>
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Client</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col gap-1">
                                    {customer.email && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Mail className="h-3 w-3" />
                                            <span>{customer.email}</span>
                                        </div>
                                    )}
                                    {customer.phone && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Phone className="h-3 w-3" />
                                            <span>{customer.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                {customer.address ? (
                                    <div className="flex items-start gap-2 text-sm text-muted-foreground max-w-[200px] truncate">
                                        <MapPin className="h-3 w-3 mt-1 shrink-0" />
                                        <span>{customer.address}</span>
                                    </div>
                                ) : (
                                    <span className="text-xs text-muted-foreground/50 italic">No address provided</span>
                                )}
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-[160px]">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => onEdit(customer)}>
                                            <Edit className="mr-2 h-4 w-4" /> Edit Details
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                            onClick={() => onDelete(customer.id)}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
