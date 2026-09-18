import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function addFullTextSearch() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  
  const sql = postgres(process.env.DATABASE_URL);
  
  try {
    console.log("Adding search_vector column to products...");
    await sql`
      ALTER TABLE products ADD COLUMN IF NOT EXISTS search_vector tsvector
      GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(description, '')), 'B')
      ) STORED;
    `;
    
    console.log("Creating GIN index on search_vector...");
    await sql`
      CREATE INDEX IF NOT EXISTS idx_products_search ON products USING GIN (search_vector);
    `;

    console.log("Creating search_products helper function...");
    await sql`
      CREATE OR REPLACE FUNCTION search_products(search_query text)
      RETURNS SETOF products AS $$
        SELECT p.* FROM products p
        LEFT JOIN product_tags pt ON p.id = pt.product_id
        LEFT JOIN tags t ON pt.tag_id = t.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.search_vector @@ websearch_to_tsquery('english', search_query)
           OR t.name ILIKE '%' || search_query || '%'
           OR c.name ILIKE '%' || search_query || '%'
        GROUP BY p.id
        ORDER BY max(ts_rank(p.search_vector, websearch_to_tsquery('english', search_query))) DESC;
      $$ LANGUAGE sql STABLE;
    `;
    
    console.log("Search infrastructure added successfully.");
  } catch (error) {
    console.error("Failed to add search infrastructure:", error);
  } finally {
    await sql.end();
  }
}

addFullTextSearch();
