import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabaseServer';
import { webauthnUtils } from '@/lib/webauthnUtils';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { enrollmentToken, email } = await request.json();

    if (!enrollmentToken || !email) {
      return NextResponse.json({ error: 'Missing enrollment token or email' }, { status: 400 });
    }

    const supabase = createServerSupabase();

    // 1. Verify Enrollment Token
    const { data: tokenData, error: tokenError } = await supabase
      .from('enrollment_tokens')
      .select('*')
      .eq('token_hash', enrollmentToken) // In a real app, hash this
      .eq('is_used', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json({ error: 'Invalid or expired enrollment token' }, { status: 401 });
    }

    // 2. Get User ID (Assume user exists or handle creation)
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 3. Generate Registration Options
    const options = await webauthnUtils.getRegistrationOptions(user.email!, user.id);

    // 4. Store Challenge in Cookie for Verification
    (await cookies()).set('webauthn_reg_challenge', options.challenge, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 300, // 5 minutes
      sameSite: 'lax',
    });

    return NextResponse.json(options);
  } catch (error: any) {
    console.error('Registration options error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
