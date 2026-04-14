import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabaseServer';
import { webauthnUtils } from '@/lib/webauthnUtils';
import { cookies } from 'next/headers';
import base64url from 'base64url';

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

    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();

    if (userError || !userData?.users) {
      console.error('[API] listUsers error:', userError);
      return NextResponse.json({ error: 'Failed to fetch user list' }, { status: 500 });
    }

    const user = userData.users.find(u => u.email === email);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!body.id) {
    return NextResponse.json({ error: 'Missing credential ID from client' }, { status: 400 });
    }

    const incomingCredentialID = body.id;

    const { data: dbAuthenticator, error: dbError } = await supabase
      .from('authorized_devices')
      .select('*')
      .eq('user_id', user.id)
      .eq('credential_id', incomingCredentialID)
      .single();

    if(dbError) {
      console.log('[DB ERROR]', dbError);
    }

    if (!dbAuthenticator) {
      console.log('[AUTH FAIL]');
      console.log('Incoming credential ID:', incomingCredentialID);
 
        const { data: allCreds } = await supabase
        .from('authorized_devices')
        .select('credential_id')
        .eq('user_id', user.id);

      console.log('Stored credentials:', allCreds);

      return NextResponse.json({ error: 'Hardware credential not recognized' }, { status: 401 });

    }

    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
    const origin = request.headers.get('origin') || '';
    const overrideRpId = host.split(':')[0];

    console.log(`[API] Login Verify:
      - Email: ${email}
      - Host: ${host}
      - Origin: ${origin}
      - RP_ID: ${overrideRpId}
      - Hint: ${rpIdHint}`);

    const verification = await webauthnUtils.verifyAuthentication(
      body,
      expectedChallenge,
      dbAuthenticator.credential_id,   // already normalized in util
      dbAuthenticator.public_key,
      dbAuthenticator.counter,
      origin,
      overrideRpId,
      rpIdHint
    );

    if (!verification.verified || !verification.authenticationInfo) {
      return NextResponse.json({ error: 'Hardware signature verification failed' }, { status: 401 });
    }

    await supabase
      .from('authorized_devices')
      .update({
        counter: verification.authenticationInfo.newCounter,
        last_used_at: new Date().toISOString()
      })
      .eq('id', dbAuthenticator.id);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.session) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    cookieStore.delete('webauthn_auth_challenge');

    cookieStore.set('bmtech_hardware_verified', dbAuthenticator.credential_id, {
      httpOnly: true,
      secure: !request.url.includes('localhost'),
      maxAge: 60 * 60 * 24,
      sameSite: 'lax',
    });

    const session = authData.session;
    cookieStore.set('sb-auth-token', JSON.stringify(session), {
      httpOnly: false,
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