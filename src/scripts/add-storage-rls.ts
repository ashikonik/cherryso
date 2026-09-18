import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function addStorageRls() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  
  const sql = postgres(process.env.DATABASE_URL);
  
  try {
    await sql`
      CREATE POLICY "Allow authenticated uploads" 
      ON storage.objects FOR INSERT TO authenticated 
      WITH CHECK (bucket_id = 'products');
    `;
    console.log("Created INSERT policy");
  } catch (e: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
    console.log("INSERT policy might exist:", e.message);
  }

  try {
    await sql`
      CREATE POLICY "Allow authenticated updates" 
      ON storage.objects FOR UPDATE TO authenticated 
      USING (bucket_id = 'products');
    `;
    console.log("Created UPDATE policy");
  } catch (e: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
    console.log("UPDATE policy might exist:", e.message);
  }

  try {
    await sql`
      CREATE POLICY "Allow authenticated deletes" 
      ON storage.objects FOR DELETE TO authenticated 
      USING (bucket_id = 'products');
    `;
    console.log("Created DELETE policy");
  } catch (e: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
    console.log("DELETE policy might exist:", e.message);
  }

  await sql.end();
}

addStorageRls();
