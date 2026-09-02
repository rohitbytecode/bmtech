/**
 * Phase 4B.1 Deterministic Commercial Opportunity Scoring Engine
 * Pure functional implementation (no database/network calls)
 */

import { SCORING_CONFIG_V1 } from './config.ts';
import type {
  OpportunitySignalInput,
  ScoringContext,
  ScoreContributor,
  DimensionScoreBreakdown,
  DataQualityBreakdown,
  BusinessValidityTier,
  OpportunityExplanation,
  ScoringResult,
} from './types.ts';

function findSignal(
  signals: OpportunitySignalInput[],
  category: string,
  key: string
): OpportunitySignalInput | undefined {
  return signals.find(s => s.category === category && s.signal_key === key);
}

function hasSignal(
  signals: OpportunitySignalInput[],
  category: string,
  key: string
): boolean {
  return !!findSignal(signals, category, key);
}

function clamp(val: number, min = 0, max = 100): number {
  return Math.min(Math.max(val, min), max);
}

export function calculateWebOpportunity(
  signals: OpportunitySignalInput[],
  context: ScoringContext
): DimensionScoreBreakdown {
  const cfg = SCORING_CONFIG_V1.web;
  const contributors: ScoreContributor[] = [];

  const noWebsiteSig = findSignal(signals, 'web', 'no_website');
  const unreachableSig = findSignal(signals, 'web', 'website_unreachable');
  const httpErrorSig = findSignal(signals, 'web', 'website_http_error');
  const nonHtmlSig = findSignal(signals, 'web', 'non_html_site');
  const noHttpsSig = findSignal(signals, 'web', 'no_https');

  // Branch 1: No Website
  if (noWebsiteSig || context.has_website === false || (context.website === null && !unreachableSig && !httpErrorSig)) {
    const score = cfg.no_website_base;
    contributors.push({
      signal_key: 'no_website',
      category: 'web',
      impact: score,
      reason: 'No digital storefront or website detected. Urgent commercial opportunity for new website build.',
      confidence: noWebsiteSig?.confidence || 'high',
      evidence_summary: 'website = null',
    });
    return {
      score,
      raw_score: score,
      contributors,
      summary: 'High web opportunity: Business currently operates with no website.',
    };
  }

  // Branch 2: Inaccessible / Error Page
  if (unreachableSig) {
    let score = cfg.website_unreachable_base;
    contributors.push({
      signal_key: 'website_unreachable',
      category: 'web',
      impact: score,
      reason: 'Website domain is unreachable (DNS failure, connection refused, or timeout). Urgent hosting/web infrastructure remediation required.',
      confidence: unreachableSig.confidence,
      evidence_summary: unreachableSig.evidence?.error || 'Connection failed',
    });

    if (noHttpsSig) {
      score = Math.min(score + cfg.broken_site_no_https_addon, cfg.broken_site_cap);
      contributors.push({
        signal_key: 'no_https',
        category: 'web',
        impact: cfg.broken_site_no_https_addon,
        reason: 'Inaccessible site also lacks HTTPS configuration.',
        confidence: noHttpsSig.confidence,
      });
    }

    const finalScore = clamp(score);
    return {
      score: finalScore,
      raw_score: score,
      contributors,
      summary: 'High web opportunity: Website is broken or completely inaccessible.',
    };
  }

  if (httpErrorSig) {
    let score = cfg.website_http_error_base;
    contributors.push({
      signal_key: 'website_http_error',
      category: 'web',
      impact: score,
      reason: `Website returns HTTP error status (${httpErrorSig.evidence?.status_code || '4xx/5xx'}). Needs server/page fixing.`,
      confidence: httpErrorSig.confidence,
      evidence_summary: `Status code: ${httpErrorSig.evidence?.status_code}`,
    });

    const finalScore = clamp(score);
    return {
      score: finalScore,
      raw_score: score,
      contributors,
      summary: `High web opportunity: Website returns HTTP error code ${httpErrorSig.evidence?.status_code}.`,
    };
  }

  if (nonHtmlSig) {
    const score = cfg.non_html_site_base;
    contributors.push({
      signal_key: 'non_html_site',
      category: 'web',
      impact: score,
      reason: 'Domain delivers non-HTML document (e.g. PDF/file) instead of an interactive web application.',
      confidence: nonHtmlSig.confidence,
    });
    return {
      score,
      raw_score: score,
      contributors,
      summary: 'High web opportunity: Domain lacks a proper HTML web landing page.',
    };
  }

  // Branch 3: Working Website Technical & Structural Flaws
  let rawScore = cfg.working_site_base;
  contributors.push({
    signal_key: 'working_site_baseline',
    category: 'web',
    impact: cfg.working_site_base,
    reason: 'Functional website is online; baseline maintenance/upgrade opportunity.',
    confidence: 'high',
  });

  if (noHttpsSig) {
    rawScore += cfg.working_no_https;
    contributors.push({
      signal_key: 'no_https',
      category: 'web',
      impact: cfg.working_no_https,
      reason: 'Site serves over insecure HTTP without SSL certificate.',
      confidence: noHttpsSig.confidence,
      evidence_summary: 'Protocol: http:',
    });
  }

  const missingViewport = findSignal(signals, 'design', 'mobile_viewport_missing');
  if (missingViewport) {
    rawScore += cfg.working_mobile_viewport_missing;
    contributors.push({
      signal_key: 'mobile_viewport_missing',
      category: 'web',
      impact: cfg.working_mobile_viewport_missing,
      reason: 'Missing mobile viewport tag; website fails modern mobile rendering standards.',
      confidence: missingViewport.confidence,
    });
  }

  const minimalContent = findSignal(signals, 'design', 'minimal_content');
  if (minimalContent) {
    rawScore += cfg.working_minimal_content;
    contributors.push({
      signal_key: 'minimal_content',
      category: 'web',
      impact: cfg.working_minimal_content,
      reason: 'Website lacks semantic HTML5 layout tags (nav, main, footer). Outdated markup architecture.',
      confidence: minimalContent.confidence,
    });
  }

  const finalScore = clamp(Math.min(rawScore, cfg.working_site_cap));
  const summary = finalScore >= 40
    ? 'Moderate web opportunity: Working website has security and structural standards deficiencies.'
    : 'Low web opportunity: Functional website meets standard web protocols.';

  return {
    score: finalScore,
    raw_score: rawScore,
    contributors,
    summary,
  };
}

export function calculateSeoOpportunity(
  signals: OpportunitySignalInput[],
  context: ScoringContext
): DimensionScoreBreakdown {
  const cfg = SCORING_CONFIG_V1.seo;
  const contributors: ScoreContributor[] = [];

  const isNoWeb = hasSignal(signals, 'web', 'no_website') || context.has_website === false || context.website === null;
  const isUnreachable = hasSignal(signals, 'web', 'website_unreachable') || hasSignal(signals, 'web', 'website_http_error');

  if (isNoWeb || isUnreachable) {
    contributors.push({
      signal_key: 'no_functional_website_for_seo',
      category: 'seo',
      impact: 0,
      reason: 'No functional website available for on-page SEO analysis. Commercial focus is primary web development.',
      confidence: 'high',
    });
    return {
      score: 0,
      raw_score: 0,
      contributors,
      summary: 'No on-page SEO deficiency evaluated (website absent or offline).',
    };
  }

  let rawScore = 0;

  const titleMissing = findSignal(signals, 'seo', 'meta_title_missing');
  const titlePresent = findSignal(signals, 'seo', 'meta_title_present');
  if (titleMissing) {
    rawScore += cfg.missing_title;
    contributors.push({
      signal_key: 'meta_title_missing',
      category: 'seo',
      impact: cfg.missing_title,
      reason: 'Missing <title> tag. Critical on-page ranking and click-through deficiency.',
      confidence: titleMissing.confidence,
    });
  } else if (titlePresent && titlePresent.evidence?.length && titlePresent.evidence.length < 15) {
    rawScore += cfg.weak_title_short;
    contributors.push({
      signal_key: 'meta_title_short',
      category: 'seo',
      impact: cfg.weak_title_short,
      reason: `Meta title is too short (${titlePresent.evidence.length} chars), missing brand and local keyword optimization.`,
      confidence: 'high',
      evidence_summary: `Length: ${titlePresent.evidence.length}`,
    });
  }

  const descMissing = findSignal(signals, 'seo', 'meta_description_missing');
  const descPresent = findSignal(signals, 'seo', 'meta_description_present');
  if (descMissing) {
    rawScore += cfg.missing_description;
    contributors.push({
      signal_key: 'meta_description_missing',
      category: 'seo',
      impact: cfg.missing_description,
      reason: 'Missing meta description tag. Search engines have no targeted snippet to display in results.',
      confidence: descMissing.confidence,
    });
  } else if (descPresent && descPresent.evidence?.length && descPresent.evidence.length < 30) {
    rawScore += cfg.weak_description_short;
    contributors.push({
      signal_key: 'meta_description_short',
      category: 'seo',
      impact: cfg.weak_description_short,
      reason: `Meta description is too short (${descPresent.evidence.length} chars) for effective SERP snippet display.`,
      confidence: 'high',
    });
  }

  const schemaMissing = findSignal(signals, 'seo', 'structured_data_missing');
  if (schemaMissing) {
    rawScore += cfg.missing_structured_data;
    contributors.push({
      signal_key: 'structured_data_missing',
      category: 'seo',
      impact: cfg.missing_structured_data,
      reason: 'Missing Schema.org JSON-LD structured data. Disqualifies business from rich snippets & knowledge cards.',
      confidence: schemaMissing.confidence,
    });
  }

  const canonicalPresent = findSignal(signals, 'seo', 'canonical_present');
  if (!canonicalPresent) {
    rawScore += cfg.missing_canonical;
    contributors.push({
      signal_key: 'canonical_missing',
      category: 'seo',
      impact: cfg.missing_canonical,
      reason: 'Missing canonical URL link tag; risk of duplicate URL indexing.',
      confidence: 'high',
    });
  }

  const finalScore = clamp(Math.min(rawScore, cfg.max_cap));
  const summary = finalScore >= 60
    ? 'High SEO opportunity: Major search optimization gaps (missing title, description, and structured data).'
    : finalScore >= 30
    ? 'Moderate SEO opportunity: Some on-page technical metadata missing.'
    : 'Low SEO opportunity: Website has well-configured SEO meta tags and structured data.';

  return {
    score: finalScore,
    raw_score: rawScore,
    contributors,
    summary,
  };
}

export function calculateMarketingOpportunity(
  signals: OpportunitySignalInput[],
  context: ScoringContext
): DimensionScoreBreakdown {
  const cfg = SCORING_CONFIG_V1.marketing;
  const contributors: ScoreContributor[] = [];

  const isNoWeb = hasSignal(signals, 'web', 'no_website') || context.has_website === false || context.website === null;

  if (isNoWeb) {
    const score = cfg.no_website_base;
    contributors.push({
      signal_key: 'no_website_marketing_gap',
      category: 'marketing',
      impact: score,
      reason: 'No website footprint indicates an overall digital marketing setup opportunity.',
      confidence: 'high',
    });
    return {
      score,
      raw_score: score,
      contributors,
      summary: 'Moderate marketing opportunity: Full digital presence and inbound channel setup needed.',
    };
  }

  let rawScore = 0;

  const socialMissing = findSignal(signals, 'marketing', 'social_presence_missing');
  const socialDetected = findSignal(signals, 'marketing', 'social_presence_detected');

  if (socialMissing) {
    rawScore += cfg.missing_social;
    contributors.push({
      signal_key: 'social_presence_missing',
      category: 'marketing',
      impact: cfg.missing_social,
      reason: 'No social media profiles linked on the website. Moderate opportunity for social media channel setup.',
      confidence: socialMissing.confidence,
    });
  } else if (socialDetected && socialDetected.evidence?.count === 1) {
    rawScore += cfg.single_social_channel;
    contributors.push({
      signal_key: 'single_social_channel',
      category: 'marketing',
      impact: cfg.single_social_channel,
      reason: 'Only 1 social media channel detected. Opportunity for multi-platform marketing expansion.',
      confidence: 'high',
      evidence_summary: `Found: ${socialDetected.evidence.platforms?.join(', ')}`,
    });
  }

  const emailPresent = findSignal(signals, 'marketing', 'email_present');
  if (!emailPresent) {
    rawScore += cfg.missing_email_capture;
    contributors.push({
      signal_key: 'email_capture_missing',
      category: 'marketing',
      impact: cfg.missing_email_capture,
      reason: 'No public contact email detected on website landing page. Inbound conversion gap.',
      confidence: 'high',
    });
  }

  const phonePresent = findSignal(signals, 'marketing', 'phone_present');
  if (!phonePresent && !context.phone) {
    rawScore += cfg.missing_phone_on_page;
    contributors.push({
      signal_key: 'phone_contact_missing',
      category: 'marketing',
      impact: cfg.missing_phone_on_page,
      reason: 'No click-to-call phone number present on landing page.',
      confidence: 'high',
    });
  }

  const pageStructure = findSignal(signals, 'design', 'page_structure_detected');
  if (pageStructure && pageStructure.evidence && pageStructure.evidence.has_form === false) {
    rawScore += cfg.missing_lead_form;
    contributors.push({
      signal_key: 'lead_form_missing',
      category: 'marketing',
      impact: cfg.missing_lead_form,
      reason: 'No interactive lead capture or contact form detected on landing page.',
      confidence: 'high',
    });
  }

  const finalScore = clamp(Math.min(rawScore, cfg.max_cap));
  const summary = finalScore >= 60
    ? 'High marketing opportunity: Significant gaps in social presence, lead forms, and direct conversion channels.'
    : finalScore >= 30
    ? 'Moderate marketing opportunity: Multi-channel marketing expansion and conversion rate optimization potential.'
    : 'Low marketing opportunity: Active social presence and clear multi-channel contact paths.';

  return {
    score: finalScore,
    raw_score: rawScore,
    contributors,
    summary,
  };
}

export function calculateDesignOpportunity(
  signals: OpportunitySignalInput[],
  context: ScoringContext
): DimensionScoreBreakdown {
  const cfg = SCORING_CONFIG_V1.design;
  const contributors: ScoreContributor[] = [];

  const isNoWeb = hasSignal(signals, 'web', 'no_website') || context.has_website === false || context.website === null;
  const isUnreachable = hasSignal(signals, 'web', 'website_unreachable') || hasSignal(signals, 'web', 'website_http_error');

  if (isNoWeb || isUnreachable) {
    contributors.push({
      signal_key: 'no_functional_website_for_design',
      category: 'design',
      impact: 0,
      reason: 'No functional website to evaluate design/UX against. Primary service needed is Web Development.',
      confidence: 'high',
    });
    return {
      score: 0,
      raw_score: 0,
      contributors,
      summary: 'No design deficiency evaluated (website absent or offline).',
    };
  }

  let rawScore = 0;

  const missingViewport = findSignal(signals, 'design', 'mobile_viewport_missing');
  if (missingViewport) {
    rawScore += cfg.missing_mobile_viewport;
    contributors.push({
      signal_key: 'mobile_viewport_missing',
      category: 'design',
      impact: cfg.missing_mobile_viewport,
      reason: 'Missing <meta name="viewport"> tag. Layout does not scale on mobile devices (critical UX flaw).',
      confidence: missingViewport.confidence,
    });
  }

  const minimalContent = findSignal(signals, 'design', 'minimal_content');
  if (minimalContent) {
    rawScore += cfg.minimal_content_layout;
    contributors.push({
      signal_key: 'minimal_content_layout',
      category: 'design',
      impact: cfg.minimal_content_layout,
      reason: 'Missing semantic HTML5 structural layout elements (header, nav, main, footer). Outdated layout design.',
      confidence: minimalContent.confidence,
    });
  }

  const missingOgImage = findSignal(signals, 'design', 'og_image_missing');
  if (missingOgImage) {
    rawScore += cfg.missing_og_image;
    contributors.push({
      signal_key: 'og_image_missing',
      category: 'design',
      impact: cfg.missing_og_image,
      reason: 'Missing OpenGraph preview image (og:image). Visual branding missing when shared across social channels.',
      confidence: missingOgImage.confidence,
    });
  }

  const finalScore = clamp(Math.min(rawScore, cfg.max_cap));
  const summary = finalScore >= 60
    ? 'High design opportunity: Outdated layout lacking responsive mobile viewport and modern semantic design.'
    : finalScore >= 30
    ? 'Moderate design opportunity: Visual branding and mobile optimization improvements available.'
    : 'Low design opportunity: Modern responsive layout with semantic structure and social preview assets.';

  return {
    score: finalScore,
    raw_score: rawScore,
    contributors,
    summary,
  };
}

export function calculateDataQualityScore(
  signals: OpportunitySignalInput[],
  context: ScoringContext
): DataQualityBreakdown {
  const cfg = SCORING_CONFIG_V1.data_quality;
  let score = 0;

  const hasLocation = hasSignal(signals, 'data_quality', 'verified_location') || (!!context.latitude && !!context.longitude);
  const hasPhone = hasSignal(signals, 'data_quality', 'valid_phone') || !!context.phone;
  const hasIdentity = (!!context.business_name && context.business_name.length > 2) || (context.provider === 'osm');

  if (hasLocation) score += cfg.verified_location_weight;
  if (hasPhone) score += cfg.valid_phone_weight;
  if (hasIdentity) score += cfg.identity_provenance_weight;

  const finalScore = clamp(score);
  let tier: BusinessValidityTier = 'insufficient';

  if (finalScore >= cfg.verified_min_score) {
    tier = 'verified';
  } else if (finalScore >= cfg.partial_min_score) {
    tier = 'partial';
  }

  const summary = tier === 'verified'
    ? 'Verified business with geocoded coordinates, contact number, and verified directory provenance.'
    : tier === 'partial'
    ? 'Partially verified business record (missing full geographic or phone verification).'
    : 'Insufficient business identity evidence (unverified listing).';

  return {
    score: finalScore,
    tier,
    has_verified_location: hasLocation,
    has_valid_phone: hasPhone,
    has_identity_provenance: hasIdentity,
    summary,
  };
}

export function synthesizeOverallOpportunity(
  web: number,
  seo: number,
  marketing: number,
  design: number
): {
  overall_score: number;
  primary_dimension: 'web' | 'seo' | 'marketing' | 'design';
  primary_score: number;
  secondary_avg: number;
  formula: string;
} {
  const dims: Array<{ name: 'web' | 'seo' | 'marketing' | 'design'; score: number }> = [
    { name: 'web', score: web },
    { name: 'seo', score: seo },
    { name: 'marketing', score: marketing },
    { name: 'design', score: design },
  ];

  dims.sort((a, b) => b.score - a.score);

  const primary = dims[0];
  const secondaryDims = dims.slice(1);
  const secondaryAvg = secondaryDims.reduce((sum, d) => sum + d.score, 0) / 3;

  const cfg = SCORING_CONFIG_V1.synthesis;
  const rawOverall = cfg.primary_need_weight * primary.score + cfg.secondary_synergy_weight * secondaryAvg;
  const overallScore = clamp(Math.round(rawOverall));

  const formula = `round(0.70 * max_dimension(${primary.name}=${primary.score}) + 0.30 * secondary_avg(${secondaryAvg.toFixed(1)}))`;

  return {
    overall_score: overallScore,
    primary_dimension: primary.name,
    primary_score: primary.score,
    secondary_avg: Number(secondaryAvg.toFixed(2)),
    formula,
  };
}

export function deriveSalesPriority(
  opportunityScore: number,
  dataQuality: DataQualityBreakdown
): {
  priority: 'low' | 'medium' | 'high' | 'very_high';
  gated: boolean;
  gate_reason?: string;
  final_summary: string;
} {
  const cfg = SCORING_CONFIG_V1.sales_priority;

  if (opportunityScore >= cfg.very_high_min_score) {
    if (dataQuality.tier === 'verified') {
      return {
        priority: 'very_high',
        gated: false,
        final_summary: 'Top sales priority: Exceptional commercial opportunity backed by verified business credentials.',
      };
    }

    if (dataQuality.tier === 'partial') {
      return {
        priority: 'high',
        gated: true,
        gate_reason: 'Gated from very_high to high: Business credentials are only partially verified.',
        final_summary: 'High sales priority: Strong opportunity, pending secondary location/phone verification.',
      };
    }

    return {
      priority: 'medium',
      gated: true,
      gate_reason: 'Gated from very_high to medium: Insufficient business identity evidence.',
      final_summary: 'Medium sales priority: High technical opportunity but low data trust / unverified lead.',
    };
  }

  if (opportunityScore >= cfg.high_min_score) {
    if (dataQuality.tier === 'insufficient') {
      return {
        priority: 'medium',
        gated: true,
        gate_reason: 'Gated from high to medium due to unverified business listing.',
        final_summary: 'Medium sales priority: Moderate opportunity with unverified business data.',
      };
    }

    return {
      priority: 'high',
      gated: false,
      final_summary: 'High sales priority: Solid commercial opportunity with reliable contact details.',
    };
  }

  if (opportunityScore >= cfg.medium_min_score) {
    return {
      priority: 'medium',
      gated: false,
      final_summary: 'Medium sales priority: Moderate service potential (e.g. standard refresh or expansion).',
    };
  }

  return {
    priority: 'low',
    gated: false,
    final_summary: 'Low sales priority: Business already has an optimized modern web and marketing presence.',
  };
}

export function calculateOpportunityScores(
  signals: OpportunitySignalInput[],
  context: ScoringContext = {}
): ScoringResult {
  const web = calculateWebOpportunity(signals, context);
  const seo = calculateSeoOpportunity(signals, context);
  const marketing = calculateMarketingOpportunity(signals, context);
  const design = calculateDesignOpportunity(signals, context);

  const dataQuality = calculateDataQualityScore(signals, context);
  const synthesis = synthesizeOverallOpportunity(web.score, seo.score, marketing.score, design.score);
  const priorityInfo = deriveSalesPriority(synthesis.overall_score, dataQuality);

  const explanation: OpportunityExplanation = {
    scoring_version: SCORING_CONFIG_V1.version,
    dimensions: {
      web,
      seo,
      marketing,
      design,
    },
    synthesis: {
      primary_dimension: synthesis.primary_dimension,
      primary_dimension_score: synthesis.primary_score,
      secondary_dimensions_average: synthesis.secondary_avg,
      synthesis_formula: synthesis.formula,
      calculated_overall_score: synthesis.overall_score,
    },
    data_quality: dataQuality,
    sales_priority_rationale: priorityInfo,
  };

  return {
    opportunity_web: web.score,
    opportunity_seo: seo.score,
    opportunity_marketing: marketing.score,
    opportunity_design: design.score,
    opportunity_score: synthesis.overall_score,
    data_quality_score: dataQuality.score,
    sales_priority: priorityInfo.priority,
    explanation,
    scoring_version: SCORING_CONFIG_V1.version,
  };
}
