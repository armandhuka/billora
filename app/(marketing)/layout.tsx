import { Topbar } from "@/components/layout/topbar"
import { Footer } from "@/components/layout/footer"

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col min-h-screen">
            <Topbar />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    )
}
