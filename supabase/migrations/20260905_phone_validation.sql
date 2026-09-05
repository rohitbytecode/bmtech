-- ================================================================
-- Migration: Phone Validation Columns for prospects table
-- Created: 2026-09-05
-- ================================================================

-- 1. Add new phone validation columns
ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS phone_normalized    TEXT,
  ADD COLUMN IF NOT EXISTS phone_status        TEXT NOT NULL DEFAULT 'pending'
                                               CHECK (phone_status IN (
                                                 'pending',
                                                 'invalid_format',
                                                 'toll_free',
                                                 'wrong_length',
                                                 'active',
                                                 'landline'
                                               )),
  ADD COLUMN IF NOT EXISTS phone_line_type     TEXT
                                               CHECK (phone_line_type IN (
                                                 'mobile',
                                                 'landline'
                                               )),
  ADD COLUMN IF NOT EXISTS phone_is_shared     BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS phone_verified_at   TIMESTAMPTZ;

-- 2. Index on phone_status for fast filtering
CREATE INDEX IF NOT EXISTS idx_prospects_phone_status
  ON prospects (phone_status);

-- 3. Index on phone_normalized for fast shared-number lookups
CREATE INDEX IF NOT EXISTS idx_prospects_phone_normalized
  ON prospects (phone_normalized)
  WHERE phone_normalized IS NOT NULL;

-- 4. Mark shared phone numbers
--    A phone is "shared" if the same phone value appears more than once
--    in the prospects table (raw phone column).
UPDATE prospects p
SET    phone_is_shared = TRUE
WHERE  phone IS NOT NULL
  AND  phone <> ''
  AND  (
    SELECT COUNT(*)
    FROM   prospects p2
    WHERE  p2.phone = p.phone
  ) > 1;
