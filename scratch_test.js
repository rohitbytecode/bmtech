const { createClient } = require('@supabase/supabase-js');

async function clearDevices() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceKey) {
    console.log("Missing URL or Service Key");
    return;
  }
  
  const supabase = createClient(supabaseUrl, serviceKey);
  
  const { error } = await supabase
    .from('authorized_devices')
    .delete()
    .neq('user_id', '00000000-0000-0000-0000-000000000000'); // Delete all rows
    
  if (error) {
    console.error("Failed to clear devices:", error.message);
  } else {
    console.log("Successfully cleared all registered devices.");
  }
}

clearDevices();
