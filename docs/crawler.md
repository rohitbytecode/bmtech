# BMTech Prospect Discovery Engine (V2)

## Architecture Overview

The BMTech Prospect Engine is a distributed, multi-stage pipeline designed to discover, validate, deduplicate, enrich, and score business prospects. It runs primarily through Supabase Edge Functions, triggered periodically by `pg_cron`.

```mermaid
graph TD
    Cron[pg_cron (every minute)] -->|invoke_crawler_worker| EdgeFunction[Crawler Worker]
    EdgeFunction --> AutoScheduler{Auto Scheduler}
    AutoScheduler -->|Queues| DiscoverTasks[Discover Tasks]
    EdgeFunction --> ClaimTasks{Claim Batch of Tasks}
    ClaimTasks --> ProcessTask[Process Task Pipeline]

    subgraph Pipeline
        DT[Discover Task] -->|OSM + Google Places| RC[Raw Candidates]
        RC --> VT[Validate Task]
        VT -->|Normalization & Phone Validate| VC[Validated Candidates]
        VC --> DD[Deduplicate Task]
        DD -->|Entity Resolution| UC[Unique Candidates]
        UC --> FW[Fetch Website Task]
        FW -->|Cheerio + Metadata| EC[Enriched Candidates]
        EC --> FN[Finalize Task]
        FN -->|Quality Scoring| PR[Prospects]
        PR --> SC[Score Task]
        SC -->|Opportunity Signals| RDY[Ready For Call]
    end
```

## Core Pipeline Stages

The pipeline follows a strict, cost-optimized ordering. Cheap operations (DB lookups, regex) happen before expensive operations (network requests).

### 1. Discovery (`discover`)
- **Triggers**: Auto-scheduler queues these for active strategies every 8 hours.
- **Geographic Resolution**: Resolves target cities into precise bounding boxes using Nominatim (OSM).
- **Category Resolution**: Maps generic industries (e.g. "gym") to provider-specific queries (e.g. `["leisure"="fitness_centre"]` for OSM, `"gym"` for Google Places).
- **Multi-Source Fetch**: Hits OpenStreetMap (free) and Google Places (paid, high quality).
- **Output**: Inserts rows into `discovery_candidates`.

### 2. Validation (`validate`)
- **Normalization**: Standardizes business names, strips legal entity suffixes, normalizes URLs.
- **Phone Validation**: Uses `phoneValidator.ts` (port of `lib/phone/validate.ts`) to verify E.164 format, reject toll-free numbers, and detect landline vs. mobile.
- **Gate**: Rejects candidates with no identifiable business name or completely missing contact info.

### 3. Deduplication (`deduplicate`)
- **Database-Level Lookups**: Uses exact match on external provider IDs and Google Place IDs.
- **Phone & Website**: Cross-references normalized phones and websites against existing candidates and prospects.
- **Entity Resolution**: Uses fuzzy name matching coupled with coordinate proximity (within 200m) to detect same businesses with slightly different names.

### 4. Enrichment (`fetch_website`)
- Fetches the candidate's website if available.
- Extracts meta tags (title, description, viewport), social links, emails, phone numbers, and JSON-LD structured data.

### 5. Finalization (`finalize`)
- **Quality Scoring**: Runs `scoreBusinessQuality()`, evaluating confidence in the business's existence (e.g., Google OPERATIONAL status, verified phone, reachable website, multi-source corroboration).
- **Gate**: Assigns a `quality_tier` ('low', 'medium', 'good', 'high'). Candidates with 'low' scores are rejected.
- **Output**: Promotes passing candidates into the `prospects` table.

### 6. Opportunity Scoring (`score`)
- Analyzes factual evidence (e.g. "No mobile viewport detected") and computes deterministic commercial opportunity scores.
- Assesses what BMTech can sell to this prospect (Web, SEO, Marketing, Design).

## Core Logic Modules

The core business logic has been extracted into testable, pure functions inside `supabase/functions/crawler-worker/pipeline/`:

* **`normalize.ts`**: Safely cleans strings, standardizes ampersands, collapses whitespace.
* **`phoneValidator.ts`**: The source of truth for Indian phone number structure. Crucial for filtering out 1800 numbers and garbage data early.
* **`entityResolver.ts`**: Scores match confidence between two records (0-100 scale). E.g. Exact place ID = +50, Exact normalized phone = +40.
* **`qualityScorer.ts`**: Determines if a business is *real*. Protects the sales team from calling dead numbers or phantom businesses.
* **`categories/taxonomy.ts`**: The canonical dictionary mapping high-level concepts to precise API queries.

## Job & Task Lifecycle (Reliability)

To ensure strategies don't stall at 0 prospects silently, the engine employs:
1. **Atomic Claiming**: Uses Postgres `FOR UPDATE SKIP LOCKED` to prevent multiple workers from processing the same task.
2. **Lock Timeouts**: Abandoned tasks (worker crashed) are recovered after 10 minutes.
3. **Exponential Backoff**: Failing tasks are retried with increasing delays (30s, 60s, 120s...).
4. **Dead-Letter State**: Tasks that fail their `max_attempts` enter `dead_letter` state for manual review, rather than disappearing.
5. **Outcome-Based Scheduling**: The auto-scheduler considers a job "completed" regardless of prospect count, preventing failed jobs from blocking future discovery cycles.
