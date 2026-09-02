const { supabase } = require('./scratch_db');

/**
 * PHASE 4B.2 RE-VERIFICATION SCRIPT
 * 
 * Root Cause of Discrepancy:
 * The original controlled test hardcoded latitude/longitude/provider='osm'
 * for ALL 8 prospects in runProductionScoreWorkflow(), including the
 * Ghost Listing (case 8). This falsely inflated Ghost Listing's DQ from
 * 25 (correct: insufficient) to 65 (false: partial), changing its
 * sales_priority from 'medium' (correct) to 'high' (incorrect).
 *
 * This script:
 *  1. Creates all 8 prospects with correct per-prospect context
 *  2. Scores them with corrected context (no hardcoded lat/lon for ghost)
 *  3. Persists to both prospect_opportunity_scores and prospects
 *  4. Independently re-derives expected priority from rules
 *  5. Verifies database consistency
 *  6. Re-runs idempotency test
 *  7. Cleans up
 */

// ============================================================================
// AUTHORITATIVE SCORING ENGINE (JS mirror of lib/scoring/scoringEngine.ts)
// ============================================================================
const SCORING_CONFIG_V1 = {
  version: 'deterministic-v1',
  web: { no_website_base: 90, website_unreachable_base: 85, website_http_error_base: 75, non_html_site_base: 80, broken_site_no_https_addon: 5, broken_site_cap: 90, working_site_base: 5, working_no_https: 25, working_mobile_viewport_missing: 30, working_minimal_content: 25, working_site_cap: 70 },
  seo: { no_website_seo_score: 0, unreachable_website_seo_score: 0, missing_title: 35, missing_description: 25, missing_structured_data: 20, missing_canonical: 10, weak_title_short: 15, weak_description_short: 10, max_cap: 100 },
  marketing: { no_website_base: 40, missing_social: 40, single_social_channel: 15, missing_email_capture: 15, missing_phone_on_page: 10, missing_lead_form: 15, max_cap: 100 },
  design: { no_website_design_score: 0, unreachable_website_design_score: 0, missing_mobile_viewport: 45, minimal_content_layout: 30, missing_og_image: 15, max_cap: 100 },
  synthesis: { primary_need_weight: 0.70, secondary_synergy_weight: 0.30 },
  data_quality: { verified_location_weight: 40, valid_phone_weight: 35, identity_provenance_weight: 25, verified_min_score: 70, partial_min_score: 40 },
  sales_priority: { very_high_min_score: 75, high_min_score: 50, medium_min_score: 25, low_max_score: 24 },
};

function clamp(val, min = 0, max = 100) { return Math.min(Math.max(val, min), max); }

function calculateOpportunityScores(signals, context = {}) {
  const cfg = SCORING_CONFIG_V1;
  const findSig = (cat, key) => signals.find(s => s.category === cat && s.signal_key === key);
  const hasSig = (cat, key) => !!findSig(cat, key);

  // WEB
  let webScore = 0;
  const noWebSig = findSig('web', 'no_website');
  const unreachableSig = findSig('web', 'website_unreachable');
  const httpErrSig = findSig('web', 'website_http_error');
  const noHttpsSig = findSig('web', 'no_https');

  if (noWebSig || context.has_website === false || (context.website === null && !unreachableSig && !httpErrSig)) {
    webScore = cfg.web.no_website_base;
  } else if (unreachableSig) {
    webScore = cfg.web.website_unreachable_base + (noHttpsSig ? cfg.web.broken_site_no_https_addon : 0);
    webScore = Math.min(webScore, cfg.web.broken_site_cap);
  } else if (httpErrSig) {
    webScore = cfg.web.website_http_error_base;
  } else {
    let raw = cfg.web.working_site_base;
    if (noHttpsSig) raw += cfg.web.working_no_https;
    if (findSig('design', 'mobile_viewport_missing')) raw += cfg.web.working_mobile_viewport_missing;
    if (findSig('design', 'minimal_content')) raw += cfg.web.working_minimal_content;
    webScore = Math.min(raw, cfg.web.working_site_cap);
  }
  webScore = clamp(webScore);

  // SEO
  let seoScore = 0;
  const isNoWeb = noWebSig || context.has_website === false || context.website === null;
  const isUnreachable = unreachableSig || httpErrSig;
  if (!isNoWeb && !isUnreachable) {
    if (findSig('seo', 'meta_title_missing')) seoScore += cfg.seo.missing_title;
    if (findSig('seo', 'meta_description_missing')) seoScore += cfg.seo.missing_description;
    if (findSig('seo', 'structured_data_missing')) seoScore += cfg.seo.missing_structured_data;
    if (!findSig('seo', 'canonical_present')) seoScore += cfg.seo.missing_canonical;
  }
  seoScore = clamp(seoScore);

  // MARKETING
  let marketingScore = 0;
  if (isNoWeb) {
    marketingScore = cfg.marketing.no_website_base;
  } else {
    if (findSig('marketing', 'social_presence_missing')) marketingScore += cfg.marketing.missing_social;
    if (!findSig('marketing', 'email_present')) marketingScore += cfg.marketing.missing_email_capture;
    if (!findSig('marketing', 'phone_present') && !context.phone) marketingScore += cfg.marketing.missing_phone_on_page;
  }
  marketingScore = clamp(marketingScore);

  // DESIGN
  let designScore = 0;
  if (!isNoWeb && !isUnreachable) {
    if (findSig('design', 'mobile_viewport_missing')) designScore += cfg.design.missing_mobile_viewport;
    if (findSig('design', 'minimal_content')) designScore += cfg.design.minimal_content_layout;
    if (findSig('design', 'og_image_missing')) designScore += cfg.design.missing_og_image;
  }
  designScore = clamp(designScore);

  // DATA QUALITY
  let dq = 0;
  const hasLoc = hasSig('data_quality', 'verified_location') || (!!context.latitude && !!context.longitude);
  const hasPhone = hasSig('data_quality', 'valid_phone') || !!context.phone;
  const hasIdent = (!!context.business_name && context.business_name.length > 2) || (context.provider === 'osm');
  if (hasLoc) dq += cfg.data_quality.verified_location_weight;
  if (hasPhone) dq += cfg.data_quality.valid_phone_weight;
  if (hasIdent) dq += cfg.data_quality.identity_provenance_weight;
  const dqScore = clamp(dq);
  let dqTier = 'insufficient';
  if (dqScore >= cfg.data_quality.verified_min_score) dqTier = 'verified';
  else if (dqScore >= cfg.data_quality.partial_min_score) dqTier = 'partial';

  // SYNTHESIS
  const dims = [
    { name: 'web', score: webScore },
    { name: 'seo', score: seoScore },
    { name: 'marketing', score: marketingScore },
    { name: 'design', score: designScore }
  ].sort((a, b) => b.score - a.score);
  const primary = dims[0];
  const secondaryAvg = (dims[1].score + dims[2].score + dims[3].score) / 3;
  const overallScore = clamp(Math.round(cfg.synthesis.primary_need_weight * primary.score + cfg.synthesis.secondary_synergy_weight * secondaryAvg));

  // SALES PRIORITY
  let priority = 'low';
  let gated = false;
  let gateReason = undefined;
  if (overallScore >= cfg.sales_priority.very_high_min_score) {
    if (dqTier === 'verified') priority = 'very_high';
    else if (dqTier === 'partial') { priority = 'high'; gated = true; gateReason = 'Gated from very_high to high (partial verification).'; }
    else { priority = 'medium'; gated = true; gateReason = 'Gated from very_high to medium (insufficient data).'; }
  } else if (overallScore >= cfg.sales_priority.high_min_score) {
    if (dqTier === 'insufficient') { priority = 'medium'; gated = true; gateReason = 'Gated from high to medium (insufficient data).'; }
    else priority = 'high';
  } else if (overallScore >= cfg.sales_priority.medium_min_score) {
    priority = 'medium';
  }

  const explanation = {
    scoring_version: 'deterministic-v1',
    dimensions: {
      web: { score: webScore },
      seo: { score: seoScore },
      marketing: { score: marketingScore },
      design: { score: designScore }
    },
    synthesis: {
      primary_dimension: primary.name,
      primary_dimension_score: primary.score,
      secondary_dimensions_average: Number(secondaryAvg.toFixed(2)),
      synthesis_formula: `round(0.70 * ${primary.name}(${primary.score}) + 0.30 * secondary_avg(${secondaryAvg.toFixed(1)}))`,
      calculated_overall_score: overallScore
    },
    data_quality: { score: dqScore, tier: dqTier, has_location: hasLoc, has_phone: hasPhone, has_identity: hasIdent },
    sales_priority_rationale: { priority, gated, gate_reason: gateReason }
  };

  return {
    opportunity_web: webScore,
    opportunity_seo: seoScore,
    opportunity_marketing: marketingScore,
    opportunity_design: designScore,
    opportunity_score: overallScore,
    data_quality_score: dqScore,
    sales_priority: priority,
    explanation,
    scoring_version: 'deterministic-v1'
  };
}

// ============================================================================
// INDEPENDENT PRIORITY RE-DERIVATION (for audit cross-check)
// ============================================================================
function independentlyDerivePriority(opportunityScore, dqScore) {
  let dqTier = 'insufficient';
  if (dqScore >= 70) dqTier = 'verified';
  else if (dqScore >= 40) dqTier = 'partial';

  if (opportunityScore >= 75) {
    if (dqTier === 'verified') return { expected: 'very_high', gated: false };
    if (dqTier === 'partial') return { expected: 'high', gated: true };
    return { expected: 'medium', gated: true };
  }
  if (opportunityScore >= 50) {
    if (dqTier === 'insufficient') return { expected: 'medium', gated: true };
    return { expected: 'high', gated: false };
  }
  if (opportunityScore >= 25) return { expected: 'medium', gated: false };
  return { expected: 'low', gated: false };
}

// ============================================================================
// TEST CASES — with CORRECT per-prospect context
// ============================================================================
const strategyId = '65cd0c42-c074-493b-b83f-48e49872eb30';

const testCases = [
  {
    name: '1. No Website (Verified Local Clinic)',
    prospectData: { business_name: 'Verify-Ctrl 1 No-Web Clinic', website: null, has_website: false, phone: '+14155551001' },
    // CORRECT context: verified location, phone, osm provider
    context: { latitude: 37.77, longitude: -122.41, provider: 'osm' },
    signals: [
      { category: 'data_quality', signal_key: 'verified_location', confidence: 'high', evidence: { lat: 37.77, lon: -122.41 } },
      { category: 'data_quality', signal_key: 'valid_phone', confidence: 'high', evidence: { phone: '+14155551001' } },
      { category: 'web', signal_key: 'no_website', confidence: 'high', evidence: { reason: 'No website URL' } }
    ]
  },
  {
    name: '2. Modern Website (Excellent Cloud Corp)',
    prospectData: { business_name: 'Verify-Ctrl 2 Modern Cloud Corp', website: 'https://prod-modern.com', has_website: true, phone: '+14155551002' },
    context: { latitude: 37.78, longitude: -122.42, provider: 'osm' },
    signals: [
      { category: 'data_quality', signal_key: 'verified_location', confidence: 'high', evidence: {} },
      { category: 'data_quality', signal_key: 'valid_phone', confidence: 'high', evidence: {} },
      { category: 'seo', signal_key: 'canonical_present', confidence: 'high', evidence: {} },
      { category: 'marketing', signal_key: 'social_presence_detected', confidence: 'high', evidence: { count: 3 } },
      { category: 'marketing', signal_key: 'email_present', confidence: 'high', evidence: {} },
      { category: 'marketing', signal_key: 'phone_present', confidence: 'high', evidence: {} },
      { category: 'design', signal_key: 'mobile_viewport_present', confidence: 'high', evidence: {} },
      { category: 'design', signal_key: 'og_image_present', confidence: 'high', evidence: {} },
    ]
  },
  {
    name: '3. Broken Website (Unreachable Domain Diner)',
    prospectData: { business_name: 'Verify-Ctrl 3 Broken Diner', website: 'http://prod-broken.com', has_website: true, phone: '+14155551003' },
    context: { latitude: 37.75, longitude: -122.40, provider: 'osm' },
    signals: [
      { category: 'data_quality', signal_key: 'verified_location', confidence: 'high', evidence: {} },
      { category: 'data_quality', signal_key: 'valid_phone', confidence: 'high', evidence: {} },
      { category: 'web', signal_key: 'website_unreachable', confidence: 'high', evidence: { error: 'ERR_CONNECTION_REFUSED' } },
      { category: 'web', signal_key: 'no_https', confidence: 'high', evidence: {} }
    ]
  },
  {
    name: '4. Weak SEO (Downtown Law Firm)',
    prospectData: { business_name: 'Verify-Ctrl 4 Law Firm', website: 'https://prod-weak-seo.com', has_website: true, phone: '+14155551004' },
    context: { latitude: 37.76, longitude: -122.43, provider: 'osm' },
    signals: [
      { category: 'data_quality', signal_key: 'verified_location', confidence: 'high', evidence: {} },
      { category: 'data_quality', signal_key: 'valid_phone', confidence: 'high', evidence: {} },
      { category: 'seo', signal_key: 'meta_title_missing', confidence: 'high', evidence: {} },
      { category: 'seo', signal_key: 'meta_description_missing', confidence: 'high', evidence: {} },
      { category: 'seo', signal_key: 'structured_data_missing', confidence: 'high', evidence: {} },
      { category: 'marketing', signal_key: 'email_present', confidence: 'high', evidence: {} },
      { category: 'design', signal_key: 'mobile_viewport_present', confidence: 'high', evidence: {} }
    ]
  },
  {
    name: '5. Weak Design (Outdated Architecture Co)',
    prospectData: { business_name: 'Verify-Ctrl 5 Outdated Arch', website: 'https://prod-weak-design.com', has_website: true, phone: '+14155551005' },
    context: { latitude: 37.79, longitude: -122.41, provider: 'osm' },
    signals: [
      { category: 'data_quality', signal_key: 'verified_location', confidence: 'high', evidence: {} },
      { category: 'data_quality', signal_key: 'valid_phone', confidence: 'high', evidence: {} },
      { category: 'design', signal_key: 'mobile_viewport_missing', confidence: 'high', evidence: {} },
      { category: 'design', signal_key: 'minimal_content', confidence: 'high', evidence: {} },
      { category: 'design', signal_key: 'og_image_missing', confidence: 'high', evidence: {} },
      { category: 'seo', signal_key: 'canonical_present', confidence: 'high', evidence: {} }
    ]
  },
  {
    name: '6. Weak Marketing (Artisanal Bakery)',
    prospectData: { business_name: 'Verify-Ctrl 6 Bakery', website: 'https://prod-weak-mkt.com', has_website: true, phone: '+14155551006' },
    context: { latitude: 37.74, longitude: -122.45, provider: 'osm' },
    signals: [
      { category: 'data_quality', signal_key: 'verified_location', confidence: 'high', evidence: {} },
      { category: 'data_quality', signal_key: 'valid_phone', confidence: 'high', evidence: {} },
      { category: 'marketing', signal_key: 'social_presence_missing', confidence: 'high', evidence: {} },
      { category: 'design', signal_key: 'mobile_viewport_present', confidence: 'high', evidence: {} },
      { category: 'seo', signal_key: 'canonical_present', confidence: 'high', evidence: {} }
    ]
  },
  {
    name: '7. Multi-Service Opportunity (Multi-Flaw Consulting)',
    prospectData: { business_name: 'Verify-Ctrl 7 Multi-Flaw', website: 'http://prod-multi-flaw.com', has_website: true, phone: '+14155551007' },
    context: { latitude: 37.77, longitude: -122.42, provider: 'osm' },
    signals: [
      { category: 'data_quality', signal_key: 'verified_location', confidence: 'high', evidence: {} },
      { category: 'data_quality', signal_key: 'valid_phone', confidence: 'high', evidence: {} },
      { category: 'web', signal_key: 'no_https', confidence: 'high', evidence: {} },
      { category: 'seo', signal_key: 'meta_title_missing', confidence: 'high', evidence: {} },
      { category: 'seo', signal_key: 'meta_description_missing', confidence: 'high', evidence: {} },
      { category: 'seo', signal_key: 'structured_data_missing', confidence: 'high', evidence: {} },
      { category: 'design', signal_key: 'mobile_viewport_missing', confidence: 'high', evidence: {} },
      { category: 'design', signal_key: 'minimal_content', confidence: 'high', evidence: {} },
      { category: 'design', signal_key: 'og_image_missing', confidence: 'high', evidence: {} },
      { category: 'marketing', signal_key: 'social_presence_missing', confidence: 'high', evidence: {} }
    ]
  },
  {
    name: '8. Insufficient Business Evidence (Ghost Listing)',
    prospectData: { business_name: 'Verify-Ctrl 8 Ghost Listing', website: null, has_website: false, phone: null },
    // CRITICAL FIX: Ghost listing has NO verified location, NO phone, NO osm provider
    context: { latitude: null, longitude: null, provider: null },
    signals: [
      { category: 'web', signal_key: 'no_website', confidence: 'high', evidence: { reason: 'No website' } }
    ]
  }
];

async function runVerification() {
  console.log('================================================================');
  console.log('PHASE 4B.2 RE-VERIFICATION: ALL 8 PROSPECTS');
  console.log('Corrected context for Ghost Listing (Case 8)');
  console.log('================================================================\n');

  const createdIds = [];
  const results = [];

  for (const tc of testCases) {
    console.log(`\n--- ${tc.name} ---`);

    // Create prospect
    const { data: p, error: pErr } = await supabase.from('prospects').insert({
      strategy_id: strategyId,
      ...tc.prospectData,
      status: 'discovered'
    }).select().single();
    if (pErr) { console.error('Create failed:', pErr); continue; }
    createdIds.push(p.id);

    // Insert signals
    const signalsWithPid = tc.signals.map(s => ({ ...s, prospect_id: p.id }));
    if (signalsWithPid.length > 0) {
      await supabase.from('prospect_opportunity_signals').insert(signalsWithPid);
    }

    // Build full scoring context (merging prospect data + per-case context)
    const fullContext = {
      prospect_id: p.id,
      business_name: p.business_name,
      website: p.website,
      has_website: p.has_website,
      phone: p.phone,
      latitude: tc.context.latitude,
      longitude: tc.context.longitude,
      provider: tc.context.provider,
    };

    // Run scoring
    const res = calculateOpportunityScores(signalsWithPid, fullContext);

    // Independently verify priority
    const independent = independentlyDerivePriority(res.opportunity_score, res.data_quality_score);
    const priorityMatch = res.sales_priority === independent.expected;

    console.log(`  Web=${res.opportunity_web} SEO=${res.opportunity_seo} Mkt=${res.opportunity_marketing} Des=${res.opportunity_design}`);
    console.log(`  Overall=${res.opportunity_score} DQ=${res.data_quality_score} (tier=${res.explanation.data_quality.tier})`);
    console.log(`  Engine Priority=${res.sales_priority} | Independent Derivation=${independent.expected} | Gated=${independent.gated}`);
    console.log(`  Priority Cross-Check: ${priorityMatch ? 'MATCH' : '*** MISMATCH ***'}`);

    // Persist to prospect_opportunity_scores
    const { error: scoreErr } = await supabase.from('prospect_opportunity_scores').upsert({
      prospect_id: p.id,
      opportunity_web: res.opportunity_web,
      opportunity_seo: res.opportunity_seo,
      opportunity_marketing: res.opportunity_marketing,
      opportunity_design: res.opportunity_design,
      opportunity_score: res.opportunity_score,
      data_quality_score: res.data_quality_score,
      sales_priority: res.sales_priority,
      explanation: res.explanation,
      scoring_version: res.scoring_version,
      calculated_at: new Date().toISOString()
    }, { onConflict: 'prospect_id, scoring_version' });
    if (scoreErr) { console.error('Score upsert failed:', scoreErr); continue; }

    // Update prospects table
    const { error: updateErr } = await supabase.from('prospects').update({
      opportunity_web: res.opportunity_web,
      opportunity_seo: res.opportunity_seo,
      opportunity_marketing: res.opportunity_marketing,
      opportunity_design: res.opportunity_design,
      opportunity_score: res.opportunity_score,
      data_quality_score: res.data_quality_score,
      sales_priority: res.sales_priority,
      updated_at: new Date().toISOString()
    }).eq('id', p.id);
    if (updateErr) { console.error('Prospect update failed:', updateErr); continue; }

    // Verify database consistency
    const { data: pRow } = await supabase.from('prospects').select('*').eq('id', p.id).single();
    const { data: sRow } = await supabase.from('prospect_opportunity_scores').select('*').eq('prospect_id', p.id).single();

    const dbConsistent =
      pRow.opportunity_web === sRow.opportunity_web &&
      pRow.opportunity_seo === sRow.opportunity_seo &&
      pRow.opportunity_marketing === sRow.opportunity_marketing &&
      pRow.opportunity_design === sRow.opportunity_design &&
      pRow.opportunity_score === sRow.opportunity_score &&
      pRow.data_quality_score === sRow.data_quality_score &&
      pRow.sales_priority === sRow.sales_priority &&
      sRow.scoring_version === 'deterministic-v1';

    console.log(`  DB prospects.sales_priority = '${pRow.sales_priority}'`);
    console.log(`  DB scores.sales_priority    = '${sRow.sales_priority}'`);
    console.log(`  DB scores.scoring_version   = '${sRow.scoring_version}'`);
    console.log(`  DB Consistency: ${dbConsistent ? 'PERFECT MATCH' : '*** MISMATCH ***'}`);

    results.push({
      name: tc.name,
      web: res.opportunity_web,
      seo: res.opportunity_seo,
      mkt: res.opportunity_marketing,
      des: res.opportunity_design,
      overall: res.opportunity_score,
      dq: res.data_quality_score,
      dqTier: res.explanation.data_quality.tier,
      enginePriority: res.sales_priority,
      independentPriority: independent.expected,
      priorityMatch,
      gated: independent.gated,
      dbConsistent,
      dbPriority_prospects: pRow.sales_priority,
      dbPriority_scores: sRow.sales_priority,
    });
  }

  // Idempotency check on prospect 1
  console.log('\n--- Idempotency Check (re-scoring prospect 1) ---');
  const pid1 = createdIds[0];
  const { data: sig1 } = await supabase.from('prospect_opportunity_signals').select('*').eq('prospect_id', pid1);
  const { data: p1 } = await supabase.from('prospects').select('*').eq('id', pid1).single();
  const reScore = calculateOpportunityScores(sig1, {
    prospect_id: p1.id, business_name: p1.business_name, website: p1.website,
    has_website: p1.has_website, phone: p1.phone,
    latitude: testCases[0].context.latitude, longitude: testCases[0].context.longitude,
    provider: testCases[0].context.provider,
  });
  await supabase.from('prospect_opportunity_scores').upsert({
    prospect_id: pid1,
    opportunity_web: reScore.opportunity_web, opportunity_seo: reScore.opportunity_seo,
    opportunity_marketing: reScore.opportunity_marketing, opportunity_design: reScore.opportunity_design,
    opportunity_score: reScore.opportunity_score, data_quality_score: reScore.data_quality_score,
    sales_priority: reScore.sales_priority, explanation: reScore.explanation,
    scoring_version: reScore.scoring_version, calculated_at: new Date().toISOString()
  }, { onConflict: 'prospect_id, scoring_version' });
  const { data: scoreRows } = await supabase.from('prospect_opportunity_scores').select('*').eq('prospect_id', pid1);
  console.log(`  Row count after re-scoring: ${scoreRows.length} (Expected: 1) -> ${scoreRows.length === 1 ? 'PASSED' : 'FAILED'}`);

  // Summary
  console.log('\n================================================================');
  console.log('RE-VERIFICATION SUMMARY');
  console.log('================================================================');
  console.log('\nProspect | Web | SEO | Mkt | Des | Overall | DQ | Tier | Engine Priority | Independent Priority | Match | DB Match');
  console.log('---------|-----|-----|-----|-----|---------|----|----|-----------------|---------------------|-------|---------');
  for (const r of results) {
    console.log(`${r.name.substring(0, 40).padEnd(40)} | ${String(r.web).padStart(3)} | ${String(r.seo).padStart(3)} | ${String(r.mkt).padStart(3)} | ${String(r.des).padStart(3)} | ${String(r.overall).padStart(7)} | ${String(r.dq).padStart(3)} | ${r.dqTier.padEnd(12)} | ${r.enginePriority.padEnd(15)} | ${r.independentPriority.padEnd(19)} | ${r.priorityMatch ? 'YES' : 'NO!!'} | ${r.dbConsistent ? 'YES' : 'NO!!'}`);
  }

  const allPrioritiesMatch = results.every(r => r.priorityMatch);
  const allDbConsistent = results.every(r => r.dbConsistent);
  console.log(`\nAll priority cross-checks passed: ${allPrioritiesMatch ? 'YES' : 'NO'}`);
  console.log(`All DB consistency checks passed: ${allDbConsistent ? 'YES' : 'NO'}`);
  console.log(`Idempotency check: ${scoreRows.length === 1 ? 'PASSED' : 'FAILED'}`);

  // SPECIAL FOCUS: Case 8 Ghost Listing
  const case8 = results.find(r => r.name.includes('Ghost'));
  if (case8) {
    console.log('\n--- SPECIAL AUDIT: Case 8 Ghost Listing ---');
    console.log(`  opportunity_score = ${case8.overall}`);
    console.log(`  data_quality_score = ${case8.dq}`);
    console.log(`  data_quality_tier = ${case8.dqTier}`);
    console.log(`  Engine sales_priority = ${case8.enginePriority}`);
    console.log(`  Independent derivation = ${case8.independentPriority}`);
    console.log(`  Gated = ${case8.gated}`);
    console.log(`  DB prospects.sales_priority = ${case8.dbPriority_prospects}`);
    console.log(`  DB scores.sales_priority = ${case8.dbPriority_scores}`);
    console.log(`  VERDICT: ${case8.enginePriority === 'medium' && case8.dbPriority_prospects === 'medium' && case8.dbPriority_scores === 'medium' ? 'CORRECT (medium, gated)' : 'INCORRECT — NEEDS FIX'}`);
  }

  // Cleanup
  console.log('\nCleaning up verification records...');
  for (const pid of createdIds) {
    await supabase.from('prospects').delete().eq('id', pid);
  }
  console.log('Cleaned up.');
}

runVerification();
