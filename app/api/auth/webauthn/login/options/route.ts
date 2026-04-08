import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabaseServer';
import { webauthnUtils } from '@/lib/webauthnUtils';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const supabase = createServerSupabase();

    // 1. Get User and their registered authenticators
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { data: credentials, error: dbError } = await supabase
      .from('authorized_devices')
      .select('credential_id, transports')
      .eq('user_id', user.id);

    if (dbError || !credentials || credentials.length === 0) {
      return NextResponse.json({ error: 'No hardware keys registered for this account' }, { status: 403 });
    }

    // 2. Generate Authentication Options
    const options = await webauthnUtils.getAuthenticationOptions(credentials);

    // 3. Store Challenge in Cookie
    (await cookies()).set('webauthn_auth_challenge', options.challenge, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 300,
      sameSite: 'lax',
    });

    return NextResponse.json(options);
  } catch (error: any) {
    console.error('Auth options error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
