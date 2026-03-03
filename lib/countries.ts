/**
 * Country → Currency mapping.
 * Each entry provides the ISO country code, display name, currency code, and symbol.
 */

export interface CountryCurrency {
    country: string        // ISO 3166-1 alpha-2
    countryName: string
    currency_code: string  // ISO 4217
    currency_symbol: string
}

export const COUNTRIES: CountryCurrency[] = [
    { country: "IN", countryName: "India", currency_code: "INR", currency_symbol: "₹" },
    { country: "US", countryName: "United States", currency_code: "USD", currency_symbol: "$" },
    { country: "GB", countryName: "United Kingdom", currency_code: "GBP", currency_symbol: "£" },
    { country: "EU", countryName: "European Union", currency_code: "EUR", currency_symbol: "€" },
    { country: "AU", countryName: "Australia", currency_code: "AUD", currency_symbol: "A$" },
    { country: "CA", countryName: "Canada", currency_code: "CAD", currency_symbol: "C$" },
    { country: "AE", countryName: "United Arab Emirates", currency_code: "AED", currency_symbol: "د.إ" },
    { country: "SA", countryName: "Saudi Arabia", currency_code: "SAR", currency_symbol: "﷼" },
    { country: "SG", countryName: "Singapore", currency_code: "SGD", currency_symbol: "S$" },
    { country: "MY", countryName: "Malaysia", currency_code: "MYR", currency_symbol: "RM" },
    { country: "PK", countryName: "Pakistan", currency_code: "PKR", currency_symbol: "₨" },
    { country: "BD", countryName: "Bangladesh", currency_code: "BDT", currency_symbol: "৳" },
    { country: "LK", countryName: "Sri Lanka", currency_code: "LKR", currency_symbol: "₨" },
    { country: "NP", countryName: "Nepal", currency_code: "NPR", currency_symbol: "₨" },
    { country: "JP", countryName: "Japan", currency_code: "JPY", currency_symbol: "¥" },
    { country: "CN", countryName: "China", currency_code: "CNY", currency_symbol: "¥" },
    { country: "KR", countryName: "South Korea", currency_code: "KRW", currency_symbol: "₩" },
    { country: "ID", countryName: "Indonesia", currency_code: "IDR", currency_symbol: "Rp" },
    { country: "PH", countryName: "Philippines", currency_code: "PHP", currency_symbol: "₱" },
    { country: "TH", countryName: "Thailand", currency_code: "THB", currency_symbol: "฿" },
    { country: "VN", countryName: "Vietnam", currency_code: "VND", currency_symbol: "₫" },
    { country: "NG", countryName: "Nigeria", currency_code: "NGN", currency_symbol: "₦" },
    { country: "ZA", countryName: "South Africa", currency_code: "ZAR", currency_symbol: "R" },
    { country: "KE", countryName: "Kenya", currency_code: "KES", currency_symbol: "KSh" },
    { country: "GH", countryName: "Ghana", currency_code: "GHS", currency_symbol: "₵" },
    { country: "BR", countryName: "Brazil", currency_code: "BRL", currency_symbol: "R$" },
    { country: "MX", countryName: "Mexico", currency_code: "MXN", currency_symbol: "Mex$" },
    { country: "AR", countryName: "Argentina", currency_code: "ARS", currency_symbol: "$" },
    { country: "NZ", countryName: "New Zealand", currency_code: "NZD", currency_symbol: "NZ$" },
    { country: "CH", countryName: "Switzerland", currency_code: "CHF", currency_symbol: "CHF" },
    { country: "TR", countryName: "Turkey", currency_code: "TRY", currency_symbol: "₺" },
    { country: "IL", countryName: "Israel", currency_code: "ILS", currency_symbol: "₪" },
    { country: "EG", countryName: "Egypt", currency_code: "EGP", currency_symbol: "£" },
    { country: "QA", countryName: "Qatar", currency_code: "QAR", currency_symbol: "﷼" },
    { country: "KW", countryName: "Kuwait", currency_code: "KWD", currency_symbol: "KD" },
    { country: "BH", countryName: "Bahrain", currency_code: "BHD", currency_symbol: "BD" },
    { country: "OM", countryName: "Oman", currency_code: "OMR", currency_symbol: "﷼" },
    { country: "JO", countryName: "Jordan", currency_code: "JOD", currency_symbol: "JD" },
    { country: "RU", countryName: "Russia", currency_code: "RUB", currency_symbol: "₽" },
    { country: "UA", countryName: "Ukraine", currency_code: "UAH", currency_symbol: "₴" },
    { country: "PL", countryName: "Poland", currency_code: "PLN", currency_symbol: "zł" },
    { country: "SE", countryName: "Sweden", currency_code: "SEK", currency_symbol: "kr" },
    { country: "NO", countryName: "Norway", currency_code: "NOK", currency_symbol: "kr" },
    { country: "DK", countryName: "Denmark", currency_code: "DKK", currency_symbol: "kr" },
]

/** Get currency info for a given country code. Falls back to USD. */
export function getCurrencyForCountry(countryCode: string): CountryCurrency {
    return COUNTRIES.find(c => c.country === countryCode) ?? COUNTRIES[1] // USD fallback
}

/** Default currency symbol (USD) for use before settings load. */
export const DEFAULT_CURRENCY_SYMBOL = "$"
