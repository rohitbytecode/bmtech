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

export interface LeadPayload {
  name: string;
  email: string;
  message: string;
  service_id?: string;
}

export const dataService = {
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

  async submitLead({ name, email, message, service_id }: LeadPayload) {
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert([{ name, email, message, service_id: service_id || null }])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data, error: null };
    } catch (error) {
      console.error(error);
      return { success: false, data: null, error: error instanceof Error ? error.message : String(error) };
    }
  }
};
