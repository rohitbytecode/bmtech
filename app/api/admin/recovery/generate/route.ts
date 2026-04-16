import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
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

    // 2. Generate 10 random codes
    const rawCodes = Array.from(
      { length: 10 },
      () =>
        crypto.randomBytes(4).toString('hex').toUpperCase() +
        '-' +
        crypto.randomBytes(4).toString('hex').toUpperCase(),
    );

    // 3. Hash codes for storage
    const hashedCodes = rawCodes.map((code) =>
      crypto.createHash('sha256').update(code).digest('hex'),
    );

    // 4. Update user metadata with hashes
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: { ...user.user_metadata, recovery_codes: hashedCodes },
    });

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      codes: rawCodes, // Only returned once!
    });
  } catch (error: any) {
    console.error('Recovery code generation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
