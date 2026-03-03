import { getSettings } from "@/app/actions/settings"
import { DashboardLayoutClient } from "@/components/layout/dashboard-layout-client"
import { getCurrencyForCountry, DEFAULT_CURRENCY_SYMBOL } from "@/lib/countries"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Fetch settings so we can provide currency to the whole dashboard
    const res = await getSettings()
    const settings = res.data

    const country = settings?.country ?? "US"
    const currencyInfo = getCurrencyForCountry(country)
    const symbol = settings?.currency_symbol ?? currencyInfo.currency_symbol ?? DEFAULT_CURRENCY_SYMBOL
    const code = settings?.currency_code ?? currencyInfo.currency_code ?? "USD"

    return (
        <DashboardLayoutClient currencySymbol={symbol} currencyCode={code}>
            {children}
        </DashboardLayoutClient>
    )
}
