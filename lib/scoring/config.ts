/**
 * Central Configuration for Phase 4B.1 Deterministic Opportunity Scoring Engine
 * Version: deterministic-v1
 * 
 * BUSINESS RATIONALE:
 * BMTech provides high-value Web Development, SEO, Digital Marketing, and UI/UX Design services.
 * Scoring evaluates commercial opportunity for these services, keeping data quality strictly separate.
 */

export const SCORING_CONFIG_V1 = {
  version: 'deterministic-v1',

  // --------------------------------------------------------------------------
  // 1. WEB OPPORTUNITY WEIGHTS
  // --------------------------------------------------------------------------
  web: {
    // Branch A: Absence / Total Failure of Web Presence
    // Rationale: A business with no website or a broken site represents the highest
    // immediate commercial urgency for new web development.
    no_website_base: 90,
    website_unreachable_base: 85,
    website_http_error_base: 75,
    non_html_site_base: 80,

    // Compound modifier for broken site (e.g. unreachable + no_https)
    broken_site_no_https_addon: 5,
    broken_site_cap: 90,

    // Branch B: Working Website Deficiencies
    // Rationale: A working website represents redesign/rebuild opportunities based on
    // structural & standard non-compliance, but has lower urgency than missing/broken sites.
    working_site_base: 5, // baseline maintenance opportunity
    working_no_https: 25, // Missing SSL: major trust and security red flag
    working_mobile_viewport_missing: 30, // Missing viewport: breaks mobile usability
    working_minimal_content: 25, // Lacks modern HTML5 semantic structure
    working_site_cap: 70, // Capped to avoid exceeding broken/missing website scores
  },

  // --------------------------------------------------------------------------
  // 2. SEO OPPORTUNITY WEIGHTS
  // --------------------------------------------------------------------------
  seo: {
    // Branch A: When no functional website exists
    // Rationale: On-page SEO requires an accessible website to optimize. When no website exists,
    // the opportunity is Web Development, NOT On-page SEO (prevent double counting).
    no_website_seo_score: 0,
    unreachable_website_seo_score: 0,

    // Branch B: On-page Technical SEO Deficiencies on functional websites
    missing_title: 35, // Primary on-page search ranking factor absent
    missing_description: 25, // SERP snippet / click-through description absent
    missing_structured_data: 20, // Schema.org JSON-LD missing (rich snippet gap)
    missing_canonical: 10, // Canonical URL link tag absent (duplicate content risk)
    
    // Quality modifiers for weak present metadata
    weak_title_short: 15, // Title < 15 chars (insufficient keyword coverage)
    weak_description_short: 10, // Description < 30 chars (low informational value)

    max_cap: 100,
  },

  // --------------------------------------------------------------------------
  // 3. MARKETING OPPORTUNITY WEIGHTS
  // --------------------------------------------------------------------------
  marketing: {
    // Branch A: No Website
    // Rationale: Moderate digital marketing need (needs full online presence buildout).
    no_website_base: 40,

    // Branch B: Working Website Footprint
    missing_social: 40, // No social profiles detected on website (moderate indicator)
    single_social_channel: 15, // Only 1 social channel found (expansion opportunity)
    missing_email_capture: 15, // No contact/inbound email address found on landing page
    missing_phone_on_page: 10, // No phone link on landing page
    missing_lead_form: 15, // No lead capture / contact form detected

    max_cap: 100,
  },

  // --------------------------------------------------------------------------
  // 4. DESIGN OPPORTUNITY WEIGHTS
  // --------------------------------------------------------------------------
  design: {
    // Branch A: No Website / Unreachable
    no_website_design_score: 0,
    unreachable_website_design_score: 0,

    // Branch B: Working Website Design & Responsive Deficiencies
    missing_mobile_viewport: 45, // Responsive design failure (crucial for mobile UX)
    minimal_content_layout: 30, // Outdated non-semantic HTML layout (lacks nav/main/footer)
    missing_og_image: 15, // Lacks social preview visual branding card
    
    max_cap: 100,
  },

  // --------------------------------------------------------------------------
  // 5. OVERALL OPPORTUNITY SYNTHESIS
  // --------------------------------------------------------------------------
  // Rationale: A strong need in ANY single core BMTech service makes a lead valuable (70% weight).
  // Breadth across multiple service needs provides significant synergy (30% weight).
  synthesis: {
    primary_need_weight: 0.70,
    secondary_synergy_weight: 0.30,
  },

  // --------------------------------------------------------------------------
  // 6. DATA QUALITY / BUSINESS VALIDITY WEIGHTS
  // --------------------------------------------------------------------------
  // Rationale: Strictly evaluates data provenance and business legitimacy.
  data_quality: {
    verified_location_weight: 40, // OSM verified coordinates
    valid_phone_weight: 35, // Functional phone number
    identity_provenance_weight: 25, // Known provider + valid business name
    
    // Validity Tiers
    verified_min_score: 70,
    partial_min_score: 40,
  },

  // --------------------------------------------------------------------------
  // 7. SALES PRIORITY THRESHOLDS & GATES
  // --------------------------------------------------------------------------
  sales_priority: {
    very_high_min_score: 75, // Requires 'verified' business data quality
    high_min_score: 50,
    medium_min_score: 25,
    low_max_score: 24,
  },
} as const;
