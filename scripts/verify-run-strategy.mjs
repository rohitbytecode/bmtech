// Verify the complete Run Strategy flow: create job + task via the API route logic directly.
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  // 1. Find the active Cafe strategy
  const { data: strategies } = await supabase
    .from('strategies')
    .select('id, name, status')
    .eq('status', 'active')
    .limit(3);

  console.log('Active strategies:', strategies?.map(s => ({ id: s.id.slice(0, 8), name: s.name })));

  const strategy = strategies?.[0];
  if (!strategy) {
    console.log('No active strategy found.');
    return;
  }

  // 2. Create a crawler_job
  const { data: job, error: jobError } = await supabase
    .from('crawler_jobs')
    .insert({ strategy_id: strategy.id, target_count: null, status: 'pending' })
    .select()
    .single();

  if (jobError) {
    console.log('Job insert failed:', jobError.message);
    return;
  }
  console.log('Job created:', job.id);

  // 3. Create the discover task
  const { error: taskError } = await supabase
    .from('crawler_tasks')
    .insert({
      job_id: job.id,
      task_type: 'discover',
      status: 'pending',
      priority: 100,
      payload: { strategy_id: strategy.id }
    });

  if (taskError) {
    console.log('Task insert failed:', taskError.message);
    return;
  }
  console.log('Discover task created for job', job.id.slice(0, 8));

  // 4. Confirm counts
  const { count: jobCount } = await supabase.from('crawler_jobs').select('*', { count: 'exact', head: true });
  const { count: taskCount } = await supabase.from('crawler_tasks').select('*', { count: 'exact', head: true });
  console.log('crawler_jobs total:', jobCount);
  console.log('crawler_tasks total:', taskCount);
}

run();
