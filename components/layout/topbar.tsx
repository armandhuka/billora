"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Menu, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function Topbar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    const [isOpen, setIsOpen] = React.useState(false);

    const navigations = [
        { title: "Home", href: "/" },
        { title: "Features", href: "#features" },
        { title: "Pricing", href: "/pricing" },
        { title: "About", href: "/about" },
        { title: "Contact", href: "/contact" },
    ];

    return (
        <header className={cn("sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)} {...props}>
            <div className="container px-4 md:px-6 flex h-16 items-center justify-between">

                {/* LEFT: Logo */}
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center space-x-2 group">
                        <div className="bg-primary text-primary-foreground p-1 rounded-md group-hover:rotate-12 transition-transform">
                            <Zap className="h-5 w-5 fill-current" />
                        </div>
                        <span className="font-bold text-xl tracking-tight hidden sm:inline-block">
                            Billora
                        </span>
                    </Link>
                </div>

                {/* CENTER: Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                    {navigations.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="transition-colors hover:text-primary relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full"
                        >
                            {item.title}
                        </Link>
                    ))}
                </nav>

                {/* RIGHT: Actions */}
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2">
                        <Button variant="ghost" asChild className="hover:text-primary hover:bg-primary/10">
                            <Link href="/login">Log in</Link>
                        </Button>
                        <Button asChild className="shadow-sm transition-transform hover:scale-105">
                            <Link href="/signup">Sign up</Link>
                        </Button>
                        <div className="w-px h-6 bg-border mx-1"></div>
                    </div>
                    <ModeToggle />

                    {/* MOBILE: Hamburger menu */}
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle mobile menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                            <div className="flex flex-col gap-6 pt-10">
                                <div className="flex items-center space-x-2">
                                    <div className="bg-primary text-primary-foreground p-1 rounded-md">
                                        <Zap className="h-5 w-5 fill-current" />
                                    </div>
                                    <span className="font-bold text-xl tracking-tight">
                                        Billora
                                    </span>
                                </div>

                                <div className="flex flex-col space-y-3">
                                    {navigations.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsOpen(false)}
                                            className="text-lg font-medium hover:text-primary transition-colors px-2 py-1 rounded-md hover:bg-primary/10"
                                        >
                                            {item.title}
                                        </Link>
                                    ))}
                                </div>

                                <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
                                    <Button variant="outline" className="w-full justify-start" asChild>
                                        <Link href="/login" onClick={() => setIsOpen(false)}>Log in</Link>
                                    </Button>
                                    <Button className="w-full justify-start" asChild>
                                        <Link href="/signup" onClick={() => setIsOpen(false)}>Sign up free</Link>
                                    </Button>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    )
}
