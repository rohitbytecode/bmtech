import {
  DiscoveryProvider,
  DiscoveryOptions,
  DiscoveryResult,
  StrategyTargeting,
} from '../discovery.ts';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

// Helper for regex escaping
const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

type ConceptType = 'subject' | 'modifier';

interface Concept {
  id: string;
  type: ConceptType;
  aliases: string[];
  tags: string[];
}

const CONCEPT_DICTIONARY: Concept[] = [
  // Modifiers
  { id: 'wedding', type: 'modifier', aliases: ['wedding', 'weddings', 'bridal', 'bride', 'marriage', 'matrimonial'], tags: ['["shop"="wedding"]'] },
  { id: 'personal', type: 'modifier', aliases: ['personal', 'private', 'custom', 'boutique', 'luxury'], tags: [] },

  // Subjects
  { id: 'photography', type: 'subject', aliases: ['photography', 'photographer', 'photographers', 'photo', 'photos'], tags: ['["shop"="photo"]', '["shop"="photo_studio"]', '["craft"="photographer"]'] },
  { id: 'makeup', type: 'subject', aliases: ['makeup', 'cosmetics', 'mua', 'aesthetic', 'aesthetics', 'beauty'], tags: ['["shop"="beauty"]', '["shop"="cosmetics"]'] },
  { id: 'salon', type: 'subject', aliases: ['salon', 'salons', 'hair', 'hairdresser', 'barber'], tags: ['["shop"="hairdresser"]'] },
  { id: 'spa', type: 'subject', aliases: ['spa', 'spas'], tags: ['["leisure"="spa"]'] },
  { id: 'venue', type: 'subject', aliases: ['venue', 'venues', 'banquet', 'hall', 'resort', 'hotel'], tags: ['["amenity"="events_venue"]', '["tourism"="hotel"]'] },
  { id: 'planner', type: 'subject', aliases: ['planner', 'planners', 'planning', 'management', 'coordinator'], tags: ['["office"="event_management"]', '["office"="wedding_planner"]'] },
  { id: 'training', type: 'subject', aliases: ['training', 'trainer', 'trainers', 'coach', 'fitness', 'gym', 'gyms', 'crossfit', 'workout'], tags: ['["leisure"="fitness_centre"]', '["sport"="fitness"]'] },
  { id: 'yoga', type: 'subject', aliases: ['yoga'], tags: ['["sport"="yoga"]'] },
  { id: 'pilates', type: 'subject', aliases: ['pilates'], tags: ['["sport"="pilates"]'] },
  { id: 'cafe', type: 'subject', aliases: ['cafe', 'cafes', 'coffee', 'coffeehouse', 'coffeehouses', 'espresso'], tags: ['["amenity"="cafe"]'] },
  { id: 'bakery', type: 'subject', aliases: ['bakery', 'bakeries', 'bake'], tags: ['["shop"="bakery"]'] },
  { id: 'generic_store', type: 'subject', aliases: ['studio', 'studios', 'shop', 'shops', 'boutique', 'boutiques', 'store', 'stores', 'center', 'centers', 'centre', 'centres'], tags: [] },
];

function resolveIndustry(industry: string) {
  const normalized = industry.toLowerCase().replace(/[^a-z0-9 ]/g, ' ');
  const tokens = normalized.split(/\s+/).filter(t => t.length > 2);
  
  const matchedSubjects = new Map<string, Concept>();
  const matchedModifiers = new Map<string, Concept>();

  for (const token of tokens) {
    for (const concept of CONCEPT_DICTIONARY) {
      if (concept.aliases.includes(token)) {
        if (concept.type === 'subject') {
          matchedSubjects.set(concept.id, concept);
        } else {
          matchedModifiers.set(concept.id, concept);
        }
      }
    }
  }

  let resolvedTags = new Set<string>();
  const hasGenericSubject = matchedSubjects.has('generic_store');

  if (matchedSubjects.size > 0) {
    for (const subject of matchedSubjects.values()) {
      for (const tag of subject.tags) resolvedTags.add(tag);
    }
    // If no subject tags, try to inherit modifier tags
    if (resolvedTags.size === 0 && hasGenericSubject) {
      for (const modifier of matchedModifiers.values()) {
        for (const tag of modifier.tags) resolvedTags.add(tag);
      }
    }
  }

  let fallbackNameSearch: string | null = null;
  if (resolvedTags.size === 0 && tokens.length > 0) {
    const exactPhrase = escapeRegExp(normalized.replace(/\s+/g, ' ').trim());
    fallbackNameSearch = `["name"~"${exactPhrase}", i]`;
  }

  return {
    original: industry,
    tokens,
    subjects: Array.from(matchedSubjects.keys()),
    modifiers: Array.from(matchedModifiers.keys()),
    tags: Array.from(resolvedTags),
    fallbackNameSearch
  };
}

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
    
    const resolution = resolveIndustry(rawIndustry);

    console.log(
      `[OSM Provider] Resolved industry '${rawIndustry}' -> Subjects: [${resolution.subjects.join(', ')}], Modifiers: [${resolution.modifiers.join(', ')}], Tags: ${resolution.tags.length}`
    );

    if (resolution.tags.length === 0 && !resolution.fallbackNameSearch) {
      console.warn(
        `[OSM Provider] Unable to confidently resolve industry: '${rawIndustry}'. Returning empty to avoid excessive load.`,
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
    for (const tag of resolution.tags) {
      tagUnion += `
        node${tag}${searchArea};
        way${tag}${searchArea};
        relation${tag}${searchArea};`;
    }

    // Add fallback name search if available
    if (resolution.fallbackNameSearch) {
      tagUnion += `
        node${resolution.fallbackNameSearch}${searchArea};
        way${resolution.fallbackNameSearch}${searchArea};
        relation${resolution.fallbackNameSearch}${searchArea};`;
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
