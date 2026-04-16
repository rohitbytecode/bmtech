const { readFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');

const envPath = join(process.cwd(), '.env');
if (existsSync(envPath)) {
  const envFile = readFileSync(envPath, 'utf8');
  envFile.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [key, ...rest] = trimmed.split('=');
    const value = rest.join('=');
    if (key && value !== undefined && process.env[key] === undefined) {
      process.env[key] = value;
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase env vars. Create a .env file or export these values:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

(async () => {
  const { createClient } = await import('@supabase/supabase-js');

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    const { data, error } = await supabase.from('services').select('*');

    console.log('DATA:', data);
    console.log('ERROR:', error);
  } catch (err) {
    console.error('Supabase query failed:', err);
    process.exit(1);
  }
})();
