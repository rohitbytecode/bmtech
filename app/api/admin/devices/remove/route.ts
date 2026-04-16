import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { deviceId } = await request.json();

    if (!deviceId) {
      return NextResponse.json({ error: 'Device ID is required' }, { status: 400 });
    }

    const supabase = createServerSupabase();

    // 1. Get current user from session
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

    // 2. Fetch the device to see if it's the current one
    const { data: device } = await supabase
      .from('authorized_devices')
      .select('credential_id')
      .eq('id', deviceId)
      .single();

    const currentCredentialId = cookieStore.get('bmtech_hardware_verified')?.value;
    const isRemovingSelf = device && device.credential_id === currentCredentialId;

    // 3. Delete the device
    const { error } = await supabase
      .from('authorized_devices')
      .delete()
      .eq('id', deviceId)
      .eq('user_id', user.id);

    if (error) throw error;

    // 4. If removing self, clear the verified badge immediately
    if (isRemovingSelf) {
      cookieStore.delete('bmtech_hardware_verified');
    }

    return NextResponse.json({ success: true, removedSelf: isRemovingSelf });
  } catch (error: any) {
    console.error('Remove device error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
