import { createServiceClient } from '../_shared/supabase.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { OpenStreetMapDiscoveryProvider } from './providers/osm.ts';
import { fetchAndExtractWebsite, WebsiteEvidence } from './fetcher.ts';
import { calculateOpportunityScores } from './scoring/scoringEngine.ts';

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

      // Enqueue next task: validate
      await createNextTask(supabase, { ...task, candidate_id: savedCandidate.id }, 'validate');
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

  if (!error && candidate && !candidate.website) {
    await logEvent(
      supabase,
      task,
      'website_skipped',
      'Candidate has no website. Continuing directly to deduplicate.',
    );
    await createNextTask(supabase, task, 'deduplicate');
    return;
  }

  if (error || !candidate) {
    throw new Error(`Failed to load candidate: ${error?.message || 'Not found'}`);
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
      additional_metadata: {
        viewport: evidence.viewport,
        ogTitle: evidence.ogTitle,
        ogDescription: evidence.ogDescription,
        ogUrl: evidence.ogUrl,
        ogType: evidence.ogType,
        ogImage: evidence.ogImage,
        robots: evidence.robots,
        hasNav: evidence.hasNav,
        hasHeader: evidence.hasHeader,
        hasMain: evidence.hasMain,
        hasFooter: evidence.hasFooter,
        hasForm: evidence.hasForm
      }
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

  // Advance to deduplication
  await createNextTask(supabase, task, 'deduplicate');
}

async function processExtractTask(
  supabase: ReturnType<typeof createServiceClient>,
  task: CrawlerTask,
) {
  await logEvent(
    supabase,
    task,
    'extract_placeholder',
    'Extraction stage reached. Extractor is integrated with fetcher.',
  );

  await createNextTask(supabase, task, 'deduplicate');
}

async function processValidateTask(
  supabase: ReturnType<typeof createServiceClient>,
  task: CrawlerTask,
) {
  if (!task.candidate_id) throw new Error('No candidate ID for validate task');

  const { data: candidate, error } = await supabase
    .from('discovery_candidates')
    .select('id, website, business_name')
    .eq('id', task.candidate_id)
    .single();

  if (error || !candidate) {
    throw new Error(`Failed to load candidate in validate: ${error?.message || 'Not found'}`);
  }

  await logEvent(
    supabase,
    task,
    'validation_completed',
    'Candidate passed basic validation.',
    { has_website: !!candidate.website }
  );

  // If candidate has a website, route to fetch_website; otherwise route directly to deduplicate
  const nextTaskType = candidate.website ? 'fetch_website' : 'deduplicate';
  await createNextTask(supabase, task, nextTaskType);
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
    return; // Stop pipeline for duplicate
  }

  await logEvent(
    supabase,
    task,
    'deduplication_passed',
    'Candidate passed deduplication.',
  );

  await createNextTask(supabase, task, 'finalize');
}

/**
 * processScoreTask
 * 
 * SEMANTICS FOR PHASE 4A:
 * This task performs DETERMINISTIC OPPORTUNITY SIGNAL GENERATION.
 * It strictly creates factual, verifiable detection evidence rows in `prospect_opportunity_signals`.
 * 
 * CONFIDENCE SEMANTICS:
 * "confidence" strictly represents the CONFIDENCE OF DETECTION (e.g. certainty that a meta tag was absent or URL was missing),
 * NOT commercial value, sales priority, or opportunity score.
 * 
 * SCOPE BOUNDARY:
 * Commercial scores (opportunity_score, opportunity_web, opportunity_seo, opportunity_marketing, 
 * opportunity_design, sales_priority) are NOT calculated here and remain untouched / NULL until Phase 4B.
 */
async function processScoreTask(
  supabase: ReturnType<typeof createServiceClient>,
  task: CrawlerTask,
) {
  if (!task.candidate_id) throw new Error('No candidate ID for score task');

  const { data: candidate } = await supabase
    .from('discovery_candidates')
    .select('id, provider, website, phone, prospect_id, raw_data, latitude, longitude')
    .eq('id', task.candidate_id)
    .single();

  if (!candidate || !candidate.prospect_id) {
    throw new Error('Candidate not found or missing prospect_id (was finalize skipped?)');
  }

  // Fetch website evidence if crawled
  const { data: crawls } = await supabase
    .from('prospect_website_crawls')
    .select('*')
    .eq('candidate_id', candidate.id)
    .order('created_at', { ascending: false })
    .limit(1);

  const crawl = crawls && crawls.length > 0 ? crawls[0] : null;
  const prospectId = candidate.prospect_id;
  const signals: any[] = [];

  const addSignal = (category: string, key: string, confidence: string, evidence: any = {}) => {
    signals.push({ prospect_id: prospectId, category, signal_key: key, confidence, evidence });
  };

  // --- 1. DATA QUALITY SIGNALS ---
  // Factual evidence describing data completeness, validity, provenance, and geographic verification.
  if (candidate.provider === 'osm' && candidate.latitude && candidate.longitude) {
    addSignal('data_quality', 'verified_location', 'high', {
      provider: candidate.provider,
      latitude: candidate.latitude,
      longitude: candidate.longitude,
      source: 'geocoded_coordinates'
    });
  }
  if (candidate.phone) {
    addSignal('data_quality', 'valid_phone', 'high', {
      phone: candidate.phone,
      source: 'discovery_provider'
    });
  }
  if (candidate.website) {
    addSignal('data_quality', 'website_discovered', 'high', {
      url: candidate.website,
      source: 'discovery_provider'
    });
  }

  // --- 2. WEB SIGNALS ---
  // Signals regarding web accessibility, connectivity, HTTPS, and markup format.
  if (!candidate.website) {
    addSignal('web', 'no_website', 'high', {
      reason: 'No website URL provided during discovery',
      website_present: false
    });
  } else if (!crawl) {
    addSignal('web', 'website_unreachable', 'medium', {
      reason: 'No crawl records recorded for provided URL',
      url: candidate.website
    });
  } else {
    if (crawl.extraction_status === 'failed' || !crawl.status_code) {
      addSignal('web', 'website_unreachable', 'high', {
        error: crawl.error_message || 'HTTP request failed or timed out',
        final_url: crawl.final_url || crawl.original_url
      });
    } else if (crawl.status_code >= 400) {
      addSignal('web', 'website_http_error', 'high', {
        status_code: crawl.status_code,
        error: crawl.error_message,
        url: crawl.final_url || crawl.original_url
      });
    }
    
    if (crawl.extraction_status === 'skipped' && crawl.content_type && !crawl.content_type.toLowerCase().includes('text/html')) {
      addSignal('web', 'non_html_site', 'high', {
        content_type: crawl.content_type,
        url: crawl.final_url || crawl.original_url
      });
    }

    if (!crawl.is_https) {
      addSignal('web', 'no_https', 'high', {
        protocol: crawl.final_url ? new URL(crawl.final_url).protocol : 'http:',
        is_https: false,
        url: crawl.final_url || crawl.original_url
      });
    }

    // --- 3. SEO SIGNALS ---
    // Deterministic SEO markup detections.
    if (!crawl.extracted_title) {
      addSignal('seo', 'meta_title_missing', 'high', {
        tag: '<title>',
        found: false,
        page_size_bytes: crawl.response_size
      });
    } else {
      addSignal('seo', 'meta_title_present', 'high', {
        title: crawl.extracted_title,
        length: crawl.extracted_title.length
      });
    }

    if (!crawl.extracted_description) {
      addSignal('seo', 'meta_description_missing', 'high', {
        tag: 'meta[name="description"]',
        found: false
      });
    } else {
      addSignal('seo', 'meta_description_present', 'high', {
        description: crawl.extracted_description,
        length: crawl.extracted_description.length
      });
    }

    if (crawl.extracted_canonical) {
      addSignal('seo', 'canonical_present', 'high', {
        canonical_url: crawl.extracted_canonical
      });
    }

    if (!crawl.json_ld || crawl.json_ld.length === 0) {
      addSignal('seo', 'structured_data_missing', 'high', {
        tag: 'script[type="application/ld+json"]',
        found: 0
      });
    } else {
      addSignal('seo', 'structured_data_present', 'high', {
        count: crawl.json_ld.length,
        types: crawl.json_ld.map((item: any) => item['@type']).filter(Boolean)
      });
    }

    // --- 4. MARKETING SIGNALS ---
    // Deterministic social presence and contact channel detections.
    const socialLinks = crawl.social_links || {};
    const platformKeys = Object.keys(socialLinks);
    if (platformKeys.length === 0) {
      addSignal('marketing', 'social_presence_missing', 'high', {
        checked_platforms: ['facebook', 'instagram', 'linkedin', 'twitter', 'youtube', 'tiktok'],
        found_count: 0
      });
    } else {
      addSignal('marketing', 'social_presence_detected', 'high', {
        platforms: platformKeys,
        count: platformKeys.length,
        links: socialLinks
      });
    }

    const contactData = crawl.contact_data || {};
    if (contactData.emails && contactData.emails.length > 0) {
      addSignal('marketing', 'email_present', 'high', {
        emails: contactData.emails,
        count: contactData.emails.length
      });
    }
    if (contactData.phones && contactData.phones.length > 0) {
      addSignal('marketing', 'phone_present', 'high', {
        phones: contactData.phones,
        count: contactData.phones.length
      });
    }

    // --- 5. DESIGN SIGNALS (from additional_metadata) ---
    // Deterministic responsive viewport, OG image, and HTML5 layout element detections.
    const meta = crawl.additional_metadata || {};
    
    if (!meta.viewport) {
      addSignal('design', 'mobile_viewport_missing', 'high', {
        tag: 'meta[name="viewport"]',
        found: false
      });
    } else {
      addSignal('design', 'mobile_viewport_present', 'high', {
        viewport: meta.viewport
      });
    }

    if (!meta.ogImage) {
      addSignal('design', 'og_image_missing', 'high', {
        tag: 'meta[property="og:image"]',
        found: false
      });
    } else {
      addSignal('design', 'og_image_present', 'high', {
        og_image: meta.ogImage
      });
    }

    if (meta.hasNav || meta.hasHeader || meta.hasMain || meta.hasFooter || meta.hasForm) {
      addSignal('design', 'page_structure_detected', 'high', {
        has_nav: !!meta.hasNav,
        has_header: !!meta.hasHeader,
        has_main: !!meta.hasMain,
        has_footer: !!meta.hasFooter,
        has_form: !!meta.hasForm
      });
    } else {
      addSignal('design', 'minimal_content', 'medium', {
        reason: 'No semantic HTML5 layout tags (nav, header, main, footer, form) detected'
      });
    }
  }

  // UPSERT signals idempotently
  if (signals.length > 0) {
    const { error: upsertError } = await supabase
      .from('prospect_opportunity_signals')
      .upsert(signals, { onConflict: 'prospect_id, category, signal_key' });
      
    if (upsertError) {
      throw new Error(`Failed to save signals: ${upsertError.message}`);
    }
  }

  await logEvent(
    supabase,
    task,
    'signals_generated',
    `Generated ${signals.length} deterministic opportunity signals.`,
    { signal_count: signals.length, prospect_id: prospectId }
  );

  // --- PHASE 4B.2: DETERMINISTIC-V1 COMMERCIAL OPPORTUNITY SCORING ---
  // Fetch full prospect context
  const { data: prospect, error: prospectFetchError } = await supabase
    .from('prospects')
    .select('*')
    .eq('id', prospectId)
    .single();

  if (prospectFetchError || !prospect) {
    throw new Error(`Failed to load prospect for scoring: ${prospectFetchError?.message || 'Not found'}`);
  }

  const scoringContext = {
    prospect_id: prospect.id,
    business_name: prospect.business_name,
    website: prospect.website,
    has_website: prospect.has_website,
    phone: prospect.phone,
    city: prospect.city,
    country: prospect.country,
    industry: prospect.industry,
    provider: candidate.provider,
    latitude: candidate.latitude,
    longitude: candidate.longitude,
  };

  // Run authoritative deterministic-v1 scoring engine
  const scoringResult = calculateOpportunityScores(signals, scoringContext);

  // Persist authoritative score record into prospect_opportunity_scores
  const { error: scoreUpsertError } = await supabase
    .from('prospect_opportunity_scores')
    .upsert({
      prospect_id: prospectId,
      opportunity_web: scoringResult.opportunity_web,
      opportunity_seo: scoringResult.opportunity_seo,
      opportunity_marketing: scoringResult.opportunity_marketing,
      opportunity_design: scoringResult.opportunity_design,
      opportunity_score: scoringResult.opportunity_score,
      data_quality_score: scoringResult.data_quality_score,
      sales_priority: scoringResult.sales_priority,
      explanation: scoringResult.explanation,
      scoring_version: scoringResult.scoring_version,
      calculated_at: new Date().toISOString(),
    }, { onConflict: 'prospect_id, scoring_version' });

  if (scoreUpsertError) {
    throw new Error(`Failed to save prospect opportunity scores: ${scoreUpsertError.message}`);
  }

  // Synchronize canonical fields on prospects table
  const { error: updateProspectError } = await supabase
    .from('prospects')
    .update({
      opportunity_web: scoringResult.opportunity_web,
      opportunity_seo: scoringResult.opportunity_seo,
      opportunity_marketing: scoringResult.opportunity_marketing,
      opportunity_design: scoringResult.opportunity_design,
      opportunity_score: scoringResult.opportunity_score,
      data_quality_score: scoringResult.data_quality_score,
      sales_priority: scoringResult.sales_priority,
      updated_at: new Date().toISOString(),
    })
    .eq('id', prospectId);

  if (updateProspectError) {
    throw new Error(`Failed to update prospect opportunity fields: ${updateProspectError.message}`);
  }

  await logEvent(
    supabase,
    task,
    'scores_calculated',
    `Calculated deterministic-v1 scores: Overall=${scoringResult.opportunity_score}, Priority=${scoringResult.sales_priority}`,
    {
      scoring_version: scoringResult.scoring_version,
      opportunity_score: scoringResult.opportunity_score,
      opportunity_web: scoringResult.opportunity_web,
      opportunity_seo: scoringResult.opportunity_seo,
      opportunity_marketing: scoringResult.opportunity_marketing,
      opportunity_design: scoringResult.opportunity_design,
      data_quality_score: scoringResult.data_quality_score,
      sales_priority: scoringResult.sales_priority,
      prospect_id: prospectId,
    }
  );
  
  // Pipeline terminates here for Phase 4B
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

  // Mark candidate as accepted and link prospect
  await supabase.from('discovery_candidates').update({ status: 'accepted', prospect_id: prospect.id }).eq('id', candidate.id);

  await logEvent(
    supabase,
    task,
    'finalized',
    'Candidate finalized and converted to prospect.',
    { prospect_id: prospect.id }
  );
  
  await createNextTask(supabase, task, 'score');
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
  const { data: abandonedTasks } = await supabase
    .from('crawler_tasks')
    .select('id, attempts, max_attempts')
    .eq('status', 'processing')
    .lt(
      'locked_at',
      new Date(
        Date.now() - LOCK_TIMEOUT_MINUTES * 60 * 1000,
      ).toISOString(),
    );

  if (abandonedTasks && abandonedTasks.length > 0) {
    console.log(`[Crawler Worker] Recovering ${abandonedTasks.length} abandoned task(s).`);
    for (const t of abandonedTasks) {
      const shouldRetry = t.attempts < t.max_attempts;
      await supabase
        .from('crawler_tasks')
        .update({
          status: shouldRetry ? 'retry' : 'failed',
          available_at: shouldRetry
            ? new Date(Date.now() + t.attempts * 30_000).toISOString()
            : new Date().toISOString(),
          locked_at: null,
          locked_by: null,
          last_error: 'Recovered after worker lock timeout',
        })
        .eq('id', t.id);
    }
  }

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
    // --- Authentication ---
    // For service-to-service calls (pg_net/cron), the Supabase Edge runtime injects
    // SUPABASE_SECRET_KEYS — a comma-separated list of all project secret (service_role)
    // keys. We extract the bearer token and verify it is present in that list.
    // This is the correct pattern for internal callers; user JWTs are NOT accepted here.
    //
    // NOTE: SUPABASE_JWT_SECRET and SUPABASE_SERVICE_ROLE_KEY are NOT injected by the runtime.
    // SUPABASE_SECRET_KEYS IS injected automatically on the Supabase platform.
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.slice(7).trim();

    // Two-tier service-role verification.
    //
    // Tier 1: Check SUPABASE_SECRET_KEYS (injected for new sb_secret_... API key format).
    // Tier 2: Decode the JWT payload role claim (for legacy eyJhbG... JWT-format service keys).
    //
    // The platform-level verify_jwt gate has ALREADY verified the JWT signature before our
    // handler runs. We do NOT need to re-verify the signature; we only need to confirm
    // the caller has service_role privileges.
    const rawSecretKeys = Deno.env.get('SUPABASE_SECRET_KEYS') ?? '';
    const secretKeys = rawSecretKeys.split(',').map((k) => k.trim()).filter(Boolean);

    let isAuthorized = false;

    if (secretKeys.includes(token)) {
      // Tier 1: new-format secret key — authorized.
      isAuthorized = true;
    } else {
      // Tier 2: decode JWT payload and check role claim (legacy JWT-format service role key).
      // Signature already verified by the Kong gateway above; decoding the payload is safe.
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payloadJson = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
          const payload = JSON.parse(payloadJson);
          if (payload.role === 'service_role') {
            isAuthorized = true;
          }
        }
      } catch {
        // Malformed token — not authorized.
      }
    }

    if (!isAuthorized) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Insufficient role' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createServiceClient();
    
    console.log(`[Crawler Worker] Invocation started.`);
    const startTime = Date.now();

    const tasks = await claimTasks(supabase);

    if (!tasks.length) {
      console.log(`[Crawler Worker] Invocation finished. 0 tasks claimed. Duration: ${Date.now() - startTime}ms`);
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
    
    console.log(`[Crawler Worker] Invocation finished. Claimed: ${tasks.length}, Successful: ${successful}, Failed: ${failed}. Duration: ${Date.now() - startTime}ms`);

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
