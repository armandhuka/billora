"use client"

/**
 * CurrencyContext — provides the current business currency symbol
 * and code to any component in the dashboard tree.
 *
 * Usage:
 *   const { symbol, code } = useCurrency()
 *   <span>{symbol}{amount}</span>
 */

import * as React from "react"
import { DEFAULT_CURRENCY_SYMBOL } from "@/lib/countries"

interface CurrencyContextValue {
    symbol: string
    code: string
}

const CurrencyContext = React.createContext<CurrencyContextValue>({
    symbol: DEFAULT_CURRENCY_SYMBOL,
    code: "USD",
})

interface CurrencyProviderProps {
    symbol: string
    code: string
    children: React.ReactNode
}

export function CurrencyProvider({ symbol, code, children }: CurrencyProviderProps) {
    return (
        <CurrencyContext.Provider value={{ symbol, code }}>
            {children}
        </CurrencyContext.Provider>
    )
}

export function useCurrency(): CurrencyContextValue {
    return React.useContext(CurrencyContext)
}
