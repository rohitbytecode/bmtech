/**
 * lib/phone/validate.ts
 *
 * Format-level phone validation for Indian numbers.
 * No external APIs — pure string analysis + heuristics.
 */

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type PhoneValidResult =
  | { valid: true; normalized: string }
  | { valid: false; reason: string };

// ─────────────────────────────────────────────────────────────
// Toll-free prefix patterns (prefix after stripping leading 0s / +)
// ─────────────────────────────────────────────────────────────
const TOLL_FREE_PATTERNS: RegExp[] = [
  /^1800/,       // Indian toll-free 1800 XXXXXX
  /^0008/,       // International toll-free prefix 0008
  /^000800/,     // International toll-free prefix 000800
  /^1860/,       // Indian toll-free 1860
  /^1860/,
];

// ─────────────────────────────────────────────────────────────
// Step 1 – Normalise raw input into a single string of digits
// (optionally prefixed with +)
// ─────────────────────────────────────────────────────────────
function normalize(raw: string): string {
  // Strip all whitespace, dashes, dots, parentheses, and non-digit chars
  // except a leading + sign
  const stripped = raw
    .trim()
    .replace(/[\s\-().]/g, '')           // remove common separators
    .replace(/[^\d+]/g, '');             // remove anything else that isn't digit or +

  // Convert 091XXXXXXXXXX  →  +91XXXXXXXXXX
  if (/^091\d{10}$/.test(stripped)) {
    return '+91' + stripped.slice(3);
  }

  // Convert bare 10-digit numbers starting with 6-9  →  +91XXXXXXXXXX
  if (/^[6-9]\d{9}$/.test(stripped)) {
    return '+91' + stripped;
  }

  // Convert 0XXXXXXXXXX (11 digits starting with 0) → +91XXXXXXXXXX
  if (/^0[1-9]\d{9}$/.test(stripped)) {
    return '+91' + stripped.slice(1);
  }

  // Already has +
  return stripped;
}

// ─────────────────────────────────────────────────────────────
// Step 2 – Reject toll-free numbers
// ─────────────────────────────────────────────────────────────
function isTollFree(normalized: string): boolean {
  // Strip leading + for prefix matching
  const digits = normalized.replace(/^\+/, '');
  return TOLL_FREE_PATTERNS.some((pattern) => pattern.test(digits));
}

// ─────────────────────────────────────────────────────────────
// Step 3 – Validate Indian mobile: +91 [6-9] XXXXXXXXX (10 digits after CC)
// ─────────────────────────────────────────────────────────────
function isIndianMobile(normalized: string): boolean {
  return /^\+91[6-9]\d{9}$/.test(normalized);
}

// ─────────────────────────────────────────────────────────────
// Step 4 – Validate Indian landline: +91 [1-5] XXXXXXXXX or XXXXXXXXXX
//   Landlines are 6–8 digit local numbers with 2-4 digit STD codes.
//   After country code, total subscriber + STD = 10 or 11 digits.
// ─────────────────────────────────────────────────────────────
function isIndianLandline(normalized: string): boolean {
  // +91 then 10 or 11 digits starting with 1-5
  return /^\+91[1-5]\d{9,10}$/.test(normalized);
}

// ─────────────────────────────────────────────────────────────
// Main export – validateIndianPhone
// ─────────────────────────────────────────────────────────────
export function validateIndianPhone(raw: string | null | undefined): PhoneValidResult {
  if (!raw || raw.trim() === '') {
    return { valid: false, reason: 'Phone number is empty' };
  }

  const normalized = normalize(raw);

  // Must have at least something after normalisation
  if (!normalized || normalized.replace(/\+/, '').length === 0) {
    return { valid: false, reason: 'Phone number is empty after normalisation' };
  }

  // Toll-free check (before length check so we get a specific reason)
  if (isTollFree(normalized)) {
    return { valid: false, reason: 'Toll-free numbers are not valid prospects' };
  }

  // For Indian numbers (+91) validate structure
  if (normalized.startsWith('+91')) {
    const subscriber = normalized.slice(3); // digits after +91

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

    // Starts with +91 but doesn't match mobile or landline pattern
    return {
      valid: false,
      reason: 'Number does not match any known Indian mobile or landline pattern',
    };
  }

  // Non-Indian international numbers (other country codes)
  // Basic length check: E.164 is 8–15 digits after +
  const digitsOnly = normalized.replace(/^\+/, '');
  if (normalized.startsWith('+')) {
    if (digitsOnly.length < 8 || digitsOnly.length > 15) {
      return {
        valid: false,
        reason: `Wrong length for international number: ${digitsOnly.length} digits (expected 8–15)`,
      };
    }
    // Accept non-Indian international numbers as-is (out of scope for deeper validation)
    return { valid: true, normalized };
  }

  // No country code and couldn't be auto-detected
  return {
    valid: false,
    reason: 'Could not determine country code — number may be malformed',
  };
}

// ─────────────────────────────────────────────────────────────
// Utility – isLikelyMobile
// Returns true if a normalised number looks like an Indian mobile
// ─────────────────────────────────────────────────────────────
export function isLikelyMobile(normalized: string): boolean {
  return isIndianMobile(normalized);
}
