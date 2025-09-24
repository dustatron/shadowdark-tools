-- Temporarily allow anonymous inserts for seeding purposes
-- This policy will be replaced after seeding is complete

DROP POLICY IF EXISTS "Only authenticated users can modify magic items" ON public.magic_items;

-- Allow anonymous inserts (for seeding only)
CREATE POLICY "Allow seeding magic items" ON public.magic_items FOR INSERT WITH CHECK (true);

-- Keep the read policy
-- CREATE POLICY "Magic items are publicly readable" ON public.magic_items FOR SELECT USING (true); -- already exists