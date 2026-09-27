/**
 * Central Configuration for Phase 4B.1 Deterministic Opportunity Scoring Engine
 * Version: deterministic-v1
 */

export const SCORING_CONFIG_V1 = {
  version: 'deterministic-v1',

  // 1. WEB OPPORTUNITY WEIGHTS
  web: {
    no_website_base: 90,
    website_unreachable_base: 85,
    website_http_error_base: 75,
    non_html_site_base: 80,
    broken_site_no_https_addon: 5,
    broken_site_cap: 90,
    working_site_base: 5,
    working_no_https: 25,
    working_mobile_viewport_missing: 30,
    working_minimal_content: 25,
    working_site_cap: 70,
  },

  // 2. SEO OPPORTUNITY WEIGHTS
  seo: {
    no_website_seo_score: 0,
    unreachable_website_seo_score: 0,
    missing_title: 35,
    missing_description: 25,
    missing_structured_data: 20,
    missing_canonical: 10,
    weak_title_short: 15,
    weak_description_short: 10,
    max_cap: 100,
  },

  // 3. MARKETING OPPORTUNITY WEIGHTS
  marketing: {
    no_website_base: 40,
    missing_social: 40,
    single_social_channel: 15,
    missing_email_capture: 15,
    missing_phone_on_page: 10,
    missing_lead_form: 15,
    max_cap: 100,
  },

  // 4. DESIGN OPPORTUNITY WEIGHTS
  design: {
    no_website_design_score: 0,
    unreachable_website_design_score: 0,
    missing_mobile_viewport: 45,
    minimal_content_layout: 30,
    missing_og_image: 15,
    max_cap: 100,
  },

  // 5. OVERALL OPPORTUNITY SYNTHESIS
  synthesis: {
    primary_need_weight: 0.70,
    secondary_synergy_weight: 0.30,
  },

  // 6. DATA QUALITY / BUSINESS VALIDITY WEIGHTS
  data_quality: {
    verified_location_weight: 40,
    valid_phone_weight: 35,
    identity_provenance_weight: 25,
    verified_min_score: 70,
    partial_min_score: 40,
  },

  // 7. SALES PRIORITY THRESHOLDS
  sales_priority: {
    very_high_min_score: 75,
    high_min_score: 50,
    medium_min_score: 25,
    low_max_score: 24,
  },
} as const;
