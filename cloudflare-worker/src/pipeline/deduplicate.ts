/**
 * supabase/functions/crawler-worker/pipeline/deduplicate.ts
 *
 * Database-level deduplication for discovery candidates.
 */

import { createServiceClient } from '../_shared/supabase';
import { normalizeBusinessName, normalizeWebsite } from './normalize';
import { validateIndianPhone } from './phoneValidator';

export async function checkDuplicate(
  supabase: ReturnType<typeof createServiceClient>,
  candidate: any
): Promise<{ isDuplicate: boolean; reason?: string }> {
  const candidateName = normalizeBusinessName(candidate.business_name);
  const website = normalizeWebsite(candidate.website);
  let phoneNormalized: string | null = null;

  if (candidate.phone) {
    const phoneRes = validateIndianPhone(candidate.phone);
    if (phoneRes.valid) {
      phoneNormalized = phoneRes.normalized;
    }
  }

  // 1. External ID check (most accurate)
  if (candidate.external_id && candidate.provider) {
    const { data: extData, error: extError } = await supabase
      .from('discovery_candidates')
      .select('id')
      .eq('provider', candidate.provider)
      .eq('external_id', candidate.external_id)
      .neq('id', candidate.id)
      .limit(1);

    if (extData && extData.length > 0) {
      return { isDuplicate: true, reason: 'duplicate_provider_id' };
    }
  }

  // 2. Google Place ID check
  if (candidate.google_place_id) {
    const { data: gData } = await supabase
      .from('discovery_candidates')
      .select('id')
      .eq('google_place_id', candidate.google_place_id)
      .neq('id', candidate.id)
      .limit(1);

    if (gData && gData.length > 0) {
      return { isDuplicate: true, reason: 'duplicate_google_place_id' };
    }
  }

  // 3. Phone check
  if (phoneNormalized) {
    // Check candidates
    const { data: pData } = await supabase
      .from('discovery_candidates')
      .select('id, status')
      .eq('phone_normalized', phoneNormalized)
      .in('status', ['discovered', 'accepted'])
      .neq('id', candidate.id)
      .limit(1);

    if (pData && pData.length > 0) {
      return { isDuplicate: true, reason: 'duplicate_phone_in_candidates' };
    }

    // Check prospects (we normalize phone before insertion, but fallback to raw for safety)
    const { data: pProspects } = await supabase
      .from('prospects')
      .select('id')
      .eq('phone', candidate.phone)
      .limit(1);

    if (pProspects && pProspects.length > 0) {
      return { isDuplicate: true, reason: 'duplicate_phone_in_prospects' };
    }
  }

  // 4. Website check
  if (website) {
    const { data: wData } = await supabase
      .from('discovery_candidates')
      .select('id')
      .eq('website', website)
      .neq('id', candidate.id)
      .in('status', ['discovered', 'accepted'])
      .limit(1);
      
    if (wData && wData.length > 0) {
      return { isDuplicate: true, reason: 'duplicate_website_in_candidates' };
    }
  }

  // 5. Name + Location fuzzy check (simplified via DB query for names, coordinate math in mem if needed)
  if (candidateName && candidate.latitude && candidate.longitude) {
    const { data: locData } = await supabase
      .from('discovery_candidates')
      .select('id, latitude, longitude')
      .eq('business_name_normalized', candidateName)
      .neq('id', candidate.id)
      .in('status', ['discovered', 'accepted'])
      .limit(5); // Fetch a few same-named candidates to check coordinates

    if (locData && locData.length > 0) {
      for (const existing of locData) {
        if (existing.latitude && existing.longitude) {
          const latDiff = Math.abs(candidate.latitude - existing.latitude);
          const lonDiff = Math.abs(candidate.longitude - existing.longitude);
          // roughly 200m
          if (latDiff < 0.002 && lonDiff < 0.002) {
             return { isDuplicate: true, reason: 'duplicate_name_location' };
          }
        }
      }
    }
  }

  return { isDuplicate: false };
}
