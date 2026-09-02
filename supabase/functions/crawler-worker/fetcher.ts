import * as cheerio from 'npm:cheerio@1.0.0-rc.12';

export interface WebsiteEvidence {
  originalUrl: string;
  finalUrl: string | null;
  statusCode: number | null;
  contentType: string | null;
  responseSize: number | null;
  fetchDurationMs: number | null;
  isHttps: boolean;
  extractedTitle: string | null;
  extractedDescription: string | null;
  extractedCanonical: string | null;
  contactData: {
    emails: string[];
    phones: string[];
    addressText?: string;
  };
  socialLinks: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
  };
  jsonLd: any[];
  extractionStatus: 'completed' | 'failed' | 'skipped';
  errorMessage: string | null;
  viewport?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogUrl?: string | null;
  ogType?: string | null;
  ogImage?: string | null;
  robots?: string | null;
  hasNav?: boolean;
  hasHeader?: boolean;
  hasMain?: boolean;
  hasFooter?: boolean;
  hasForm?: boolean;
}

function normalizeUrl(rawUrl: string): string {
  let url = rawUrl.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  try {
    const parsed = new URL(url);
    parsed.hash = ''; // Remove fragment
    return parsed.toString();
  } catch (e) {
    return url;
  }
}

export async function fetchAndExtractWebsite(rawUrl: string): Promise<WebsiteEvidence> {
  const startTime = Date.now();
  const evidence: WebsiteEvidence = {
    originalUrl: rawUrl,
    finalUrl: null,
    statusCode: null,
    contentType: null,
    responseSize: null,
    fetchDurationMs: null,
    isHttps: false,
    extractedTitle: null,
    extractedDescription: null,
    extractedCanonical: null,
    contactData: { emails: [], phones: [] },
    socialLinks: {},
    jsonLd: [],
    extractionStatus: 'pending' as any,
    errorMessage: null,
    hasNav: false,
    hasHeader: false,
    hasMain: false,
    hasFooter: false,
    hasForm: false,
  };

  const url = normalizeUrl(rawUrl);
  // isHttps will be updated using response.url later, but initialized safely
  evidence.isHttps = url.startsWith('https://');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000); // 15 seconds

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'BMTech-Bot/1.0 (+https://bmtech.ai)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
    });

    clearTimeout(timeout);

    evidence.finalUrl = response.url;
    evidence.statusCode = response.status;
    evidence.isHttps = new URL(response.url).protocol === 'https:';
    
    const contentType = response.headers.get('content-type') || '';
    evidence.contentType = contentType;

    if (!response.ok) {
      evidence.extractionStatus = 'failed';
      evidence.errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;
      evidence.fetchDurationMs = Date.now() - startTime;
      return evidence;
    }

    if (!contentType.toLowerCase().includes('text/html')) {
      evidence.extractionStatus = 'skipped';
      evidence.errorMessage = 'Non-HTML content type';
      evidence.fetchDurationMs = Date.now() - startTime;
      return evidence;
    }

    // Read response up to 2MB to prevent large file crashes
    const reader = response.body?.getReader();
    let html = '';
    let bytesRead = 0;
    const MAX_BYTES = 2 * 1024 * 1024; // 2MB

    if (reader) {
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          bytesRead += value.length;
          html += decoder.decode(value, { stream: true });
          if (bytesRead > MAX_BYTES) {
            // Cancel stream and stop reading
            reader.cancel();
            evidence.extractionStatus = 'skipped';
            evidence.errorMessage = 'response_too_large';
            evidence.responseSize = bytesRead;
            evidence.fetchDurationMs = Date.now() - startTime;
            return evidence;
          }
        }
      }
      html += decoder.decode();
    } else {
      // Fallback
      html = await response.text();
      bytesRead = new TextEncoder().encode(html).length;
    }

    evidence.responseSize = bytesRead;
    evidence.fetchDurationMs = Date.now() - startTime;

    // --- HTML Extraction using Cheerio ---
    const $ = cheerio.load(html);

    evidence.extractedTitle = $('title').text().trim().substring(0, 500) || null;
    evidence.extractedDescription = $('meta[name="description"]').attr('content')?.trim().substring(0, 1000) || null;
    evidence.extractedCanonical = $('link[rel="canonical"]').attr('href')?.trim() || null;

    // Extract Emails
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
    const emails = new Set<string>();
    
    // Check mailto links
    $('a[href^="mailto:"]').each((_, el) => {
      let href = $(el).attr('href') || '';
      href = href.replace('mailto:', '').split('?')[0].trim();
      if (href && emailRegex.test(href)) emails.add(href.toLowerCase());
    });
    
    // Fallback naive search in text
    if (emails.size === 0) {
      const bodyText = $('body').text();
      const matches = bodyText.match(emailRegex);
      if (matches) {
        matches.forEach(m => emails.add(m.toLowerCase()));
      }
    }
    evidence.contactData.emails = Array.from(emails).slice(0, 10); // cap at 10

    // Extract Socials
    const socialPatterns = {
      facebook: /facebook\.com\/([^\/]+)/i,
      instagram: /instagram\.com\/([^\/]+)/i,
      linkedin: /linkedin\.com\/(company|in)\/([^\/]+)/i,
      twitter: /twitter\.com\/([^\/]+)|x\.com\/([^\/]+)/i,
      youtube: /youtube\.com\/([^\/]+)/i,
      tiktok: /tiktok\.com\/([^\/]+)/i,
    };

    $('a[href]').each((_, el) => {
      const href = $(el).attr('href') || '';
      for (const [platform, pattern] of Object.entries(socialPatterns)) {
        if (pattern.test(href)) {
          (evidence.socialLinks as any)[platform] = href;
        }
      }
    });

    // Extract JSON-LD and Address / Phone fallback
    let addressStr = '';
    const phoneSet = new Set<string>();

    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const text = $(el).html();
        if (text) {
          const parsed = JSON.parse(text);
          const items = Array.isArray(parsed) ? parsed : [parsed];
          evidence.jsonLd.push(...items);
          
          items.forEach(ld => {
            if (ld && typeof ld === 'object') {
              // Extract phone from JSON-LD
              if (ld.telephone) {
                phoneSet.add(String(ld.telephone));
              }
              // Extract address from JSON-LD
              if (ld.address) {
                if (typeof ld.address === 'string') {
                  addressStr = ld.address;
                } else if (typeof ld.address === 'object') {
                  const parts = [
                    ld.address.streetAddress,
                    ld.address.addressLocality,
                    ld.address.addressRegion,
                    ld.address.postalCode,
                    ld.address.addressCountry
                  ].filter(Boolean);
                  if (parts.length > 0) addressStr = parts.join(', ');
                }
              }
            }
          });
        }
      } catch (e) {
        // ignore malformed JSON-LD
      }
    });

    // Extract Phone via tel links
    $('a[href^="tel:"]').each((_, el) => {
      let href = $(el).attr('href') || '';
      href = href.replace('tel:', '').split('?')[0].trim();
      if (href) phoneSet.add(href);
    });

    evidence.contactData.phones = Array.from(phoneSet).slice(0, 5);
    if (addressStr) {
      evidence.contactData.addressText = addressStr;
    }

    // Optional Metadata
    evidence.viewport = $('meta[name="viewport"]').attr('content')?.trim() || null;
    evidence.ogTitle = $('meta[property="og:title"]').attr('content')?.trim() || null;
    evidence.ogDescription = $('meta[property="og:description"]').attr('content')?.trim() || null;
    evidence.ogUrl = $('meta[property="og:url"]').attr('content')?.trim() || null;
    evidence.ogType = $('meta[property="og:type"]').attr('content')?.trim() || null;
    evidence.ogImage = $('meta[property="og:image"]').attr('content')?.trim() || null;
    evidence.robots = $('meta[name="robots"]').attr('content')?.trim() || null;

    // Structural elements
    evidence.hasNav = $('nav').length > 0;
    evidence.hasHeader = $('header').length > 0;
    evidence.hasMain = $('main').length > 0 || $('div[role="main"]').length > 0;
    evidence.hasFooter = $('footer').length > 0;
    evidence.hasForm = $('form').length > 0;

    evidence.extractionStatus = 'completed';

  } catch (error: any) {
    clearTimeout(timeout);
    evidence.extractionStatus = 'failed';
    evidence.errorMessage = error.name === 'AbortError' ? 'Fetch timed out' : String(error.message || error);
    evidence.fetchDurationMs = Date.now() - startTime;
  }

  return evidence;
}
