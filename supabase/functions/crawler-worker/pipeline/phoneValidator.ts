/**
 * supabase/functions/crawler-worker/pipeline/phoneValidator.ts
 *
 * Format-level phone validation for Indian numbers.
 * No external APIs — pure string analysis + heuristics.
 */

export type PhoneValidResult =
  | { valid: true; normalized: string }
  | { valid: false; reason: string };

const TOLL_FREE_PATTERNS: RegExp[] = [
  /^1800/,       // Indian toll-free 1800 XXXXXX
  /^0008/,       // International toll-free prefix 0008
  /^000800/,     // International toll-free prefix 000800
  /^1860/,       // Indian toll-free 1860
];

function normalize(raw: string): string {
  const stripped = raw
    .trim()
    .replace(/[\s\-().]/g, '')
    .replace(/[^\d+]/g, '');

  if (/^091\d{10}$/.test(stripped)) {
    return '+91' + stripped.slice(3);
  }

  if (/^[6-9]\d{9}$/.test(stripped)) {
    return '+91' + stripped;
  }

  if (/^0[1-9]\d{9}$/.test(stripped)) {
    return '+91' + stripped.slice(1);
  }

  return stripped;
}

function isTollFree(normalized: string): boolean {
  const digits = normalized.replace(/^\+/, '');
  return TOLL_FREE_PATTERNS.some((pattern) => pattern.test(digits));
}

function isIndianMobile(normalized: string): boolean {
  return /^\+91[6-9]\d{9}$/.test(normalized);
}

function isIndianLandline(normalized: string): boolean {
  return /^\+91[1-5]\d{9,10}$/.test(normalized);
}

export function validateIndianPhone(raw: string | null | undefined): PhoneValidResult {
  if (!raw || raw.trim() === '') {
    return { valid: false, reason: 'Phone number is empty' };
  }

  const normalized = normalize(raw);

  if (!normalized || normalized.replace(/\+/, '').length === 0) {
    return { valid: false, reason: 'Phone number is empty after normalisation' };
  }

  if (isTollFree(normalized)) {
    return { valid: false, reason: 'Toll-free numbers are not valid prospects' };
  }

  if (normalized.startsWith('+91')) {
    const subscriber = normalized.slice(3); 

    if (subscriber.length < 10 || subscriber.length > 11) {
      return {
        valid: false,
        reason: `Wrong length: expected 10–11 digits after country code, got ${subscriber.length}`,
      };
    }

    if (isIndianMobile(normalized)) {
      return { valid: true, normalized };
    }

    if (isIndianLandline(normalized)) {
      return { valid: true, normalized };
    }

    return {
      valid: false,
      reason: 'Number does not match any known Indian mobile or landline pattern',
    };
  }

  const digitsOnly = normalized.replace(/^\+/, '');
  if (normalized.startsWith('+')) {
    if (digitsOnly.length < 8 || digitsOnly.length > 15) {
      return {
        valid: false,
        reason: `Wrong length for international number: ${digitsOnly.length} digits (expected 8–15)`,
      };
    }
    return { valid: true, normalized };
  }

  return {
    valid: false,
    reason: 'Could not determine country code — number may be malformed',
  };
}

export function isLikelyMobile(normalized: string): boolean {
  return isIndianMobile(normalized);
}
