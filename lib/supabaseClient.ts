import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Check your .env file.');
}

// Custom cookie-based storage for Supabase JS
// This ensures the browser session is visible to the Next.js Middleware/Server
const cookieStorage = {
  getItem: (key: string) => {
    if (typeof document === 'undefined') return null;
    const cookie = document.cookie.split('; ').find(row => row.startsWith(`${key}=`));
    return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
  },
  setItem: (key: string, value: string) => {
    if (typeof document === 'undefined') return;
    // We use a long-lived cookie (7 days)
    document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax; Secure=${process.env.NODE_ENV === 'production'}`;
  },
  removeItem: (key: string) => {
    if (typeof document === 'undefined') return;
    document.cookie = `${key}=; path=/; max-age=0`;
  },
};

// Initializing the Supabase client with custom cookie storage
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      storage: cookieStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);
