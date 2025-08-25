import { createClient } from '@supabase/supabase-js';

// Prefer Expo public env vars, fallback to plain names if provided
const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL || (process.env.SUPABASE_URL as string);
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || (process.env.SUPABASE_ANON_KEY as string);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in frontend/.env'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
