"use client"

import * as React from "react"
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Upload, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { CreateProductInput } from "@/types/product"
import { importProductsFromCsv } from "@/app/actions/products"
import { toast } from "sonner"

interface CsvImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onImported: () => void
}

const REQUIRED_COLS = ["name"]

function parseCsv(text: string): Record<string, string>[] {
    const lines = text.trim().split(/\r?\n/)
    if (lines.length < 2) return []
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/\s+/g, "_"))
    return lines.slice(1).filter(l => l.trim()).map(line => {
        const vals = line.split(",")
        return Object.fromEntries(headers.map((h, i) => [h, (vals[i] || "").trim()]))
    })
}

export function CsvImportDialog({ open, onOpenChange, onImported }: CsvImportDialogProps) {
    const [rows, setRows] = React.useState<Record<string, string>[]>([])
    const [headers, setHeaders] = React.useState<string[]>([])
    const [error, setError] = React.useState<string | null>(null)
    const [importing, setImporting] = React.useState(false)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        setError(null)
        const reader = new FileReader()
        reader.onload = (ev) => {
            const text = ev.target?.result as string
            const parsed = parseCsv(text)
            if (parsed.length === 0) {
                setError("CSV is empty or has no data rows.")
                return
            }
            const cols = Object.keys(parsed[0])
            if (!REQUIRED_COLS.every(r => cols.includes(r))) {
                setError(`CSV must include column: ${REQUIRED_COLS.join(", ")}`)
                return
            }
            setHeaders(cols)
            setRows(parsed)
        }
        reader.readAsText(file)
    }

    async function handleImport() {
        if (rows.length === 0) return
        setImporting(true)
        try {
            const products: CreateProductInput[] = rows.map(r => ({
                name: r.name,
                sku: r.sku || null,
                category: r.category || null,
                barcode: r.barcode || null,
                description: r.description || null,
                unit: r.unit || "pcs",
                purchase_price: r.purchase_price ? Number(r.purchase_price) : null,
                selling_price: r.selling_price ? Number(r.selling_price) : null,
                gst_rate: r.gst_rate ? Number(r.gst_rate) : 0,
                stock_quantity: r.stock_quantity ? Number(r.stock_quantity) : 0,
                min_stock_level: r.min_stock_level ? Number(r.min_stock_level) : 5,
                is_active: true,
            }))
            const result = await importProductsFromCsv(products)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(`Imported ${result.count} products!`)
                onImported()
                onOpenChange(false)
                setRows([])
                setHeaders([])
            }
        } finally {
            setImporting(false)
        }
    }

    function downloadTemplate() {
        const header = ["name", "sku", "category", "barcode", "purchase_price", "selling_price", "gst_rate", "stock_quantity", "min_stock_level"].join(",")
        const sample = ["Sample Product", "PROD-001", "Electronics", "", "100", "150", "18", "50", "10"].join(",")
        const blob = new Blob([`${header}\n${sample}`], { type: "text/csv" })
        const a = document.createElement("a")
        a.href = URL.createObjectURL(blob)
        a.download = "products_template.csv"
        a.click()
    }

    return (
        <Dialog open={open} onOpenChange={v => { onOpenChange(v); if (!v) { setRows([]); setHeaders([]); setError(null) } }}>
            <DialogContent className="sm:max-w-[680px] max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Import Products from CSV</DialogTitle>
                    <DialogDescription>
                        Upload a CSV file with product data. Required column: <code className="text-primary font-mono">name</code>
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 space-y-4 overflow-hidden">
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-1.5">
                            <Upload className="h-4 w-4" />
                            Choose CSV File
                        </Button>
                        <Button variant="ghost" size="sm" onClick={downloadTemplate} className="text-xs text-muted-foreground">
                            Download Template
                        </Button>
                        <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    {rows.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-500/10 p-3 rounded-lg">
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                            {rows.length} products ready to import
                        </div>
                    )}

                    {rows.length > 0 && (
                        <div className="overflow-auto max-h-64 rounded-lg border border-border/50">
                            <table className="w-full text-xs">
                                <thead className="bg-muted/50 sticky top-0">
                                    <tr>
                                        {headers.slice(0, 7).map(h => (
                                            <th key={h} className="px-3 py-2 text-left font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {rows.slice(0, 10).map((row, i) => (
                                        <tr key={i} className="hover:bg-muted/20">
                                            {headers.slice(0, 7).map(h => (
                                                <td key={h} className="px-3 py-2 max-w-[120px] truncate">{row[h] || "—"}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {rows.length > 10 && (
                                <div className="px-3 py-2 text-xs text-muted-foreground bg-muted/20 text-center">
                                    + {rows.length - 10} more rows
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleImport} disabled={rows.length === 0 || importing}>
                        {importing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Import {rows.length > 0 ? `${rows.length} Products` : ""}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
