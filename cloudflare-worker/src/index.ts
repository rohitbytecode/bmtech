import { createServiceClient } from './_shared/supabase';
import { corsHeaders } from './_shared/cors';

// Providers
import { OpenStreetMapDiscoveryProvider } from './providers/osm';
import { GooglePlacesDiscoveryProvider } from './providers/google';

// Pipeline Modules
import { validateIndianPhone } from './pipeline/phoneValidator';
import { normalizeBusinessName, isIdentifiableBusinessName, normalizeWebsite } from './pipeline/normalize';
import { checkDuplicate } from './pipeline/deduplicate';
import { resolveEntityMatch } from './pipeline/entityResolver';
import { scoreBusinessQuality } from './pipeline/qualityScorer';

// Geo
import { resolveCityToGeo } from './geo/resolver';
import { generateGridCells as genGridCells } from './geo/grid';

// Fetcher & Scoring
import { fetchAndExtractWebsite, WebsiteEvidence } from './fetcher';
import { calculateOpportunityScores } from './scoring/scoringEngine';

const BATCH_SIZE = 2; // Reduced from 5 to prevent CF Free Plan CPU timeout
const LOCK_TIMEOUT_MINUTES = 10;
const DISCOVER_COOLDOWN_HOURS = 8;

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
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'retry' | 'dead_letter';
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
  env: any,
) {
  const strategyId = task.payload.strategy_id as string;
  if (!strategyId) throw new Error('DISCOVER task has no strategy_id');

  await logEvent(supabase, task, 'discovery_started', 'Started discovery task');

  const { data: strategy, error: strategyError } = await supabase
    .from('strategies')
    .select('id, target_industries, target_countries, target_regions, target_cities')
    .eq('id', strategyId)
    .single();

  if (strategyError || !strategy) throw new Error(`Failed to load strategy: ${strategyError?.message}`);

  const city = (task.payload.city as string) || strategy.target_cities?.[0] || '';
  const country = (task.payload.country as string) || strategy.target_countries?.[0] || '';
  const industry = (task.payload.industry as string) || strategy.target_industries?.[0] || '';

  // Geo resolution
  let bbox = undefined;
  if (city && country) {
    const geo = await resolveCityToGeo(city, country);
    if (geo && geo.boundingbox) {
      bbox = geo.boundingbox;
      await logEvent(supabase, task, 'geo_resolved', `Resolved ${city} to bbox`, { bbox });
    }
  }

  const discoverOptions = { limit: 100, industry, city, country, boundingBox: bbox };
  
  const osmProvider = new OpenStreetMapDiscoveryProvider();
  const googleProvider = new GooglePlacesDiscoveryProvider(env.GOOGLE_MAPS_API_KEY);

  let candidates: any[] = [];
  
  // 1. Run OSM
  try {
    await logEvent(supabase, task, 'discovery_provider_request', `Requesting OSM for ${industry} in ${city}`);
    const osmResults = await osmProvider.discover(strategy, discoverOptions);
    candidates = candidates.concat(osmResults);
    await logEvent(supabase, task, 'discovery_results_received', `Received ${osmResults.length} from OSM`);
  } catch (err: any) {
    console.error('OSM provider error:', err);
    await logEvent(supabase, task, 'discovery_error', `OSM error: ${err.message}`, {}, 'error');
    throw err; // Fail task to trigger retry mechanism
  }

  // 2. Run Google
  try {
    await logEvent(supabase, task, 'discovery_provider_request', `Requesting Google Places for ${industry} in ${city}`);
    const googleResults = await googleProvider.discover(strategy, discoverOptions);
    candidates = candidates.concat(googleResults);
    await logEvent(supabase, task, 'discovery_results_received', `Received ${googleResults.length} from Google`);
  } catch (err: any) {
    console.error('Google provider error:', err);
    await logEvent(supabase, task, 'discovery_error', `Google error: ${err.message}`, {}, 'error');
  }

  // Save Candidates
  let savedCount = 0;
  for (const candidate of candidates) {
    const phoneNorm = candidate.phone ? validateIndianPhone(candidate.phone) : { valid: false };
    const pNormStr = phoneNorm.valid ? (phoneNorm as any).normalized : null;
    const nameNormStr = normalizeBusinessName(candidate.businessName);

    const { data: savedCandidate, error: saveError } = await supabase
      .from('discovery_candidates')
      .insert({
        job_id: task.job_id,
        strategy_id: strategyId,
        provider: candidate.provider,
        external_id: candidate.externalId,
        business_name: candidate.businessName,
        business_name_normalized: nameNormStr,
        website: normalizeWebsite(candidate.website),
        phone: candidate.phone,
        phone_normalized: pNormStr,
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
      if (!saveError.message.includes('duplicate key value')) {
        console.error(`Failed to save candidate: ${saveError.message}`);
        throw new Error(`Candidate insertion failed: ${saveError.message}`); // Fail task on true db error
      }
      continue;
    }

    savedCount++;
    
    if (candidate.status !== 'rejected') {
      await createNextTask(supabase, { ...task, candidate_id: savedCandidate.id }, 'validate');
    }
  }

  await logEvent(supabase, task, 'discovery_completed', `Saved ${savedCount} new candidates.`);
  
  // Stats update
  await supabase.rpc('update_crawler_job_status', { p_job_id: task.job_id });
}

async function processValidateTask(
  supabase: ReturnType<typeof createServiceClient>,
  task: CrawlerTask,
) {
  if (!task.candidate_id) throw new Error('No candidate ID for validate task');

  const { data: candidate, error } = await supabase
    .from('discovery_candidates')
    .select('*')
    .eq('id', task.candidate_id)
    .single();

  if (error || !candidate) throw new Error(`Failed to load candidate: ${error?.message}`);

  if (!isIdentifiableBusinessName(candidate.business_name)) {
    await supabase.from('discovery_candidates').update({ status: 'rejected', rejection_reason: 'missing_or_generic_business_name' }).eq('id', candidate.id);
    return;
  }

  const phoneRes = validateIndianPhone(candidate.phone);
  if (!phoneRes.valid && !candidate.website) {
    await supabase.from('discovery_candidates').update({ status: 'rejected', rejection_reason: 'missing_contact_info' }).eq('id', candidate.id);
    return;
  }

  await createNextTask(supabase, task, 'deduplicate');
}

async function processDeduplicateTask(
  supabase: ReturnType<typeof createServiceClient>,
  task: CrawlerTask,
) {
  if (!task.candidate_id) throw new Error('No candidate ID for deduplicate task');

  const { data: candidate } = await supabase
    .from('discovery_candidates')
    .select('*')
    .eq('id', task.candidate_id)
    .single();

  if (!candidate) throw new Error('Candidate not found');

  const dedupRes = await checkDuplicate(supabase, candidate);
  
  if (dedupRes.isDuplicate) {
    await logEvent(supabase, task, 'duplicate_detected', `Candidate rejected as duplicate: ${dedupRes.reason}`);
    await supabase.from('discovery_candidates').update({ status: 'duplicate', rejection_reason: dedupRes.reason }).eq('id', candidate.id);
    return;
  }

  await logEvent(supabase, task, 'deduplication_passed', 'Candidate passed deduplication.');

  const nextTaskType = candidate.website ? 'fetch_website' : 'finalize';
  await createNextTask(supabase, task, nextTaskType);
}

async function processFetchWebsiteTask(
  supabase: ReturnType<typeof createServiceClient>,
  task: CrawlerTask,
) {
  if (!task.candidate_id) throw new Error('FETCH_WEBSITE task has no candidate_id');

  const { data: candidate, error } = await supabase
    .from('discovery_candidates')
    .select('id, website, phone, business_name')
    .eq('id', task.candidate_id)
    .single();

  if (!error && candidate && !candidate.website) {
    await createNextTask(supabase, task, 'finalize');
    return;
  }

  if (error || !candidate) throw new Error(`Failed to load candidate: ${error?.message}`);

  const evidence = await fetchAndExtractWebsite(candidate.website);

  await supabase.from('prospect_website_crawls').insert({
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
      hasForm: evidence.hasForm,
    },
  });

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

  const { data: crawls } = await supabase
    .from('prospect_website_crawls')
    .select('*')
    .eq('candidate_id', candidate.id)
    .order('created_at', { ascending: false })
    .limit(1);

  const crawl = crawls && crawls.length > 0 ? crawls[0] : null;

  // 1. Ensure valid phone
  let validPhone: string | null = candidate.phone_normalized;
  if (!validPhone && crawl?.contact_data?.phones && Array.isArray(crawl.contact_data.phones)) {
    for (const p of crawl.contact_data.phones) {
      const pRes = validateIndianPhone(p);
      if (pRes.valid) {
        validPhone = pRes.normalized;
        break;
      }
    }
  }

  if (!validPhone) {
    await supabase.from('discovery_candidates').update({ status: 'rejected', rejection_reason: 'missing_business_phone' }).eq('id', candidate.id);
    return;
  }

  // 2. Score Business Quality
  const websiteFetchSuccess = crawl ? (crawl.extraction_status === 'completed' && crawl.status_code < 400) : undefined;
  const quality = scoreBusinessQuality(candidate, websiteFetchSuccess);

  await supabase.from('discovery_candidates').update({ quality_score: quality.score, quality_signals: quality.signals }).eq('id', candidate.id);

  if (quality.tier === 'low') {
    await supabase.from('discovery_candidates').update({ status: 'rejected', rejection_reason: 'low_quality_score' }).eq('id', candidate.id);
    return;
  }

  // 3. Create Prospect
  const { data: prospect, error: prospectError } = await supabase
    .from('prospects')
    .insert({
      strategy_id: candidate.strategy_id,
      business_name: candidate.business_name,
      website: candidate.website,
      phone: validPhone,
      email: candidate.email,
      address_line: candidate.address,
      city: candidate.city,
      state_region: candidate.state_region,
      postal_code: candidate.postal_code,
      country: candidate.country,
      industry: candidate.industry,
      has_website: !!candidate.website,
      has_social_presence: crawl && crawl.social_links && Object.keys(crawl.social_links).length > 0 ? true : false,
      status: 'discovered',
      quality_score: quality.score,
      quality_tier: quality.tier,
      google_place_id: candidate.google_place_id,
      business_status: candidate.raw_data?.businessStatus || null,
    })
    .select('id')
    .single();

  if (prospectError) throw new Error(`Failed to create prospect: ${prospectError.message}`);

  await supabase.from('prospect_sources').insert({
    prospect_id: prospect.id,
    source_type: candidate.provider,
    source_url: '',
    source_data: { external_id: candidate.external_id, candidate_id: candidate.id, raw_data: candidate.raw_data },
  });

  await supabase.from('discovery_candidates').update({ status: 'accepted', prospect_id: prospect.id }).eq('id', candidate.id);
  await createNextTask(supabase, task, 'score');
}

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

  if (!candidate || !candidate.prospect_id) throw new Error('Candidate not found or missing prospect_id');

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

  if (candidate.latitude && candidate.longitude) {
    addSignal('data_quality', 'verified_location', 'high', { provider: candidate.provider, latitude: candidate.latitude, longitude: candidate.longitude, source: 'geocoded_coordinates' });
  }
  if (candidate.phone) {
    addSignal('data_quality', 'valid_phone', 'high', { phone: candidate.phone, source: 'discovery_provider' });
  }
  if (candidate.website) {
    addSignal('data_quality', 'website_discovered', 'high', { url: candidate.website, source: 'discovery_provider' });
  }

  if (!candidate.website) {
    addSignal('web', 'no_website', 'high', { reason: 'No website URL provided during discovery', website_present: false });
  } else if (!crawl) {
    addSignal('web', 'website_unreachable', 'medium', { reason: 'No crawl records recorded for provided URL', url: candidate.website });
  } else {
    if (crawl.extraction_status === 'failed' || !crawl.status_code) {
      addSignal('web', 'website_unreachable', 'high', { error: crawl.error_message || 'HTTP request failed or timed out', final_url: crawl.final_url || crawl.original_url });
    } else if (crawl.status_code >= 400) {
      addSignal('web', 'website_http_error', 'high', { status_code: crawl.status_code, error: crawl.error_message, url: crawl.final_url || crawl.original_url });
    }

    if (crawl.extraction_status === 'skipped' && crawl.content_type && !crawl.content_type.toLowerCase().includes('text/html')) {
      addSignal('web', 'non_html_site', 'high', { content_type: crawl.content_type, url: crawl.final_url || crawl.original_url });
    }

    if (!crawl.is_https) {
      addSignal('web', 'no_https', 'high', { protocol: crawl.final_url ? new URL(crawl.final_url).protocol : 'http:', is_https: false, url: crawl.final_url || crawl.original_url });
    }

    if (!crawl.extracted_title) {
      addSignal('seo', 'meta_title_missing', 'high', { tag: '<title>', found: false, page_size_bytes: crawl.response_size });
    } else {
      addSignal('seo', 'meta_title_present', 'high', { title: crawl.extracted_title, length: crawl.extracted_title.length });
    }

    if (!crawl.extracted_description) {
      addSignal('seo', 'meta_description_missing', 'high', { tag: 'meta[name="description"]', found: false });
    } else {
      addSignal('seo', 'meta_description_present', 'high', { description: crawl.extracted_description, length: crawl.extracted_description.length });
    }

    if (crawl.extracted_canonical) {
      addSignal('seo', 'canonical_present', 'high', { canonical_url: crawl.extracted_canonical });
    }

    if (!crawl.json_ld || crawl.json_ld.length === 0) {
      addSignal('seo', 'structured_data_missing', 'high', { tag: 'script[type="application/ld+json"]', found: 0 });
    } else {
      addSignal('seo', 'structured_data_present', 'high', { count: crawl.json_ld.length, types: crawl.json_ld.map((item: any) => item['@type']).filter(Boolean) });
    }

    const socialLinks = crawl.social_links || {};
    const platformKeys = Object.keys(socialLinks);
    if (platformKeys.length === 0) {
      addSignal('marketing', 'social_presence_missing', 'high', { checked_platforms: ['facebook', 'instagram', 'linkedin', 'twitter', 'youtube', 'tiktok'], found_count: 0 });
    } else {
      addSignal('marketing', 'social_presence_detected', 'high', { platforms: platformKeys, count: platformKeys.length, links: socialLinks });
    }

    const contactData = crawl.contact_data || {};
    if (contactData.emails && contactData.emails.length > 0) {
      addSignal('marketing', 'email_present', 'high', { emails: contactData.emails, count: contactData.emails.length });
    }
    if (contactData.phones && contactData.phones.length > 0) {
      addSignal('marketing', 'phone_present', 'high', { phones: contactData.phones, count: contactData.phones.length });
    }

    const meta = crawl.additional_metadata || {};
    if (!meta.viewport) {
      addSignal('design', 'mobile_viewport_missing', 'high', { tag: 'meta[name="viewport"]', found: false });
    } else {
      addSignal('design', 'mobile_viewport_present', 'high', { viewport: meta.viewport });
    }

    if (!meta.ogImage) {
      addSignal('design', 'og_image_missing', 'high', { tag: 'meta[property="og:image"]', found: false });
    } else {
      addSignal('design', 'og_image_present', 'high', { og_image: meta.ogImage });
    }

    if (meta.hasNav || meta.hasHeader || meta.hasMain || meta.hasFooter || meta.hasForm) {
      addSignal('design', 'page_structure_detected', 'high', { has_nav: !!meta.hasNav, has_header: !!meta.hasHeader, has_main: !!meta.hasMain, has_footer: !!meta.hasFooter, has_form: !!meta.hasForm });
    } else {
      addSignal('design', 'minimal_content', 'medium', { reason: 'No semantic HTML5 layout tags (nav, header, main, footer, form) detected' });
    }
  }

  if (signals.length > 0) {
    const { error: upsertError } = await supabase
      .from('prospect_opportunity_signals')
      .upsert(signals, { onConflict: 'prospect_id, category, signal_key' });
    if (upsertError) throw new Error(`Failed to save signals: ${upsertError.message}`);
  }

  const { data: prospect, error: prospectFetchError } = await supabase
    .from('prospects')
    .select('*')
    .eq('id', prospectId)
    .single();

  if (prospectFetchError || !prospect) throw new Error(`Failed to load prospect for scoring`);

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

  const scoringResult = calculateOpportunityScores(signals, scoringContext);

  const { error: scoreUpsertError } = await supabase.from('prospect_opportunity_scores').upsert(
    {
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
    },
    { onConflict: 'prospect_id, scoring_version' },
  );

  if (scoreUpsertError) throw new Error(`Failed to save prospect opportunity scores`);

  const prospectStatus = scoringResult.sales_priority === 'low' ? 'rejected' : 'ready_for_call';

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
      status: prospectStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', prospectId);

  if (updateProspectError) throw new Error(`Failed to update prospect opportunity fields`);
}

async function processTask(supabase: ReturnType<typeof createServiceClient>, task: CrawlerTask, env: any) {
  switch (task.task_type) {
    case 'discover':
      return processDiscoverTask(supabase, task, env);
    case 'validate':
      return processValidateTask(supabase, task);
    case 'deduplicate':
      return processDeduplicateTask(supabase, task);
    case 'fetch_website':
      return processFetchWebsiteTask(supabase, task);
    case 'finalize':
      return processFinalizeTask(supabase, task);
    case 'score':
      return processScoreTask(supabase, task);
    case 'extract': // Deprecated, mapped to dedup
      return createNextTask(supabase, task, 'deduplicate');
    default:
      throw new Error(`Unknown task type: ${task.task_type}`);
  }
}

async function claimTasks(supabase: ReturnType<typeof createServiceClient>) {
  const worker = workerId();

  const { data: abandonedTasks } = await supabase
    .from('crawler_tasks')
    .select('id, attempts, max_attempts')
    .eq('status', 'processing')
    .lt('locked_at', new Date(Date.now() - LOCK_TIMEOUT_MINUTES * 60 * 1000).toISOString());

  if (abandonedTasks && abandonedTasks.length > 0) {
    for (const t of abandonedTasks) {
      const shouldRetry = t.attempts < t.max_attempts;
      await supabase
        .from('crawler_tasks')
        .update({
          status: shouldRetry ? 'retry' : 'failed',
          available_at: shouldRetry
            ? new Date(Date.now() + Math.min(30_000 * Math.pow(2, t.attempts), 600_000)).toISOString()
            : new Date().toISOString(),
          locked_at: null,
          locked_by: null,
          last_error: 'Recovered after worker lock timeout',
        })
        .eq('id', t.id);
    }
  }

  const { data, error } = await supabase.rpc('claim_crawler_tasks', {
    p_batch_size: BATCH_SIZE,
    p_worker_id: worker,
  });

  if (error) throw new Error(`Failed to claim crawler tasks: ${error.message}`);
  return (data || []) as CrawlerTask[];
}

async function completeTask(supabase: ReturnType<typeof createServiceClient>, task: CrawlerTask) {
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
      status: shouldRetry ? 'retry' : 'dead_letter',
      available_at: shouldRetry
        ? new Date(Date.now() + Math.min(30_000 * Math.pow(2, task.attempts), 600_000)).toISOString()
        : new Date().toISOString(),
      last_error: message,
      locked_at: null,
      locked_by: null,
    })
    .eq('id', task.id);
}

async function scheduleActiveStrategies(supabase: ReturnType<typeof createServiceClient>) {
  const { data: strategies, error: stratError } = await supabase
    .from('strategies')
    .select('id, name, target_industries, target_cities, target_countries')
    .eq('status', 'active');

  if (stratError || !strategies?.length) return 0;

  const cutoff = new Date(Date.now() - DISCOVER_COOLDOWN_HOURS * 60 * 60 * 1000).toISOString();
  let queued = 0;

  for (const strategy of strategies) {
    const { data: activeJobs } = await supabase
      .from('crawler_jobs')
      .select('id')
      .eq('strategy_id', strategy.id)
      .in('status', ['pending', 'processing'])
      .limit(1);

    if (activeJobs && activeJobs.length > 0) continue;

    const { data: completedJobs } = await supabase
      .from('crawler_jobs')
      .select('id')
      .eq('strategy_id', strategy.id)
      .gte('completed_at', cutoff)
      .limit(1);

    if (completedJobs && completedJobs.length > 0) continue;

    const { data: job, error: jobError } = await supabase
      .from('crawler_jobs')
      .insert({ strategy_id: strategy.id, status: 'pending' })
      .select('id')
      .single();

    if (jobError || !job) continue;

    const industries = strategy.target_industries?.length ? strategy.target_industries : [''];
    const cities = strategy.target_cities?.length ? strategy.target_cities : [''];
    const country = strategy.target_countries?.[0] || '';

    const tasksToInsert = [];
    for (const industry of industries) {
      for (const city of cities) {
        tasksToInsert.push({
          job_id: job.id,
          task_type: 'discover',
          status: 'pending',
          priority: 50,
          payload: { strategy_id: strategy.id, auto_scheduled: true, industry, city, country },
        });
      }
    }

    if (tasksToInsert.length > 0) {
      await supabase.from('crawler_tasks').insert(tasksToInsert);
      queued += tasksToInsert.length;
    }
  }

  return queued;
}

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  SUPABASE_SECRET_KEYS: string;
  GOOGLE_MAPS_API_KEY?: string;
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const token = authHeader.slice(7).trim();
    const rawSecretKeys = env.SUPABASE_SECRET_KEYS ?? '';
    const secretKeys = rawSecretKeys.split(',').map((k) => k.trim()).filter(Boolean);

    let isAuthorized = false;
    if (secretKeys.includes(token)) {
      isAuthorized = true;
    } else {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payloadJson = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
          const payload = JSON.parse(payloadJson);
          if (payload.role === 'service_role') isAuthorized = true;
        }
      } catch {}
    }

    if (!isAuthorized) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const supabase = createServiceClient(env);
    const tasks = await claimTasks(supabase);

    if (!tasks.length) {
      const queued = await scheduleActiveStrategies(supabase);
      return new Response(JSON.stringify({ success: true, auto_scheduled: queued }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let successful = 0;
    let failed = 0;

    for (const task of tasks) {
      try {
        await processTask(supabase, task, env);
        await completeTask(supabase, task);
        await supabase.rpc('update_crawler_job_status', { p_job_id: task.job_id });
        successful++;
      } catch (error) {
        failed++;
        await failTask(supabase, task, error);
      }
    }

    return new Response(JSON.stringify({ success: true, claimed: tasks.length, successful, failed }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : String(error) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  }
};
