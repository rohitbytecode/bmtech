import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabaseServer';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const supabase = createServerSupabase();

    // 1. Fetch invite by token (Public policy allows this)
    const { data: invite, error } = await supabase
      .from('device_invites')
      .select('*, created_by_email:created_by') // Note: We might need to join users to get email
      .eq('token', token)
      .eq('used', false)
      .single();

    if (error || !invite) {
      return NextResponse.json({ error: 'Invalid or used invitation' }, { status: 404 });
    }

    // 2. Check expiry
    const isExpired = new Date(invite.expires_at) < new Date();
    if (isExpired) {
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 410 });
    }

    return NextResponse.json({
      success: true,
      type: invite.type,
      expiresAt: invite.expires_at,
    });
  } catch (error: any) {
    console.error('Invite verification error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
