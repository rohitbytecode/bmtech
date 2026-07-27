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
  highlighted?: boolean;
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

// Fallback seed data matching bmtech.in (Brothers Mediatech)
export const DEFAULT_SETTINGS: Settings = {
  id: 1,
  agency_name: 'Brothers Mediatech',
  headline: 'We Handle Your Digital. You Grow Your Business.',
  description:
    'Partner with BMTech for world-class web development, graphics design, video production, IT infrastructure, and social media scaling. Your vision, our expertise.',
  contact_email: 'contact@bmtech.in',
  contact_phone: '+91 98765 43210',
  about_text:
    'Brothers Mediatech (BMTech) is a full-service digital agency dedicated to helping businesses transform their digital presence through innovative technology, design, and marketing strategies.',
  email_alerts_enabled: true,
  push_notifications_enabled: true,
  weekly_reports_enabled: true,
  slack_integration_enabled: false,
};

export const DEFAULT_SERVICES: Service[] = [
  {
    id: 's1',
    name: 'Web & App Development',
    title: 'Web & App Development',
    description:
      'Custom, high-performance websites and modern mobile/web applications tailored to your business needs.',
    icon: 'Code',
  },
  {
    id: 's2',
    name: 'Graphic & UI/UX Design',
    title: 'Graphic & UI/UX Design',
    description:
      'Stunning brand identity, UI/UX design, logos, and visual assets designed to captivate your audience.',
    icon: 'Palette',
  },
  {
    id: 's3',
    name: 'Video Production & Editing',
    title: 'Video Production & Editing',
    description:
      'High-quality promotional videos, reels, ads, and motion graphics that drive engagement.',
    icon: 'Video',
  },
  {
    id: 's4',
    name: 'Digital Marketing & SEO',
    title: 'Digital Marketing & SEO',
    description:
      'Strategic social media management, Google Ads, and search engine optimization to scale your brand reach.',
    icon: 'TrendingUp',
  },
];

export const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'p1',
    title: 'E-Commerce Platform Redesign',
    category: 'Web Development',
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    link: 'https://bmtech.in',
  },
  {
    id: 'p2',
    title: 'SaaS Dashboard UI/UX Design',
    category: 'UI/UX Design',
    image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    link: 'https://bmtech.in',
  },
  {
    id: 'p3',
    title: 'Brand Identity & Commercial Video',
    category: 'Video Production',
    image:
      'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
    link: 'https://bmtech.in',
  },
  {
    id: 'p4',
    title: 'Social Media Growth Campaign',
    category: 'Digital Marketing',
    image:
      'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80',
    link: 'https://bmtech.in',
  },
];

export const DEFAULT_PACKAGES: Package[] = [
  {
    id: 'pkg1',
    name: 'Starter Branding',
    price: '₹14,999',
    features: [
      'Custom Website (Up to 5 pages)',
      'Logo & Brand Guide',
      'Basic SEO Setup',
      'Mobile Responsive',
      '1 Month Free Support',
    ],
    highlighted: false,
  },
  {
    id: 'pkg2',
    name: 'Growth Suite',
    price: '₹34,999',
    features: [
      'Full Web/App Development',
      'Complete UI/UX & Graphics Pack',
      'Social Media Management (1 Month)',
      'High-Converting Promo Video',
      'Advanced SEO & Analytics Integration',
      '3 Months Priority Support',
    ],
    highlighted: true,
  },
  {
    id: 'pkg3',
    name: 'Enterprise Transformation',
    price: 'Custom',
    features: [
      'Dedicated Tech & Creative Team',
      'Custom Software Architecture',
      'Full Media Production & Reels',
      'Omnichannel Marketing Strategy',
      '24/7 SLA & Infrastructure Management',
    ],
    highlighted: false,
  },
];

export const DEFAULT_MAINTENANCE_PLANS: MaintenancePlan[] = [
  {
    id: 'mp1',
    name: 'Basic Care',
    price: '₹4,999 / mo',
    features: [
      'Monthly Security Updates',
      'Weekly Automated Backups',
      'Uptime Monitoring (99.9%)',
      'Standard Email Support',
    ],
    highlighted: false,
  },
  {
    id: 'mp2',
    name: 'Pro Maintenance',
    price: '₹12,999 / mo',
    features: [
      'Weekly Content Updates & Tweaks',
      'Daily Off-site Backups',
      'Performance Optimization',
      'SEO & Security Audit',
      'Priority Support (< 4 hr response)',
    ],
    highlighted: true,
  },
  {
    id: 'mp3',
    name: 'Ultimate Ops',
    price: '₹24,999 / mo',
    features: [
      'Unlimited Minor Code & Design Edits',
      'Real-time Security & Firewall',
      'Dedicated Account Manager',
      '24/7 Emergency Hotlines',
    ],
    highlighted: false,
  },
];

export const dataService = {
  async getSettings() {
    try {
      const { data, error } = await supabase.from('settings').select('*').eq('id', 1).single();

      if (error || !data) {
        return { data: [DEFAULT_SETTINGS], error: null };
      }
      return { data: [data] as Settings[], error: null };
    } catch (err) {
      return { data: [DEFAULT_SETTINGS], error: null };
    }
  },

  async updateSettings(updates: Partial<Settings>) {
    try {
      const response = await fetch('/api/admin/settings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to update settings');

      return { success: true, data: result.data as Settings, error: null };
    } catch (error: any) {
      console.error('updateSettings failed:', error.message);
      return { success: false, data: null, error: error.message };
    }
  },

  async getServices() {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: true });

      if (error || !data || data.length === 0) {
        return { data: DEFAULT_SERVICES, error: null };
      }
      return { data: data as Service[], error: null };
    } catch (err) {
      return { data: DEFAULT_SERVICES, error: null };
    }
  },

  async createService(service: Omit<Service, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase.from('services').insert([service]).select().single();
      if (error) throw error;
      return { success: true, data: data as Service, error: null };
    } catch (error) {
      console.error('createService failed:', error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : String(error),
      };
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
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  async deleteService(id: string) {
    try {
      const { error } = await supabase.from('services').delete().eq('id', id);
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

      if (error || !data || data.length === 0) {
        return { data: DEFAULT_PROJECTS, error: null };
      }
      return { data: data as Project[], error: null };
    } catch (err) {
      return { data: DEFAULT_PROJECTS, error: null };
    }
  },

  async createProject(project: Omit<Project, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase.from('projects').insert([project]).select().single();
      if (error) throw error;
      return { success: true, data: data as Project, error: null };
    } catch (error) {
      console.error('createProject failed:', error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : String(error),
      };
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
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  async deleteProject(id: string) {
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
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

      if (error || !data || data.length === 0) {
        return { data: DEFAULT_PACKAGES, error: null };
      }
      return { data: data as Package[], error: null };
    } catch (err) {
      return { data: DEFAULT_PACKAGES, error: null };
    }
  },

  async createPackage(pkg: Omit<Package, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase.from('packages').insert([pkg]).select().single();
      if (error) throw error;
      return { success: true, data: data as Package, error: null };
    } catch (error) {
      console.error('createPackage failed:', error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : String(error),
      };
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
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  async deletePackage(id: string) {
    try {
      const { error } = await supabase.from('packages').delete().eq('id', id);
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

      if (error || !data || data.length === 0) {
        return { data: DEFAULT_MAINTENANCE_PLANS, error: null };
      }
      return { data: data as MaintenancePlan[], error: null };
    } catch (err) {
      return { data: DEFAULT_MAINTENANCE_PLANS, error: null };
    }
  },

  async createMaintenancePlan(plan: Omit<MaintenancePlan, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase
        .from('maintenance_plans')
        .insert([plan])
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: data as MaintenancePlan, error: null };
    } catch (error) {
      console.error('createMaintenancePlan failed:', error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  async updateMaintenancePlan(id: string, updates: Partial<MaintenancePlan>) {
    try {
      const { data, error } = await supabase
        .from('maintenance_plans')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: data as MaintenancePlan, error: null };
    } catch (error) {
      console.error('updateMaintenancePlan failed:', error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  async deleteMaintenancePlan(id: string) {
    try {
      const { error } = await supabase.from('maintenance_plans').delete().eq('id', id);
      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error('deleteMaintenancePlan failed:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
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
      return { data: [], error: null };
    }
  },

  async getDashboardStats() {
    try {
      const [leadsRes, projectsRes, packagesRes] = await Promise.all([
        supabase.from('leads').select('*', { count: 'exact', head: true }),
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('packages').select('*', { count: 'exact', head: true }),
      ]);

      return {
        data: {
          totalLeads: leadsRes.count || 0,
          totalProjects: projectsRes.count || DEFAULT_PROJECTS.length,
          totalPackages: packagesRes.count || DEFAULT_PACKAGES.length,
        },
        error: null,
      };
    } catch (error) {
      return {
        data: {
          totalLeads: 0,
          totalProjects: DEFAULT_PROJECTS.length,
          totalPackages: DEFAULT_PACKAGES.length,
        },
        error: null,
      };
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
      const { error } = await supabase.from('leads').delete().eq('id', id);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error('deleteLead failed:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  },

  async updateLeadStatus(id: string, status: 'new' | 'contacted') {
    try {
      const { error } = await supabase.from('leads').update({ status }).eq('id', id);

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
      const response = await fetch('/api/admin/devices/list');
      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Failed to fetch devices');

      return { data: result.devices, error: null };
    } catch (error: any) {
      console.error('getAuthorizedDevices failed:', error.message);
      return { data: [], error: error.message };
    }
  },

  async authorizeDevice(deviceId: string, name: string) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('authorized_devices')
        .upsert({
          device_id: deviceId,
          device_name: name,
          user_id: user.id,
          last_used_at: new Date().toISOString(),
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
      const response = await fetch('/api/admin/devices/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to remove device');

      return { success: true, error: null };
    } catch (error: any) {
      console.error('deauthorizeDevice failed:', error.message);
      return { success: false, error: error.message };
    }
  },
};
