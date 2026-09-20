"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const redirectTo = (formData.get("redirectTo") as string) || "/"

  // Rate-limit login attempts per IP (5 / 15 min). Identifier is the client IP.
  // Doing this BEFORE the Supabase call prevents credential-stuffing floods
  // from burning DB connections / Supabase auth quota.
  try {
    const ip = getClientIp(await headers());
    await checkRateLimit("login", ip);
  } catch (e) {
    if (e instanceof Error && e.message === "RATE_LIMIT_EXCEEDED") {
      return { error: "Too many login attempts. Please wait a few minutes and try again." };
    }
    throw e;
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/", "layout")
  redirect(redirectTo)
}

export async function signup(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const fullName = formData.get("fullName") as string

  // Rate-limit signup per IP (3 / hour). Spam signups burn the auth user pool
  // and trigger Supabase email sends, so we gate aggressively.
  try {
    const ip = getClientIp(await headers());
    await checkRateLimit("register", ip);
  } catch (e) {
    if (e instanceof Error && e.message === "RATE_LIMIT_EXCEEDED") {
      return { error: "Too many account creation attempts. Please wait and try again later." };
    }
    throw e;
  }

  const supabase = await createClient()

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      }
    }
  })

  if (error) {
    return { error: error.message }
  }

  // If email confirmation is disabled, user is logged in automatically.
  // We can just redirect.
  revalidatePath("/", "layout")

  if (data.session) {
    redirect("/")
  }

  return { success: "Check your email to confirm your account!" }
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/")
}
