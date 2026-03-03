/**
 * Generic CSV export utility.
 * Converts an array of objects to a properly escaped CSV string
 * and triggers an automatic file download in the browser.
 */

export interface CsvHeader {
    key: string
    label: string
}

/**
 * Escape a CSV cell value (handles commas, quotes, newlines).
 */
function escapeCsvCell(value: unknown): string {
    if (value === null || value === undefined) return ""
    const str = String(value)
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`
    }
    return str
}

/**
 * Convert an array of row objects to a CSV string.
 */
export function buildCsvString(headers: CsvHeader[], rows: Record<string, unknown>[]): string {
    const headerRow = headers.map(h => escapeCsvCell(h.label)).join(",")
    const dataRows = rows.map(row =>
        headers.map(h => escapeCsvCell(row[h.key])).join(",")
    )
    return [headerRow, ...dataRows].join("\r\n")
}

/**
 * Trigger a CSV file download in the browser.
 */
export function downloadCsv(csvString: string, filename: string): void {
    const blob = new Blob(["\uFEFF" + csvString], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${filename}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

/**
 * One-shot helper: build CSV from a typed array and download.
 * The generic T avoids needing an index signature on your types.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function exportToCsv<T = any>(headers: CsvHeader[], rows: T[], filename: string): void {
    const rawRows = rows as unknown as Record<string, unknown>[]
    const csv = buildCsvString(headers, rawRows)
    downloadCsv(csv, filename)
}
