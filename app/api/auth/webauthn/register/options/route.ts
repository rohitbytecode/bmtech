import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabaseServer';
import { webauthnUtils } from '@/lib/webauthnUtils';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { enrollmentToken, email, rpIdHint } = await request.json();

    if (!enrollmentToken || !email) {
      return NextResponse.json({ error: 'Missing enrollment token or email' }, { status: 400 });
    }

    const supabase = createServerSupabase();

    // 1. Verify Enrollment Token (New device_invites first, then legacy enrollment_tokens)
    let inviterId = null;
    
    const { data: inviteData } = await supabase
      .from('device_invites')
      .select('*')
      .eq('token', enrollmentToken)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (inviteData) {
      inviterId = inviteData.created_by;
    } else {
      // Fallback to legacy bootstrap tokens
      const { data: tokenData } = await supabase
        .from('enrollment_tokens')
        .select('*')
        .eq('token_hash', enrollmentToken)
        .eq('is_used', false)
        .gt('expires_at', new Date().toISOString())
        .single();
        
      if (!tokenData) {
        return NextResponse.json({ error: 'Invalid or expired enrollment token/invite' }, { status: 401 });
      }
    }

    // 2. Get User ID (Assume user exists)
    // For device_invites, we use the creator's ID. 
    const { data: { users } } = await supabase.auth.admin.listUsers();
    
    // If we have an inviterId from device_invites, that IS our target user
    const user = inviterId 
      ? users.find(u => u.id === inviterId)
      : users.find(u => u.email === email);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 3. Generate Registration Options with dynamic RP ID
    // Prioritize x-forwarded-host for custom domains on Vercel
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
    const overrideRpId = host.split(':')[0]; // Remove port if present
    
    console.log(`[API] Registration Options request for ${user.email}. Host: ${host}, Hint: ${rpIdHint}`);
    
    const options = await webauthnUtils.getRegistrationOptions(user.email!, user.id, [], overrideRpId, rpIdHint);

    // 4. Store Challenge in Cookie for Verification
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
    (await cookies()).set('webauthn_reg_challenge', options.challenge, {
      httpOnly: true,
      secure: !isLocalhost, // Only secure if not on localhost
      maxAge: 300, // 5 minutes
      sameSite: 'lax',
    });

    return NextResponse.json(options);
  } catch (error: any) {
    console.error('Registration options error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
