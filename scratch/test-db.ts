import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
  try {
    const sql = postgres(process.env.DATABASE_URL!);
    const result = await sql`SELECT 1 as connected`;
    console.log("Success:", result);
    process.exit(0);
  } catch (error) {
    console.error("Connection failed:", error);
    process.exit(1);
  }
}
test();
