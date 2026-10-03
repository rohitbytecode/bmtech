import type { Metadata } from 'next';
import { Sora, Inter } from 'next/font/google';
import { headers } from 'next/headers';
import './globals.css';
import Header from '../components/Header';
import CustomCursor from '../components/CustomCursor';
import { ThemeProvider } from '../components/ThemeContext';
import SmoothScrollProvider from '../components/SmoothScrollProvider';
import ScrollProgress from '../components/ScrollProgress';

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  weight: ['600', '700', '800'],
  preload: false, // skip build-time Google Fonts fetch (Vercel network restriction)
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
  preload: false, // skip build-time Google Fonts fetch (Vercel network restriction)
});

export const metadata: Metadata = {
  metadataBase: new URL('https://bmtech.in'),
  title: {
    default: 'BMTech - Engineering Digital Excellence',
    template: '%s | BMTech',
  },
  description:
    'BMTech is a premium digital agency specializing in web development, UI/UX design, video production, and digital marketing for businesses that want to lead.',
  keywords: [
    'digital agency India',
    'web development',
    'UI/UX design',
    'video production',
    'digital marketing',
    'Brothers Mediatech',
    'BMTech',
  ],
  authors: [{ name: 'Brothers Mediatech', url: 'https://bmtech.in' }],
  creator: 'Brothers Mediatech',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://bmtech.in',
    siteName: 'BMTech',
    title: 'BMTech - Engineering Digital Excellence',
    description:
      'We partner with forward-thinking enterprises to design, build, and scale world-class digital products and infrastructure.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BMTech — Engineering Digital Excellence',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BMTech - Engineering Digital Excellence',
    description:
      'Premium digital agency crafting high-impact experiences for modern brands.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/bm-glow.png',
    shortcut: '/bm-glow.png',
    apple: '/bm-glow.png',
  },
  alternates: {
    canonical: 'https://bmtech.in',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const isMaintenance = headersList.get('x-maintenance-mode') === 'true';

  return (
    <html lang="en" className={`${sora.variable} ${inter.variable} antialiased`}>
      <body className="font-body bg-background text-foreground overflow-x-hidden transition-colors duration-300">
        <SmoothScrollProvider>
          <ScrollProgress />
          <ThemeProvider>
            <CustomCursor />
            {!isMaintenance && <Header />}
            {children}
            {/* JSON-LD Structured Data */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify([
                  {
                    '@context': 'https://schema.org',
                    '@type': 'Organization',
                    name: 'Brothers Mediatech',
                    alternateName: 'BMTech',
                    url: 'https://bmtech.in',
                    logo: 'https://bmtech.in/bm-glow.png',
                    description:
                      'Premium digital agency specializing in web development, UI/UX design, video production, and digital marketing.',
                    contactPoint: {
                      '@type': 'ContactPoint',
                      telephone: '+91-63538-32814',
                      contactType: 'sales',
                      availableLanguage: ['English', 'Hindi'],
                    },
                    sameAs: [
                      'https://www.linkedin.com/in/vinay-dharaiya-940b94412',
                      'https://www.instagram.com/brothers_mediatech',
                    ],
                  },
                  {
                    '@context': 'https://schema.org',
                    '@type': 'WebSite',
                    name: 'BMTech',
                    url: 'https://bmtech.in',
                    potentialAction: {
                      '@type': 'SearchAction',
                      target: 'https://bmtech.in/?q={search_term_string}',
                      'query-input': 'required name=search_term_string',
                    },
                  },
                ]),
              }}
            />
          </ThemeProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
