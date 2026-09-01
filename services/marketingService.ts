import { supabase } from '../lib/supabaseClient';
import type { Strategy, Prospect, CallerAssignment, CallAttempt, StickyNote } from '../types/marketing';

export const marketingService = {
  // --------------------------------------------------------
  // STRATEGIES
  // --------------------------------------------------------
  async getStrategies() {
    try {
      const { data, error } = await supabase
        .from('strategies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data as Strategy[], error: null };
    } catch (error: any) {
      console.error('getStrategies error:', error);
      return { data: [], error: error.message };
    }
  },

  async createStrategy(strategy: Omit<Strategy, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase.from('strategies').insert([strategy]).select().single();
      if (error) throw error;
      return { success: true, data: data as Strategy, error: null };
    } catch (error: any) {
      return { success: false, data: null, error: error.message };
    }
  },

  async updateStrategy(id: string, updates: Partial<Strategy>) {
    try {
      const { data, error } = await supabase
        .from('strategies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: data as Strategy, error: null };
    } catch (error: any) {
      return { success: false, data: null, error: error.message };
    }
  },

  async deleteStrategy(id: string) {
    try {
      const { error } = await supabase.from('strategies').delete().eq('id', id);
      if (error) throw error;
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // --------------------------------------------------------
  // PROSPECTS
  // --------------------------------------------------------
  async getProspects(filters?: { status?: string; strategy_id?: string }) {
    try {
      let query = supabase.from('prospects').select('*').order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.strategy_id) {
        query = query.eq('strategy_id', filters.strategy_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data: data as Prospect[], error: null };
    } catch (error: any) {
      console.error('getProspects error:', error);
      return { data: [], error: error.message };
    }
  },

  async getProspectById(id: string) {
    try {
      const { data, error } = await supabase.from('prospects').select('*').eq('id', id).single();
      if (error) throw error;
      return { data: data as Prospect, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async createProspect(prospect: Omit<Prospect, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase.from('prospects').insert([prospect]).select().single();
      if (error) throw error;
      return { success: true, data: data as Prospect, error: null };
    } catch (error: any) {
      return { success: false, data: null, error: error.message };
    }
  },

  async updateProspect(id: string, updates: Partial<Prospect>) {
    try {
      const { data, error } = await supabase
        .from('prospects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: data as Prospect, error: null };
    } catch (error: any) {
      return { success: false, data: null, error: error.message };
    }
  },

  async deleteProspect(id: string) {
    try {
      const { error } = await supabase.from('prospects').delete().eq('id', id);
      if (error) throw error;
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // --------------------------------------------------------
  // CALLER ASSIGNMENTS
  // --------------------------------------------------------
  async getAssignmentsForCaller(callerId: string, status?: string) {
    try {
      let query = supabase.from('caller_assignments').select('*, prospects(*)').eq('caller_id', callerId);
      if (status) {
        query = query.eq('status', status);
      }
      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: [], error: error.message };
    }
  },

  async assignProspect(assignment: Omit<CallerAssignment, 'id' | 'created_at' | 'completed_at'>) {
    try {
      const { data, error } = await supabase.from('caller_assignments').insert([assignment]).select().single();
      if (error) throw error;
      return { success: true, data: data as CallerAssignment, error: null };
    } catch (error: any) {
      return { success: false, data: null, error: error.message };
    }
  },

  // --------------------------------------------------------
  // CALL ATTEMPTS
  // --------------------------------------------------------
  async getCallHistory(prospectId: string) {
    try {
      const { data, error } = await supabase
        .from('call_attempts')
        .select('*')
        .eq('prospect_id', prospectId)
        .order('called_at', { ascending: false });
      if (error) throw error;
      return { data: data as CallAttempt[], error: null };
    } catch (error: any) {
      return { data: [], error: error.message };
    }
  },

  async logCallAttempt(attempt: Omit<CallAttempt, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase.from('call_attempts').insert([attempt]).select().single();
      if (error) throw error;
      return { success: true, data: data as CallAttempt, error: null };
    } catch (error: any) {
      return { success: false, data: null, error: error.message };
    }
  },

  // --------------------------------------------------------
  // STICKY NOTES
  // --------------------------------------------------------
  async getStickyNotes(filters?: { prospect_id?: string; strategy_id?: string }) {
    try {
      let query = supabase.from('sticky_notes').select('*').order('created_at', { ascending: false });
      
      if (filters?.prospect_id) query = query.eq('prospect_id', filters.prospect_id);
      else if (filters?.strategy_id) query = query.eq('strategy_id', filters.strategy_id);
      else query = query.is('prospect_id', null).is('strategy_id', null); // general notes

      const { data, error } = await query;
      if (error) throw error;
      return { data: data as StickyNote[], error: null };
    } catch (error: any) {
      return { data: [], error: error.message };
    }
  },

  async createStickyNote(note: Omit<StickyNote, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase.from('sticky_notes').insert([note]).select().single();
      if (error) throw error;
      return { success: true, data: data as StickyNote, error: null };
    } catch (error: any) {
      return { success: false, data: null, error: error.message };
    }
  },

  async deleteStickyNote(id: string) {
    try {
      const { error } = await supabase.from('sticky_notes').delete().eq('id', id);
      if (error) throw error;
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};
