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

    // Temporarily disabled BMTECH_2026
    // if (dbError || !credentials || credentials.length === 0) {
    //   return NextResponse.json({ error: 'No hardware keys registered for this account' }, { status: 403 });
    // }

    // Temporary auth
    if (dbError || !credentials || credentials.length === 0) {
      return NextResponse.json({
        webauthnAvailable: false
      }, { status: 200 });
    }

    // 2. Generate Authentication Options
    console.log(`[WebAuthn] Generating login options for ${email}. Found ${credentials?.length || 0} registered keys.`);
    const options = await webauthnUtils.getAuthenticationOptions(credentials || []);

    // 3. Store Challenge in Cookie
    const isLocalhost = request.url.includes('localhost') || request.url.includes('127.0.0.1');
    console.log(`[WebAuthn] Challenge generated for ${email}. RP_ID: ${options.rpId}`);
    (await cookies()).set('webauthn_auth_challenge', options.challenge, {
      httpOnly: true,
      secure: !isLocalhost, // Only secure if not on localhost
      maxAge: 300,
      sameSite: 'lax',
    });

    return NextResponse.json(options);
  } catch (error: any) {
    console.error('Auth options error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
