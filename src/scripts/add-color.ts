import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function addColorColumn() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  
  const sql = postgres(process.env.DATABASE_URL);
  
  try {
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS color text;`;
    console.log("Successfully added color column to products table.");
  } catch (error) {
    console.error("Failed to add color column:", error);
  } finally {
    await sql.end();
  }
}

addColorColumn();
