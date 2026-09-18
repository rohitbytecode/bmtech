/**
 * supabase/functions/crawler-worker/geo/resolver.ts
 *
 * Geographic boundary and coordinates resolution.
 */

export interface BoundingBox {
  south: number;
  north: number;
  west: number;
  east: number;
}

export interface GeoLocation {
  lat: number;
  lon: number;
  boundingbox?: BoundingBox;
  displayName: string;
}

// Simple in-memory cache for the life of the worker invocation
const cache = new Map<string, GeoLocation>();

export async function resolveCityToGeo(city: string, country: string): Promise<GeoLocation | null> {
  const query = `${city}, ${country}`.trim();
  if (cache.has(query)) {
    return cache.get(query)!;
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'BMTech Crawler / 1.0',
        },
      }
    );

    if (!response.ok) {
      console.error(`Nominatim API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = (await response.json()) as any;
    if (!data || data.length === 0) {
      return null;
    }

    const result = data[0];
    const geo: GeoLocation = {
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      displayName: result.display_name,
    };

    if (result.boundingbox && result.boundingbox.length === 4) {
      geo.boundingbox = {
        south: parseFloat(result.boundingbox[0]),
        north: parseFloat(result.boundingbox[1]),
        west: parseFloat(result.boundingbox[2]),
        east: parseFloat(result.boundingbox[3]),
      };
    }

    cache.set(query, geo);
    return geo;
  } catch (error) {
    console.error('Error resolving city geometry:', error);
    return null;
  }
}
