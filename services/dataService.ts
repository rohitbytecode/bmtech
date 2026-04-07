import { supabase } from '../lib/supabaseClient';

export interface Service {
  id: string;
  name: string;
  description: string;
  price: string | number;
  icon: string;
  created_at?: string;
  // Fallbacks for frontend mapping
  title?: string; 
}

export interface Project {
  id: string;
  title: string;
  category: string;
  image: string;
  link: string;
  client_id?: string;
  status?: string;
  created_at?: string;
}

export interface Package {
  id: string;
  name: string;
  price: string;
  features: string[] | unknown;
  highlighted: boolean;
  created_at?: string;
}

export interface MaintenancePlan {
  id: string;
  name: string;
  price: string;
  features: string[] | unknown;
  created_at?: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  message: string;
  service_id?: string;
  status: 'new' | 'contacted';
  created_at: string;
}

export interface LeadPayload {
  name: string;
  email: string;
  message: string;
  service_id?: string;
}

export const dataService = {
  // Existing methods ... (I'll keep them and just append)
  async getServices() {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      return { data: data as Service[], error: null };
    } catch (error) {
      console.error(error);
      return { data: null, error: error instanceof Error ? error.message : String(error) };
    }
  },

  async getProjects() {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data as Project[], error: null };
    } catch (error) {
      console.error(error);
      return { data: null, error: error instanceof Error ? error.message : String(error) };
    }
  },

  async getPackages() {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return { data: data as Package[], error: null };
    } catch (error) {
      console.error(error);
      return { data: null, error: error instanceof Error ? error.message : String(error) };
    }
  },

  async getMaintenancePlans() {
    try {
      const { data, error } = await supabase
        .from('maintenance_plans')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return { data: data as MaintenancePlan[], error: null };
    } catch (error) {
      console.error(error);
      return { data: null, error: error instanceof Error ? error.message : String(error) };
    }
  },

  async getLeads() {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data as Lead[], error: null };
    } catch (error) {
      console.error(error);
      return { data: null, error: error instanceof Error ? error.message : String(error) };
    }
  },

  async getDashboardStats() {
    try {
      const [leadsRes, projectsRes, packagesRes] = await Promise.all([
        supabase.from('leads').select('*', { count: 'exact', head: true }),
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('packages').select('*', { count: 'exact', head: true })
      ]);

      if (leadsRes.error) throw leadsRes.error;
      if (projectsRes.error) throw projectsRes.error;
      if (packagesRes.error) throw packagesRes.error;

      return {
        data: {
          totalLeads: leadsRes.count || 0,
          totalProjects: projectsRes.count || 0,
          totalPackages: packagesRes.count || 0
        },
        error: null
      };
    } catch (error) {
      console.error(error);
      return { data: null, error: error instanceof Error ? error.message : String(error) };
    }
  },

  async submitLead({ name, email, message, service_id }: LeadPayload) {
    try {
      const response = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, service_id }),
      });

      const contentType = response.headers.get('content-type') || '';
      let result: any = null;

      if (contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || 'Unexpected non-JSON response from /api/submit-lead');
      }

      if (!response.ok || !result?.success) {
        throw new Error(result?.error || 'Unable to submit lead.');
      }

      return { success: true, data: result.data, error: null };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'object' && error !== null && 'message' in error
          ? String((error as any).message)
          : String(error ?? 'Unknown error');

      console.error('submitLead failed:', errorMessage);
      return { success: false, data: null, error: errorMessage };
    }
  },

  async deleteLead(id: string) {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error('deleteLead failed:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  },

  async updateLeadStatus(id: string, status: 'new' | 'contacted') {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error('updateLeadStatus failed:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }
};
