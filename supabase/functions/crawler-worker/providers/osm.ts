import { DiscoveryProvider, DiscoveryOptions, DiscoveryResult, StrategyTargeting } from '../discovery.ts';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

// Initial Industry Mapping
// Mapping generic strategy industries to OSM tags
const INDUSTRY_MAPPING: Record<string, string> = {
  'fitness': '["leisure"="fitness_centre"]',
  'gym': '["leisure"="fitness_centre"]',
  'fitness center': '["leisure"="fitness_centre"]',
  'fitness centre': '["leisure"="fitness_centre"]',
};

export class OpenStreetMapDiscoveryProvider implements DiscoveryProvider {
  name = 'openstreetmap';

  async discover(strategy: StrategyTargeting, options?: DiscoveryOptions): Promise<DiscoveryResult[]> {
    const limit = options?.limit || 10;
    
    // We expect at least one industry and one city/country to target for OSM.
    if (!strategy.target_industries?.length) {
      throw new Error('OSM Provider requires at least one target industry.');
    }
    
    if (!strategy.target_cities?.length && !strategy.target_countries?.length) {
      throw new Error('OSM Provider requires at least one target city or country.');
    }

    // Try to map the first industry
    const rawIndustry = strategy.target_industries[0].toLowerCase().trim();
    const tagQuery = INDUSTRY_MAPPING[rawIndustry];

    if (!tagQuery) {
      throw new Error(`OSM Provider does not currently support mapping for industry: '${rawIndustry}'`);
    }

    const city = strategy.target_cities?.[0] || '';
    const country = strategy.target_countries?.[0] || '';

    let areaQuery = '';
    let searchArea = '';
    
    if (country && city) {
      // Intersect country area with city area to ensure we only get cities in that country
      areaQuery = `
        area["name"="${country}"]->.country;
        area["name"="${city}"]->.city;
      `;
      searchArea = '(area.city)(area.country)';
    } else if (city) {
      areaQuery = `area["name"="${city}"]->.searchArea;`;
      searchArea = '(area.searchArea)';
    } else if (country) {
      areaQuery = `area["name"="${country}"]->.searchArea;`;
      searchArea = '(area.searchArea)';
    }

    const query = `
      [out:json][timeout:25];
      ${areaQuery}
      (
        node${tagQuery}${searchArea};
        way${tagQuery}${searchArea};
        relation${tagQuery}${searchArea};
      );
      out center ${limit};
    `;

    console.log('Executing Overpass Query:\n', query);

    const response = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'User-Agent': 'BMTech Marketing App (admin@bmtech.in)',
      },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || !data.elements) {
      return [];
    }

    const results: DiscoveryResult[] = data.elements.map((el: any) => {
      const tags = el.tags || {};
      const elCity = tags['addr:city'] || '';
      const elCountry = tags['addr:country'] || '';
      
      let candidateStatus: 'discovered' | 'rejected' = 'discovered';
      let rejectionReason: string | undefined = undefined;

      // Because our Overpass query strictly enforces geographic boundary containment 
      // (e.g. area.city and area.country), if this element was returned, it is physically 
      // inside the requested boundaries.
      const passedGeographicContainment = !!searchArea; // searchArea means we used boundary filter
      const validationMethod = searchArea ? 'geographic_boundary_intersection' : 'text_fallback';

      if (passedGeographicContainment) {
        // If it passed containment, we accept it. The only reason to reject is if 
        // there is an EXPLICIT contradictory tag that proves OSM data is corrupted.
        if (country && elCountry && !elCountry.toLowerCase().includes(country.toLowerCase()) && 
             !(country.toLowerCase() === 'united kingdom' && (elCountry.toUpperCase() === 'GB' || elCountry.toUpperCase() === 'UK'))) {
           candidateStatus = 'rejected';
           rejectionReason = 'geographic_country_mismatch';
        }
      } else {
        // Fallback logic if we didn't use strict area filtering
        if (city && city.trim().length > 0) {
          if (!elCity || !elCity.toLowerCase().includes(city.toLowerCase())) {
            candidateStatus = 'rejected';
            rejectionReason = 'geographic_city_mismatch';
          }
        }
        if (country && elCountry) {
           if (!elCountry.toLowerCase().includes(country.toLowerCase()) && 
               !(country.toLowerCase() === 'united kingdom' && (elCountry.toUpperCase() === 'GB' || elCountry.toUpperCase() === 'UK'))) {
             candidateStatus = 'rejected';
             rejectionReason = 'geographic_country_mismatch';
           }
        }
      }

      // If coordinates are completely missing, we cannot verify geographic scope
      if (!el.lat && !el.center?.lat) {
         candidateStatus = 'rejected';
         rejectionReason = 'geographic_location_unverified';
      }

      const rawDataWithMetadata = {
        ...el,
        validation_metadata: {
          target_country: country,
          target_city: city,
          candidate_coordinates: { lat: el.lat || el.center?.lat, lon: el.lon || el.center?.lon },
          validation_method: validationMethod,
          containment_passed: passedGeographicContainment,
          explicit_addr_city: elCity,
          explicit_addr_country: elCountry
        }
      };

      return {
        provider: this.name,
        externalId: `${el.type}/${el.id}`,
        businessName: tags.name || 'Unknown Business',
        website: tags.website || tags['contact:website'],
        phone: tags.phone || tags['contact:phone'],
        email: tags.email || tags['contact:email'],
        address: tags['addr:street'] 
          ? `${tags['addr:housenumber'] || ''} ${tags['addr:street']}`.trim() 
          : undefined,
        city: elCity || undefined,
        stateRegion: tags['addr:state'] || tags['addr:province'],
        postalCode: tags['addr:postcode'],
        country: tags['addr:country'],
        latitude: el.lat || el.center?.lat,
        longitude: el.lon || el.center?.lon,
        industry: rawIndustry,
        rawData: rawDataWithMetadata,
        status: candidateStatus,
        rejectionReason: rejectionReason,
      };
    });

    return results;
  }
}
