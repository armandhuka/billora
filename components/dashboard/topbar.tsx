"use client"

import * as React from "react"
import { Menu, User, LogOut, Settings as SettingsIcon, Bell } from "lucide-react"
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

interface SidebarTopbarProps {
    onMenuClick: () => void
}

export function SidebarTopbar({ onMenuClick }: SidebarTopbarProps) {
    const [userName, setUserName] = React.useState<string | null>(null)
    const supabase = createClient()

    React.useEffect(() => {
        async function getUser() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUserName(user.user_metadata.name || user.email?.split('@')[0] || "User")
            }
        }
        getUser()
    }, [supabase.auth])

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
