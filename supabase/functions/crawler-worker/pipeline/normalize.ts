/**
 * supabase/functions/crawler-worker/pipeline/normalize.ts
 *
 * Centralized normalization functions for business data.
 */

export function normalizeBusinessName(name: string | null | undefined): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/\b(pvt|ltd|llp|inc|llc|co)\b/gi, '') // strip legal entity suffixes
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isIdentifiableBusinessName(value: string | null | undefined): boolean {
  const name = (value || '').trim();
  return (
    name.length >= 3 &&
    (name.match(/[a-z]/gi) || []).length >= 3 &&
    !/^(unknown business|unknown|unnamed|no name|n\/a|na|business|shop|store|cafe|restaurant)$/i.test(
      name,
    )
  );
}

export function normalizeWebsite(url: string | null | undefined): string {
  if (!url) return '';
  let normalized = url.trim().toLowerCase();
  
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = `https://${normalized}`;
  }
  
  try {
    const parsed = new URL(normalized);
    parsed.hash = ''; // Remove fragment
    return parsed.toString().replace(/\/$/, '');
  } catch (e) {
    // Fallback if URL parsing fails
    return url.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
  }
}

export function normalizeAddress(address: string | null | undefined): string {
  if (!address) return '';
  return address
    .toLowerCase()
    .replace(/[^a-z0-9\s,.-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
