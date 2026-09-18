import { Suspense } from "react"
import Link from "next/link"
import { LoginForm } from "./login-form"

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">Welcome Back 🍒</h1>
        <p className="text-muted-foreground">Log in to your CherrySo account</p>
      </div>

      <Suspense fallback={<div className="flex justify-center p-4">Loading form...</div>}>
        <LoginForm />
      </Suspense>

      <div className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-primary font-medium hover:underline">
          Sign up
        </Link>
      </div>
    </div>
  )
}
