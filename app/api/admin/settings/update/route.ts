import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const updates = await request.json();

    // 1. Verify Session & Hardware
    const cookieStore = await cookies();
    const isHardwareVerified = cookieStore.get('bmtech_hardware_verified')?.value === 'true';
    const authCookie = cookieStore.get('sb-auth-token');

    if (!isHardwareVerified) {
      return NextResponse.json({ error: 'Hardware verification required' }, { status: 403 });
    }

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

    const supabase = createServerSupabase();
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Perform Update with Service Role
    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from('settings')
      .upsert({ 
        id: 1, 
        ...updates, 
        updated_at: new Date().toISOString() 
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
