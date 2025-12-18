-- Run this in your Supabase SQL Editor to fix the search functionality

CREATE OR REPLACE FUNCTION search_content(keyword text)
RETURNS TABLE (
  id uuid,
  type text,
  title text,
  slug text,
  excerpt text
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id, 
    'post'::text AS type, 
    p.title, 
    p.slug, 
    LEFT(REGEXP_REPLACE(p.content, '<[^>]+>', '', 'g'), 150) AS excerpt
  FROM posts p
  WHERE p.title ILIKE '%' || keyword || '%' 
     OR p.content ILIKE '%' || keyword || '%'
  
  UNION ALL
  
  SELECT 
    pg.id, 
    'page'::text AS type, 
    pg.title, 
    pg.slug, 
    LEFT(REGEXP_REPLACE(pg.content, '<[^>]+>', '', 'g'), 150) AS excerpt
  FROM pages pg
  WHERE pg.title ILIKE '%' || keyword || '%' 
     OR pg.content ILIKE '%' || keyword || '%';
END;
$$;
