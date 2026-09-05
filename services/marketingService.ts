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

  async getStrategiesPaginated(page: number, pageSize: number) {
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from('strategies')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      return { data: data as Strategy[], count: count || 0, error: null };
    } catch (error: any) {
      console.error('getStrategiesPaginated error:', error);
      return { data: [], count: 0, error: error.message };
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

  async getProspectsPaginated(
    page: number, 
    pageSize: number, 
    filters?: { 
      status?: string; 
      strategy_id?: string;
      country?: string;
      city?: string;
      industry?: string;
      sales_priority?: string;
      search?: string;
    }
  ) {
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('prospects')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.strategy_id) query = query.eq('strategy_id', filters.strategy_id);
      if (filters?.country) query = query.ilike('country', `%${filters.country}%`);
      if (filters?.city) query = query.ilike('city', `%${filters.city}%`);
      if (filters?.industry) query = query.ilike('industry', `%${filters.industry}%`);
      if (filters?.sales_priority) query = query.eq('sales_priority', filters.sales_priority);
      if (filters?.search) {
        query = query.or(`business_name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,website.ilike.%${filters.search}%`);
      }

      const { data, error, count } = await query.range(from, to);
      
      if (error) throw error;
      return { data: data as Prospect[], count: count || 0, error: null };
    } catch (error: any) {
      console.error('getProspectsPaginated error:', error);
      return { data: [], count: 0, error: error.message };
    }
  },

  async getAllProspects(
    filters?: { 
      status?: string; 
      strategy_id?: string;
      country?: string;
      city?: string;
      industry?: string;
      sales_priority?: string;
      search?: string;
    }
  ) {
    try {
      let query = supabase
        .from('prospects')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.strategy_id) query = query.eq('strategy_id', filters.strategy_id);
      if (filters?.country) query = query.ilike('country', `%${filters.country}%`);
      if (filters?.city) query = query.ilike('city', `%${filters.city}%`);
      if (filters?.industry) query = query.ilike('industry', `%${filters.industry}%`);
      if (filters?.sales_priority) query = query.eq('sales_priority', filters.sales_priority);
      if (filters?.search) {
        query = query.or(`business_name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,website.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return { data: data as Prospect[], error: null };
    } catch (error: any) {
      console.error('getAllProspects error:', error);
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
  async getAssignmentsForCaller(callerId?: string, status?: string) {
    try {
      let query = supabase.from('caller_assignments').select('*, prospects(*)');
      if (callerId) {
        query = query.eq('caller_id', callerId);
      }
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

  async getAssignmentForProspect(prospectId: string) {
    try {
      const { data, error } = await supabase
        .from('caller_assignments')
        .select('*')
        .eq('prospect_id', prospectId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (error && error.code !== 'PGRST116') throw error; // Ignore not found error
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async getCallers() {
    try {
      const response = await fetch('/api/admin/callers', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Failed to fetch callers');
      }
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return { data: data.callers, error: null };
    } catch (error: any) {
      console.error('getCallers error:', error);
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

  async logCallOutcome(assignmentId: string, prospectId: string, callerId: string, outcome: string) {
    try {
      // 1. Mark the assignment as completed
      const { error: assignError } = await supabase
        .from('caller_assignments')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', assignmentId);
        
      if (assignError) throw assignError;

      // 2. Map the outcome to the prospect's new status
      let newStatus = 'discovered';
      if (outcome === 'interested') newStatus = 'qualified';
      else if (outcome === 'not_interested' || outcome === 'invalid_number') newStatus = 'rejected';
      else if (outcome === 'callback_required' || outcome === 'no_answer') newStatus = 'callback';

      // 3. Update the prospect status
      const { error: prospectError } = await supabase
        .from('prospects')
        .update({ status: newStatus })
        .eq('id', prospectId);
        
      if (prospectError) throw prospectError;
      
      // 4. Log the call attempt
      const { error: attemptError } = await supabase
        .from('call_attempts')
        .insert([{
          prospect_id: prospectId,
          assignment_id: assignmentId,
          caller_id: callerId,
          outcome: outcome,
          notes: '',
          duration_seconds: 0,
          called_at: new Date().toISOString()
        }]);
        
      if (attemptError) throw attemptError;

      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async getMarketingDashboardStats() {
    try {
      // Run multiple count queries in parallel for performance
      const [
        { count: totalProspects },
        { count: readyToCall },
        { count: assigned },
        { count: callbacks },
        { count: qualified },
        { count: rejected },
        { count: totalCalls }
      ] = await Promise.all([
        supabase.from('prospects').select('*', { count: 'exact', head: true }),
        supabase.from('prospects').select('*', { count: 'exact', head: true }).eq('status', 'discovered'),
        supabase.from('prospects').select('*', { count: 'exact', head: true }).eq('status', 'assigned'),
        supabase.from('prospects').select('*', { count: 'exact', head: true }).eq('status', 'callback'),
        supabase.from('prospects').select('*', { count: 'exact', head: true }).eq('status', 'qualified'),
        supabase.from('prospects').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
        supabase.from('call_attempts').select('*', { count: 'exact', head: true })
      ]);

      const q = qualified || 0;
      const r = rejected || 0;
      const conversionRate = (q + r) > 0 ? Math.round((q / (q + r)) * 100) : 0;

      return {
        data: {
          totalProspects: totalProspects || 0,
          readyToCall: readyToCall || 0,
          assigned: assigned || 0,
          callbacks: callbacks || 0,
          qualified: q,
          rejected: r,
          totalCalls: totalCalls || 0,
          conversionRate
        },
        error: null
      };
    } catch (error: any) {
      console.error('Failed to load marketing stats:', error);
      return { data: null, error: error.message };
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
