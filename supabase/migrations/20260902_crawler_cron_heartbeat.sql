-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS supabase_vault;

-- Create the helper function to invoke the edge function securely
CREATE OR REPLACE FUNCTION invoke_crawler_worker()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_url text;
    v_auth_header text;
    v_request_id bigint;
BEGIN
    -- Attempt to read the URL from Vault
    SELECT secret INTO v_url FROM vault.decrypted_secrets WHERE name = 'crawler_worker_url';
    
    -- Attempt to read the Auth header from Vault
    SELECT secret INTO v_auth_header FROM vault.decrypted_secrets WHERE name = 'crawler_worker_auth_header';
    
    -- Abort if secrets are missing
    IF v_url IS NULL THEN
        RAISE NOTICE 'crawler_worker_url not found in vault.decrypted_secrets. Skipping cron execution.';
        RETURN;
    END IF;

    IF v_auth_header IS NULL THEN
        RAISE NOTICE 'crawler_worker_auth_header not found in vault.decrypted_secrets. Skipping cron execution.';
        RETURN;
    END IF;

    -- Make the HTTP POST request to the Edge Function using pg_net
    SELECT net.http_post(
        url := v_url,
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', v_auth_header
        ),
        body := '{}'::jsonb
    ) INTO v_request_id;
    
    RAISE NOTICE 'Invoked crawler-worker HTTP endpoint. Request ID: %', v_request_id;
END;
$$;

-- Ensure idempotency by removing the job if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'crawler-worker-heartbeat') THEN
        PERFORM cron.unschedule('crawler-worker-heartbeat');
    END IF;
END $$;

-- Schedule the job to run every minute
SELECT cron.schedule(
    'crawler-worker-heartbeat',
    '* * * * *',
    $$SELECT invoke_crawler_worker();$$
);
