"use client"

import { useActionState } from "react"
import Link from "next/link"
import { signup } from "../actions"
import { Button } from "@/components/ui/button"

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(async (prevState: unknown, formData: FormData) => {
    return await signup(formData)
  }, null)

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">Join CherrySo 🌸</h1>
        <p className="text-muted-foreground">Create an account to track orders and save favorites.</p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        
        <div className="flex flex-col gap-2">
          <label htmlFor="fullName" className="text-sm font-medium">Full Name</label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Jane Doe"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="you@example.com"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-sm font-medium">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {state?.error && (
          <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md">
            {state.error}
          </div>
        )}
        
        {state?.success && (
          <div className="p-3 text-sm bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-md">
            {state.success}
          </div>
        )}

        <Button type="submit" className="w-full mt-2" disabled={isPending}>
          {isPending ? "Creating account..." : "Sign up"}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Log in
        </Link>
      </div>
    </div>
  )
}
