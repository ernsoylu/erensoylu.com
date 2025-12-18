-- Enable RLS on tables (if not already enabled)
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to DELETE pages
CREATE POLICY "Enable delete for authenticated users only" ON "public"."pages"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (true);

-- Policy to allow authenticated users to DELETE posts
CREATE POLICY "Enable delete for authenticated users only" ON "public"."posts"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (true);

-- Ensure Insert/Update also works if needed (assuming these might be missing too if RLS was just enabled)
CREATE POLICY "Enable insert for authenticated users only" ON "public"."pages" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users only" ON "public"."pages" FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."posts" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users only" ON "public"."posts" FOR UPDATE TO authenticated USING (true);

-- Allow public read access (Select)
CREATE POLICY "Allow public read access" ON "public"."pages" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public read access" ON "public"."posts" FOR SELECT TO anon, authenticated USING (true);
