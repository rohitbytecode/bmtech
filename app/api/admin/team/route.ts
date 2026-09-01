import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const team = users.map((user) => ({
      id: user.id,
      email: user.email,
      role: user.user_metadata?.role || 'user',
      name: user.user_metadata?.name || user.email?.split('@')[0],
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at
    }));

    return NextResponse.json({ team });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { email: rawEmail, name: rawName, role: rawRole } = await request.json();

    const email = rawEmail?.trim().toLowerCase();
    const name = rawName?.trim();
    const role = rawRole?.trim();

    if (!email || !role) {
      return NextResponse.json({ error: 'Email and role are required' }, { status: 400 });
    }

    // Generate a default password
    const defaultPassword = `Bmtech@${Math.floor(1000 + Math.random() * 9000)}`;

    // Create the user using admin.createUser
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: defaultPassword,
      email_confirm: true,
      user_metadata: {
        name: name || email.split('@')[0],
        role: role
      }
    });

    if (error) {
      console.error('[API Team] Supabase Error:', error);
      return NextResponse.json({ 
        error: `Supabase Error: ${error.message}`,
        details: error
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: data.user, password: defaultPassword });
  } catch (err: any) {
    console.error('[API Team] Try-Catch Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
