import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const type = searchParams.get('type');

  // Handle hash-based tokens (implicit flow) - Supabase sometimes uses this
  const hashParams = new URLSearchParams(request.url.split('#')[1]);
  const accessToken = hashParams.get('access_token');
  const refreshToken = hashParams.get('refresh_token');

  if (!code && !accessToken) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login?error=Missing%20authentication%20code`,
    );
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: 'Supabase credentials not configured' }, { status: 500 });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // If we have authorization code, exchange it for session (preferred)
    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('Auth callback error:', error);
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/login?error=${encodeURIComponent(error.message)}`,
        );
      }

      if (!data.session) {
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/login?error=No%20session%20found`,
        );
      }

      // Handle email verification
      if (type === 'email_change') {
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/settings?verified=email_updated`,
        );
      }

      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`);
    }

    // Fallback: Handle hash-based tokens (implicit flow)
    // This happens when Supabase Site URL isn't configured correctly
    if (accessToken) {
      console.warn('Using fallback implicit flow - Supabase Site URL may be misconfigured');

      // Create a response that sets the session via the access token
      const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`);

      // Session will be set via the supabase client on the next request
      // when it reads the hash tokens
      return response;
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login?error=Authentication%20failed`,
    );
  } catch (error) {
    console.error('Unexpected auth callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login?error=Authentication%20failed`,
    );
  }
}
