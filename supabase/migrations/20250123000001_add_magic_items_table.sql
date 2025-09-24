-- Create magic_items table for storing the magic items data
CREATE TABLE public.magic_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('weapon', 'armor', 'accessory', 'consumable', 'artifact')),
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'uncommon', 'rare', 'very-rare', 'legendary', 'artifact')),
  properties JSONB,
  source TEXT DEFAULT 'Shadowdark RPG',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_magic_items_type ON public.magic_items(type);
CREATE INDEX idx_magic_items_rarity ON public.magic_items(rarity);
CREATE INDEX idx_magic_items_name_search ON public.magic_items USING gin(to_tsvector('english', name));
CREATE INDEX idx_magic_items_description_search ON public.magic_items USING gin(to_tsvector('english', description));

-- Enable Row Level Security (public read access)
ALTER TABLE public.magic_items ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (magic items are public data)
CREATE POLICY "Magic items are publicly readable" ON public.magic_items FOR SELECT USING (true);

-- Only authenticated users can modify magic items (for admin purposes)
CREATE POLICY "Only authenticated users can modify magic items" ON public.magic_items FOR ALL USING (auth.uid() IS NOT NULL);