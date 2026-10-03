import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/gx91b/',
          '/dashboard/',
          '/login',
          '/signup',
          '/unauthorized',
          '/maintenance',
        ],
      },
    ],
    sitemap: 'https://bmtech.in/sitemap.xml',
  };
}
