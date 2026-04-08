import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabaseServer';
import { webauthnUtils } from '@/lib/webauthnUtils';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { enrollmentToken, email } = body;

    const cookieStore = await cookies();
    const expectedChallenge = cookieStore.get('webauthn_reg_challenge')?.value;

    if (!expectedChallenge) {
      return NextResponse.json({ error: 'Missing registration challenge' }, { status: 400 });
    }

    // 1. Verify Registration Signature
    const verification = await webauthnUtils.verifyRegistration(body, expectedChallenge);

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

    // 2. Get User ID (Assume user exists)
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const user = users.find((u: any) => u.email === email);

    if (!user) {
      return NextResponse.json({ error: 'User not found during verification' }, { status: 404 });
    }

    // 3. Store the Authenticator in the database
    const { error: dbError } = await supabase
      .from('authorized_devices')
      .insert({
        user_id: user.id,
        credential_id: Buffer.from(credentialID).toString('base64url'),
        public_key: Buffer.from(credentialPublicKey).toString('base64url'),
        counter,
        device_name: 'Hardware Authenticator',
        attestation_type: verification.registrationInfo.attestationObject ? 'direct' : 'none',
      });

    if (dbError) {
      console.error('Database error storing authenticator:', dbError);
      return NextResponse.json({ error: 'Failed to store authenticator' }, { status: 500 });
    }

    // 4. Mark Enrollment Token as Used
    await supabase
      .from('enrollment_tokens')
      .update({ is_used: true })
      .eq('token_hash', enrollmentToken);

    // 5. Cleanup Challenge Cookie
    cookieStore.delete('webauthn_reg_challenge');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Registration verification error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
