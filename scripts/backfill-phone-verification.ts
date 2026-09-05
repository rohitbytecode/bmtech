/**
 * scripts/backfill-phone-verification.ts
 *
 * Standalone Node.js script to backfill phone validation data
 * for all existing prospects in the database.
 *
 * Run with:
 *   npx ts-node scripts/backfill-phone-verification.ts
 *
 * Safe to re-run multiple times (idempotent).
 */

// ── Dotenv must be loaded before any env access ──
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') }); // fallback

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { validateIndianPhone, isLikelyMobile } from '../lib/phone/validate';
import {
  adjustQualityForPhone,
  type PhoneStatus,
  type ProspectQuality,
} from '../lib/prospects/score';

// ─────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────

const BATCH_SIZE      = 50;
const BATCH_DELAY_MS  = 100;

// ─────────────────────────────────────────────────────────────
// Supabase client (service role)
// ─────────────────────────────────────────────────────────────

function createSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error(
      '❌  Missing env vars: NEXT_PUBLIC_SUPABASE_URL and/or NEXT_SUPABASE_SERVICE_ROLE_KEY',
    );
    process.exit(1);
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ─────────────────────────────────────────────────────────────
// Prospect row shape (only fields we need)
// ─────────────────────────────────────────────────────────────

interface ProspectRow {
  id: string;
  phone: string | null;
  phone_normalized: string | null;
  data_quality_score: number | null;
}

// ─────────────────────────────────────────────────────────────
// Shared-number lookup: how many OTHER prospects share the same
// normalised phone?
// ─────────────────────────────────────────────────────────────

async function getSharedCount(
  supabase: SupabaseClient,
  phoneNormalized: string,
  excludeId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from('prospects')
    .select('*', { count: 'exact', head: true })
    .or(`phone_normalized.eq.${phoneNormalized},phone.eq.${phoneNormalized}`)
    .neq('id', excludeId);

  if (error) {
    console.warn(`  ⚠  shared-count query error for ${phoneNormalized}:`, error.message);
    return 0;
  }
  return count ?? 0;
}

// ─────────────────────────────────────────────────────────────
// Map a numeric data_quality_score to a quality tier
// ─────────────────────────────────────────────────────────────

function scoreToTier(score: number | null): ProspectQuality {
  const s = score ?? 50;
  if (s >= 75) return 'HIGH';
  if (s >= 40) return 'MEDIUM';
  return 'LOW';
}

const QUALITY_SCORE_MAP: Record<string, number> = {
  HIGH:         85,
  MEDIUM:       55,
  LOW:          25,
  DISQUALIFIED:  0,
};

// ─────────────────────────────────────────────────────────────
// Process a single prospect
// Returns the outcome category for summary stats.
// ─────────────────────────────────────────────────────────────

type OutcomeCategory = 'ok_mobile' | 'ok_landline' | 'disqualified' | 'demoted' | 'skipped';

async function processProspect(
  supabase: SupabaseClient,
  prospect: ProspectRow,
): Promise<OutcomeCategory> {
  const raw = prospect.phone;
  const now = new Date().toISOString();

  // ── Validate ──
  const result = validateIndianPhone(raw);

  if (!result.valid) {
    // Map reason → phone_status
    let phoneStatus: PhoneStatus = 'invalid_format';
    const lower = result.reason.toLowerCase();
    if (lower.includes('toll-free') || lower.includes('toll_free')) {
      phoneStatus = 'toll_free';
    } else if (lower.includes('length')) {
      phoneStatus = 'wrong_length';
    }

    await supabase
      .from('prospects')
      .update({
        phone_status:      phoneStatus,
        phone_is_shared:   false,
        phone_verified_at: now,
        data_quality_score: 0,
      })
      .eq('id', prospect.id);

    return 'disqualified';
  }

  // ── Valid phone ──
  const isMobile = isLikelyMobile(result.normalized);
  const lineType: 'mobile' | 'landline' = isMobile ? 'mobile' : 'landline';
  const phoneStatus: PhoneStatus        = isMobile ? 'active'  : 'landline';

  // ── Shared check ──
  const sharedCount = await getSharedCount(supabase, result.normalized, prospect.id);
  const isShared    = sharedCount > 0;

  // ── Quality adjustment ──
  const currentTier    = scoreToTier(prospect.data_quality_score);
  const adjustedQuality = adjustQualityForPhone(currentTier, phoneStatus, isShared);
  const newScore        = QUALITY_SCORE_MAP[adjustedQuality] ?? (prospect.data_quality_score ?? 50);

  // ── Write back to Supabase ──
  const { error } = await supabase
    .from('prospects')
    .update({
      phone_normalized:   result.normalized,
      phone_status:       phoneStatus,
      phone_line_type:    lineType,
      phone_is_shared:    isShared,
      phone_verified_at:  now,
      data_quality_score: newScore,
    })
    .eq('id', prospect.id);

  if (error) {
    console.warn(`  ⚠  Failed to update prospect ${prospect.id}:`, error.message);
    return 'skipped';
  }

  // Determine outcome category
  if (adjustedQuality === 'DISQUALIFIED') return 'disqualified';
  if (isShared) return 'demoted';
  return isMobile ? 'ok_mobile' : 'ok_landline';
}

// ─────────────────────────────────────────────────────────────
// Delay helper
// ─────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('🔍  BMTech – Phone Verification Backfill');
  console.log('─'.repeat(50));

  const supabase = createSupabaseClient();

  // Summary counters
  let totalFetched     = 0;
  let totalProcessed   = 0;
  let totalSkipped     = 0;
  let totalDisqualified = 0;
  let totalDemoted     = 0;
  let totalMobile      = 0;
  let totalLandline    = 0;

  // ── Fetch ALL pending prospects upfront (avoids offset-drift bug) ──────
  // We must load IDs before processing because updating phone_status during
  // the run would shift offsets and cause rows to be silently skipped.
  console.log('📋  Fetching all pending prospect IDs from Supabase...');

  const { data: allRows, error: fetchAllError } = await supabase
    .from('prospects')
    .select('id, phone, phone_normalized, data_quality_score')
    .or('phone_status.is.null,phone_status.eq.pending')
    .order('created_at', { ascending: true });

  if (fetchAllError) {
    console.error('❌  Failed to fetch prospects:', fetchAllError.message);
    process.exit(1);
  }

  const allProspects = (allRows ?? []) as ProspectRow[];
  totalFetched = allProspects.length;

  if (allProspects.length === 0) {
    console.log('ℹ️   Nothing to process — all prospects are already verified.\n');
  } else {
    console.log(`✅  Found ${allProspects.length} prospects to process.\n`);
  }

  // ── Process in batches ────────────────────────────────────────────────
  for (let batchStart = 0; batchStart < allProspects.length; batchStart += BATCH_SIZE) {
    const batch = allProspects.slice(batchStart, batchStart + BATCH_SIZE);

    console.log(
      `\n📦  Processing batch [${batchStart + 1} – ${batchStart + batch.length}] of ${allProspects.length}` +
      ` (${batch.length} prospects)`,
    );

    // ── Process each prospect in the batch ──
    for (const prospect of batch) {
      if (!prospect.phone || prospect.phone.trim() === '') {
        // No phone at all — mark as invalid
        await supabase
          .from('prospects')
          .update({
            phone_status: 'invalid_format',
            phone_verified_at: new Date().toISOString(),
            data_quality_score: 0,
          })
          .eq('id', prospect.id);
        totalSkipped++;
        process.stdout.write('_');
        continue;
      }

      const outcome = await processProspect(supabase, prospect);
      totalProcessed++;

      switch (outcome) {
        case 'ok_mobile':    totalMobile++;       process.stdout.write('✓'); break;
        case 'ok_landline':  totalLandline++;     process.stdout.write('L'); break;
        case 'disqualified': totalDisqualified++; process.stdout.write('✗'); break;
        case 'demoted':      totalDemoted++;      process.stdout.write('↓'); break;
        case 'skipped':      totalSkipped++;      process.stdout.write('?'); break;
      }
    }

    process.stdout.write('\n');

    // Small delay between batches to avoid hammering Supabase
    if (batchStart + BATCH_SIZE < allProspects.length) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Final: update phone_is_shared on ALL remaining prospects
  // whose normalised number appears more than once
  // (catches cases where a batch updated a number mid-run)
  // ─────────────────────────────────────────────────────────────
  console.log('\n🔗  Running final shared-number sweep across all verified prospects…');

  await supabase.rpc('mark_shared_phones').then(({ error }) => {
    if (error) {
      // rpc may not exist — fall back to raw SQL via Supabase
      // This is best-effort; the migration already ran the UPDATE.
      console.warn('  ⚠  mark_shared_phones RPC not found — shared sweep skipped (run migration).');
    } else {
      console.log('  ✅  Shared phone sweep complete via RPC.');
    }
  });

  // ─────────────────────────────────────────────────────────────
  // Summary
  // ─────────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(50));
  console.log('📊  BACKFILL SUMMARY');
  console.log('═'.repeat(50));
  console.log(`  Total fetched      : ${totalFetched}`);
  console.log(`  ✓  Processed       : ${totalProcessed}`);
  console.log(`  _  Skipped (no ph) : ${totalSkipped}`);
  console.log('─'.repeat(50));
  console.log(`  📱 Mobile          : ${totalMobile}`);
  console.log(`  ☎  Landline        : ${totalLandline}`);
  console.log(`  ✗  Disqualified    : ${totalDisqualified}`);
  console.log(`  ↓  Demoted (shared): ${totalDemoted}`);
  console.log('═'.repeat(50));
  console.log('✅  Backfill complete.\n');
}

main().catch((err) => {
  console.error('❌  Unhandled error:', err);
  process.exit(1);
});
