import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    ArrowRight,
    BarChart3,
    Box,
    Calculator,
    Clock,
    FileText,
    LineChart,
    Settings,
    ShoppingCart,
    Store,
    Truck,
    Users
} from "lucide-react";

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* 1. HERO SECTION */}
            <section className="w-full py-24 md:py-32 lg:py-48 flex items-center justify-center relative overflow-hidden bg-background">
                <div className="absolute inset-0 z-0 bg-grid-slate-100 dark:bg-grid-slate-900/[0.04] bg-[bottom_1px_center] 
          [mask-image:linear-gradient(to_bottom,transparent,black_50%,transparent)]"></div>
                <div className="container px-4 md:px-6 z-10 text-center space-y-8 flex flex-col items-center">
                    <Badge variant="secondary" className="px-3 py-1 text-sm text-accent backdrop-blur-sm bg-accent/10 border-accent/20">
                        Version 1.0 is Live
                    </Badge>
                    <div className="space-y-4 max-w-3xl">
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-tight bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
                            Smart Billing & Inventory Management
                        </h1>
                        <p className="mx-auto max-w-[700px] text-muted-foreground text-lg md:text-xl leading-relaxed">
                            Manage invoices, inventory and business operations from one unified platform. Designed for modern businesses.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-8">
                        <Button size="lg" className="w-full sm:w-auto group" asChild>
                            <Link href="/signup">
                                Get Started
                                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                        <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
                            <Link href="#features">View Features</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* 2. WHAT THIS TOOL DOES */}
            <section id="features" className="w-full py-20 bg-muted/30">
                <div className="container px-4 md:px-6">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Everything You Need to Run Your Business</h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            A comprehensive suite of tools designed to streamline your daily operations.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300">
                            <CardHeader>
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                                    <Calculator className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle>Billing</CardTitle>
                                <CardDescription>Fast, error-free billing at your fingertips.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                Create professional bills in seconds. Track payments and send reminders seamlessly.
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300">
                            <CardHeader>
                                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                                    <Box className="h-6 w-6 text-accent" />
                                </div>
                                <CardTitle>Inventory</CardTitle>
                                <CardDescription>Never run out of stock unexpectedly.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                Real-time stock tracking, low stock alerts, and automated reorder points.
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300">
                            <CardHeader>
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                                    <FileText className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle>GST-Ready Invoicing</CardTitle>
                                <CardDescription>Stay compliant effortlessly.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                Generate GST-compliant invoices natively. Let us handle the tax calculations.
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300">
                            <CardHeader>
                                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                                    <ShoppingCart className="h-6 w-6 text-accent" />
                                </div>
                                <CardTitle>Purchase Tracking</CardTitle>
                                <CardDescription>Manage suppliers and inward stock.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                Keep a tight grip on your purchases, vendor payments, and supply chain.
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* 3. KEY BENEFITS */}
            <section className="w-full py-20 bg-background border-t">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col lg:flex-row gap-12 items-center">
                        <div className="flex-1 space-y-6">
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Focus on Growth. We&apos;ll handle the admin.</h2>
                            <ul className="space-y-4">
                                {[
                                    { icon: Clock, title: "Real-time stock", description: "Know exactly what's on your shelves at any moment." },
                                    { icon: Settings, title: "Automated invoicing", description: "Set up recurring invoices and save hours." },
                                    { icon: LineChart, title: "Business insights", description: "Actionable dashboards measuring your true profit." },
                                    { icon: Users, title: "Multi-customer management", description: "Maintain detailed ledgers for all your clients." }
                                ].map((benefit, i) => (
                                    <li key={i} className="flex gap-4 items-start">
                                        <div className="mt-1 bg-muted p-2 rounded-full">
                                            <benefit.icon className="h-5 w-5 text-accent" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">{benefit.title}</h3>
                                            <p className="text-muted-foreground">{benefit.description}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="flex-1 relative">
                            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-2xl opacity-50"></div>
                            <div className="relative rounded-2xl border bg-card p-8 shadow-2xl space-y-6">
                                <div className="flex justify-between items-center border-b pb-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Revenue</p>
                                        <p className="text-2xl font-bold font-mono">$42,500.00</p>
                                    </div>
                                    <Badge className="bg-green-500/15 text-green-600 dark:text-green-400 hover:bg-green-500/25">
                                        +12.5% This Month
                                    </Badge>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary" /> Inventory Holding</span>
                                        <span className="font-mono">$15,200.00</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-accent" /> Outstanding Receivables</span>
                                        <span className="font-mono">$4,300.00</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. HOW IT HELPS (FOR WHOM) */}
            <section className="w-full py-20 bg-muted/30 border-t">
                <div className="container px-4 md:px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Built for Your Business</h2>
                        <p className="text-muted-foreground text-lg mt-4">Scalable architecture that adapts to your workflow.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="flex flex-col items-center text-center p-6 space-y-4">
                            <div className="w-16 h-16 rounded-full bg-card border shadow-sm flex items-center justify-center">
                                <Store className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold">Retailers</h3>
                            <p className="text-muted-foreground">Fast POS billing over-the-counter and instant inventory deductions to keep your store moving.</p>
                        </div>
                        <div className="flex flex-col items-center text-center p-6 space-y-4">
                            <div className="w-16 h-16 rounded-full bg-card border shadow-sm flex items-center justify-center">
                                <Truck className="h-8 w-8 text-accent" />
                            </div>
                            <h3 className="text-xl font-bold">Distributors</h3>
                            <p className="text-muted-foreground">Manage bulk orders, multi-warehouse stock, and complex supplier ledgers with ease.</p>
                        </div>
                        <div className="flex flex-col items-center text-center p-6 space-y-4">
                            <div className="w-16 h-16 rounded-full bg-card border shadow-sm flex items-center justify-center">
                                <BarChart3 className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold">Service Businesses</h3>
                            <p className="text-muted-foreground">Generate professional service invoices and track your operational expenses systematically.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. FEATURES SNAPSHOT */}
            <section className="w-full py-24 bg-background border-t">
                <div className="container px-4 md:px-6">
                    <div className="mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-center">Powerful Features</h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <Card className="bg-card">
                            <CardHeader>
                                <CardTitle className="text-xl">1. Invoice Generation</CardTitle>
                                <CardDescription>Customizable templates, Logo injection, Auto-numbering, Multi-currency support.</CardDescription>
                            </CardHeader>
                        </Card>
                        <Card className="bg-card">
                            <CardHeader>
                                <CardTitle className="text-xl">2. Inventory Tracking</CardTitle>
                                <CardDescription>SKU Management, Barcode support, Minimum stock alerts, Batch tracking.</CardDescription>
                            </CardHeader>
                        </Card>
                        <Card className="bg-card">
                            <CardHeader>
                                <CardTitle className="text-xl">3. Purchase Management</CardTitle>
                                <CardDescription>Purchase Orders, Goods Receipt Notes, Supplier Ledgers, Cost landed analysis.</CardDescription>
                            </CardHeader>
                        </Card>
                        <Card className="bg-card">
                            <CardHeader>
                                <CardTitle className="text-xl">4. Expense Tracking</CardTitle>
                                <CardDescription>Categorized expenses, Receipt uploads, Recurring bills, Profit impact.</CardDescription>
                            </CardHeader>
                        </Card>
                        <Card className="bg-card">
                            <CardHeader>
                                <CardTitle className="text-xl">5. Customer Management</CardTitle>
                                <CardDescription>Detailed CRM, Credit limits, Outstanding aging, Email statements.</CardDescription>
                            </CardHeader>
                        </Card>
                        <Card className="bg-card md:col-span-2 lg:col-span-1">
                            <CardHeader>
                                <CardTitle className="text-xl">6. Advanced Reports</CardTitle>
                                <CardDescription>P&L Statements, GST filing reports, Sales by Item, Fast moving stock.</CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                </div>
            </section>

            {/* 6. CTA SECTION */}
            <section className="w-full py-24 bg-primary text-primary-foreground border-t">
                <div className="container px-4 md:px-6 text-center space-y-8">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Start managing your business smarter.</h2>
                    <p className="text-primary-foreground/80 text-lg md:text-xl max-w-2xl mx-auto">
                        Join thousands of businesses who have modernized their operations with our platform.
                    </p>
                    <div className="pt-4">
                        <Button size="lg" variant="secondary" className="text-lg px-8 py-6 rounded-full shadow-xl hover:scale-105 transition-transform" asChild>
                            <Link href="/signup">Create your free account</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
