import Link from "next/link"
import { Zap } from "lucide-react"

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full border-t bg-background">
            <div className="container px-4 md:px-6 py-12 lg:py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* LEFT: Branding & Description */}
                    <div className="flex flex-col space-y-4">
                        <Link href="/" className="flex items-center space-x-2 group w-fit">
                            <div className="bg-primary text-primary-foreground p-1 rounded-md group-hover:rotate-12 transition-transform">
                                <Zap className="h-5 w-5 fill-current" />
                            </div>
                            <span className="font-bold text-xl tracking-tight">
                                Billora
                            </span>
                        </Link>
                        <p className="text-muted-foreground text-sm max-w-xs">
                            Smart billing & inventory platform.
                        </p>
                    </div>

                    {/* CENTER: Navigation Links */}
                    <div className="flex flex-col space-y-3">
                        <h3 className="font-semibold text-sm tracking-widest uppercase text-foreground/80 mb-1">Company</h3>
                        {['Home', 'Features', 'Pricing', 'About', 'Contact'].map((item) => (
                            <Link
                                key={item}
                                href={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                                className="text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
                            >
                                {item}
                            </Link>
                        ))}
                    </div>

                    {/* RIGHT: Action Links */}
                    <div className="flex flex-col space-y-3">
                        <h3 className="font-semibold text-sm tracking-widest uppercase text-foreground/80 mb-1">Account</h3>
                        <Link href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors w-fit">
                            Login
                        </Link>
                        <Link href="/signup" className="text-sm text-primary font-medium hover:text-primary/80 transition-colors w-fit">
                            Sign up
                        </Link>
                    </div>

                </div>

                {/* BOTTOM: Copyright */}
                <div className="mt-12 pt-8 border-t flex flex-col items-center justify-center">
                    <p className="text-sm text-muted-foreground">
                        © {currentYear} Billora. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}
