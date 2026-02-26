"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signup } from "@/app/actions/auth"
import { Loader2 } from "lucide-react"

export default function SignupPage() {
    const [error, setError] = React.useState<string | null>(null)
    const [loading, setLoading] = React.useState(false)
    const [success, setSuccess] = React.useState(false)
    const router = useRouter()

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(event.currentTarget)
        const result = await signup(formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        } else {
            setSuccess(true)
            // Redirect after a short delay or show success message
            setTimeout(() => {
                router.push("/login")
            }, 2000)
        }
    }

    return (
        <Card className="w-full shadow-xl border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <CardHeader className="space-y-2 text-center">
                <CardTitle className="text-2xl font-bold tracking-tight">Create your account</CardTitle>
                <CardDescription className="text-base">
                    Start managing your business smarter.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {success ? (
                    <div className="bg-primary/10 text-primary p-4 rounded-md text-center text-sm font-medium">
                        Account created successfully! Redirecting to login...
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            {error && (
                                <div className="bg-destructive/10 text-destructive p-3 rounded-md text-xs font-medium">
                                    {error}
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" name="name" placeholder="John Doe" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" placeholder="john@example.com" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" name="password" type="password" required />
                            </div>
                            <Button
                                type="submit"
                                className="w-full text-md mt-4 shadow-sm hover:scale-[1.02] transition-transform"
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
                            </Button>
                        </div>
                    </form>
                )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4 text-center mt-2">
                <div className="text-sm text-muted-foreground w-full">
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary font-medium hover:underline underline-offset-4">
                        Login
                    </Link>
                </div>
            </CardFooter>
        </Card>
    )
}

