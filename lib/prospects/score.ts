/**
 * lib/prospects/score.ts
 *
 * Quality score adjustment based on phone validation results.
 */

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type ProspectQuality = 'LOW' | 'MEDIUM' | 'HIGH';
export type QualityResult   = ProspectQuality | 'DISQUALIFIED';

export type PhoneStatus =
  | 'pending'
  | 'invalid_format'
  | 'toll_free'
  | 'wrong_length'
  | 'active'
  | 'landline';

/** Statuses that make a prospect fully disqualified */
const DISQUALIFYING_STATUSES: ReadonlySet<PhoneStatus> = new Set([
  'invalid_format',
  'toll_free',
  'wrong_length',
]);

// ─────────────────────────────────────────────────────────────
// Main export – adjustQualityForPhone
// ─────────────────────────────────────────────────────────────

/**
 * Adjust a prospect's quality tier based on phone validation results.
 *
 * Rules (in priority order):
 *  1. If phoneStatus is invalid_format | toll_free | wrong_length → DISQUALIFIED
 *  2. If isShared is true → demote one tier (HIGH→MEDIUM, MEDIUM→LOW, LOW stays LOW)
 *  3. Otherwise return currentQuality unchanged
 */
export function adjustQualityForPhone(
  currentQuality: ProspectQuality,
  phoneStatus: PhoneStatus,
  isShared: boolean,
): QualityResult {
  // Rule 1 – hard disqualify
  if (DISQUALIFYING_STATUSES.has(phoneStatus)) {
    return 'DISQUALIFIED';
  }

  // Rule 2 – demote shared numbers by one tier
  if (isShared) {
    switch (currentQuality) {
      case 'HIGH':   return 'MEDIUM';
      case 'MEDIUM': return 'LOW';
      case 'LOW':    return 'LOW'; // already at floor
    }
  }

  // Rule 3 – no change
  return currentQuality;
}
