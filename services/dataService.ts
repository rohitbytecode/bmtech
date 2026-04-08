import { supabase } from '../lib/supabaseClient';

export interface Service {
  id: string;
  name: string;
  description: string;
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

export interface Settings {
  id: number;
  agency_name: string;
  headline: string;
  description: string;
  contact_email: string;
  contact_phone: string;
  about_text: string;
  email_alerts_enabled: boolean;
  push_notifications_enabled: boolean;
  weekly_reports_enabled: boolean;
  slack_integration_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

export const dataService = {
  // Existing methods ...
  async getSettings() {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) throw error;
      return { data: [data] as Settings[], error: null };
    } catch (error: any) {
      const errorMessage = error?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
      console.error('getSettings failed:', errorMessage);
      return { data: [], error: errorMessage };
    }
  },

  async updateSettings(updates: Partial<Settings>) {
    try {
      const { data, error } = await supabase
        .from('settings')
        .upsert({ 
          id: 1, 
          ...updates, 
          updated_at: new Date().toISOString() 
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: data as Settings, error: null };
    } catch (error: any) {
      const errorMessage = error?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
      console.error('updateSettings failed:', errorMessage);
      return { success: false, data: null, error: errorMessage };
    }
  },
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

  async createService(service: Omit<Service, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase
        .from('services')
        .insert([service])
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: data as Service, error: null };
    } catch (error) {
      console.error('createService failed:', error);
      return { success: false, data: null, error: error instanceof Error ? error.message : String(error) };
    }
  },

  async updateService(id: string, updates: Partial<Service>) {
    try {
      const { data, error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: data as Service, error: null };
    } catch (error) {
      console.error('updateService failed:', error);
      return { success: false, data: null, error: error instanceof Error ? error.message : String(error) };
    }
  },

  async deleteService(id: string) {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error('deleteService failed:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
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

  async createProject(project: Omit<Project, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([project])
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: data as Project, error: null };
    } catch (error) {
      console.error('createProject failed:', error);
      return { success: false, data: null, error: error instanceof Error ? error.message : String(error) };
    }
  },

  async updateProject(id: string, updates: Partial<Project>) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: data as Project, error: null };
    } catch (error) {
      console.error('updateProject failed:', error);
      return { success: false, data: null, error: error instanceof Error ? error.message : String(error) };
    }
  },

  async deleteProject(id: string) {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error('deleteProject failed:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
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

  async createPackage(pkg: Omit<Package, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase
        .from('packages')
        .insert([pkg])
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: data as Package, error: null };
    } catch (error) {
      console.error('createPackage failed:', error);
      return { success: false, data: null, error: error instanceof Error ? error.message : String(error) };
    }
  },

  async updatePackage(id: string, updates: Partial<Package>) {
    try {
      const { data, error } = await supabase
        .from('packages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: data as Package, error: null };
    } catch (error) {
      console.error('updatePackage failed:', error);
      return { success: false, data: null, error: error instanceof Error ? error.message : String(error) };
    }
  },

  async deletePackage(id: string) {
    try {
      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error('deletePackage failed:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
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
  },

  // Authorized Devices
  async getAuthorizedDevices() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data, error } = await supabase
        .from('authorized_devices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: [], error: error.message };
    }
  },

  async authorizeDevice(deviceId: string, name: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data, error } = await supabase
        .from('authorized_devices')
        .upsert({ 
          device_id: deviceId, 
          device_name: name, 
          user_id: user.id,
          last_used_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async deauthorizeDevice(deviceId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { error } = await supabase
        .from('authorized_devices')
        .delete()
        .eq('device_id', deviceId)
        .eq('user_id', user.id);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};
