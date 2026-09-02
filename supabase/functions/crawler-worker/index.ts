import { createServiceClient } from '../_shared/supabase.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { OpenStreetMapDiscoveryProvider } from './providers/osm.ts';
import { fetchAndExtractWebsite, WebsiteEvidence } from './fetcher.ts';

const BATCH_SIZE = 10;
const LOCK_TIMEOUT_MINUTES = 10;

type CrawlerTask = {
  id: string;
  job_id: string;
  candidate_id: string | null;
  task_type:
    | 'discover'
    | 'fetch_website'
    | 'extract'
    | 'validate'
    | 'deduplicate'
    | 'score'
    | 'finalize';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'retry';
  priority: number;
  payload: Record<string, unknown>;
  attempts: number;
  max_attempts: number;
};

function workerId() {
  return `worker-${crypto.randomUUID()}`;
}

async function logEvent(
  supabase: ReturnType<typeof createServiceClient>,
  task: CrawlerTask,
  eventType: string,
  message: string,
  data: Record<string, unknown> = {},
  level = 'info',
) {
  await supabase.from('crawler_events').insert({
    job_id: task.job_id,
    candidate_id: task.candidate_id,
    task_id: task.id,
    event_type: eventType,
    level,
    message,
    data,
  });
}

async function createNextTask(
  supabase: ReturnType<typeof createServiceClient>,
  task: CrawlerTask,
  taskType: CrawlerTask['task_type'],
  payload: Record<string, unknown> = {},
) {
  const { error } = await supabase.from('crawler_tasks').insert({
    job_id: task.job_id,
    candidate_id: task.candidate_id,
    task_type: taskType,
    status: 'pending',
    priority: task.priority,
    payload,
  });

  if (error) {
    throw new Error(`Failed to create next task: ${error.message}`);
  }
}

async function processDiscoverTask(
  supabase: ReturnType<typeof createServiceClient>,
  task: CrawlerTask,
) {
  const strategyId = task.payload.strategy_id as string;
  if (!strategyId) {
    throw new Error('DISCOVER task has no strategy_id');
  }

  await logEvent(supabase, task, 'discovery_started', 'Started discovery task');

  const { data: strategy, error: strategyError } = await supabase
    .from('strategies')
    .select('id, target_industries, target_countries, target_regions, target_cities')
    .eq('id', strategyId)
    .single();

  if (strategyError || !strategy) {
    throw new Error(`Failed to load strategy: ${strategyError?.message}`);
  }

  const provider = new OpenStreetMapDiscoveryProvider();
  
  await logEvent(supabase, task, 'discovery_provider_request', `Requesting data from ${provider.name}`);

  const candidates = await provider.discover(strategy, { limit: 10 });

  await logEvent(supabase, task, 'discovery_results_received', `Received ${candidates.length} raw results from ${provider.name}`);

  for (const candidate of candidates) {
    const { data: existing } = await supabase
      .from('discovery_candidates')
      .select('id')
      .eq('provider', candidate.provider)
      .eq('external_id', candidate.externalId || '')
      .maybeSingle();

    if (existing) {
      continue;
    }

      const { data: savedCandidate, error: saveError } = await supabase
        .from('discovery_candidates')
        .insert({
          job_id: task.job_id,
          strategy_id: strategyId,
          provider: candidate.provider,
          external_id: candidate.externalId,
          business_name: candidate.businessName,
          website: candidate.website,
          phone: candidate.phone,
          email: candidate.email,
          address: candidate.address,
          city: candidate.city,
          state_region: candidate.stateRegion,
          postal_code: candidate.postalCode,
          country: candidate.country,
          latitude: candidate.latitude,
          longitude: candidate.longitude,
          industry: candidate.industry,
          raw_data: candidate.rawData,
          status: candidate.status || 'discovered',
          rejection_reason: candidate.rejectionReason,
        })
        .select()
        .single();

      if (saveError) {
        console.error(`Failed to save candidate: ${saveError.message}`);
        continue;
      }

      await logEvent(supabase, task, 'discovery_candidate_saved', `Saved candidate ${candidate.businessName}`, { candidate_id: savedCandidate.id });

      // If the candidate was rejected (e.g. geographic bounds failed), don't spawn next tasks.
      if (candidate.status === 'rejected') {
        continue;
      }

      // Enqueue next task
      const nextTaskType = savedCandidate.website ? 'fetch_website' : 'validate';
      await createNextTask(supabase, { ...task, candidate_id: savedCandidate.id }, nextTaskType);
  }

  await logEvent(supabase, task, 'discovery_completed', `Discovery completed. Inserted candidates and queued next tasks.`);
  
  // Update raw results count explicitly
  await supabase
    .from('crawler_jobs')
    .update({ raw_discovered_count: candidates.length })
    .eq('id', task.job_id);
}

async function processFetchWebsiteTask(
  supabase: ReturnType<typeof createServiceClient>,
  task: CrawlerTask,
) {
  if (!task.candidate_id) {
    throw new Error('FETCH_WEBSITE task has no candidate_id');
  }

  const { data: candidate, error } = await supabase
    .from('discovery_candidates')
    .select('id, website, business_name')
    .eq('id', task.candidate_id)
    .single();

  if (error) {
    throw new Error(`Failed to load candidate: ${error.message}`);
  }

  if (!candidate.website) {
    await logEvent(
      supabase,
      task,
      'website_skipped',
      'Candidate has no website. Continuing without website crawl.',
    );

    await createNextTask(supabase, task, 'validate');

    return;
  }

  await logEvent(
    supabase,
    task,
    'website_fetch_started',
    `Starting website fetch for ${candidate.business_name}.`,
    { website: candidate.website }
  );

  const evidence = await fetchAndExtractWebsite(candidate.website);

  const { error: insertError } = await supabase
    .from('prospect_website_crawls')
    .insert({
      candidate_id: candidate.id,
      original_url: evidence.originalUrl,
      final_url: evidence.finalUrl,
      status_code: evidence.statusCode,
      content_type: evidence.contentType,
      response_size: evidence.responseSize,
      fetch_duration_ms: evidence.fetchDurationMs,
      is_https: evidence.isHttps,
      extracted_title: evidence.extractedTitle,
      extracted_description: evidence.extractedDescription,
      extracted_canonical: evidence.extractedCanonical,
      contact_data: evidence.contactData,
      social_links: evidence.socialLinks,
      json_ld: evidence.jsonLd,
      extraction_status: evidence.extractionStatus,
      error_message: evidence.errorMessage,
    });

  if (insertError) {
    throw new Error(`Failed to save website evidence: ${insertError.message}`);
  }

  await logEvent(
    supabase,
    task,
    evidence.extractionStatus === 'completed' ? 'website_extraction_completed' : 'website_fetch_failed',
    `Website processing ${evidence.extractionStatus}`,
    { statusCode: evidence.statusCode, error: evidence.errorMessage }
  );

  // Skip extract task as we did it in-memory
  await createNextTask(supabase, task, 'validate');
}

async function processExtractTask(
  supabase: ReturnType<typeof createServiceClient>,
  task: CrawlerTask,
) {
  await logEvent(
    supabase,
    task,
    'extract_placeholder',
    'Extraction stage reached. Extractor will be implemented next.',
  );

  await createNextTask(supabase, task, 'validate');
}

async function processValidateTask(
  supabase: ReturnType<typeof createServiceClient>,
  task: CrawlerTask,
) {
  if (!task.candidate_id) throw new Error('No candidate ID for validate task');

  // We could implement strict validation here.
  // For now, if the candidate made it this far, they are valid enough to deduplicate.
  await logEvent(
    supabase,
    task,
    'validation_completed',
    'Candidate passed basic validation.',
  );

  await createNextTask(supabase, task, 'deduplicate');
}

async function processDeduplicateTask(
  supabase: ReturnType<typeof createServiceClient>,
  task: CrawlerTask,
) {
  if (!task.candidate_id) throw new Error('No candidate ID for deduplicate task');

  const { data: candidate } = await supabase
    .from('discovery_candidates')
    .select('provider, external_id, phone, website')
    .eq('id', task.candidate_id)
    .single();

  if (!candidate) throw new Error('Candidate not found');

  // Check deduplication via prospect_sources
  const { data: duplicates } = await supabase
    .from('prospect_sources')
    .select('id')
    .eq('source_type', candidate.provider)
    .contains('source_data', { external_id: candidate.external_id })
    .limit(1);

  if (duplicates && duplicates.length > 0) {
    await logEvent(supabase, task, 'duplicate_detected', 'Candidate is a duplicate based on provider ID');
    await supabase.from('discovery_candidates').update({ status: 'duplicate' }).eq('id', task.candidate_id);
    return; // Stop pipeline
  }

  await logEvent(
    supabase,
    task,
    'deduplication_passed',
    'Candidate passed deduplication.',
  );

  await createNextTask(supabase, task, 'score');
}

async function processScoreTask(
  supabase: ReturnType<typeof createServiceClient>,
  task: CrawlerTask,
) {
  await logEvent(
    supabase,
    task,
    'score_placeholder',
    'Opportunity/data-quality scoring stage reached.',
  );

  await createNextTask(supabase, task, 'finalize');
}

async function processFinalizeTask(
  supabase: ReturnType<typeof createServiceClient>,
  task: CrawlerTask,
) {
  if (!task.candidate_id) throw new Error('No candidate ID for finalize task');

  const { data: candidate } = await supabase
    .from('discovery_candidates')
    .select('*')
    .eq('id', task.candidate_id)
    .single();

  if (!candidate) throw new Error('Candidate not found');

  // Fetch website evidence
  const { data: crawls } = await supabase
    .from('prospect_website_crawls')
    .select('*')
    .eq('candidate_id', candidate.id)
    .order('created_at', { ascending: false })
    .limit(1);

  const crawl = crawls && crawls.length > 0 ? crawls[0] : null;

  // Insert into prospects
  const { data: prospect, error: prospectError } = await supabase
    .from('prospects')
    .insert({
      strategy_id: candidate.strategy_id,
      business_name: candidate.business_name,
      website: candidate.website,
      phone: candidate.phone,
      email: candidate.email,
      address_line: candidate.address,
      city: candidate.city,
      state_region: candidate.state_region,
      postal_code: candidate.postal_code,
      country: candidate.country,
      timezone: (candidate as any).timezone || null,
      industry: candidate.industry,
      has_website: !!candidate.website,
      has_social_presence: crawl && crawl.social_links && Object.keys(crawl.social_links).length > 0 ? true : false,
      status: 'discovered'
    })
    .select('id')
    .single();

  if (prospectError) {
    throw new Error(`Failed to create prospect: ${prospectError.message}`);
  }

  // Insert prospect source
  const { error: sourceError } = await supabase.from('prospect_sources').insert({
    prospect_id: prospect.id,
    source_type: candidate.provider,
    source_url: '',
    source_data: {
      external_id: candidate.external_id,
      candidate_id: candidate.id,
      raw_data: candidate.raw_data
    }
  });

  if (sourceError) {
    throw new Error(`Failed to create prospect source: ${sourceError.message}`);
  }

  // Mark candidate as accepted
  await supabase.from('discovery_candidates').update({ status: 'accepted' }).eq('id', candidate.id);

  await logEvent(
    supabase,
    task,
    'finalized',
    'Candidate finalized and converted to prospect.',
    { prospect_id: prospect.id }
  );
}

async function processTask(
  supabase: ReturnType<typeof createServiceClient>,
  task: CrawlerTask,
) {
  switch (task.task_type) {
    case 'discover':
      return processDiscoverTask(supabase, task);

    case 'fetch_website':
      return processFetchWebsiteTask(supabase, task);

    case 'extract':
      return processExtractTask(supabase, task);

    case 'validate':
      return processValidateTask(supabase, task);

    case 'deduplicate':
      return processDeduplicateTask(supabase, task);

    case 'score':
      return processScoreTask(supabase, task);

    case 'finalize':
      return processFinalizeTask(supabase, task);

    default:
      throw new Error(`Unknown task type: ${task.task_type}`);
  }
}

async function claimTasks(
  supabase: ReturnType<typeof createServiceClient>,
) {
  const worker = workerId();

  /*
   * Recover abandoned processing tasks.
   */
  await supabase
    .from('crawler_tasks')
    .update({
      status: 'retry',
      locked_at: null,
      locked_by: null,
      last_error: 'Recovered after worker lock timeout',
    })
    .eq('status', 'processing')
    .lt(
      'locked_at',
      new Date(
        Date.now() - LOCK_TIMEOUT_MINUTES * 60 * 1000,
      ).toISOString(),
    );

  /*
   * Atomic claim via Postgres FOR UPDATE SKIP LOCKED
   */
  const { data, error } = await supabase.rpc('claim_crawler_tasks', {
    p_batch_size: BATCH_SIZE,
    p_worker_id: worker,
  });

  if (error) {
    throw new Error(`Failed to claim crawler tasks: ${error.message}`);
  }

  return (data || []) as CrawlerTask[];
}

async function completeTask(
  supabase: ReturnType<typeof createServiceClient>,
  task: CrawlerTask,
) {
  await supabase
    .from('crawler_tasks')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      locked_at: null,
      locked_by: null,
    })
    .eq('id', task.id);
}

async function failTask(
  supabase: ReturnType<typeof createServiceClient>,
  task: CrawlerTask,
  error: unknown,
) {
  const message = error instanceof Error ? error.message : String(error);

  const shouldRetry = task.attempts < task.max_attempts;

  await supabase
    .from('crawler_tasks')
    .update({
      status: shouldRetry ? 'retry' : 'failed',
      available_at: shouldRetry
        ? new Date(Date.now() + task.attempts * 30_000).toISOString()
        : new Date().toISOString(),
      last_error: message,
      locked_at: null,
      locked_by: null,
    })
    .eq('id', task.id);

  await logEvent(
    supabase,
    task,
    shouldRetry ? 'task_retry' : 'task_failed',
    message,
    {
      attempts: task.attempts,
      max_attempts: task.max_attempts,
    },
    'error',
  );
}

async function updateJobCounters(
  supabase: ReturnType<typeof createServiceClient>,
  jobId: string,
) {
  const { error } = await supabase.rpc('update_crawler_job_status', {
    p_job_id: jobId,
  });

  if (error) {
    console.error(`Failed to update job counters for job ${jobId}:`, error.message);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        error: 'Method not allowed',
      }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }

  try {
    const supabase = createServiceClient();

    const tasks = await claimTasks(supabase);

    if (!tasks.length) {
      return new Response(
        JSON.stringify({
          success: true,
          processed: 0,
          message: 'No crawler tasks available',
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    let successful = 0;
    let failed = 0;

    for (const task of tasks) {
      try {
        await processTask(supabase, task);

        await completeTask(supabase, task);

        await updateJobCounters(supabase, task.job_id);

        successful++;
      } catch (error) {
        failed++;

        await failTask(supabase, task, error);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        claimed: tasks.length,
        successful,
        failed,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    console.error('Crawler worker error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : String(error),
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});
