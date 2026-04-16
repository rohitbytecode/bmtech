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
    return NextResponse.json(
      {
        success: false,
        error:
          'Supabase server environment variables are not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
      },
      { status: 500 },
    );
  }
  const body = await request.json();
  const { name, email, message, service_id } = body as {
    name?: string;
    email?: string;
    message?: string;
    service_id?: string;
  };

  if (!name || !email || !message) {
    return NextResponse.json(
      { success: false, error: 'Name, email, and message are required.' },
      { status: 400 },
    );
  }

  const { data, error } = await supabaseAdmin
    .from('leads')
    .insert([{ name, email, message, service_id: service_id || null }])
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message ?? 'Failed to save lead.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, data });
}
