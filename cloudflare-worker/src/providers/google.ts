/**
 * supabase/functions/crawler-worker/providers/google.ts
 *
 * Google Places API (New) Provider.
 * Uses Text Search for thorough coverage.
 */

import {
  DiscoveryProvider,
  DiscoveryOptions,
  DiscoveryResult,
  StrategyTargeting,
} from '../discovery';
import { resolveCategory } from '../categories/resolver';
import { BoundingBox } from '../geo/resolver';

const GOOGLE_API_URL = 'https://places.googleapis.com/v1/places:searchText';

export interface GoogleDiscoveryOptions extends DiscoveryOptions {
  boundingBox?: BoundingBox;
}

export class GooglePlacesDiscoveryProvider implements DiscoveryProvider {
  name = 'google_places';
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || '';
  }

  async discover(
    strategy: StrategyTargeting,
    options?: GoogleDiscoveryOptions,
  ): Promise<DiscoveryResult[]> {
    if (!this.apiKey) {
      console.warn('[Google Provider] Missing GOOGLE_MAPS_API_KEY. Skipping provider.');
      return [];
    }

    const limit = options?.limit || 20;

    if (!strategy.target_industries?.length) {
      throw new Error('Google Provider requires at least one target industry.');
    }

    const rawIndustry = (options?.industry || strategy.target_industries[0]).toLowerCase().trim();
    const category = resolveCategory(rawIndustry);
    
    const googleQuery = category.providers.google_places?.googleQuery || rawIndustry;
    const googleType = category.providers.google_places?.googleType;

    const city = options?.city || strategy.target_cities?.[0] || '';
    const country = options?.country || strategy.target_countries?.[0] || '';

    // Construct text query e.g., "gym in Surat, India"
    const textQuery = `${googleQuery} in ${city}, ${country}`.trim();
    
    console.log(`[Google Provider] Querying: "${textQuery}"`);

    const requestBody: any = {
      textQuery: textQuery,
      pageSize: Math.min(limit, 20), // Max 20 per page for Text Search
    };

    // Add location restriction if bounding box is provided
    if (options?.boundingBox) {
      requestBody.locationRestriction = {
        rectangle: {
          low: {
            latitude: options.boundingBox.south,
            longitude: options.boundingBox.west
          },
          high: {
            latitude: options.boundingBox.north,
            longitude: options.boundingBox.east
          }
        }
      };
    }
    
    if (googleType) {
      requestBody.includedType = googleType;
    }

    // Requesting Basic + Contact + Atmosphere data fields
    // Cost control: We only request what we strictly need for validation & scoring.
    const fieldMask = 'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.internationalPhoneNumber,places.websiteUri,places.location,places.types,places.businessStatus,places.rating,places.userRatingCount';

    try {
      const response = await fetch(GOOGLE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.apiKey,
          'X-Goog-FieldMask': fieldMask,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errData = await response.text();
        console.error(`[Google Provider] API error: ${response.status} - ${errData}`);
        return [];
      }

      const data = (await response.json()) as any;

      if (!data.places || data.places.length === 0) {
        return [];
      }

      const results: DiscoveryResult[] = data.places.map((place: any) => {
        let candidateStatus: 'discovered' | 'rejected' = 'discovered';
        let rejectionReason: string | undefined = undefined;

        // Reject if permanently closed
        if (place.businessStatus === 'CLOSED_PERMANENTLY' || place.businessStatus === 'CLOSED_TEMPORARILY') {
          candidateStatus = 'rejected';
          rejectionReason = `business_status_${place.businessStatus.toLowerCase()}`;
        }

        const businessName = place.displayName?.text || '';

        const rawDataWithMetadata = {
          ...place,
          validation_metadata: {
            target_country: country,
            target_city: city,
            used_bbox: !!options?.boundingBox,
          },
        };

        return {
          provider: this.name,
          externalId: place.id,
          businessName: businessName,
          website: place.websiteUri,
          phone: place.internationalPhoneNumber || place.nationalPhoneNumber,
          email: undefined, // Google Places Text Search doesn't return email
          address: place.formattedAddress,
          city: city, // Extracted from address could be complex, fallback to target city
          stateRegion: undefined,
          postalCode: undefined,
          country: country,
          latitude: place.location?.latitude,
          longitude: place.location?.longitude,
          industry: rawIndustry,
          rawData: rawDataWithMetadata,
          status: candidateStatus,
          rejectionReason: rejectionReason,
        };
      });

      return results;
    } catch (error) {
      console.error('[Google Provider] Request failed:', error);
      return [];
    }
  }
}
