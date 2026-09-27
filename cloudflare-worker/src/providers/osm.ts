import {
  DiscoveryProvider,
  DiscoveryOptions,
  DiscoveryResult,
  StrategyTargeting,
} from '../discovery';
import { resolveCategory } from '../categories/resolver';
import { BoundingBox } from '../geo/resolver';

const OVERPASS_URL = 'https://overpass.kumi.systems/api/interpreter';

// Helper for regex escaping
const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export interface OSMDiscoveryOptions extends DiscoveryOptions {
  boundingBox?: BoundingBox;
}

export class OpenStreetMapDiscoveryProvider implements DiscoveryProvider {
  name = 'openstreetmap';

  async discover(
    strategy: StrategyTargeting,
    options?: OSMDiscoveryOptions,
  ): Promise<DiscoveryResult[]> {
    // We don't strictly enforce a limit for grid-based searches anymore, 
    // but keep a reasonable safeguard.
    const limit = options?.limit || 500;

    if (!strategy.target_industries?.length) {
      throw new Error('OSM Provider requires at least one target industry.');
    }

    const rawIndustry = (options?.industry || strategy.target_industries[0]).toLowerCase().trim();
    const category = resolveCategory(rawIndustry);

    const osmTags = category.providers.osm?.osmTags || [];
    
    console.log(
      `[OSM Provider] Resolved industry '${rawIndustry}' -> Canonical: ${category.canonicalName}, Tags: ${osmTags.length}`
    );

    const fallbackNameSearch = `["name"~"${escapeRegExp(rawIndustry)}", i]`;

    if (osmTags.length === 0 && category.id === 'generic_business') {
       console.warn(
        `[OSM Provider] Unable to confidently resolve industry: '${rawIndustry}'. Will use fallback name search.`
      );
    }

    const city = options?.city || strategy.target_cities?.[0] || '';
    const country = options?.country || strategy.target_countries?.[0] || '';

    let areaQuery = '';
    let searchArea = '';

    // If bounding box is provided, use bbox filtering instead of area intersection
    if (options?.boundingBox) {
      const { south, west, north, east } = options.boundingBox;
      searchArea = `(${south},${west},${north},${east})`;
    } else {
      // Fallback to area strings if no bbox (legacy/fallback mode)
      if (country && city) {
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
      } else {
        throw new Error('OSM Provider requires at least one target city/country or bounding box.');
      }
    }

    let tagUnion = '';
    for (const tag of osmTags) {
      tagUnion += `
        node${tag}${searchArea};
        way${tag}${searchArea};
        relation${tag}${searchArea};`;
    }

    if (osmTags.length === 0) {
      tagUnion += `
        node${fallbackNameSearch}${searchArea};
        way${fallbackNameSearch}${searchArea};
        relation${fallbackNameSearch}${searchArea};`;
    }

    const query = `
      [out:json][timeout:25];
      ${areaQuery}
      (${tagUnion}
      );
      out center ${limit};
    `;

    console.log(`[OSM Provider] Executing query... (BBox: ${!!options?.boundingBox})`);

    const response = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: {
        'User-Agent': 'BMTech Marketing App (admin@bmtech.in)',
      },
      body: query,
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type') || 'unknown';
      const errorBody = await response.text();
      throw new Error(
        `Overpass API error: ${response.status} ${response.statusText} | ` +
        `Content-Type: ${contentType} | ` +
        `Body: ${errorBody.slice(0, 2000)}`
      );
    }

    const data = (await response.json()) as any;

    if (!data || !data.elements) {
      return [];
    }

    const results: DiscoveryResult[] = data.elements.map((el: any) => {
      const tags = el.tags || {};
      const elCity = tags['addr:city'] || '';
      const elCountry = tags['addr:country'] || '';

      let candidateStatus: 'discovered' | 'rejected' = 'discovered';
      let rejectionReason: string | undefined = undefined;

      // If coordinates are missing, we cannot use it
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
          used_bbox: !!options?.boundingBox,
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
