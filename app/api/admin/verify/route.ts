import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey, { auth: { persistSession: false } })
    : null;

export async function POST(request: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase server environment variables are not configured.' }, { status: 500 });
  }

  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // 1. Direct check using Service Role (reads the auth table metadata safely)
    const { data: user, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (fetchError || !user?.user) {
      console.error('User fetch failed:', fetchError?.message);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const metadata = user.user.user_metadata;
    const isSuperAdmin = metadata?.role === 'admin' || metadata?.is_super_admin === true;

    if (isSuperAdmin) {
      return NextResponse.json({ is_super_admin: true });
    }

    // 2. Secondary check: RPC Fallback
    const { data: rpcValue, error: rpcError } = await supabaseAdmin.rpc('check_is_super_admin', {
      check_user_id: userId
    });

    return NextResponse.json({ is_super_admin: rpcValue === true });
    
  } catch (err) {
    console.error('Verify Route Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
