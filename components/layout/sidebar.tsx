import * as React from "react"
import { cn } from "@/lib/utils"

export function Sidebar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <aside className={cn("hidden lg:block w-64 border-r bg-background", className)} {...props}>
            <div className="p-4">
                <h2 className="text-lg font-semibold border-b pb-2">Navigation</h2>
                {/* Navigation links placeholder */}
            </div>
        </aside>
    )
}
