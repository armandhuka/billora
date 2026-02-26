import Link from "next/link"
import { Zap } from "lucide-react"

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center relative bg-muted/30">
            <div className="absolute inset-0 z-0 bg-grid-slate-100 dark:bg-grid-slate-900/[0.04] bg-[bottom_1px_center] 
          [mask-image:linear-gradient(to_bottom,transparent,black_50%,transparent)]"></div>

            <div className="z-10 w-full max-w-md p-4 flex flex-col items-center space-y-6">
                <Link href="/" className="flex items-center space-x-2 group">
                    <div className="bg-primary text-primary-foreground p-1.5 rounded-md group-hover:rotate-12 transition-transform shadow-md">
                        <Zap className="h-6 w-6 fill-current" />
                    </div>
                    <span className="font-bold text-2xl tracking-tight">
                        Billora
                    </span>
                </Link>
                {children}
            </div>
        </div>
    )
}
