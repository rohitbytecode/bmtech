import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabaseServer';
import { webauthnUtils } from '@/lib/webauthnUtils';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { enrollmentToken, email, deviceName } = body;

    const cookieStore = await cookies();
    const expectedChallenge = cookieStore.get('webauthn_reg_challenge')?.value;

    if (!expectedChallenge) {
      return NextResponse.json({ error: 'Missing registration challenge' }, { status: 400 });
    }

    // 1. Verify Registration Signature with Dynamic Identity
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
    const origin = request.headers.get('origin') || '';
    const overrideRpId = host.split(':')[0];
    
    console.log(`[API] Registration Verify request. Host: ${host}, Origin: ${origin}, RP_ID: ${overrideRpId}`);
    
    const verification = await webauthnUtils.verifyRegistration(body, expectedChallenge, origin, overrideRpId);

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json({ error: 'Registration verification failed' }, { status: 400 });
    }

    const registrationInfo = verification.registrationInfo;

    if (!registrationInfo) {
      throw new Error("Registration failed");
    }

    const credentialID = registrationInfo.credential.id;
    const credentialPublicKey = registrationInfo.credential.publicKey;
    const counter = registrationInfo.credential.counter;

    const supabase = createServerSupabase();

    // 2. Identify the target user and the invite type
    const { data: inviteData } = await supabase
      .from('device_invites')
      .select('*')
      .eq('token', enrollmentToken)
      .eq('used', false)
      .single();

    let targetUserId = inviteData?.created_by;
    
    if (!targetUserId) {
      // Fallback to legacy bootstrap
      const { data: { users } } = await supabase.auth.admin.listUsers();
      const legacyUser = users.find((u: any) => u.email === email);
      targetUserId = legacyUser?.id;
    }

    if (!targetUserId) {
      return NextResponse.json({ error: 'User not found during verification' }, { status: 404 });
    }

    // 3. Store the Authenticator in the database
    const { error: dbError } = await supabase
      .from('authorized_devices')
      .insert({
        user_id: targetUserId,
        credential_id: credentialID,
        public_key: Buffer.from(credentialPublicKey).toString('base64url'),
        counter,
        transports: registrationInfo.credential.transports || [],
        device_name: deviceName || 'Hardware Authenticator',
        attestation_type: verification.registrationInfo.attestationObject ? 'direct' : 'none',
      });

    if (dbError) {
      console.error('Database error storing authenticator:', dbError);
      return NextResponse.json({ error: 'Failed to store authenticator' }, { status: 500 });
    }

    // 4. Mark Token/Invite as Used (Single-Use Policy)
    if (inviteData) {
      await supabase
        .from('device_invites')
        .update({ used: true })
        .eq('id', inviteData.id);
    } else {
      await supabase
        .from('enrollment_tokens')
        .update({ is_used: true })
        .eq('token_hash', enrollmentToken);
    }

    // 5. Cleanup Challenge Cookie
    cookieStore.delete('webauthn_reg_challenge');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Registration verification error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
