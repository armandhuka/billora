"use client"

import * as React from "react"
import { Menu, User, LogOut, Settings as SettingsIcon, Bell, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { logout } from "@/app/actions/auth"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

interface SidebarTopbarProps {
    onMenuClick: () => void
}

export function SidebarTopbar({ onMenuClick }: SidebarTopbarProps) {
    const [userName, setUserName] = React.useState<string | null>(null)
    const [installPrompt, setInstallPrompt] = React.useState<BeforeInstallPromptEvent | null>(null)
    const [isInstalled, setIsInstalled] = React.useState(false)
    const supabase = createClient()

    React.useEffect(() => {
        async function getUser() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUserName(user.user_metadata.name || user.email?.split('@')[0] || "User")
            }
        }
        getUser()

        // Listen for the install prompt
        const handleBeforeInstall = (e: Event) => {
            e.preventDefault()
            setInstallPrompt(e as BeforeInstallPromptEvent)
        }

        // Check if already installed (standalone mode)
        if (window.matchMedia("(display-mode: standalone)").matches) {
            setIsInstalled(true)
        }

        window.addEventListener("beforeinstallprompt", handleBeforeInstall)
        window.addEventListener("appinstalled", () => {
            setIsInstalled(true)
            setInstallPrompt(null)
            toast.success("Billora installed! Launch from your home screen.")
        })

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstall)
        }
    }, [supabase.auth])

    const handleInstall = async () => {
        if (!installPrompt) return
        await installPrompt.prompt()
        const { outcome } = await installPrompt.userChoice
        if (outcome === "accepted") {
            setInstallPrompt(null)
            toast.success("Installing Billora…")
        }
    }

    return (
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur md:px-6 lg:px-8">
            <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={onMenuClick}
            >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
            </Button>

            <div className="flex flex-1 items-center gap-4">
                <h1 className="text-lg font-semibold md:text-xl lg:hidden">Billora</h1>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                {/* Install App button — only shown when prompt is available and app not installed */}
                {installPrompt && !isInstalled && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleInstall}
                        className="hidden sm:flex items-center gap-1.5 h-8 text-xs border-primary/30 text-primary hover:bg-primary/10 hover:border-primary"
                    >
                        <Download className="h-3.5 w-3.5" />
                        Install App
                    </Button>
                )}

                <Button variant="ghost" size="icon" className="hidden sm:flex hover:text-primary hover:bg-primary/10">
                    <Bell className="h-5 w-5" />
                    <span className="sr-only">Notifications</span>
                </Button>

                <ModeToggle />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full border bg-muted hover:bg-primary/10 flex items-center justify-center p-0 overflow-hidden">
                            <User className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{userName}</p>
                                <p className="text-xs leading-none text-muted-foreground uppercase-none">
                                    Business Owner
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {/* Install option in dropdown for mobile */}
                        {installPrompt && !isInstalled && (
                            <>
                                <DropdownMenuItem
                                    onClick={handleInstall}
                                    className="cursor-pointer text-primary"
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    <span>Install App</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                            </>
                        )}
                        <DropdownMenuItem asChild>
                            <a href="/settings" className="cursor-pointer w-full flex items-center">
                                <SettingsIcon className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </a>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => logout()}
                            className="text-destructive focus:bg-destructive/10 cursor-pointer"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
