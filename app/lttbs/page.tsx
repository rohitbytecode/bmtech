import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowUpRight,
  BookOpen,
  Shield,
  CalendarCheck,
  Globe,
  Layers,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Laxmi Tours & Travels - LTTBS | BM Tech',
  description:
    'Laxmi Tours & Travels digital platform currently under development by BM Tech. View the API documentation and project status.',
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const projectDetails = [
  { label: 'Project', value: 'Laxmi Tours & Travels' },
  { label: 'Client', value: 'Laxmi Tours & Travels' },
  { label: 'Development', value: 'BM Tech' },
  { label: 'Status', value: 'In Development' },
] as const;

const capabilities = [
  {
    icon: Shield,
    title: 'Secure Authentication',
    description: 'Token-based auth with role management and session handling.',
  },
  {
    icon: CalendarCheck,
    title: 'Booking Management',
    description: 'End-to-end booking lifecycle from creation to fulfilment.',
  },
  {
    icon: Globe,
    title: 'REST API',
    description: 'Clean, documented endpoints for all platform operations.',
  },
  {
    icon: Layers,
    title: 'Versioned Architecture',
    description: 'API versioning for stable integrations and future growth.',
  },
] as const;

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function LttbsPage() {
  return (
    <main className="relative min-h-screen bg-background text-text-primary selection:bg-accent-blue/30">
      {/* Subtle top-edge gradient accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[480px] opacity-40"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(37,99,235,0.12) 0%, transparent 70%)',
        }}
      />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center px-6 pt-20 pb-24 sm:pt-24 sm:pb-32 lg:pt-28 lg:pb-36">
        {/* Status badge */}
        <div className="mb-8 flex items-center gap-2.5 rounded-full border border-border bg-surface/60 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-text-secondary backdrop-blur-sm">
          <span
            aria-hidden="true"
            className="relative flex h-2 w-2"
          >
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400/60 motion-reduce:animate-none" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
          </span>
          Work in Progress
        </div>

        {/* Eyebrow */}
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.25em] text-text-secondary/70">
          LTTBS &middot; Client Project
        </p>

        {/* Main heading */}
        <h1 className="max-w-2xl text-center text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          Laxmi Tours{' '}
          <span className="bg-gradient-to-r from-accent-blue to-blue-400 bg-clip-text text-transparent">
            &amp; Travels
          </span>
        </h1>

        {/* Supporting heading */}
        <p className="mt-5 text-lg font-medium text-text-secondary sm:text-xl">
          Digital platform currently in development.
        </p>

        {/* Description */}
        <p className="mt-4 max-w-xl text-center text-sm leading-relaxed text-text-secondary/80 sm:text-base">
          We&rsquo;re building a modern management platform for Laxmi Tours
          &amp; Travels. The system is currently under active development and
          will bring operations, bookings, and business workflows into a unified
          platform.
        </p>

        {/* CTA */}
        <div className="mt-10 flex flex-col items-center gap-3">
          <Link
            href="/lttbs/api/docs"
            className="group inline-flex items-center gap-2.5 rounded-xl border border-accent-blue/30 bg-accent-blue px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-blue/20 transition-all duration-200 hover:bg-blue-700 hover:shadow-accent-blue/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <BookOpen size={16} strokeWidth={2.25} aria-hidden="true" />
            View API Documentation
            <ArrowUpRight
              size={14}
              strokeWidth={2.5}
              aria-hidden="true"
              className="opacity-60 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 motion-reduce:transition-none"
            />
          </Link>
          <span className="text-xs text-text-secondary/60">API Reference</span>
        </div>
      </section>

      {/* ── Project Information ──────────────────────────────────── */}
      <section
        aria-label="Project details"
        className="relative mx-auto max-w-3xl px-6 pb-20 sm:pb-24"
      >
        <div className="rounded-2xl border border-border bg-surface/50 p-6 backdrop-blur-sm sm:p-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {projectDetails.map(({ label, value }) => (
              <div key={label} className="space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary/60">
                  {label}
                </p>
                <p className="text-sm font-medium text-text-primary">
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Documentation link inside card */}
          <div className="mt-6 border-t border-border pt-5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary/60">
                  Documentation
                </p>
                <Link
                  href="/lttbs/api/docs"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-blue transition-colors duration-150 hover:text-blue-400 focus-visible:outline-none focus-visible:underline"
                >
                  API Reference
                  <ArrowUpRight size={13} strokeWidth={2.5} aria-hidden="true" />
                </Link>
              </div>
              <div className="hidden sm:flex items-center gap-2 rounded-lg border border-amber-400/20 bg-amber-400/5 px-3 py-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400/60 motion-reduce:animate-none" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-400" />
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400/80">
                  In Development
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Technical / Capabilities ─────────────────────────────── */}
      <section
        aria-labelledby="capabilities-heading"
        className="relative mx-auto max-w-4xl px-6 pb-24 sm:pb-32"
      >
        <div className="mb-10 text-center">
          <h2
            id="capabilities-heading"
            className="text-xl font-bold tracking-tight sm:text-2xl"
          >
            Building the Foundation
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Core systems powering the LTTBS platform.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group rounded-xl border border-border bg-surface/40 p-5 transition-colors duration-200 hover:border-border hover:bg-surface/70"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background">
                <Icon
                  size={18}
                  strokeWidth={1.75}
                  className="text-accent-blue"
                  aria-hidden="true"
                />
              </div>
              <h3 className="text-sm font-semibold tracking-tight">
                {title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-text-secondary/80">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-border py-8 text-center">
        <p className="text-xs text-text-secondary/60">
          &copy; 2026 BM Tech &middot; Laxmi Tours &amp; Travels
        </p>
        <p className="mt-1 text-[11px] text-text-secondary/40">
          Built by BM Tech
        </p>
      </footer>
    </main>
  );
}
