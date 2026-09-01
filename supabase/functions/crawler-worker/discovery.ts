export interface DiscoveryOptions {
  limit?: number;
}

export interface DiscoveryResult {
  provider: string;
  externalId?: string;

  businessName: string;

  website?: string;
  phone?: string;
  email?: string;

  address?: string;
  city?: string;
  stateRegion?: string;
  postalCode?: string;
  country?: string;

  latitude?: number;
  longitude?: number;

  industry?: string;

  rawData: Record<string, unknown>;
  
  status?: 'discovered' | 'rejected';
  rejectionReason?: string;
}

export interface StrategyTargeting {
  target_industries: string[];
  target_countries: string[];
  target_regions: string[];
  target_cities: string[];
}

export interface DiscoveryProvider {
  name: string;

  discover(
    strategy: StrategyTargeting,
    options?: DiscoveryOptions
  ): Promise<DiscoveryResult[]>;
}
