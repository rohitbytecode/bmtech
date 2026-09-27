/**
 * supabase/functions/crawler-worker/pipeline/entityResolver.ts
 *
 * Entity resolution logic to determine if two discovery candidates
 * or a candidate and a prospect are the exact same business.
 */

export interface EntityMatchResult {
  score: number;
  decision: 'SAME_ENTITY' | 'LIKELY_SAME' | 'DIFFERENT_ENTITY';
  reasons: string[];
}

export function resolveEntityMatch(
  candidate: any,
  existing: any
): EntityMatchResult {
  let score = 0;
  const reasons: string[] = [];

  // Definitive Match: Google Place ID
  if (candidate.google_place_id && existing.google_place_id && 
      candidate.google_place_id === existing.google_place_id) {
    score += 50;
    reasons.push('exact_google_place_id');
  }

  // Definitive Match: External ID (same provider)
  if (candidate.provider && existing.provider && 
      candidate.provider === existing.provider &&
      candidate.external_id && existing.external_id &&
      candidate.external_id === existing.external_id) {
    score += 50;
    reasons.push('exact_provider_id');
  }

  // High Confidence: Phone number
  if (candidate.phone_normalized && existing.phone_normalized &&
      candidate.phone_normalized === existing.phone_normalized) {
    score += 40;
    reasons.push('exact_phone_normalized');
  }

  // High Confidence: Website
  if (candidate.website && existing.website) {
    // Strip http/https and www for comparison
    const candWeb = candidate.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
    const exWeb = existing.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
    if (candWeb === exWeb) {
      score += 30;
      reasons.push('exact_website_domain');
    }
  }

  // Medium Confidence: Name
  if (candidate.business_name_normalized && existing.business_name_normalized) {
    if (candidate.business_name_normalized === existing.business_name_normalized) {
      score += 20;
      reasons.push('exact_name_normalized');
    } else {
      // Basic subset match (e.g., "ABC Fitness" vs "ABC Fitness Center")
      const candName = candidate.business_name_normalized;
      const exName = existing.business_name_normalized;
      if (candName.includes(exName) || exName.includes(candName)) {
        score += 10;
        reasons.push('partial_name_match');
      }
    }
  }

  // Low/Medium Confidence: Location proximity
  if (candidate.latitude && candidate.longitude && existing.latitude && existing.longitude) {
    const latDiff = Math.abs(candidate.latitude - existing.latitude);
    const lonDiff = Math.abs(candidate.longitude - existing.longitude);
    
    if (latDiff < 0.002 && lonDiff < 0.002) { // approx 200m
      score += 15;
      reasons.push('close_proximity_200m');
    } else if (latDiff < 0.005 && lonDiff < 0.005) { // approx 500m
      score += 5;
      reasons.push('close_proximity_500m');
    }
  }

  // Determine decision based on score thresholds
  let decision: 'SAME_ENTITY' | 'LIKELY_SAME' | 'DIFFERENT_ENTITY' = 'DIFFERENT_ENTITY';
  if (score >= 50) {
    decision = 'SAME_ENTITY';
  } else if (score >= 30) {
    decision = 'LIKELY_SAME';
  }

  return { score, decision, reasons };
}
