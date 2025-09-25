import { createClient } from '@/lib/supabase/server';
import { User } from '@supabase/supabase-js';

export interface PublicUser {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

/**
 * Ensures a user record exists in the public.users table for an authenticated user.
 * This function handles the case where a user exists in auth.users but not in public.users.
 *
 * @param authUser - The authenticated user from Supabase Auth
 * @returns Promise<PublicUser> - The user record from public.users
 * @throws Error if user creation or retrieval fails
 */
export async function ensureUserExists(authUser: User): Promise<PublicUser> {
  const supabase = await createClient();

  // First, try to get the existing user record
  const { data: existingUser, error: selectError } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();

  // If user exists, return it
  if (existingUser && !selectError) {
    return existingUser;
  }

  // If the error is not "not found", throw it
  if (selectError && selectError.code !== 'PGRST116') {
    throw new Error(`Failed to check user existence: ${selectError.message}`);
  }

  // User doesn't exist, create it using regular client with RLS policy
  const { data: newUser, error: insertError } = await supabase
    .from('users')
    .insert({
      id: authUser.id,
      email: authUser.email || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (insertError) {
    // Handle race condition where another request created the user
    if (insertError.code === '23505') { // unique violation
      // Try to fetch the user again
      const { data: raceUser, error: raceError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (raceError) {
        throw new Error(`Failed to fetch user after race condition: ${raceError.message}`);
      }

      return raceUser;
    }

    throw new Error(`Failed to create user: ${insertError.message}`);
  }

  return newUser;
}

/**
 * Get a user by ID from the public.users table
 *
 * @param userId - The user ID
 * @returns Promise<PublicUser | null> - The user record or null if not found
 */
export async function getUserById(userId: string): Promise<PublicUser | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch user: ${error.message}`);
  }

  return data;
}