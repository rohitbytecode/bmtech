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

    // 1. First, we call a custom database function (RPC) that has SECURITY DEFINER
    // This securely looks up the custom column in the protected auth.users table.
    const { data: isSuperAdmin, error: rpcError } = await supabaseAdmin.rpc('check_is_super_admin', {
      check_user_id: userId
    });

    if (rpcError) {
      // 2. Fallback: On some older Supabase setups, schema('auth') might be exposed.
      // We will attempt a direct read as a backup in case the user hasn't created the RPC yet.
      const fallback = await supabaseAdmin.schema('auth').from('users').select('is_super_admin').eq('id', userId).single();
      
      if (!fallback.error && fallback.data) {
         return NextResponse.json({ is_super_admin: fallback.data.is_super_admin === true });
      }

      console.error('Super admin check failed:', rpcError.message);
      return NextResponse.json({ 
        error: 'Database function "check_is_super_admin" not found or failed. Please create it in Supabase SQL editor.',
        details: rpcError.message 
      }, { status: 500 });
    }

    return NextResponse.json({ is_super_admin: isSuperAdmin === true });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
