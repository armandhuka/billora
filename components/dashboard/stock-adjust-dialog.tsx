"use client"

import * as React from "react"
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowUp, ArrowDown, Minus } from "lucide-react"
import { adjustStock } from "@/app/actions/stock-logs"
import { toast } from "sonner"

interface StockAdjustDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    productId: string
    productName: string
    currentStock: number
    onAdjusted: () => void
}

export function StockAdjustDialog({
    open,
    onOpenChange,
    productId,
    productName,
    currentStock,
    onAdjusted,
}: StockAdjustDialogProps) {
    const [mode, setMode] = React.useState<"add" | "remove" | "set">("add")
    const [quantity, setQuantity] = React.useState("")
    const [note, setNote] = React.useState("")
    const [loading, setLoading] = React.useState(false)

    const qty = parseInt(quantity || "0", 10)
    const isValid = !isNaN(qty) && qty > 0

    const delta = mode === "add" ? qty : mode === "remove" ? -qty : qty - currentStock
    const newStock = currentStock + delta

    async function handleSubmit() {
        if (!isValid) return
        setLoading(true)
        try {
            const result = await adjustStock({
                productId,
                quantity: delta,
                note: note.trim() || `Manual ${mode === "add" ? "addition" : mode === "remove" ? "removal" : "set to " + qty}`,
            })
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(`Stock updated: ${delta > 0 ? "+" : ""}${delta} units`)
                onAdjusted()
                onOpenChange(false)
                setQuantity("")
                setNote("")
            }
        } finally {
            setLoading(false)
        }
    }

    const modes = [
        { id: "add" as const, label: "Add Stock", icon: ArrowUp, color: "text-emerald-600" },
        { id: "remove" as const, label: "Remove Stock", icon: ArrowDown, color: "text-rose-600" },
        { id: "set" as const, label: "Set Exact", icon: Minus, color: "text-blue-600" },
    ]

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[420px]">
                <DialogHeader>
                    <DialogTitle>Adjust Stock</DialogTitle>
                    <DialogDescription>
                        Manual adjustment for <span className="font-semibold text-foreground">{productName}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Current stock display */}
                    <div className="flex items-center justify-between bg-muted/40 rounded-xl px-4 py-3">
                        <span className="text-sm text-muted-foreground">Current Stock</span>
                        <span className="text-xl font-bold">{currentStock}</span>
                    </div>

                    {/* Mode selector */}
                    <div>
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                            Adjustment Type
                        </Label>
                        <div className="flex bg-muted/40 rounded-lg p-0.5 gap-0.5">
                            {modes.map(m => (
                                <button
                                    key={m.id}
                                    type="button"
                                    onClick={() => setMode(m.id)}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-md transition-all ${mode === m.id
                                            ? "bg-background shadow text-foreground"
                                            : "text-muted-foreground hover:text-foreground"
                                        }`}
                                >
                                    <m.icon className={`h-3.5 w-3.5 ${mode === m.id ? m.color : ""}`} />
                                    {m.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quantity */}
                    <div className="space-y-1.5">
                        <Label htmlFor="qty">
                            {mode === "set" ? "New Stock Total" : "Quantity"}
                        </Label>
                        <Input
                            id="qty"
                            type="number"
                            min={1}
                            placeholder={mode === "set" ? `Current: ${currentStock}` : "Enter quantity"}
                            value={quantity}
                            onChange={e => setQuantity(e.target.value)}
                            className="text-lg font-semibold"
                        />
                    </div>

                    {/* Preview */}
                    {isValid && (
                        <div className="flex items-center justify-between bg-muted/30 rounded-xl px-4 py-3 border border-border/50">
                            <span className="text-sm text-muted-foreground">New Stock After Adjustment</span>
                            <div className="flex items-center gap-2">
                                <Badge variant={delta > 0 ? "default" : "destructive"} className={delta > 0 ? "bg-emerald-500" : ""}>
                                    {delta > 0 ? "+" : ""}{delta}
                                </Badge>
                                <span className="text-xl font-bold">{Math.max(0, newStock)}</span>
                            </div>
                        </div>
                    )}

                    {/* Note */}
                    <div className="space-y-1.5">
                        <Label htmlFor="note">Note (optional)</Label>
                        <Textarea
                            id="note"
                            placeholder="e.g. Stocktake correction, Damaged goods removed..."
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            className="resize-none min-h-[64px]"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={!isValid || loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Adjustment
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
