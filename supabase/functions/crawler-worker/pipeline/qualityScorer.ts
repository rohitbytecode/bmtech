/**
 * supabase/functions/crawler-worker/pipeline/qualityScorer.ts
 *
 * Scores business existence confidence and assigns a quality tier.
 */

export interface QualityScoreResult {
  score: number;
  tier: 'low' | 'medium' | 'good' | 'high';
  signals: Record<string, number>;
}

export function scoreBusinessQuality(candidate: any, websiteFetchSuccess?: boolean): QualityScoreResult {
  let score = 0;
  const signals: Record<string, number> = {};

  // Google Places signals
  if (candidate.google_place_id) {
    score += 10;
    signals['has_google_place_id'] = 10;
  }
  
  if (candidate.rawData?.businessStatus === 'OPERATIONAL') {
    score += 25;
    signals['google_status_operational'] = 25;
  }

  // Phone validation signals
  if (candidate.phone_normalized) {
    score += 20;
    signals['has_normalized_phone'] = 20;
  }

  // Website signals
  if (candidate.website) {
    if (websiteFetchSuccess === true) {
      score += 15;
      signals['website_reachable'] = 15;
    } else if (websiteFetchSuccess === undefined) {
      // We haven't fetched it yet, give partial credit
      score += 5;
      signals['has_website_url'] = 5;
    }
  }

  // Location signals
  if (candidate.latitude && candidate.longitude) {
    score += 5;
    signals['has_coordinates'] = 5;
  }
  
  if (candidate.address && candidate.address.trim().length > 5) {
    score += 5;
    signals['has_physical_address'] = 5;
  }

  // Email signal
  if (candidate.email) {
    score += 5;
    signals['has_email'] = 5;
  }

  // Cross-provider corroboration
  if (candidate.source_count > 1) {
    score += 15;
    signals['multi_source_corroboration'] = 15;
  }

  // Cap score at 100
  score = Math.min(score, 100);

  // Assign tier
  let tier: 'low' | 'medium' | 'good' | 'high' = 'low';
  if (score >= 81) {
    tier = 'high';
  } else if (score >= 66) {
    tier = 'good';
  } else if (score >= 46) {
    tier = 'medium';
  }

  return { score, tier, signals };
}
