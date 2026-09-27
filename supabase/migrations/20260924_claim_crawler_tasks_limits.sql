-- ================================================================
-- Migration: Add JSONB limits to claim_crawler_tasks
-- Created: 2026-09-24
-- ================================================================

-- 1. Preserve/Ensure old function for backward compatibility
CREATE OR REPLACE FUNCTION claim_crawler_tasks(p_batch_size int, p_worker_id text)
RETURNS SETOF crawler_tasks
LANGUAGE plpgsql
AS $$
DECLARE
    v_now timestamptz := now();
BEGIN
    RETURN QUERY
    WITH claimed AS (
        SELECT id
        FROM crawler_tasks
        WHERE status IN ('pending', 'retry')
          AND (available_at IS NULL OR available_at <= v_now)
        ORDER BY priority DESC, available_at ASC
        LIMIT p_batch_size
        FOR UPDATE SKIP LOCKED
    )
    UPDATE crawler_tasks ct
    SET status = 'processing',
        locked_by = p_worker_id,
        locked_at = v_now,
        attempts = ct.attempts + 1
    FROM claimed
    WHERE ct.id = claimed.id
    RETURNING ct.*;
END;
$$;

-- 2. New overloaded function to support JSONB limits by task_type with global safety cap
CREATE OR REPLACE FUNCTION claim_crawler_tasks(p_limits jsonb, p_worker_id text)
RETURNS SETOF crawler_tasks
LANGUAGE plpgsql
AS $$
DECLARE
    v_task_type text;
    v_limit int;
    v_global_max int := 5; -- HARD LIMIT: Max 5 tasks total to guarantee < 50 Cloudflare subrequests
    v_total_claimed int := 0;
    v_claimed_in_loop int;
    v_now timestamptz := now();
BEGIN
    -- Temp table to collect all claimed IDs across the loop
    CREATE TEMP TABLE IF NOT EXISTS temp_claimed_tasks (id uuid) ON COMMIT DROP;
    TRUNCATE temp_claimed_tasks;

    FOR v_task_type, v_limit IN 
        SELECT key, value::text::int FROM jsonb_each(p_limits)
    LOOP
        IF v_limit > 0 AND v_total_claimed < v_global_max THEN
            -- Adjust limit to not exceed global max
            v_limit := LEAST(v_limit, v_global_max - v_total_claimed);

            WITH claimed AS (
                SELECT id
                FROM crawler_tasks
                WHERE status IN ('pending', 'retry')
                  AND task_type = v_task_type::crawler_task_type
                  AND (available_at IS NULL OR available_at <= v_now)
                ORDER BY priority DESC, available_at ASC
                LIMIT v_limit
                FOR UPDATE SKIP LOCKED
            ),
            updated AS (
                UPDATE crawler_tasks ct
                SET status = 'processing',
                    locked_by = p_worker_id,
                    locked_at = v_now,
                    attempts = ct.attempts + 1
                FROM claimed
                WHERE ct.id = claimed.id
                RETURNING ct.id
            )
            INSERT INTO temp_claimed_tasks (id)
            SELECT id FROM updated;

            GET DIAGNOSTICS v_claimed_in_loop = ROW_COUNT;
            v_total_claimed := v_total_claimed + v_claimed_in_loop;
        END IF;
    END LOOP;

    -- Return all fully updated records to the caller
    RETURN QUERY
    SELECT t.* FROM crawler_tasks t
    JOIN temp_claimed_tasks tc ON t.id = tc.id;
END;
$$;
