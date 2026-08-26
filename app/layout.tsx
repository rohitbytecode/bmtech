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
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'BMTech - Engineering Digital Excellence.',
  description: 'Digital agency specializing in Graphics, Video, IT Services, and Social Media.',
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
          </ThemeProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
