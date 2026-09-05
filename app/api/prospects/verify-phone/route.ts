/**
 * app/api/prospects/verify-phone/route.ts
 *
 * POST /api/prospects/verify-phone
 * Body: { prospect_id: string; phone: string }
 *
 * Validates the phone number, updates Supabase, checks for shared numbers,
 * adjusts quality score, and returns the result.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabaseServer';
import { validateIndianPhone, isLikelyMobile } from '@/lib/phone/validate';
import {
  adjustQualityForPhone,
  type PhoneStatus,
  type ProspectQuality,
} from '@/lib/prospects/score';

// ─────────────────────────────────────────────────────────────
// Request / Response types
// ─────────────────────────────────────────────────────────────

interface VerifyPhoneRequestBody {
  prospect_id: string;
  phone: string;
}

interface VerifyPhoneSuccessResponse {
  status: 'active' | 'landline';
  phone_normalized: string;
  phone_line_type: 'mobile' | 'landline';
  phone_is_shared: boolean;
  quality: string;
}

interface VerifyPhoneInvalidResponse {
  status: 'invalid';
  reason: string;
}

// ─────────────────────────────────────────────────────────────
// Helper – count how many prospects share the same phone value
// ─────────────────────────────────────────────────────────────
async function getSharedCount(
  supabase: ReturnType<typeof createServerSupabase>,
  phoneNormalized: string,
  excludeProspectId: string,
): Promise<number> {
  // Check both raw phone column and phone_normalized for thoroughness
  const { count, error } = await supabase
    .from('prospects')
    .select('*', { count: 'exact', head: true })
    .or(`phone_normalized.eq.${phoneNormalized},phone.eq.${phoneNormalized}`)
    .neq('id', excludeProspectId);

  if (error) {
    console.error('[verify-phone] shared count query error:', error);
    return 0;
  }

  return count ?? 0;
}

// ─────────────────────────────────────────────────────────────
// POST handler
// ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: Partial<VerifyPhoneRequestBody>;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { prospect_id, phone } = body;

  if (!prospect_id || typeof prospect_id !== 'string') {
    return NextResponse.json({ error: 'prospect_id is required' }, { status: 400 });
  }
  if (!phone || typeof phone !== 'string') {
    return NextResponse.json({ error: 'phone is required' }, { status: 400 });
  }

  const supabase = createServerSupabase();
  const now = new Date().toISOString();

  // ── 1. Validate the phone number ──
  const result = validateIndianPhone(phone);

  if (!result.valid) {
    // Map failure reason to a phone_status value
    let phoneStatus: PhoneStatus = 'invalid_format';
    const lowerReason = result.reason.toLowerCase();
    if (lowerReason.includes('toll-free')) {
      phoneStatus = 'toll_free';
    } else if (lowerReason.includes('wrong length') || lowerReason.includes('length')) {
      phoneStatus = 'wrong_length';
    }

    // Update prospect in Supabase
    const { error: updateError } = await supabase
      .from('prospects')
      .update({
        phone_status: phoneStatus,
        phone_verified_at: now,
      })
      .eq('id', prospect_id);

    if (updateError) {
      console.error('[verify-phone] update error (invalid):', updateError);
      return NextResponse.json({ error: 'Failed to update prospect' }, { status: 500 });
    }

    const response: VerifyPhoneInvalidResponse = {
      status: 'invalid',
      reason: result.reason,
    };
    return NextResponse.json(response, { status: 200 });
  }

  // ── 2. Valid phone — determine line type ──
  const isMobile    = isLikelyMobile(result.normalized);
  const lineType: 'mobile' | 'landline' = isMobile ? 'mobile' : 'landline';
  const phoneStatus: PhoneStatus        = isMobile ? 'active' : 'landline';

  // ── 3. Check for shared numbers ──
  const sharedCount  = await getSharedCount(supabase, result.normalized, prospect_id);
  const isShared     = sharedCount > 0;

  // ── 4. Fetch current quality score for this prospect ──
  const { data: prospectData, error: fetchError } = await supabase
    .from('prospects')
    .select('data_quality_score')
    .eq('id', prospect_id)
    .single();

  if (fetchError) {
    console.error('[verify-phone] fetch prospect error:', fetchError);
    return NextResponse.json({ error: 'Failed to fetch prospect' }, { status: 500 });
  }

  // Map numeric data_quality_score → ProspectQuality tier
  const numericScore: number = prospectData?.data_quality_score ?? 50;
  let currentQuality: ProspectQuality;
  if (numericScore >= 75) {
    currentQuality = 'HIGH';
  } else if (numericScore >= 40) {
    currentQuality = 'MEDIUM';
  } else {
    currentQuality = 'LOW';
  }

  const adjustedQuality = adjustQualityForPhone(currentQuality, phoneStatus, isShared);

  // Map quality result back to a numeric score for storage
  const qualityScoreMap: Record<string, number> = {
    HIGH: 85,
    MEDIUM: 55,
    LOW: 25,
    DISQUALIFIED: 0,
  };
  const newScore = qualityScoreMap[adjustedQuality] ?? numericScore;

  // ── 5. Update prospect in Supabase ──
  const { error: updateError } = await supabase
    .from('prospects')
    .update({
      phone_normalized:  result.normalized,
      phone_status:      phoneStatus,
      phone_line_type:   lineType,
      phone_is_shared:   isShared,
      phone_verified_at: now,
      data_quality_score: newScore,
    })
    .eq('id', prospect_id);

  if (updateError) {
    console.error('[verify-phone] update error (valid):', updateError);
    return NextResponse.json({ error: 'Failed to update prospect' }, { status: 500 });
  }

  // ── 6. Also update phone_is_shared on any OTHER prospects with the same number ──
  if (isShared) {
    await supabase
      .from('prospects')
      .update({ phone_is_shared: true })
      .or(`phone_normalized.eq.${result.normalized},phone.eq.${result.normalized}`)
      .neq('id', prospect_id);
  }

  // ── 7. Return result ──
  const response: VerifyPhoneSuccessResponse = {
    status:           phoneStatus,
    phone_normalized: result.normalized,
    phone_line_type:  lineType,
    phone_is_shared:  isShared,
    quality:          adjustedQuality,
  };

  return NextResponse.json(response, { status: 200 });
}
