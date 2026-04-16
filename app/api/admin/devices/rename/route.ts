import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { id, newName } = await request.json();

    if (!id || !newName) {
      return NextResponse.json({ error: 'Device ID and New Name are required' }, { status: 400 });
    }

    const supabase = createServerSupabase();

    // 1. Authenticate user
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

    // 2. Update the device name (ensure it belongs to the user)
    const { error } = await supabase
      .from('authorized_devices')
      .update({ device_name: newName })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Rename device error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
