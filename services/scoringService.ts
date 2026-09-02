import { supabase } from '../lib/supabaseClient';
import { calculateOpportunityScores } from '../lib/scoring/scoringEngine';
import { SCORING_CONFIG_V1 } from '../lib/scoring/config';
import type { OpportunitySignalInput, ScoringContext, ScoringResult } from '../lib/scoring/types';

export const scoringService = {
  /**
   * Pure calculation in-memory without database mutations
   */
  calculateInMomory(signals: OpportunitySignalInput[], context: ScoringContext = {}): ScoringResult {
    return calculateOpportunityScores(signals, context);
  },

  /**
   * Score a specific prospect, saving the result into `prospect_opportunity_scores`
   * and updating the canonical fields on `prospects`.
   */
  async scoreProspect(
    prospectId: string,
    client = supabase
  ): Promise<{ success: boolean; data: ScoringResult | null; error: string | null }> {
    try {
      // 1. Fetch prospect
      const { data: prospect, error: pErr } = await client
        .from('prospects')
        .select('*')
        .eq('id', prospectId)
        .single();

      if (pErr || !prospect) {
        return { success: false, data: null, error: pErr?.message || 'Prospect not found' };
      }

      // 2. Fetch signals
      const { data: signals, error: sErr } = await client
        .from('prospect_opportunity_signals')
        .select('*')
        .eq('prospect_id', prospectId);

      if (sErr) {
        return { success: false, data: null, error: `Failed to load signals: ${sErr.message}` };
      }

      const signalInputs: OpportunitySignalInput[] = (signals || []).map(s => ({
        category: s.category,
        signal_key: s.signal_key,
        confidence: s.confidence,
        evidence: s.evidence,
      }));

      const context: ScoringContext = {
        prospect_id: prospect.id,
        business_name: prospect.business_name,
        website: prospect.website,
        has_website: prospect.has_website,
        phone: prospect.phone,
        city: prospect.city,
        country: prospect.country,
        industry: prospect.industry,
      };

      // 3. Calculate scores deterministically
      const scoringResult = calculateOpportunityScores(signalInputs, context);

      // 4. Save to prospect_opportunity_scores (Idempotent UPSERT on prospect_id, scoring_version)
      const { error: scoreInsertErr } = await client
        .from('prospect_opportunity_scores')
        .upsert(
          {
            prospect_id: prospect.id,
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
          { onConflict: 'prospect_id, scoring_version' }
        );

      if (scoreInsertErr) {
        console.error('Error saving prospect_opportunity_scores:', scoreInsertErr);
      }

      // 5. Update canonical columns on prospects table
      const { error: updateProspectErr } = await client
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
        .eq('id', prospect.id);

      if (updateProspectErr) {
        console.error('Error updating prospects table:', updateProspectErr);
      }

      return { success: true, data: scoringResult, error: null };
    } catch (err: any) {
      return { success: false, data: null, error: err.message || String(err) };
    }
  },

  /**
   * Get detailed score explanation for a prospect
   */
  async getProspectScoreExplanation(
    prospectId: string,
    version = SCORING_CONFIG_V1.version,
    client = supabase
  ) {
    try {
      const { data, error } = await client
        .from('prospect_opportunity_scores')
        .select('*')
        .eq('prospect_id', prospectId)
        .eq('scoring_version', version)
        .maybeSingle();

      if (error) throw error;
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  },
};
