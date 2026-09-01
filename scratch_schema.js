const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
  const tables = ['strategies', 'prospects', 'prospect_sources', 'caller_assignments', 'call_attempts', 'sticky_notes'];
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.error(`Error querying ${table}:`, error.message);
    } else {
      console.log(`Table '${table}' exists. Columns:`, data.length > 0 ? Object.keys(data[0]).join(', ') : 'Empty table, but exists.');
    }
  }
}

checkSchema();
