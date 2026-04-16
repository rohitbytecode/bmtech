const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

async function test() {
  const { data, error } = await supabase
    .from('maintenance_plans')
    .select('id, name, highlighted')
    .limit(1);
  console.log('Data:', data);
  console.log('Error:', error);
}

test();
