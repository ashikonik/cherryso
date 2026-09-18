import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { db } from "@/db"
import { roles } from "@/db/schema"
import { eq } from "drizzle-orm"
import { Sidebar } from "@/components/admin/Sidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?redirect=/admin")
  }

  const userRoles = await db.select().from(roles).where(eq(roles.userId, user.id))
  const role = userRoles[0]?.role || "customer"

  if (role !== "admin" && role !== "moderator") {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userRole={role} />
      <main className="flex-1 overflow-y-auto bg-muted/20 p-8">
        {children}
      </main>
    </div>
  )
}
