import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';

export async function GET() {
  try {
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

    // 2. Get the current hardware credential ID from the secure cookie
    const currentCredentialId = cookieStore.get('bmtech_hardware_verified')?.value;

    return NextResponse.json({
      success: true,
      userEmail: user.email,
      currentCredentialId: currentCredentialId || null,
    });
  } catch (error: any) {
    console.error('Session info error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
