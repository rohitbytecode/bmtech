import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase server environment variables');
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const strategyId = body.strategyId;
    const targetCount = body.targetCount;

    if (!strategyId) {
      return NextResponse.json(
        { error: 'strategyId is required' },
        { status: 400 },
      );
    }

    // Authenticate via Authorization header (Bearer <access_token>)
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized (Missing Authorization header)' },
        { status: 401 },
      );
    }

    const supabase = getServiceClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized (Invalid token)' },
        { status: 401 },
      );
    }

    const userRole = user.user_metadata?.role;
    const isSuperAdmin = user.user_metadata?.is_super_admin === true;
    if (userRole !== 'admin' && !isSuperAdmin) {
      return NextResponse.json(
        { error: 'Forbidden (Admin only)' },
        { status: 403 },
      );
    }

    const { data: strategy, error: strategyError } =
      await supabase
        .from('strategies')
        .select('id, name, status')
        .eq('id', strategyId)
        .single();

    if (strategyError || !strategy) {
      return NextResponse.json(
        { error: 'Strategy not found' },
        { status: 404 },
      );
    }

    if (strategy.status !== 'active') {
      return NextResponse.json(
        { error: 'Only active strategies can start crawler jobs' },
        { status: 400 },
      );
    }

    const { data: job, error: jobError } = await supabase
      .from('crawler_jobs')
      .insert({
        strategy_id: strategyId,
        target_count: targetCount ?? null,
        status: 'pending',
        created_by: user.id,
      })
      .select()
      .single();

    if (jobError) {
      return NextResponse.json(
        { error: jobError.message },
        { status: 500 },
      );
    }

    const { error: taskError } = await supabase
      .from('crawler_tasks')
      .insert({
        job_id: job.id,
        task_type: 'discover',
        status: 'pending',
        priority: 100,
        payload: {
          strategy_id: strategyId,
        },
      });

    if (taskError) {
      await supabase
        .from('crawler_jobs')
        .delete()
        .eq('id', job.id);

      return NextResponse.json(
        { error: taskError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      job,
    });
  } catch (error) {
    console.error('Create crawler job error:', error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create crawler job',
      },
      { status: 500 },
    );
  }
}
