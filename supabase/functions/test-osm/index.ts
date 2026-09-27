const query = `[out:json][timeout:25];(node["amenity"="cafe"](21.0494,72.6717,21.3694,72.9917););out center 10;`;

const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.openstreetmap.fr/api/interpreter",
];

async function testEndpoint(url: string) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'User-Agent': 'BMTech Marketing App (admin@bmtech.in)',
      },
      body: query,
    });

    const contentType = response.headers.get('content-type') || 'unknown';
    const bodyText = await response.text();

    return {
      url,
      status: response.status,
      statusText: response.statusText,
      contentType,
      bodyPrefix: bodyText.slice(0, 500),
      error: null,
    };
  } catch (err: any) {
    return {
      url,
      status: null,
      statusText: null,
      contentType: null,
      bodyPrefix: null,
      error: err.message,
    };
  }
}

Deno.serve(async (_req: Request) => {
  const results = await Promise.allSettled(
    ENDPOINTS.map(url => testEndpoint(url))
  );

  const output = results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value;
    return { url: ENDPOINTS[i], error: r.reason?.message ?? 'Unknown error' };
  });

  return new Response(JSON.stringify(output, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
});
