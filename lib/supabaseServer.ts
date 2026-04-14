import { createClient } from '@supabase/supabase-js';

export const createServerSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is missing');
  }

  // Use Service Role key if available, fallback to Anon for simple reads, 
  // but we should warn if Service Role is missing as it's required for Admin tasks.
  if (!supabaseServiceKey) {
    console.error('[Supabase] CRITICAL: NEXT_SUPABASE_SERVICE_ROLE_KEY is missing. Admin operations will fail.');
  }

  const finalKey = supabaseServiceKey || anonKey;
  if (!finalKey) {
    throw new Error('Supabase Key (Service Role or Anon) is missing');
  }

  return createClient(supabaseUrl, finalKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};
