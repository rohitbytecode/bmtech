/**
 * supabase/functions/crawler-worker/categories/taxonomy.ts
 *
 * Core taxonomy definitions mapping general industries to 
 * specific queries for various providers.
 */

export interface ProviderQuery {
  osmTags?: string[];
  googleQuery?: string;
  googleType?: string;
}

export interface TaxonomyCategory {
  id: string;
  canonicalName: string;
  aliases: string[];
  providers: {
    osm?: ProviderQuery;
    google_places?: ProviderQuery;
  };
}

export const TAXONOMY: TaxonomyCategory[] = [
  // Health & Fitness
  {
    id: 'fitness',
    canonicalName: 'Fitness Center',
    aliases: ['fitness', 'gym', 'gyms', 'workout', 'training', 'health club', 'crossfit'],
    providers: {
      osm: { osmTags: ['["leisure"="fitness_centre"]', '["sport"="fitness"]'] },
      google_places: { googleQuery: 'gym', googleType: 'gym' }
    }
  },
  {
    id: 'yoga',
    canonicalName: 'Yoga Studio',
    aliases: ['yoga', 'yoga studio', 'pilates'],
    providers: {
      osm: { osmTags: ['["sport"="yoga"]', '["sport"="pilates"]'] },
      google_places: { googleQuery: 'yoga studio', googleType: 'gym' }
    }
  },

  // Food & Beverage
  {
    id: 'restaurant',
    canonicalName: 'Restaurant',
    aliases: ['restaurant', 'restaurants', 'dining', 'eatery', 'food'],
    providers: {
      osm: { osmTags: ['["amenity"="restaurant"]', '["amenity"="fast_food"]'] },
      google_places: { googleQuery: 'restaurant', googleType: 'restaurant' }
    }
  },
  {
    id: 'cafe',
    canonicalName: 'Cafe',
    aliases: ['cafe', 'cafes', 'coffee', 'coffeehouse', 'tea'],
    providers: {
      osm: { osmTags: ['["amenity"="cafe"]'] },
      google_places: { googleQuery: 'cafe', googleType: 'cafe' }
    }
  },
  {
    id: 'bakery',
    canonicalName: 'Bakery',
    aliases: ['bakery', 'bakeries', 'bake', 'sweets'],
    providers: {
      osm: { osmTags: ['["shop"="bakery"]', '["shop"="pastry"]'] },
      google_places: { googleQuery: 'bakery', googleType: 'bakery' }
    }
  },

  // Beauty & Wellness
  {
    id: 'salon',
    canonicalName: 'Salon & Barbershop',
    aliases: ['salon', 'salons', 'hair', 'hairdresser', 'barber', 'barbershop', 'beauty parlour'],
    providers: {
      osm: { osmTags: ['["shop"="hairdresser"]', '["shop"="beauty"]'] },
      google_places: { googleQuery: 'salon', googleType: 'beauty_salon' }
    }
  },
  {
    id: 'spa',
    canonicalName: 'Spa',
    aliases: ['spa', 'spas', 'massage'],
    providers: {
      osm: { osmTags: ['["leisure"="spa"]', '["shop"="massage"]'] },
      google_places: { googleQuery: 'spa', googleType: 'spa' }
    }
  },

  // Events & Photography
  {
    id: 'photography',
    canonicalName: 'Photographer',
    aliases: ['photography', 'photographer', 'photo studio', 'wedding photographer'],
    providers: {
      osm: { osmTags: ['["shop"="photo"]', '["shop"="photo_studio"]', '["craft"="photographer"]'] },
      google_places: { googleQuery: 'photographer', googleType: 'photographer' }
    }
  },
  {
    id: 'event_planner',
    canonicalName: 'Event Planner',
    aliases: ['event planner', 'wedding planner', 'banquet', 'venue', 'event management'],
    providers: {
      osm: { osmTags: ['["office"="event_management"]', '["office"="wedding_planner"]', '["amenity"="events_venue"]'] },
      google_places: { googleQuery: 'event planner', googleType: 'event_planner' }
    }
  },

  // Medical
  {
    id: 'dentist',
    canonicalName: 'Dentist',
    aliases: ['dentist', 'dental', 'dental clinic', 'teeth'],
    providers: {
      osm: { osmTags: ['["healthcare"="dentist"]', '["amenity"="dentist"]'] },
      google_places: { googleQuery: 'dentist', googleType: 'dentist' }
    }
  },
  {
    id: 'doctor',
    canonicalName: 'Doctor & Clinic',
    aliases: ['doctor', 'clinic', 'hospital', 'physician', 'healthcare'],
    providers: {
      osm: { osmTags: ['["healthcare"="clinic"]', '["amenity"="clinic"]', '["amenity"="doctors"]'] },
      google_places: { googleQuery: 'clinic', googleType: 'doctor' }
    }
  }
];

export const FALLBACK_CATEGORY: TaxonomyCategory = {
  id: 'generic_business',
  canonicalName: 'Business',
  aliases: [],
  providers: {}
};
