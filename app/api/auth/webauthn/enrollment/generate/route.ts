import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const supabase = createServerSupabase();

    // 1. Verify that the requester is an admin
    // In a real app, check the requester's session/role
    const cookieStore = await cookies();
    const isHardwareVerified = cookieStore.get('bmtech_hardware_verified')?.value === 'true';

    // For now, we enforce that only a hardware-verified admin can generate new invites
    if (!isHardwareVerified) {
      return NextResponse.json(
        { error: 'Hardware verification required to generate invites' },
        { status: 403 },
      );
    }

    // 2. Generate a secure one-time token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = rawToken; // In a real app, store a hash: crypto.createHash('sha256').update(rawToken).digest('hex')
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    const { data, error } = await supabase
      .from('enrollment_tokens')
      .insert({
        user_id: userId,
        token_hash: tokenHash,
        expires_at: expiresAt,
        is_used: false,
      })
      .select()
      .single();

    if (error) throw error;

    // 3. Return the raw token (only shown once)
    return NextResponse.json({
      token: rawToken,
      expiresAt,
      inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/enroll?token=${rawToken}`,
    });
  } catch (error: any) {
    console.error('Enrollment token generation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
