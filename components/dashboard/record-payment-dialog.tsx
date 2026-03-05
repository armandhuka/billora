"use client"

import * as React from "react"
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Loader2, CreditCard } from "lucide-react"
import { Invoice } from "@/types/invoice"
import { recordPayment } from "@/app/actions/payments"
import { useCurrency } from "@/context/currency-context"
import { toast } from "sonner"

interface RecordPaymentDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    invoice: Invoice | null
    onSuccess?: () => void
}

export function RecordPaymentDialog({ open, onOpenChange, invoice, onSuccess }: RecordPaymentDialogProps) {
    const { symbol } = useCurrency()
    const [loading, setLoading] = React.useState(false)
    const [amount, setAmount] = React.useState("")
    const [method, setMethod] = React.useState("cash")
    const [date, setDate] = React.useState(new Date().toISOString().slice(0, 10))
    const [note, setNote] = React.useState("")

    React.useEffect(() => {
        if (open && invoice) {
            setAmount(String(Number(invoice.total_amount).toFixed(2)))
            setMethod("cash")
            setDate(new Date().toISOString().slice(0, 10))
            setNote("")
        }
    }, [open, invoice])

    if (!invoice) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!amount || Number(amount) <= 0) {
            toast.error("Enter a valid amount")
            return
        }

        setLoading(true)
        try {
            const res = await recordPayment({
                customer_id: invoice.customer_id || "",
                invoice_id: invoice.id,
                amount: Number(amount),
                payment_method: method,
                payment_date: date,
                note: note || null,
            })

            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success("Payment recorded successfully!")
                onOpenChange(false)
                onSuccess?.()
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[440px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-emerald-600" />
                        Record Payment
                    </DialogTitle>
                    <DialogDescription>
                        Invoice <span className="font-semibold text-foreground">{invoice.invoice_number}</span> — {symbol}{Number(invoice.total_amount).toFixed(2)}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label>Amount</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">{symbol}</span>
                            <Input
                                type="number"
                                step="0.01"
                                min="0.01"
                                className="pl-8 text-right font-mono"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label>Payment Method</Label>
                            <Select value={method} onValueChange={setMethod}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cash">Cash</SelectItem>
                                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                    <SelectItem value="upi">UPI</SelectItem>
                                    <SelectItem value="cheque">Cheque</SelectItem>
                                    <SelectItem value="card">Card</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Payment Date</Label>
                            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Note (optional)</Label>
                        <Textarea
                            placeholder="e.g. Received via bank transfer"
                            className="h-16 resize-none"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Record Payment
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
