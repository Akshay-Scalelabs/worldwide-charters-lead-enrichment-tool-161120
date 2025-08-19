import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_KEY;

/**
 * PUBLIC_INTERFACE
 * isSupabaseConfigured
 * This function checks if Supabase configuration is present in the environment variables.
 * @returns {boolean} True if both URL and KEY are defined, else false.
 */
export function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_KEY);
}

/**
 * Supabase client instance or null if not configured.
 * The client is created without session persistence since this app has no auth.
 */
export const supabase = isSupabaseConfigured()
  ? createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } })
  : null;
