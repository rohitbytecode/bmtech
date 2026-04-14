import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabaseServer';
import { webauthnUtils } from '@/lib/webauthnUtils';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    console.log(`[API][${new Date().toISOString()}] Starting Registration Verify`);
    
    const body = await request.json();
    const { enrollmentToken, email, deviceName, rpIdHint } = body;

    const cookieStore = await cookies();
    const challengeCookie = cookieStore.get('webauthn_reg_challenge');
    const expectedChallenge = challengeCookie?.value;

    console.log(`[API] Security context:
      - Challenge Cookie Present: ${!!challengeCookie}
      - Challenge Value: ${expectedChallenge ? 'Masked' : 'MISSING'}
      - Enrollment Token: ${enrollmentToken ? 'Present' : 'MISSING'}`);

    if (!expectedChallenge) {
      console.warn('[API] FATAL: Registration challenge missing from cookies. This could be due to cross-site cookie blocking.');
      return NextResponse.json({ 
        error: 'Security challenge expired or blocked. Please refresh and try again.',
        diagnostic: 'CHALLENGE_MISSING' 
      }, { status: 400 });
    }

    // 1. Verify Registration Signature with Dynamic Identity
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
    const origin = request.headers.get('origin') || '';
    const overrideRpId = host.split(':')[0];
    
    console.log(`[API] Identity context:
      - Host: ${host}
      - Origin: ${origin}
      - RP_ID: ${overrideRpId}
      - Client Hint: ${rpIdHint}`);
    
    let verification;
    try {
      verification = await webauthnUtils.verifyRegistration(body, expectedChallenge, origin, overrideRpId, rpIdHint);
    } catch (vErr: any) {
      console.error('[WebAuthn] Cryptographic verification CRASHED:', vErr);
      return NextResponse.json({ 
        error: 'Hardware verification crashed', 
        details: vErr.message,
        diagnostic: 'CRYPTO_CRASH'
      }, { status: 500 });
    }

    if (!verification.verified || !verification.registrationInfo) {
      console.warn('[WebAuthn] Verification FAILED:', verification);
      return NextResponse.json({ 
        error: 'Hardware verification failed. Your device might be incompatible or the domain is mismatched.',
        diagnostic: 'VERIFICATION_FAILED'
      }, { status: 400 });
    }

    const registrationInfo = verification.registrationInfo;
    const credentialID = registrationInfo.credential.id;
    const credentialPublicKey = registrationInfo.credential.publicKey;
    const counter = registrationInfo.credential.counter;

    console.log(`[API] Cryptography match! Registering Credential: ${credentialID.substring(0, 10)}...`);

    let supabase;
    try {
      supabase = createServerSupabase();
    } catch (confErr: any) {
      console.error('[Supabase] Config error:', confErr.message);
      return NextResponse.json({ 
        error: 'Server configuration error', 
        details: confErr.message,
        diagnostic: 'CONFIG_ERROR'
      }, { status: 500 });
    }

    // 2. Identify the target user and the invite type
    console.log('[API] Checking enrollment tokens...');
    const { data: inviteData, error: inviteError } = await supabase
      .from('device_invites')
      .select('*')
      .eq('token', enrollmentToken)
      .eq('used', false)
      .single();

    if (inviteError && inviteError.code !== 'PGRST116') {
      console.error('[Supabase] Invite lookup error:', inviteError);
    }

    let targetUserId = inviteData?.created_by;
    
    if (!targetUserId) {
      console.log('[API] Falling back to legacy tokens/email lookup...');
      const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
      
      if (userError || !userData?.users) {
        console.error('[Supabase] FATAL Admin API error:', userError);
        return NextResponse.json({ 
          error: 'Authentication authority unreachable',
          details: userError?.message || 'Empty user list',
          diagnostic: 'AUTH_API_FAILURE'
        }, { status: 500 });
      }

      const legacyUser = userData.users.find((u: any) => u.email === email);
      targetUserId = legacyUser?.id;
    }

    if (!targetUserId) {
      console.warn(`[API] Enrollment failed: User ${email} not found.`);
      return NextResponse.json({ error: 'User not found in system' }, { status: 404 });
    }

    // 3. Store the Authenticator in the database
    console.log(`[API] Binding device to user ${targetUserId}...`);
    const { error: dbError } = await supabase
      .from('authorized_devices')
      .insert({
        user_id: targetUserId,
        credential_id: credentialID,
        public_key: Buffer.from(credentialPublicKey).toString('base64url'),
        counter,
        transports: registrationInfo.credential.transports || [],
        device_name: deviceName || 'Hardware Authenticator',
        attestation_type: registrationInfo.attestationObject ? 'direct' : 'none',
      });

    if (dbError) {
      console.error('[Supabase] DB storing error:', dbError);
      return NextResponse.json({ 
        error: 'Database rejection', 
        details: dbError.message,
        diagnostic: 'DB_INSERT_FAILURE'
      }, { status: 500 });
    }

    // 4. Mark Token/Invite as Used
    if (inviteData) {
      await supabase.from('device_invites').update({ used: true }).eq('id', inviteData.id);
    } else {
      await supabase.from('enrollment_tokens').update({ is_used: true }).eq('token_hash', enrollmentToken);
    }

    cookieStore.delete('webauthn_reg_challenge');
    console.log('[API] Registration SUCCESSFUL');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API] TOP-LEVEL CRASH:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: error.message,
      stack: error.stack?.split('\n')[0], // Only first line of stack for security
      diagnostic: 'TOP_LEVEL_CRASH'
    }, { status: 500 });
  }
}
