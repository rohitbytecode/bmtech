import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AdminRoot() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Attempt to find the auth cookie
  const allCookies = cookieStore.getAll();
  const authCookie = allCookies.find((c) => c.name.includes('auth-token'));

  if (!authCookie) {
    redirect('/admin/login');
  }

  try {
    let sessionData;
    try {
      sessionData = JSON.parse(decodeURIComponent(authCookie.value));
    } catch (e) {
      sessionData = JSON.parse(authCookie.value);
    }

    const token = sessionData?.access_token || sessionData?.[0]?.access_token;
    if (!token) redirect('/admin/login');

    const {
      data: { user },
    } = await supabase.auth.getUser(token);

    if (
      user &&
      (user.user_metadata?.role === 'admin' || user.user_metadata?.is_super_admin === true)
    ) {
      redirect('/admin/dashboard');
    }
  } catch (e) {
    // Fallback to login on error
  }

  redirect('/admin/login');
}
