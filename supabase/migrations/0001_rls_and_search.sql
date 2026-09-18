-- Add search_vector to products
ALTER TABLE "products" ADD COLUMN "search_vector" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
  ) STORED;

CREATE INDEX idx_products_search ON "products" USING GIN ("search_vector");

-- Create helper function for full text search
CREATE OR REPLACE FUNCTION search_products(search_query text)
RETURNS SETOF products AS $$
  SELECT p.* FROM (
    SELECT DISTINCT p.id, ts_rank(p.search_vector, websearch_to_tsquery('english', search_query)) as rank
    FROM products p
    LEFT JOIN product_tags pt ON p.id = pt.product_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.search_vector @@ websearch_to_tsquery('english', search_query)
       OR t.name ILIKE '%' || search_query || '%'
       OR c.name ILIKE '%' || search_query || '%'
  ) sub
  JOIN products p ON p.id = sub.id
  ORDER BY sub.rank DESC;
$$ LANGUAGE sql STABLE;

-- RLS setup (Enable RLS on all tables)
ALTER TABLE "user_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "roles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tags" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product_images" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product_videos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product_variants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product_tags" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reviews" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cart_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "favorites" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "wishlists" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "return_requests" ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM roles 
    WHERE roles.user_id = is_admin.user_id 
    AND roles.role IN ('admin', 'moderator')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Public Read Policies
CREATE POLICY "Public profiles are viewable by everyone" ON "user_profiles" FOR SELECT USING (true);
CREATE POLICY "Public categories are viewable by everyone" ON "categories" FOR SELECT USING (true);
CREATE POLICY "Public tags are viewable by everyone" ON "tags" FOR SELECT USING (true);
CREATE POLICY "Public products are viewable by everyone" ON "products" FOR SELECT USING (true);
CREATE POLICY "Public product images are viewable by everyone" ON "product_images" FOR SELECT USING (true);
CREATE POLICY "Public product videos are viewable by everyone" ON "product_videos" FOR SELECT USING (true);
CREATE POLICY "Public product variants are viewable by everyone" ON "product_variants" FOR SELECT USING (true);
CREATE POLICY "Public product tags are viewable by everyone" ON "product_tags" FOR SELECT USING (true);
CREATE POLICY "Approved reviews are viewable by everyone" ON "reviews" FOR SELECT USING (status = 'approved');

-- User Scoped Policies
CREATE POLICY "Users can update their own profile" ON "user_profiles" FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view their own cart" ON "cart_items" FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own cart items" ON "cart_items" FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own cart items" ON "cart_items" FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own cart items" ON "cart_items" FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own orders" ON "orders" FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own orders" ON "orders" FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL); -- Allow guest checkout if user_id is null

CREATE POLICY "Users can view their own order items" ON "order_items" FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR orders.user_id IS NULL))
);

CREATE POLICY "Users can create reviews" ON "reviews" FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own pending reviews" ON "reviews" FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own favorites" ON "favorites" FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own favorites" ON "favorites" FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own wishlists" ON "wishlists" FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own wishlists" ON "wishlists" FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own return requests" ON "return_requests" FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own return requests" ON "return_requests" FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Note: Admin write access and access to logs/settings is handled via Drizzle Service Role connection,
-- so we do NOT need to write explicit RLS policies for admin inserts/updates here, as the service_role key bypasses RLS.
