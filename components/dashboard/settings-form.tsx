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
import { Loader2, Save, Building2, MapPin, Phone, Mail, ReceiptText } from "lucide-react"
import { BusinessSettings } from "@/types/settings"
import { updateSettings } from "@/app/actions/settings"
import { toast } from "sonner"

const settingsSchema = z.object({
    business_name: z.string().min(2, "Business name is required").nullable(),
    gst_number: z.string().nullable(),
    address: z.string().nullable(),
    phone: z.string().nullable(),
    email: z.string().email("Invalid email address").nullable().or(z.literal("")),
})

type SettingsFormValues = z.infer<typeof settingsSchema>

interface SettingsFormProps {
    settings: BusinessSettings | null
}

export function SettingsForm({ settings }: SettingsFormProps) {
    const [loading, setLoading] = React.useState(false)

    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            business_name: settings?.business_name || "",
            gst_number: settings?.gst_number || "",
            address: settings?.address || "",
            phone: settings?.phone || "",
            email: settings?.email || "",
        },
    })

    async function onSubmit(values: SettingsFormValues) {
        setLoading(true)
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const res = await updateSettings(values as any)
            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success("Settings updated successfully")
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
