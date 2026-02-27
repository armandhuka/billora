import { getSettings } from "@/app/actions/settings"
import { SettingsForm } from "@/components/dashboard/settings-form"

export default async function SettingsPage() {
    const res = await getSettings()
    const settings = res.data || null

    if (res.error && !settings) {
        return (
            <div className="p-8 text-center text-rose-600 bg-rose-50 rounded-lg border border-rose-100">
                <h1 className="text-xl font-bold">Error Loading Settings</h1>
                <p className="mt-2">{res.error}</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 max-w-5xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary">Business Settings</h1>
                <p className="text-muted-foreground">
                    Configure your business profile, tax information, and contact details.
                </p>
            </div>

            <SettingsForm settings={settings} />
        </div>
    )
}
