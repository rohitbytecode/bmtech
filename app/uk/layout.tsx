import type { Metadata } from 'next';
import ComingSoon from '@/components/ComingSoon';

export const metadata: Metadata = {
  title: 'White-Label Video Production for UK Agencies',
  description:
    'Scale your content production without expanding your in-house team. BMTech is a white-label creative production partner for UK marketing, social media, and advertising agencies — delivering short-form edits, motion graphics, Reels, TikTok, and video content under your brand.',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'BMTech - White-Label Video Production for UK Agencies',
    description: 'Scale your content production. BMTech is your white-label creative partner.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  icons: {
    icon: '/bm-glow.png',
    shortcut: '/bm-glow.png',
    apple: '/bm-glow.png',
  },
};

export default function UKLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === 'production') {
    return <ComingSoon />;
  }

  return <>{children}</>;
}
