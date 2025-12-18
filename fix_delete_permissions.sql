-- Enable RLS on tables (idempotent)
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- delete policies
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON "public"."pages";
CREATE POLICY "Enable delete for authenticated users only" ON "public"."pages"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON "public"."posts";
CREATE POLICY "Enable delete for authenticated users only" ON "public"."posts"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (true);

-- insert policies
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "public"."pages";
CREATE POLICY "Enable insert for authenticated users only" ON "public"."pages" FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "public"."posts";
CREATE POLICY "Enable insert for authenticated users only" ON "public"."posts" FOR INSERT TO authenticated WITH CHECK (true);

-- update policies
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON "public"."pages";
CREATE POLICY "Enable update for authenticated users only" ON "public"."pages" FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Enable update for authenticated users only" ON "public"."posts";
CREATE POLICY "Enable update for authenticated users only" ON "public"."posts" FOR UPDATE TO authenticated USING (true);

-- select policies
DROP POLICY IF EXISTS "Allow public read access" ON "public"."pages";
CREATE POLICY "Allow public read access" ON "public"."pages" FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON "public"."posts";
CREATE POLICY "Allow public read access" ON "public"."posts" FOR SELECT TO anon, authenticated USING (true);
