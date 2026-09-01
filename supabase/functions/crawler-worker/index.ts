import { createServiceClient } from '../_shared/supabase.ts';
import { corsHeaders } from '../_shared/cors.ts';

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
  /*
   * Discovery provider will be implemented later.
   *
   * For now we only prove that the queue can execute
   * a discovery task successfully.
   */

  await logEvent(
    supabase,
    task,
    'discovery_placeholder',
    'Discovery task executed. No provider configured yet.',
  );
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

  /*
   * Actual website fetching will be implemented later.
   *
   * We deliberately do not crawl websites in this first worker version.
   */

  await logEvent(
    supabase,
    task,
    'website_placeholder',
    `Website fetch queued for ${candidate.business_name}.`,
    {
      website: candidate.website,
    },
  );

  await createNextTask(supabase, task, 'extract');
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
  await logEvent(
    supabase,
    task,
    'validate_placeholder',
    'Validation stage reached.',
  );

  await createNextTask(supabase, task, 'deduplicate');
}

async function processDeduplicateTask(
  supabase: ReturnType<typeof createServiceClient>,
  task: CrawlerTask,
) {
  await logEvent(
    supabase,
    task,
    'deduplicate_placeholder',
    'Deduplication stage reached.',
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
  await logEvent(
    supabase,
    task,
    'finalize_placeholder',
    'Finalization stage reached.',
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
   * Get available tasks.
   */
  const { data, error } = await supabase
    .from('crawler_tasks')
    .select('*')
    .in('status', ['pending', 'retry'])
    .lte('available_at', new Date().toISOString())
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(BATCH_SIZE);

  if (error) {
    throw new Error(`Failed to fetch crawler tasks: ${error.message}`);
  }

  if (!data?.length) {
    return [];
  }

  const claimed: CrawlerTask[] = [];

  /*
   * Optimistic claim.
   *
   * Multiple workers may see the same task, but only one
   * should successfully transition it from pending/retry
   * to processing.
   */
  for (const task of data) {
    const { data: updated, error: updateError } = await supabase
      .from('crawler_tasks')
      .update({
        status: 'processing',
        locked_at: new Date().toISOString(),
        locked_by: worker,
        started_at: new Date().toISOString(),
        attempts: task.attempts + 1,
      })
      .eq('id', task.id)
      .in('status', ['pending', 'retry'])
      .select('*')
      .maybeSingle();

    if (updateError) {
      console.error('Task claim failed:', updateError);
      continue;
    }

    if (updated) {
      claimed.push(updated as CrawlerTask);
    }
  }

  return claimed;
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
  const { data: tasks } = await supabase
    .from('crawler_tasks')
    .select('status');

  /*
   * We intentionally keep this simple for V1.
   * Job-level aggregation can later be moved into a SQL
   * function once the crawler is producing real volume.
   */
  if (!tasks) return;

  const completed = tasks.filter(
    (task) => task.status === 'completed',
  ).length;

  await supabase
    .from('crawler_jobs')
    .update({
      processed_count: completed,
    })
    .eq('id', jobId);
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
