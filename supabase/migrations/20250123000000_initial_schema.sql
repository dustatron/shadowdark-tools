-- Enable Row Level Security
ALTER DATABASE SET row_security = on;

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Lists table
CREATE TABLE public.lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL CHECK (length(name) <= 100),
  description TEXT CHECK (length(description) <= 500),
  is_favorite_list BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, name)
);

-- List items junction table
CREATE TABLE public.list_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID REFERENCES public.lists(id) ON DELETE CASCADE NOT NULL,
  magic_item_id TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(list_id, magic_item_id)
);

-- Roll tables
CREATE TABLE public.roll_tables (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  source_list_id UUID REFERENCES public.lists(id) ON DELETE SET NULL,
  name TEXT NOT NULL CHECK (length(name) <= 100),
  die_size INTEGER NOT NULL CHECK (die_size >= 1 AND die_size <= 10000),
  share_token TEXT UNIQUE NOT NULL,
  is_public BOOLEAN DEFAULT false,
  table_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Favorites
CREATE TABLE public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  magic_item_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, magic_item_id)
);

-- Row Level Security Policies
-- Users: Users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Lists: Users can only access their own lists
CREATE POLICY "Users can view own lists" ON public.lists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own lists" ON public.lists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own lists" ON public.lists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own lists" ON public.lists FOR DELETE USING (auth.uid() = user_id);

-- List Items: Users can only access items in their own lists
CREATE POLICY "Users can view own list items" ON public.list_items FOR SELECT
  USING (list_id IN (SELECT id FROM public.lists WHERE user_id = auth.uid()));
CREATE POLICY "Users can manage own list items" ON public.list_items FOR ALL
  USING (list_id IN (SELECT id FROM public.lists WHERE user_id = auth.uid()));

-- Roll Tables: Users can edit their own, anyone can view shared tables
CREATE POLICY "Users can view own roll tables" ON public.roll_tables FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Anyone can view shared tables" ON public.roll_tables FOR SELECT
  USING (share_token IS NOT NULL);
CREATE POLICY "Users can manage own roll tables" ON public.roll_tables FOR ALL
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Favorites: Users can only access their own favorites
CREATE POLICY "Users can view own favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own favorites" ON public.favorites FOR ALL USING (auth.uid() = user_id);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roll_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX idx_lists_user_id ON public.lists(user_id);
CREATE INDEX idx_list_items_list_id ON public.list_items(list_id);
CREATE INDEX idx_list_items_magic_item_id ON public.list_items(magic_item_id);
CREATE INDEX idx_roll_tables_user_id ON public.roll_tables(user_id);
CREATE INDEX idx_roll_tables_share_token ON public.roll_tables(share_token);
CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX idx_favorites_magic_item_id ON public.favorites(magic_item_id);