-- Drop the existing magic_items table to recreate with correct schema
DROP TABLE IF EXISTS public.magic_items CASCADE;

-- Create magic_items table matching the actual JSON structure
CREATE TABLE public.magic_items (
  id TEXT PRIMARY KEY, -- will use the slug as ID
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  traits JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create indexes for performance and search
CREATE INDEX idx_magic_items_name ON public.magic_items(name);
CREATE INDEX idx_magic_items_slug ON public.magic_items(slug);
CREATE INDEX idx_magic_items_name_search ON public.magic_items USING gin(to_tsvector('english', name));
CREATE INDEX idx_magic_items_description_search ON public.magic_items USING gin(to_tsvector('english', description));
CREATE INDEX idx_magic_items_traits_search ON public.magic_items USING gin(traits);

-- Enable Row Level Security (public read access)
ALTER TABLE public.magic_items ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (magic items are public data)
CREATE POLICY "Magic items are publicly readable" ON public.magic_items FOR SELECT USING (true);

-- Only authenticated users can modify magic items (for admin purposes)
CREATE POLICY "Only authenticated users can modify magic items" ON public.magic_items FOR ALL USING (auth.uid() IS NOT NULL);