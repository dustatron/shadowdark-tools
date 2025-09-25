-- Add missing INSERT policy for users table
-- This allows authenticated users to create their own user record in public.users

CREATE POLICY "Users can create own profile" ON public.users FOR INSERT
WITH CHECK (auth.uid() = id);