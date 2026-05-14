import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export const getSupabase = () => {
  if (supabaseClient) return supabaseClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project') || supabaseUrl.includes('YOUR_SUPABASE_URL')) {
    throw new Error('Supabase URL or Anon Key is missing or invalid. Please configure your environment variables in the Settings menu.');
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseClient;
};

// For backward compatibility or simpler usage if you're sure they exist
export const supabase = {
  from: (table: string) => getSupabase().from(table),
  auth: {
    getUser: () => getSupabase().auth.getUser(),
    getSession: () => getSupabase().auth.getSession(),
    onAuthStateChange: (callback: any) => getSupabase().auth.onAuthStateChange(callback),
    signInWithPassword: (credentials: any) => getSupabase().auth.signInWithPassword(credentials),
    signOut: () => getSupabase().auth.signOut(),
  }
} as any;
