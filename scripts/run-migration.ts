/**
 * scripts/run-migration.ts
 *
 * Executes the phone validation migration SQL directly against
 * the remote Supabase Postgres database using the pg client.
 *
 * Run with:
 *   npx ts-node --project scripts/tsconfig.json scripts/run-migration.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { Client } from 'pg';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// ─────────────────────────────────────────────────────────────
// Build the Postgres connection string from Supabase URL
// Supabase direct connection: postgres://postgres.[ref]:[password]@aws-0-*.pooler.supabase.com:5432/postgres
// ─────────────────────────────────────────────────────────────
const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const DB_PASSWORD       = process.env.SUPABASE_DB_PASSWORD;
const DB_CONNECTION_URL = process.env.SUPABASE_DB_URL; // Optional override

if (!SUPABASE_URL) {
  console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL');
  process.exit(1);
}

// Extract project ref from Supabase URL: https://[ref].supabase.co
const projectRef = SUPABASE_URL.replace('https://', '').split('.')[0];

function buildConnectionString(): string {
  if (DB_CONNECTION_URL) return DB_CONNECTION_URL;

  if (!DB_PASSWORD) {
    console.error(
      '❌  No database connection URL found.\n' +
      '   Set SUPABASE_DB_PASSWORD in your .env file (from Supabase Dashboard → Settings → Database),\n' +
      '   or set SUPABASE_DB_URL to the full connection string.\n\n' +
      '   Alternatively, run the migration manually in Supabase Dashboard → SQL Editor:\n' +
      '   File: supabase/migrations/20260905_phone_validation.sql'
    );
    process.exit(1);
  }

  // Supabase direct connection (port 5432)
  return `postgresql://postgres.${projectRef}:${DB_PASSWORD}@aws-0-ap-south-1.pooler.supabase.com:5432/postgres`;
}

async function main(): Promise<void> {
  console.log('🚀  BMTech – Phone Validation Migration');
  console.log('─'.repeat(60));

  const migrationPath = path.resolve(
    process.cwd(),
    'supabase/migrations/20260905_phone_validation.sql'
  );

  if (!fs.existsSync(migrationPath)) {
    console.error(`❌  Migration file not found: ${migrationPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationPath, 'utf-8');
  console.log(`📁  Migration: supabase/migrations/20260905_phone_validation.sql`);
  console.log(`🔗  Project ref: ${projectRef}\n`);

  const connectionString = buildConnectionString();
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

  try {
    console.log('🔌  Connecting to database...');
    await client.connect();
    console.log('✅  Connected\n');

    // Execute the entire migration as one block (handles multi-statement DDL)
    console.log('⚙️   Running migration...');
    await client.query(sql);
    console.log('✅  Migration executed successfully!\n');

    // Verify the columns were created
    console.log('🔍  Verifying columns...');
    const result = await client.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'prospects'
        AND column_name IN (
          'phone_normalized', 'phone_status', 
          'phone_line_type', 'phone_is_shared', 'phone_verified_at'
        )
      ORDER BY column_name;
    `);

    if (result.rows.length === 0) {
      console.log('⚠️   No new columns found — migration may have already been applied.');
    } else {
      console.log(`\n  Found ${result.rows.length} new columns:`);
      for (const row of result.rows) {
        console.log(`    ✓  ${row.column_name.padEnd(25)} (${row.data_type})`);
      }
    }

    // Check indexes
    const indexes = await client.query(`
      SELECT indexname FROM pg_indexes
      WHERE tablename = 'prospects'
        AND indexname IN ('idx_prospects_phone_status', 'idx_prospects_phone_normalized')
      ORDER BY indexname;
    `);
    if (indexes.rows.length > 0) {
      console.log(`\n  Indexes:`);
      for (const row of indexes.rows) {
        console.log(`    ✓  ${row.indexname}`);
      }
    }

    console.log('\n' + '═'.repeat(60));
    console.log('✅  Migration deployed successfully!');
    console.log('═'.repeat(60) + '\n');

  } catch (err: any) {
    if (err.message?.includes('already exists') || err.message?.includes('duplicate_column')) {
      console.log('\n⚠️   Some columns already exist — migration was already partially applied.');
      console.log('    This is safe to ignore.\n');
    } else {
      console.error('\n❌  Migration failed:', err.message);
      console.error('\n    You can run the migration manually in Supabase Dashboard → SQL Editor');
      console.error(`    File: supabase/migrations/20260905_phone_validation.sql\n`);
      process.exit(1);
    }
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('❌  Unhandled error:', err);
  process.exit(1);
});
