-- Restore proper security after seeding is complete
-- Remove the open seeding policy and restore admin-only modifications

DROP POLICY IF EXISTS "Allow seeding magic items" ON public.magic_items;

-- Restore proper security: only authenticated users can modify magic items
CREATE POLICY "Only authenticated users can modify magic items" ON public.magic_items FOR ALL USING (auth.uid() IS NOT NULL);