import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function addMediaColorColumns() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  
  const sql = postgres(process.env.DATABASE_URL);
  
  try {
    await sql`ALTER TABLE product_images ADD COLUMN IF NOT EXISTS color text;`;
    await sql`ALTER TABLE product_videos ADD COLUMN IF NOT EXISTS color text;`;
    await sql`ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS color text;`;
    console.log("Successfully added color column to media and variant tables.");
  } catch (error) {
    console.error("Failed to add columns:", error);
  } finally {
    await sql.end();
  }
}

addMediaColorColumns();
