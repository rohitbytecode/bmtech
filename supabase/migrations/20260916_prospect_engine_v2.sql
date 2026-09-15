-- ================================================================
-- Migration: Prospect Engine V2 schema upgrades
-- Created: 2026-09-16
-- ================================================================

-- 1. crawler_tasks improvements
ALTER TYPE crawler_task_status ADD VALUE IF NOT EXISTS 'dead_letter';

-- 2. crawler_jobs statistics columns
ALTER TABLE crawler_jobs
  ADD COLUMN IF NOT EXISTS candidates_discovered INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS candidates_accepted INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS candidates_rejected INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS candidates_duplicate INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS prospects_created INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS failure_summary JSONB,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Index for strategy scheduling lookups
CREATE INDEX IF NOT EXISTS idx_crawler_jobs_strategy_status 
  ON crawler_jobs (strategy_id, status, created_at DESC);

-- Index for task claiming performance
CREATE INDEX IF NOT EXISTS idx_crawler_tasks_claim 
  ON crawler_tasks (status, priority DESC, available_at ASC)
  WHERE status IN ('pending', 'retry');

-- 3. strategy_execution_stats table
CREATE TABLE IF NOT EXISTS strategy_execution_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
  job_id UUID REFERENCES crawler_jobs(id),
  provider TEXT NOT NULL,
  raw_discovered INTEGER DEFAULT 0,
  after_name_filter INTEGER DEFAULT 0,
  after_phone_filter INTEGER DEFAULT 0,
  after_dedup INTEGER DEFAULT 0,
  prospects_created INTEGER DEFAULT 0,
  rejection_reasons JSONB DEFAULT '{}',
  provider_errors JSONB DEFAULT '[]',
  execution_duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_strategy_exec_stats 
  ON strategy_execution_stats (strategy_id, created_at DESC);

-- 4. discovery_candidates new columns
ALTER TABLE discovery_candidates
  ADD COLUMN IF NOT EXISTS phone_normalized TEXT,
  ADD COLUMN IF NOT EXISTS business_name_normalized TEXT,
  ADD COLUMN IF NOT EXISTS google_place_id TEXT,
  ADD COLUMN IF NOT EXISTS quality_score INTEGER,
  ADD COLUMN IF NOT EXISTS quality_signals JSONB DEFAULT '{}';

-- Indexes for candidates
CREATE INDEX IF NOT EXISTS idx_candidates_phone_normalized
  ON discovery_candidates (phone_normalized) 
  WHERE phone_normalized IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_candidates_provider_external_id
  ON discovery_candidates (provider, external_id)
  WHERE external_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_candidates_name_normalized
  ON discovery_candidates (business_name_normalized)
  WHERE business_name_normalized IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_candidates_google_place_id
  ON discovery_candidates (google_place_id)
  WHERE google_place_id IS NOT NULL;

-- 5. prospects new columns
ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS quality_score INTEGER,
  ADD COLUMN IF NOT EXISTS quality_tier TEXT CHECK (quality_tier IN ('low', 'medium', 'good', 'high')),
  ADD COLUMN IF NOT EXISTS source_count INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS google_place_id TEXT,
  ADD COLUMN IF NOT EXISTS business_status TEXT;

-- Index for prospects quality
CREATE INDEX IF NOT EXISTS idx_prospects_quality
  ON prospects (quality_score DESC)
  WHERE quality_score IS NOT NULL;
