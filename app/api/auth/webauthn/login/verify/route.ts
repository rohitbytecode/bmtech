import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabaseServer';
import { webauthnUtils } from '@/lib/webauthnUtils';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, rpIdHint } = body;

    const cookieStore = await cookies();
    const expectedChallenge = cookieStore.get('webauthn_auth_challenge')?.value;

    if (!expectedChallenge) {
      return NextResponse.json({ error: 'Missing authentication challenge' }, { status: 400 });
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

    const { data: dbAuthenticator, error: dbError } = await supabase
      .from('authorized_devices')
      .select('*')
      .eq('user_id', user.id)
      .eq('credential_id', body.id)
      .single();

    if (dbError || !dbAuthenticator) {
      return NextResponse.json({ error: 'Hardware credential not recognized' }, { status: 401 });
    }

    // 2. Verify Hardware Signature with Dynamic Identity
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
    const origin = request.headers.get('origin') || '';
    const overrideRpId = host.split(':')[0];

    console.log(`[API] Login Verify request for ${email}. Host: ${host}, Origin: ${origin}, RP_ID: ${overrideRpId}, Hint: ${rpIdHint}`);

    const verification = await webauthnUtils.verifyAuthentication(
      body,
      expectedChallenge,
      dbAuthenticator.public_key,
      dbAuthenticator.counter,
      origin,
      overrideRpId,
      rpIdHint
    );

    if (!verification.verified || !verification.authenticationInfo) {
      return NextResponse.json({ error: 'Hardware signature verification failed' }, { status: 401 });
    }

    // 3. Update counter and last_used_at in DB
    await supabase
      .from('authorized_devices')
      .update({ 
        counter: verification.authenticationInfo.newCounter,
        last_used_at: new Date().toISOString()
      })
      .eq('id', dbAuthenticator.id);

    // 4. Verify Password (Final Binding)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.session) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // 5. Cleanup Challenge Cookie
    cookieStore.delete('webauthn_auth_challenge');

    // 6. Set a "Strict" hardware-verified cookie containing the credential ID
    cookieStore.set('bmtech_hardware_verified', dbAuthenticator.credential_id, {
      httpOnly: true,
      secure: !request.url.includes('localhost'),
      maxAge: 60 * 60 * 24, // 1 day
      sameSite: 'lax',
    });

    // 7. Manually set the Supabase session cookie (since createServerSupabase doesn't)
    // This allows the middleware and other pages to see the user as logged in.
    const session = authData.session;
    cookieStore.set('sb-auth-token', JSON.stringify(session), {
      httpOnly: false, // Must be accessible to some client-side scripts
      secure: !request.url.includes('localhost'),
      maxAge: session.expires_in,
      sameSite: 'lax',
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Auth verification error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
