import { createClient } from "@/lib/supabase/server"
import { db } from "@/db"
import { roles } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const userRoles = await db.select().from(roles).where(eq(roles.userId, user.id))
  const role = userRoles[0]?.role || "customer"

  if (role !== "admin" && role !== "moderator") {
    throw new Error("Forbidden: Admin privileges required")
  }

  return user
}
