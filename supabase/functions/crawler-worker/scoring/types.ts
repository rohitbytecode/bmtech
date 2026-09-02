/**
 * Types for Phase 4B Deterministic Opportunity Scoring Engine
 */

export type OpportunitySignalCategory =
  | 'web'
  | 'seo'
  | 'marketing'
  | 'design'
  | 'data_quality';

export type OpportunitySignalConfidence = 'low' | 'medium' | 'high';

export interface OpportunitySignalInput {
  category: OpportunitySignalCategory | string;
  signal_key: string;
  confidence: OpportunitySignalConfidence | string;
  evidence?: Record<string, any>;
}

export interface ScoringContext {
  prospect_id?: string;
  business_name?: string;
  website?: string | null;
  has_website?: boolean | null;
  phone?: string | null;
  city?: string | null;
  country?: string | null;
  industry?: string | null;
  provider?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface ScoreContributor {
  signal_key: string;
  category: OpportunitySignalCategory;
  impact: number;
  reason: string;
  confidence: OpportunitySignalConfidence | string;
  evidence_summary?: string;
}

export interface DimensionScoreBreakdown {
  score: number;
  raw_score: number;
  contributors: ScoreContributor[];
  summary: string;
}

export type BusinessValidityTier = 'verified' | 'partial' | 'insufficient';

export interface DataQualityBreakdown {
  score: number;
  tier: BusinessValidityTier;
  has_verified_location: boolean;
  has_valid_phone: boolean;
  has_identity_provenance: boolean;
  summary: string;
}

export interface OpportunityExplanation {
  scoring_version: string;
  dimensions: {
    web: DimensionScoreBreakdown;
    seo: DimensionScoreBreakdown;
    marketing: DimensionScoreBreakdown;
    design: DimensionScoreBreakdown;
  };
  synthesis: {
    primary_dimension: 'web' | 'seo' | 'marketing' | 'design';
    primary_dimension_score: number;
    secondary_dimensions_average: number;
    synthesis_formula: string;
    calculated_overall_score: number;
  };
  data_quality: DataQualityBreakdown;
  sales_priority_rationale: {
    priority: 'low' | 'medium' | 'high' | 'very_high';
    gated: boolean;
    gate_reason?: string;
    final_summary: string;
  };
}

export interface ScoringResult {
  opportunity_web: number;
  opportunity_seo: number;
  opportunity_marketing: number;
  opportunity_design: number;
  opportunity_score: number;
  data_quality_score: number;
  sales_priority: 'low' | 'medium' | 'high' | 'very_high';
  explanation: OpportunityExplanation;
  scoring_version: string;
}
