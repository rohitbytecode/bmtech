import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const supabase = createServerSupabase();

    // 1. Get current user from session
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('sb-auth-token');

    if (!authCookie) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 });
    }

    let token = '';
    try {
      const sessionData = JSON.parse(authCookie.value);
      token = sessionData.access_token;
    } catch (e) {
      token = authCookie.value;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch devices from the authorized_devices table
    const { data, error } = await supabase
      .from('authorized_devices')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true, devices: data });
  } catch (error: any) {
    console.error('List devices error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
