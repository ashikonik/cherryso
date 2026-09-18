import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { db } from "@/db"
import { roles } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function POST(request: Request) {
  try {
    // 1. Auth & Role Check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRoles = await db.select().from(roles).where(eq(roles.userId, user.id))
    const role = userRoles[0]?.role || "customer"

    if (role !== "admin" && role !== "moderator") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // 2. Parse FormData
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // 3. Generate unique filename
    const ext = file.name.split('.').pop()
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`

    // 4. Upload directly to Supabase Storage
    const { data, error } = await supabase
      .storage
      .from('products')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      })

    if (error) {
      console.error("Supabase storage error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // 5. Get Public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('products')
      .getPublicUrl(filename)

    return NextResponse.json({ url: publicUrl })

  } catch (error: unknown) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Internal server error during upload" },
      { status: 500 }
    )
  }
}
