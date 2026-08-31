import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabaseServer';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { token, deviceName } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Missing invite token' }, { status: 400 });
    }

    const supabase = createServerSupabase();

    // 1. Verify the invite token is valid and unused
    const { data: inviteData, error: inviteError } = await supabase
      .from('device_invites')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .single();

    if (inviteError || !inviteData) {
      return NextResponse.json({ error: 'Invalid or used invitation' }, { status: 401 });
    }

    // Check expiry
    if (new Date(inviteData.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 410 });
    }

    const targetUserId = inviteData.created_by;

    if (!targetUserId) {
      return NextResponse.json({ error: 'Invite has no associated user' }, { status: 400 });
    }

    // 2. Generate a secure device credential (random token)
    const deviceCredentialId = crypto.randomBytes(32).toString('base64url');

    // 3. Store in authorized_devices
    const { error: dbError } = await supabase.from('authorized_devices').insert({
      user_id: targetUserId,
      credential_id: deviceCredentialId,
      public_key: 'token-based-enrollment',
      counter: 0,
      transports: ['internal'],
      device_name: deviceName || `Device (${new Date().toLocaleDateString()})`,
      attestation_type: 'token',
      status: 'active',
    });

    if (dbError) {
      console.error('[Token Enrollment] DB error:', dbError);
      return NextResponse.json(
        { error: 'Failed to register device', details: dbError.message },
        { status: 500 },
      );
    }

    // 4. Mark invite as used
    await supabase.from('device_invites').update({ used: true }).eq('id', inviteData.id);

    console.log(`[Token Enrollment] Device registered successfully for user ${targetUserId}`);

    return NextResponse.json({
      success: true,
      credentialId: deviceCredentialId,
    });
  } catch (error: any) {
    console.error('[Token Enrollment] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
