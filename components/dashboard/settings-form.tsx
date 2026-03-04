"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Save, Building2, MapPin, Phone, Mail, ReceiptText, Globe, Smartphone } from "lucide-react"
import { BusinessSettings } from "@/types/settings"
import { updateSettings } from "@/app/actions/settings"
import { toast } from "sonner"
import { COUNTRIES, getCurrencyForCountry } from "@/lib/countries"
import { Badge } from "@/components/ui/badge"

const settingsSchema = z.object({
    business_name: z.string().min(2, "Business name is required").nullable(),
    gst_number: z.string().nullable(),
    address: z.string().nullable(),
    phone: z.string().nullable(),
    email: z.string().email("Invalid email address").nullable().or(z.literal("")),
    country: z.string().nullable(),
    currency_code: z.string().nullable(),
    currency_symbol: z.string().nullable(),
    upi_id: z.string().nullable(),
})

type SettingsFormValues = z.infer<typeof settingsSchema>

interface SettingsFormProps {
    settings: BusinessSettings | null
}

export function SettingsForm({ settings }: SettingsFormProps) {
    const [loading, setLoading] = React.useState(false)
    const [selectedCountry, setSelectedCountry] = React.useState(settings?.country ?? "IN")

    const currency = getCurrencyForCountry(selectedCountry)

    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            business_name: settings?.business_name || "",
            gst_number: settings?.gst_number || "",
            address: settings?.address || "",
            phone: settings?.phone || "",
            email: settings?.email || "",
            country: settings?.country || "IN",
            currency_code: settings?.currency_code || "INR",
            currency_symbol: settings?.currency_symbol || "₹",
            upi_id: settings?.upi_id || "",
        },
    })

    function handleCountryChange(countryCode: string) {
        setSelectedCountry(countryCode)
        const info = getCurrencyForCountry(countryCode)
        form.setValue("country", countryCode)
        form.setValue("currency_code", info.currency_code)
        form.setValue("currency_symbol", info.currency_symbol)
    }

    async function onSubmit(values: SettingsFormValues) {
        setLoading(true)
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const res = await updateSettings(values as any)
            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success("Settings saved! Currency updated across the app.")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                    {/* General Information */}
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-primary" />
                                <CardTitle className="text-xl">General Information</CardTitle>
                            </div>
                            <CardDescription>Manage your business identity and profile.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="business_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Business Display Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter business name" {...field} value={field.value || ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="gst_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>GST / Tax Number</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <ReceiptText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input className="pl-9" placeholder="Enter GST number" {...field} value={field.value || ""} />
                                            </div>
                                        </FormControl>
                                        <FormDescription>Used for professional invoice generation.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader className="space-y-1">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-primary" />
                                <CardTitle className="text-xl">Contact Details</CardTitle>
                            </div>
                            <CardDescription>How customers and suppliers reach you.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Business Email</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input className="pl-9" placeholder="name@business.com" {...field} value={field.value || ""} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone Number</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input className="pl-9" placeholder="+1 (555) 000-0000" {...field} value={field.value || ""} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Country & Currency */}
                <Card className="border-border/50 shadow-sm">
                    <CardHeader className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Globe className="h-5 w-5 text-primary" />
                            <CardTitle className="text-xl">Country &amp; Currency</CardTitle>
                        </div>
                        <CardDescription>
                            Select your country. Currency will be set automatically and used across invoices, reports, and all financial pages.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Country</FormLabel>
                                    <FormControl>
                                        <select
                                            value={field.value ?? "IN"}
                                            onChange={(e) => {
                                                field.onChange(e.target.value)
                                                handleCountryChange(e.target.value)
                                            }}
                                            className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none"
                                        >
                                            {COUNTRIES.map(c => (
                                                <option key={c.country} value={c.country}>
                                                    {c.countryName}
                                                </option>
                                            ))}
                                        </select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Auto-filled currency preview */}
                        <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg border border-border/50">
                            <div className="flex flex-col gap-0.5 flex-1">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Auto-detected Currency</span>
                                <span className="text-base font-bold">{currency.countryName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-base font-bold px-3 py-1 font-mono">
                                    {currency.currency_symbol}
                                </Badge>
                                <Badge variant="secondary" className="text-xs font-bold tracking-wider">
                                    {currency.currency_code}
                                </Badge>
                            </div>
                        </div>

                        <p className="text-xs text-muted-foreground">
                            All monetary values across the dashboard (invoices, purchases, expenses, reports) will display in <strong>{currency.currency_code}</strong>.
                        </p>
                    </CardContent>
                </Card>

                {/* UPI Payment Settings */}
                <Card className="border-border/50 shadow-sm">
                    <CardHeader className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Smartphone className="h-5 w-5 text-primary" />
                            <CardTitle className="text-xl">UPI Payment</CardTitle>
                        </div>
                        <CardDescription>
                            Your UPI ID (VPA) is used to generate a QR code on invoices so customers can pay instantly.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="upi_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>UPI ID (VPA)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="yourname@upi  or  yourname@bank"
                                            {...field}
                                            value={field.value || ""}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Example: <code className="text-xs bg-muted px-1 rounded">business@okaxis</code> or <code className="text-xs bg-muted px-1 rounded">9876543210@paytm</code>
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Address Section */}
                <Card className="border-border/50 shadow-sm">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-xl">Business Address</CardTitle>
                        <CardDescription>The address that will appear on your documents.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter your full business address"
                                            className="min-h-[100px] resize-none"
                                            {...field}
                                            value={field.value || ""}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <div className="flex justify-end pt-4">
                    <Button type="submit" size="lg" disabled={loading} className="px-8 bg-primary hover:bg-primary/90">
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" /> Save Settings
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
