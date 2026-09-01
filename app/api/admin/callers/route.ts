import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Use the Service Role Key to bypass RLS and list users from the auth schema
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

    // Filter users who have the 'caller' role in their metadata
    // Or if we want to allow admins to be assigned too, we can include them. Let's include callers.
    const callers = users
      .filter((user) => user.user_metadata?.role === 'caller')
      .map((user) => ({
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Unknown Caller'
      }));

    return NextResponse.json({ callers });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
