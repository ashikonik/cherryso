import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { roles } from "../db/schema";

async function seedAdmin() {
  const email = process.argv[2];

  if (!email) {
    console.error("Please provide the email address of the user to promote.");
    console.error("Usage: npx tsx src/scripts/seed-admin.ts <email>");
    process.exit(1);
  }

  console.log(`Looking up user with email: ${email}...`);

  try {
    // Use raw postgres.js client to query auth.users since it's outside public schema
    const postgres = (await import("postgres")).default;
    const sqlClient = postgres(process.env.DATABASE_URL!);
    
    const rows = await sqlClient`SELECT id FROM auth.users WHERE email = ${email}`;
    
    if (rows.length === 0) {
      console.error(`User with email ${email} not found in auth.users.`);
      process.exit(1);
    }

    const userId = rows[0].id as string;
    
    console.log(`Found user ID: ${userId}. Promoting to admin...`);

    const { db } = await import("../db");
    const { userProfiles } = await import("../db/schema");

    // Ensure the user exists in user_profiles
    await db.insert(userProfiles)
      .values({
        id: userId,
        fullName: "Admin User",
      })
      .onConflictDoNothing({ target: userProfiles.id });

    // Insert or update role
    await db.insert(roles)
      .values({
        userId,
        role: "admin",
      })
      .onConflictDoUpdate({
        target: roles.userId,
        set: { role: "admin" }
      });

    console.log(`✅ User ${email} has been successfully promoted to admin!`);
    process.exit(0);

  } catch (error) {
    console.error("Failed to promote user:", error);
    process.exit(1);
  }
}

seedAdmin();
