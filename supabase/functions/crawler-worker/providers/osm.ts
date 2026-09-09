import {
  DiscoveryProvider,
  DiscoveryOptions,
  DiscoveryResult,
  StrategyTargeting,
} from '../discovery.ts';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

// Helper for regex escaping
const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Keyword to OSM Tag Mapping
// Maps business keywords to OSM tags for flexible discovery
const KEYWORD_TAGS: Array<{ keywords: string[]; tags: string[] }> = [
  { keywords: ['gym', 'gyms', 'crossfit', 'fitness studio', 'fitness studios', 'fitness center', 'fitness centers', 'fitness centre', 'fitness centres'], tags: ['["leisure"="fitness_centre"]'] },
  { keywords: ['yoga', 'yoga studio', 'yoga studios'], tags: ['["sport"="yoga"]'] },
  { keywords: ['pilates', 'pilates studio', 'pilates studios'], tags: ['["sport"="pilates"]'] },
  { keywords: ['bridal studio', 'bridal studios', 'bridal boutique', 'bridal boutiques', 'wedding studio', 'wedding studios', 'wedding boutique', 'wedding boutiques'], tags: ['["shop"="wedding"]'] },
  { keywords: ['cafe', 'cafes', 'coffee shop', 'coffee shops', 'coffeehouse', 'coffeehouses'], tags: ['["amenity"="cafe"]'] },
  { keywords: ['bakery', 'bakeries'], tags: ['["shop"="bakery"]'] },
  { keywords: ['restaurant', 'restaurants', 'food'], tags: ['["amenity"="restaurant"]'] },
  { keywords: ['salon', 'salons', 'hair salon', 'hair salons'], tags: ['["shop"="hairdresser"]'] },
  { keywords: ['beauty salon', 'beauty salons'], tags: ['["shop"="beauty"]'] },
  { keywords: ['spa', 'spas'], tags: ['["leisure"="spa"]'] },
];

export class OpenStreetMapDiscoveryProvider implements DiscoveryProvider {
  name = 'openstreetmap';

  async discover(
    strategy: StrategyTargeting,
    options?: DiscoveryOptions,
  ): Promise<DiscoveryResult[]> {
    const limit = options?.limit || 100;

    // We expect at least one industry and one city/country to target for OSM.
    if (!strategy.target_industries?.length) {
      throw new Error('OSM Provider requires at least one target industry.');
    }

    if (!strategy.target_cities?.length && !strategy.target_countries?.length) {
      throw new Error('OSM Provider requires at least one target city or country.');
    }

    // Use the explicitly provided industry or fallback to the first one
    const rawIndustry = (options?.industry || strategy.target_industries[0]).toLowerCase().trim();
    
    // Find matching tags based on whole-word/phrase keyword matching
    const matchedTags = new Set<string>();
    for (const mapping of KEYWORD_TAGS) {
      for (const k of mapping.keywords) {
        const regex = new RegExp(`\\b${escapeRegExp(k)}\\b`, 'i');
        if (regex.test(rawIndustry)) {
          for (const tag of mapping.tags) {
            matchedTags.add(tag);
          }
        }
      }
    }

    if (matchedTags.size === 0) {
      console.warn(
        `[OSM Provider] Unmapped industry: '${rawIndustry}'. Treating as data-coverage limitation rather than infrastructure failure.`,
      );
      return [];
    }

    const city = options?.city || strategy.target_cities?.[0] || '';
    const country = options?.country || strategy.target_countries?.[0] || '';

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

    let tagUnion = '';
    for (const tag of matchedTags) {
      tagUnion += `
        node${tag}${searchArea};
        way${tag}${searchArea};
        relation${tag}${searchArea};`;
    }

    const query = `
      [out:json][timeout:25];
      ${areaQuery}
      (${tagUnion}
      );
      out center ${limit};
    `;

    console.log('Executing Overpass Query:\n', query);

    const response = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
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

    const results: DiscoveryResult[] = data.elements.map((el: { type: string; id: number; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> }) => {
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
        if (
          country &&
          elCountry &&
          !elCountry.toLowerCase().includes(country.toLowerCase()) &&
          !(
            country.toLowerCase() === 'united kingdom' &&
            (elCountry.toUpperCase() === 'GB' || elCountry.toUpperCase() === 'UK')
          )
        ) {
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
          if (
            !elCountry.toLowerCase().includes(country.toLowerCase()) &&
            !(
              country.toLowerCase() === 'united kingdom' &&
              (elCountry.toUpperCase() === 'GB' || elCountry.toUpperCase() === 'UK')
            )
          ) {
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
          explicit_addr_country: elCountry,
        },
      };

      const businessName = tags.name?.trim() || '';
      const hasIdentifiableName =
        businessName.length >= 3 &&
        /[a-z]/i.test(businessName) &&
        !/^(unknown|unnamed|no name|n\/a|na|business|shop|store|cafe|restaurant)$/i.test(
          businessName,
        );

      if (!hasIdentifiableName && candidateStatus === 'discovered') {
        candidateStatus = 'rejected';
        rejectionReason = 'missing_or_generic_business_name';
      }

      return {
        provider: this.name,
        externalId: `${el.type}/${el.id}`,
        businessName: businessName || 'Unknown Business',
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
