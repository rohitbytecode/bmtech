import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabaseServer';
import { webauthnUtils } from '@/lib/webauthnUtils';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { email, rpIdHint } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const supabase = createServerSupabase();

    // 1. Get User and their registered authenticators
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError || !userData?.users) {
      console.error('[API] listUsers error:', userError);
      return NextResponse.json({ error: 'Failed to fetch user list' }, { status: 500 });
    }

    const { users } = userData;
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

    // 2. Generate Authentication Options with dynamic RP ID
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
    const overrideRpId = host.split(':')[0]; // Remove port if present
    
    console.log(`[API] Login Options request for ${email}. Host: ${host}, RP_ID: ${overrideRpId}, Hint: ${rpIdHint}`);
    
    const options = await webauthnUtils.getAuthenticationOptions(credentials || [], overrideRpId, rpIdHint);

    // 3. Store Challenge in Cookie
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
    console.log(`[WebAuthn] Challenge generated for ${email}. RP_ID: ${overrideRpId}`);
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
