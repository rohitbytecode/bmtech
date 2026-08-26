'use client';

import IntroPreloader from '@/components/IntroPreloader';
import Hero from '@/components/Hero';
import Portfolio from '@/components/Portfolio';
import Packages from '@/components/Packages';
import Maintenance from '@/components/Maintenance';
import Process from '@/components/Process';
import About from '@/components/About';
import Contact from '@/components/Contact';
import DiscountBanner from '@/components/DiscountBanner';
import TechSlider from '@/components/TechSlider';
import GrowthStage from '@/components/GrowthStage';
import { useData } from '@/hooks/useData';
import { Settings } from '@/services/dataService';

const requiredEnv = [
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
];

function isEnvLoaded() {
  return requiredEnv.every(Boolean);
}

export default function Home() {
  const { data: settings } = useData<Settings>('settings');
  const s = settings?.[0];

  if (!isEnvLoaded()) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="max-w-xl rounded-3xl border border-red-500 bg-slate-900/90 p-10 shadow-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-red-400 mb-4">
            Configuration Required
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed mb-6">
            The homepage is unavailable because the required environment variables are not loaded.
            Please create a <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs">.env</code>{' '}
            file with the following keys:
          </p>
          <ul className="mb-6 list-disc pl-5 space-y-2 text-slate-300">
            <li>
              <code>NEXT_PUBLIC_SUPABASE_URL</code>
            </li>
            <li>
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
            </li>
          </ul>
          <p className="text-sm text-slate-400">
            Reload the page after adding the values to restore access.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-screen">
      <IntroPreloader />
      <DiscountBanner />
      <Hero />
      <TechSlider />
      <GrowthStage />
      <Portfolio />
      <Packages />
      <Maintenance />
      <Process />
      <About />
      <Contact />

      {/* ── Footer ── */}
      {/* Gradient divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent-blue/30 to-transparent" />

      <footer className="py-16 bg-background px-6 sm:px-12 md:px-24">
        <div className="max-w-7xl mx-auto">
          {/* Footer grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand column */}
            <div className="sm:col-span-2 lg:col-span-1">
              <h2 className="text-2xl font-bold tracking-tight text-foreground mb-3">
                {s ? (
                  <>
                    {s.agency_name.split(' ')[0]}
                    <span className="text-accent-blue">
                      {s.agency_name.split(' ').slice(1).join(' ')}
                    </span>
                  </>
                ) : (
                  <>
                    BM<span className="text-accent-blue">Tech</span>
                  </>
                )}
              </h2>
              <p className="text-text-secondary text-sm max-w-xs leading-relaxed mb-6">
                Premium digital agency crafting high-impact experiences for modern brands.
              </p>
              {/* Social icons */}
              <div className="flex items-center gap-3">
                {[
                  {
                    label: 'LinkedIn',
                    href: 'https://www.linkedin.com/in/vinay-dharaiya-940b94412',
                    icon: (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    ),
                  },
                  {
                    label: 'Instagram',
                    href: 'https://www.instagram.com/brothers_mediatech',
                    icon: (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                    ),
                  },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center text-text-secondary hover:text-accent-blue hover:border-accent-blue/40 hover:bg-accent-blue/5 transition-all duration-200"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">Quick Links</h3>
              <ul className="space-y-3">
                {[
                  { label: 'Services', href: '#services' },
                  { label: 'Portfolio', href: '#portfolio' },
                  { label: 'Packages', href: '#packages' },
                  { label: 'About', href: '#about' },
                  { label: 'Contact', href: '#contact' },
                ].map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-text-secondary hover:text-accent-blue transition-colors duration-200 inline-flex items-center gap-1 group/link"
                    >
                      <span className="w-0 group-hover/link:w-2 h-px bg-accent-blue transition-all duration-200" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">Services</h3>
              <ul className="space-y-3">
                {['Web Development', 'UI/UX Design', 'Video Production', 'Digital Marketing'].map(
                  (service) => (
                    <li key={service}>
                      <a
                        href="#services"
                        className="text-sm text-text-secondary hover:text-accent-blue transition-colors duration-200 inline-flex items-center gap-1 group/link"
                      >
                        <span className="w-0 group-hover/link:w-2 h-px bg-accent-blue transition-all duration-200" />
                        {service}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </div>

            {/* Contact info */}
            <div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">Get In Touch</h3>
              <ul className="space-y-3">
                <li className="text-sm text-text-secondary">
                  {s?.contact_email || 'brothersmediatech@gmail.com'}
                </li>
                <li className="text-sm text-text-secondary">
                  {s?.contact_phone || '+91 77788-64972'}
                </li>
                <li className="text-sm text-text-secondary">
                  Mon – Fri, 10 AM – 7 PM IST
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="h-px bg-border/50 mb-8" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-text-secondary text-sm">
              © 2026 {s?.agency_name || 'Brothers Mediatech'}. All rights reserved.
            </p>

            <div className="flex items-center gap-4">
              <p className="text-text-secondary text-xs">
                Made with <span className="text-red-500">❤</span> by BMTech
              </p>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center text-text-secondary hover:text-accent-blue hover:border-accent-blue/40 transition-all duration-200"
                aria-label="Back to top"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 12V2M2 5l5-3 5 3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
