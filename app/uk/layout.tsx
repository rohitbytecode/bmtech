import type { Metadata } from 'next';
import ComingSoon from '@/components/ComingSoon';

export const metadata: Metadata = {
  title: 'BMTech — White-Label Video Production for UK Agencies',
  description:
    'Scale your content production without expanding your in-house team. BMTech is a white-label creative production partner for UK marketing, social media, and advertising agencies — delivering short-form edits, motion graphics, Reels, TikTok, and video content under your brand.',
  icons: {
    icon: '/bm-glow.png',
    shortcut: '/bm-glow.png',
    apple: '/bm-glow.png',
  },
};

export default function UKLayout({ children }: { children: React.ReactNode }) {
  const isComingSoon =
    process.env.NODE_ENV === 'production' ||
    process.env.NEXT_PUBLIC_UK_COMING_SOON === 'true';

  if (isComingSoon) {
    return <ComingSoon />;
  }

  return <>{children}</>;
}
