/**
 * auth-verification.mjs
 * Verifies:
 *   1. Unauthenticated request → 401
 *   2. Service-role JWT request → 200
 *   3. Anon JWT request → 403 (insufficient role)
 *   4. Worker actually claims a queued task
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !serviceRoleKey || !anonKey) {
  console.error('Missing environment variables.');
  process.exit(1);
}

const workerUrl = `${supabaseUrl}/functions/v1/crawler-worker`;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function callWorker(label, headers) {
  const res = await fetch(workerUrl, { method: 'POST', headers });
  const body = await res.json().catch(() => ({}));
  console.log(`[${label}] HTTP ${res.status}`, JSON.stringify(body));
  return { status: res.status, body };
}

async function run() {
  console.log('=== Phase 4C Auth Verification ===\n');

  // Test 1: No Authorization header → must be 401
  const t1 = await callWorker('No Auth', { 'Content-Type': 'application/json' });
  console.log(`  → ${t1.status === 401 ? 'PASS' : 'FAIL'} (expected 401)\n`);

  // Test 2: Anon key → JWT valid but role=anon → must be 403
  const t2 = await callWorker('Anon JWT', {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${anonKey}`,
  });
  console.log(`  → ${t2.status === 403 ? 'PASS' : 'FAIL'} (expected 403 insufficient role)\n`);

  // Test 3: Service-role key → JWT valid and role=service_role → must be 200
  const t3 = await callWorker('Service-Role JWT', {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${serviceRoleKey}`,
  });
  console.log(`  → ${t3.status === 200 ? 'PASS' : 'FAIL'} (expected 200)\n`);

  // Test 4: Insert a pending task and verify the worker claims it
  console.log('=== Task Claim Verification ===\n');

  // Get any existing strategy
  const { data: strategies } = await supabase.from('strategies').select('id').limit(1);
  if (!strategies || strategies.length === 0) {
    console.log('No strategies found — skipping task claim test.');
    return;
  }
  const strategyId = strategies[0].id;

  const { data: job } = await supabase
    .from('crawler_jobs')
    .insert({ strategy_id: strategyId, status: 'running' })
    .select('id')
    .single();

  const { data: task } = await supabase
    .from('crawler_tasks')
    .insert({
      job_id: job.id,
      task_type: 'discover',
      status: 'pending',
      priority: 1,
      payload: { strategy_id: strategyId, _test: 'auth_verification' },
      attempts: 0,
      max_attempts: 3,
    })
    .select('id')
    .single();

  console.log(`Inserted test task: ${task.id}`);

  // Invoke worker with service-role credentials
  await callWorker('Service-Role JWT (claim)', {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${serviceRoleKey}`,
  });

  // Check task status in DB
  const { data: afterTask } = await supabase
    .from('crawler_tasks')
    .select('status, attempts, locked_by')
    .eq('id', task.id)
    .single();

  console.log(`Task status after worker invocation: ${JSON.stringify(afterTask)}`);
  const claimed = afterTask?.status !== 'pending';
  console.log(`  → ${claimed ? 'PASS' : 'FAIL'} (task was ${claimed ? 'claimed' : 'NOT claimed'})\n`);
}

run().catch(console.error);
