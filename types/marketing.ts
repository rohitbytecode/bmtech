export type StrategyStatus = 'draft' | 'active' | 'paused' | 'archived';
export type ProspectStatus = 'discovered' | 'validating' | 'ready_for_call' | 'assigned' | 'calling' | 'callback_required' | 'qualified' | 'rejected';
export type SalesPriority = 'low' | 'medium' | 'high' | 'very_high';
export type CallOutcome = 'interested' | 'callback_required' | 'not_interested' | 'no_answer' | 'busy' | 'switched_off' | 'invalid_number' | 'wrong_number' | 'business_closed' | 'spam' | 'duplicate' | 'irrelevant_business' | 'other';
export type AssignmentStatus = 'assigned' | 'in_progress' | 'completed' | 'reassigned' | 'cancelled';

export interface Strategy {
  id: string;
  name: string;
  description: string;
  target_industries: string[];
  target_countries: string[];
  target_regions: string[];
  target_cities: string[];
  target_services: string[];
  qualification_criteria: any | null;
  status: StrategyStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type PhoneStatus = 'pending' | 'invalid_format' | 'toll_free' | 'wrong_length' | 'active' | 'landline';
export type PhoneLineType = 'mobile' | 'landline';

export interface Prospect {
  id: string;
  strategy_id: string | null;
  business_name: string;
  website: string | null;
  phone: string | null;
  phone_normalized?: string | null;
  phone_status?: PhoneStatus | null;
  phone_line_type?: PhoneLineType | null;
  phone_is_shared?: boolean | null;
  phone_verified_at?: string | null;
  email: string | null;
  address_line: string | null;
  city: string | null;
  state_region: string | null;
  postal_code: string | null;
  country: string | null;
  timezone: string | null;
  industry: string | null;
  business_description: string | null;
  has_website: boolean | null;
  has_social_presence: boolean | null;
  website_quality: number | null;
  social_presence_quality: number | null;
  opportunity_web: number | null;
  opportunity_marketing: number | null;
  opportunity_seo: number | null;
  opportunity_design: number | null;
  data_quality_score: number | null;
  opportunity_score: number | null;
  sales_priority: SalesPriority | null;
  status: ProspectStatus;
  last_verified_at: string | null;
  created_at: string;
  updated_at: string;
}


export interface ProspectSource {
  id: string;
  prospect_id: string;
  source_type: string;
  source_url: string | null;
  source_data: any | null;
  discovered_at: string;
}

export interface CallerAssignment {
  id: string;
  prospect_id: string;
  caller_id: string;
  assigned_by: string;
  status: AssignmentStatus;
  assigned_at: string;
  completed_at: string | null;
  created_at: string;
}

export interface CallAttempt {
  id: string;
  prospect_id: string;
  caller_id: string;
  assignment_id: string | null;
  attempt_number: number;
  outcome: CallOutcome;
  notes: string | null;
  called_at: string;
  next_follow_up_at: string | null;
  created_at: string;
}

export interface StickyNote {
  id: string;
  title: string;
  content: string;
  color: string;
  created_by: string;
  assigned_to: string | null;
  prospect_id: string | null;
  strategy_id: string | null;
  created_at: string;
  updated_at: string;
}
