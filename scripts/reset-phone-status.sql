-- Reset all prospects back to 'pending' so backfill runs cleanly from scratch.
-- Run this BEFORE cleanup-invalid-phones.ts if any partial backfill has already run.
UPDATE prospects
SET
  phone_status       = 'pending',
  phone_normalized   = NULL,
  phone_line_type    = NULL,
  phone_is_shared    = FALSE,
  phone_verified_at  = NULL
WHERE phone_status IS DISTINCT FROM 'pending'
   OR phone_normalized IS NOT NULL;
