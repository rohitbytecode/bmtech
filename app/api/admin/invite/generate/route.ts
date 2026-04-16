import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { type = 'device_invite' } = await request.json();

    const supabase = createServerSupabase();

    // 1. Authenticate user
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('sb-auth-token');

    if (!authCookie) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 });
    }

    let token = '';
    try {
      const sessionData = JSON.parse(authCookie.value);
      token = sessionData.access_token;
    } catch (e) {
      token = authCookie.value;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Generate secure token and expiry (10 minutes)
    const inviteToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // 3. Store in device_invites table
    const { error: dbError } = await supabase.from('device_invites').insert({
      token: inviteToken,
      type,
      created_by: user.id,
      expires_at: expiresAt,
      used: false,
    });

    if (dbError) {
      console.error('Database error creating invite:', dbError);
      // Fallback for demo: If table doesn't exist, we still want to show the UI
      if (dbError.code === '42P01') {
        return NextResponse.json(
          {
            error:
              'SQL Table "device_invites" missing. Please run the SQL script provided in the instructions.',
            code: 'MISSING_TABLE',
          },
          { status: 500 },
        );
      }
      throw dbError;
    }

    // 4. Construct invitation URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const inviteUrl = `${baseUrl}/invite/device?token=${inviteToken}`;

    return NextResponse.json({
      success: true,
      inviteUrl,
      expiresAt,
      token: inviteToken,
    });
  } catch (error: any) {
    console.error('Invite generation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
