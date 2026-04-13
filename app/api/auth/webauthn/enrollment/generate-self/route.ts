import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabase();
    
    // 1. Get the current user from session
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
      token = authCookie.value; // Fallback if cookie is just the token string
    }

    if (!token) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // We verify the token with Supabase directly
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('User verification error:', userError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Generate a secure one-time token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = rawToken;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    const { error } = await supabase
      .from('enrollment_tokens')
      .insert({
        user_id: user.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
        is_used: false
      });

    if (error) throw error;

    return NextResponse.json({ 
      token: rawToken,
      expiresAt,
      userEmail: user.email,
      inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/enroll?token=${rawToken}&email=${encodeURIComponent(user.email || '')}`
    });
  } catch (error: any) {
    console.error('Self-enrollment token generation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
