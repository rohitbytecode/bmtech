-- ================================================================
-- Migration: Add single-task overload for claim_crawler_tasks
-- Created: 2026-09-28
--
-- Problem: The JSONB-limits overload claims tasks per-type in JSON
-- key iteration order.  A slow "discover" task can be claimed in
-- the same batch as "validate" tasks, leaving those validate rows
-- locked for the full duration of the discover run.  When the next
-- pg_cron invocation fires, the stale-lock recovery marks them
-- failed even though the validation logic itself never ran.
--
-- Fix: Add a third overload claim_crawler_tasks(p_worker_id text)
-- that claims exactly ONE task across all types using the canonical
--   ORDER BY priority DESC, available_at ASC
-- ordering.  The existing two overloads are left untouched.
-- ================================================================

CREATE OR REPLACE FUNCTION claim_crawler_tasks(p_worker_id text)
RETURNS SETOF crawler_tasks
LANGUAGE plpgsql
AS $$
DECLARE
    v_now timestamptz := now();
BEGIN
    RETURN QUERY
    WITH candidate AS (
        SELECT id
        FROM crawler_tasks
        WHERE status IN ('pending', 'retry')
          AND (available_at IS NULL OR available_at <= v_now)
        ORDER BY priority DESC, available_at ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED
    )
    UPDATE crawler_tasks ct
    SET status    = 'processing',
        locked_by = p_worker_id,
        locked_at = v_now,
        attempts  = ct.attempts + 1
    FROM candidate
    WHERE ct.id = candidate.id
    RETURNING ct.*;
END;
$$;
