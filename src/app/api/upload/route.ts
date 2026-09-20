import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { db } from "@/db"
import { roles } from "@/db/schema"
import { eq } from "drizzle-orm"
import { validateImageUpload, buildStorageKey } from "@/lib/upload-utils"

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

    // 3. Validate file BEFORE uploading. We never want to trust client-supplied
    // MIME / extension / size — see lib/upload-utils.ts for the policy.
    // Magic-byte sniff the first 16 bytes to confirm the bytes match the claim.
    const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
    const validated = validateImageUpload(
      { type: file.type, size: file.size, name: file.name },
      head
    );
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 })
    }

    // 4. Build a safe storage key. The user-supplied filename never reaches storage.
    const storageKey = buildStorageKey(validated.ext)

    // 5. Upload to Supabase Storage using the *validated* MIME, never file.type.
    const { data, error } = await supabase
      .storage
      .from('products')
      .upload(storageKey, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: validated.mime,
      })

    if (error) {
      console.error("Supabase storage error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // 6. Get Public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('products')
      .getPublicUrl(storageKey)

    return NextResponse.json({ url: publicUrl })

  } catch (error: unknown) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Internal server error during upload" },
      { status: 500 }
    )
  }
}
