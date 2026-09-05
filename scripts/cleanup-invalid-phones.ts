/**
 * scripts/cleanup-invalid-phones.ts
 *
 * Step 1 of 2: Scan every prospect in the DB, validate its phone,
 * and DELETE any prospect whose phone fails validation rules
 * (invalid format, toll-free, wrong length, empty).
 *
 * After this runs cleanly, run the backfill script.
 *
 * Run with:
 *   npx ts-node --project scripts/tsconfig.json scripts/cleanup-invalid-phones.ts
 *
 * This is a DESTRUCTIVE operation — shows a preview first and asks to confirm.
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as readline from 'readline';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { validateIndianPhone } from '../lib/phone/validate';
import type { PhoneStatus } from '../lib/prospects/score';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// ─────────────────────────────────────────────────────────────
// Supabase client
// ─────────────────────────────────────────────────────────────

function createSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface ProspectRow {
  id: string;
  business_name: string;
  phone: string | null;
}

interface InvalidRecord {
  id: string;
  business_name: string;
  phone: string | null;
  reason: string;
  phoneStatus: PhoneStatus;
}

// ─────────────────────────────────────────────────────────────
// Prompt helper (confirm before delete)
// ─────────────────────────────────────────────────────────────

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

// ─────────────────────────────────────────────────────────────
// Map validation reason → phone_status label
// ─────────────────────────────────────────────────────────────

function reasonToStatus(reason: string): PhoneStatus {
  const lower = reason.toLowerCase();
  if (lower.includes('toll-free') || lower.includes('toll_free')) return 'toll_free';
  if (lower.includes('length'))                                      return 'wrong_length';
  return 'invalid_format';
}

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('🧹  BMTech – Phone Cleanup: Remove Invalid Prospects');
  console.log('═'.repeat(60));
  console.log('⚠️   This will PERMANENTLY DELETE prospects with invalid phone numbers.');
  console.log('    Run the backfill script after this completes.\n');

  const supabase = createSupabaseClient();

  // ── Fetch all prospects ──
  console.log('📋  Fetching all prospects...');
  const { data, error } = await supabase
    .from('prospects')
    .select('id, business_name, phone')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌  Failed to fetch prospects:', error.message);
    process.exit(1);
  }

  const all = (data ?? []) as ProspectRow[];
  console.log(`✅  Fetched ${all.length} total prospects.\n`);

  // ── Identify invalid records ──
  console.log('🔍  Validating phone numbers...');
  const invalid: InvalidRecord[] = [];

  for (const prospect of all) {
    const result = validateIndianPhone(prospect.phone);
    if (!result.valid) {
      invalid.push({
        id:            prospect.id,
        business_name: prospect.business_name,
        phone:         prospect.phone,
        reason:        result.reason,
        phoneStatus:   reasonToStatus(result.reason),
      });
    }
  }

  const valid = all.length - invalid.length;

  // ── Summary ──
  console.log('\n' + '─'.repeat(60));
  console.log(`📊  Scan Results:`);
  console.log(`    Total prospects : ${all.length}`);
  console.log(`    ✅ Valid phones  : ${valid}`);
  console.log(`    ❌ Invalid phones: ${invalid.length}`);
  console.log('─'.repeat(60));

  if (invalid.length === 0) {
    console.log('\n✅  No invalid records found. Nothing to delete.\n');
    console.log('    You can now run the backfill script:');
    console.log('    npx ts-node --project scripts/tsconfig.json scripts/backfill-phone-verification.ts\n');
    return;
  }

  // ── Show breakdown by reason ──
  const byStatus: Record<string, number> = {};
  for (const r of invalid) {
    byStatus[r.phoneStatus] = (byStatus[r.phoneStatus] ?? 0) + 1;
  }
  console.log('\n  Breakdown:');
  for (const [status, count] of Object.entries(byStatus)) {
    const icon = status === 'toll_free' ? '📵' : status === 'wrong_length' ? '📏' : '🚫';
    console.log(`    ${icon}  ${status.padEnd(16)}: ${count} records`);
  }

  // ── Preview (first 20) ──
  console.log(`\n  Preview (first ${Math.min(20, invalid.length)} of ${invalid.length}):`);
  console.log('  ' + '─'.repeat(80));
  console.log(`  ${'Business Name'.padEnd(30)} ${'Phone'.padEnd(20)} Reason`);
  console.log('  ' + '─'.repeat(80));
  for (const r of invalid.slice(0, 20)) {
    const name  = (r.business_name ?? '(unnamed)').substring(0, 28).padEnd(30);
    const phone = (r.phone ?? '(empty)').substring(0, 18).padEnd(20);
    const reason = r.reason.substring(0, 35);
    console.log(`  ${name} ${phone} ${reason}`);
  }
  if (invalid.length > 20) {
    console.log(`  ... and ${invalid.length - 20} more`);
  }
  console.log('  ' + '─'.repeat(80));

  // ── Confirm before deleting ──
  console.log('');
  const answer = await prompt(
    `\n⚠️   Delete ALL ${invalid.length} invalid prospects permanently? (yes/no): `
  );

  if (answer !== 'yes') {
    console.log('\n❌  Aborted. No records were deleted.\n');
    return;
  }

  // ── Delete in batches ──
  console.log(`\n🗑️   Deleting ${invalid.length} invalid prospects...`);
  const ids = invalid.map((r) => r.id);
  const BATCH = 100;
  let deleted = 0;

  for (let i = 0; i < ids.length; i += BATCH) {
    const batchIds = ids.slice(i, i + BATCH);
    const { error: delError } = await supabase
      .from('prospects')
      .delete()
      .in('id', batchIds);

    if (delError) {
      console.error(`\n❌  Delete error on batch ${Math.floor(i / BATCH) + 1}:`, delError.message);
      process.exit(1);
    }

    deleted += batchIds.length;
    process.stdout.write(`\r  Deleted ${deleted}/${invalid.length}...`);
  }

  // ── Verify remaining count ──
  const { count: remaining } = await supabase
    .from('prospects')
    .select('*', { count: 'exact', head: true });

  console.log(`\n\n${'═'.repeat(60)}`);
  console.log('✅  Cleanup Complete!');
  console.log('═'.repeat(60));
  console.log(`  Deleted  : ${deleted} invalid prospects`);
  console.log(`  Remaining: ${remaining ?? valid} clean prospects`);
  console.log('─'.repeat(60));
  console.log('\n  Now run the backfill script:');
  console.log('  npx ts-node --project scripts/tsconfig.json scripts/backfill-phone-verification.ts\n');
}

main().catch((err) => {
  console.error('❌  Unhandled error:', err);
  process.exit(1);
});
