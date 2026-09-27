/**
 * supabase/functions/crawler-worker/categories/resolver.ts
 *
 * Dynamic category resolution based on the taxonomy.
 */

import { TAXONOMY, TaxonomyCategory, FALLBACK_CATEGORY } from './taxonomy.ts';

export function resolveCategory(inputIndustry: string): TaxonomyCategory {
  if (!inputIndustry) return FALLBACK_CATEGORY;

  const normalized = inputIndustry.toLowerCase().trim();
  
  // Try exact alias match first
  for (const cat of TAXONOMY) {
    if (cat.id === normalized || cat.canonicalName.toLowerCase() === normalized) {
      return cat;
    }
    if (cat.aliases.includes(normalized)) {
      return cat;
    }
  }
  
  // Try partial word matches
  const tokens = normalized.split(/\s+/).filter(t => t.length > 2);
  const scores = new Map<string, number>();

  for (const token of tokens) {
    for (const cat of TAXONOMY) {
      let matched = false;
      if (cat.id.includes(token) || cat.canonicalName.toLowerCase().includes(token)) {
        matched = true;
      } else {
        for (const alias of cat.aliases) {
          if (alias.includes(token)) {
            matched = true;
            break;
          }
        }
      }
      if (matched) {
        scores.set(cat.id, (scores.get(cat.id) || 0) + 1);
      }
    }
  }

  if (scores.size > 0) {
    let bestScore = 0;
    let bestCatId = '';
    for (const [id, score] of scores.entries()) {
      if (score > bestScore) {
        bestScore = score;
        bestCatId = id;
      }
    }
    const cat = TAXONOMY.find(c => c.id === bestCatId);
    if (cat) return cat;
  }

  return FALLBACK_CATEGORY;
}
