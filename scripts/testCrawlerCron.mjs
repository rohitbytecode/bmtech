import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to invoke the edge function, simulating pg_net
async function simulateCronTick() {
  console.log("Simulating cron tick (calling crawler-worker Edge Function)...");
  
  const functionUrl = `${supabaseUrl}/functions/v1/crawler-worker`;
  
  try {
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    const data = await response.json();
    console.log("Edge Function Response:", response.status, data);
    return data;
  } catch (error) {
    console.error("Failed to invoke Edge Function:", error);
  }
}

async function runTests() {
  console.log("--- Starting Crawler Cron Automation Tests ---\n");

  // TEST A: Empty Queue
  console.log("=> Test A: Empty Queue");
  await simulateCronTick();
  console.log("Expected: { success: true, processed: 0 } (or similar)\n");
  
  // Create a fake strategy
  const { data: strategy } = await supabase.from('strategies').insert({
    name: 'Cron Test Strategy',
    target_industries: ['Test'],
    status: 'active'
  }).select().single();

  const strategyId = strategy?.id;

  const { data: job } = await supabase.from('crawler_jobs').insert({
    strategy_id: strategyId,
    status: 'running'
  }).select().single();

  const jobId = job?.id;

  // TEST B: Single Task
  console.log("=> Test B: Single Task");
  const { data: taskB } = await supabase.from('crawler_tasks').insert({
    job_id: jobId,
    task_type: 'discover',
    status: 'pending',
    priority: 1,
    payload: { strategy_id: strategyId, test: 'test_b' },
    attempts: 0,
    max_attempts: 3
  }).select().single();
  
  await simulateCronTick();
  
  // Verify Task B was processed
  const { data: verifiedTaskB } = await supabase.from('crawler_tasks').select('status').eq('id', taskB.id).single();
  console.log(`Task B status after tick: ${verifiedTaskB?.status} (Expected: completed)\n`);


  // TEST C: Multiple Tasks
  console.log("=> Test C: Multiple Tasks");
  await supabase.from('crawler_tasks').insert([
    { job_id: jobId, task_type: 'discover', status: 'pending', priority: 1, payload: { strategy_id: strategyId, test: 'test_c_1' }, attempts: 0, max_attempts: 3 },
    { job_id: jobId, task_type: 'discover', status: 'pending', priority: 1, payload: { strategy_id: strategyId, test: 'test_c_2' }, attempts: 0, max_attempts: 3 },
    { job_id: jobId, task_type: 'discover', status: 'pending', priority: 1, payload: { strategy_id: strategyId, test: 'test_c_3' }, attempts: 0, max_attempts: 3 }
  ]);
  
  await simulateCronTick();
  console.log("Expected: Claimed > 1 task.\n");


  // TEST D: Concurrent Worker Invocations
  console.log("=> Test D: Concurrent Worker Invocations");
  await supabase.from('crawler_tasks').insert([
    { job_id: jobId, task_type: 'discover', status: 'pending', priority: 1, payload: { strategy_id: strategyId, test: 'test_d_1' }, attempts: 0, max_attempts: 3 },
    { job_id: jobId, task_type: 'discover', status: 'pending', priority: 1, payload: { strategy_id: strategyId, test: 'test_d_2' }, attempts: 0, max_attempts: 3 }
  ]);
  
  console.log("Firing two ticks simultaneously...");
  await Promise.all([
    simulateCronTick(),
    simulateCronTick()
  ]);
  console.log("Expected: Tasks should be atomically claimed without errors or duplicate processing.\n");


  // TEST E: Processing Failure and Retry Logic
  console.log("=> Test E: Processing Failure");
  const { data: taskE } = await supabase.from('crawler_tasks').insert({
    job_id: jobId,
    task_type: 'unknown_fake_type', // This will cause processTask to throw an error
    status: 'pending',
    priority: 1,
    payload: { test: 'test_e' },
    attempts: 0,
    max_attempts: 1 // Only 1 attempt before permanent failure
  }).select().single();
  
  await simulateCronTick();
  
  const { data: verifiedTaskE } = await supabase.from('crawler_tasks').select('status, attempts').eq('id', taskE.id).single();
  console.log(`Task E status after failure: ${verifiedTaskE?.status}, Attempts: ${verifiedTaskE?.attempts}\n`);


  // TEST F: Stale Task Recovery
  console.log("=> Test F: Stale Task Recovery");
  // We insert a task explicitly as 'processing' and lock it in the past (e.g. 15 minutes ago)
  const { data: taskF } = await supabase.from('crawler_tasks').insert({
    job_id: jobId,
    task_type: 'discover',
    status: 'processing',
    priority: 1,
    payload: { strategy_id: strategyId, test: 'test_f' },
    attempts: 0,
    max_attempts: 3,
    locked_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    locked_by: 'old-dead-worker-123'
  }).select().single();

  await simulateCronTick();
  
  const { data: verifiedTaskF } = await supabase.from('crawler_tasks').select('status, last_error').eq('id', taskF.id).single();
  console.log(`Task F status after recovery: ${verifiedTaskF?.status} (Expected: retry), Last Error: ${verifiedTaskF?.last_error}\n`);

  console.log("--- Tests Completed ---");
}

runTests().catch(console.error);
