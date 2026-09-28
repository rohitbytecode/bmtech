'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Clapperboard,
  Send,
  FileText,
  Eye,
  PackageCheck,
  Lock,
  Sun,
  Moon,
  Menu,
  X,
  Check,
  Film,
  Code,
  Megaphone,
  Star,
  ShieldCheck,
  Clock,
  TrendingDown,
  Layers,
  Play,
  CheckCircle2,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { dataService } from '@/services/dataService';
import { useTheme } from '@/components/ThemeContext';


/* ─────────────────────────── METADATA ─────────────────────────── */
// Next.js App Router: per-route metadata must be exported from a
// separate file or from a server component. Since this page is
// 'use client', we export metadata from a companion layout instead.
// See app/uk/layout.tsx — but for a client page we skip the export.

/* ─────────────────────────── CONSTANTS ─────────────────────────── */

const UK_NAV_LINKS = [
  { label: 'Packages', href: '#packages' },
  { label: 'Services', href: '#services' },
  { label: 'Work', href: '#portfolio' },
  { label: 'Process', href: '#process' },
  { label: 'Why BMTech', href: '#why' },
  { label: 'Contact', href: '#contact' },
];

const PACKAGES = [
  {
    name: 'Starter Package',
    price: '£299',
    period: '/month',
    highlighted: false,
    features: [
      '6 Short-Form Videos — Reels/Shorts using stock footage where required',
      'Captions & Subtitles for all videos',
      'Basic Colour Correction',
      'Basic Sound Design',
      'Basic Motion Graphics',
      '2 Revision Rounds per Video',
      '3–5 Working Days Turnaround',
      'White-Label Delivery',
      'Dedicated Project Communication',
      '12 Social Media Posts',
    ],
  },
  {
    name: 'Growth Package',
    price: '£599',
    period: '/month',
    highlighted: true,
    features: [
      '12 Short-Form Videos',
      'Advanced Editing',
      'Captions & Subtitles',
      'Colour Grading',
      'Motion Graphics',
      'Sound Design & SFX',
      'Content Repurposing',
      '2 Revision Rounds',
      '2–4 Working Days Turnaround',
      'White-Label Delivery',
      'Priority Production Queue',
      '16 Social Media Posts',
    ],
  },
  {
    name: 'Scale Package',
    price: '£999',
    period: '/month',
    highlighted: false,
    features: [
      '20 Short-Form Videos',
      'Advanced Editing',
      'VFX & SFX — 1–1.5× where required',
      'Motion Graphics',
      'Colour Grading',
      'Captions & Subtitles',
      'Long-Form → Short-Form Repurposing',
      'Custom Client Branding',
      '2 Revision Rounds',
      '2–3 Working Days Standard Turnaround',
      'Priority Queue',
      'White-Label Delivery',
      'Dedicated Production Coordinator',
      '20 Social Media Posts',
    ],
  },
];

const SPECIALIST_SERVICES = [
  {
    icon: Film,
    title: 'Post-Production & VFX',
    cta: 'Request a Quote',
    features: [
      'Advanced Video Editing',
      'Cinematic Editing',
      'Colour Grading',
      'Motion Graphics',
      'VFX & Compositing',
      'SFX & Sound Design',
      'Green Screen Work',
      '3D Integration',
      'Commercial & Advertising Production',
    ],
  },
  {
    icon: Code,
    title: 'IT & Software Development',
    cta: 'Discuss Your Project',
    features: [
      'Business Websites',
      'Web Applications',
      'Custom Dashboards',
      'Backend & API Development',
      'Database Systems',
      'SaaS Development',
      'Database Management',
      'Integrations & Automation',
      'Maintenance & Support',
    ],
  },
  {
    icon: Megaphone,
    title: 'Digital Marketing',
    cta: 'Start a Campaign',
    features: [
      'Social Media Management',
      'Content Strategy',
      'Paid Advertising',
      'Creative Campaign Management',
      'Analytics & Reporting',
    ],
  },
];

const PROCESS_STEPS = [
  {
    number: '01',
    title: 'Send your brief & footage',
    desc: 'Share RAW files, brand guidelines, reference links and creative direction. We plug straight into your workflow.',
    icon: Send,
  },
  {
    number: '02',
    title: 'BMTech produces the content',
    desc: 'Our dedicated editors and motion designers get to work — fast, focused, and fully behind the scenes.',
    icon: Clapperboard,
  },
  {
    number: '03',
    title: 'You review',
    desc: 'Structured review rounds with defined revision limits and rapid turnaround on feedback.',
    icon: Eye,
  },
  {
    number: '04',
    title: 'We deliver final assets',
    desc: 'White-labelled, export-ready files delivered to spec — ready to hand straight to your client.',
    icon: PackageCheck,
  },
];

const WHY_POINTS = [
  { title: 'Flexible production capacity', desc: 'Scale up or down based on your pipeline — no fixed overhead or long-term commitments.' },
  { title: 'White-label delivery', desc: 'Every asset delivered under your brand. Your clients never see us.' },
  { title: 'Direct communication', desc: 'No account managers in the way. Speak directly with the team producing your content.' },
  { title: 'Defined turnaround times', desc: 'Clear SLAs on every project so you can plan your client timelines with confidence.' },
  { title: 'Defined revision limits', desc: 'Structured revision rounds keep projects moving and budgets predictable.' },
  { title: 'Scalable production', desc: 'From one-off projects to ongoing retainers — we grow with your agency.' },
  { title: 'Remote collaboration', desc: 'Async-first workflow designed for cross-timezone teams. London mornings, deliveries by EOD.' },
];

const PORTFOLIO_PLACEHOLDERS = Array.from({ length: 8 }, (_, i) => ({
  id: `uk-project-${i + 1}`,
  category: ['Short-Form', 'Motion Graphics', 'Reels', 'VFX', 'Repurposing', 'Social Video', 'Creative Production', 'TikTok'][i % 8],
}));

/* ─────────────────────────── ANIMATION VARIANTS ─────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ─────────────────────────── SUCCESS CHECKMARK ─────────────────────────── */

function SuccessCheckmark() {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20" viewBox="0 0 64 64">
          <circle
            cx="32" cy="32" r="30" fill="none" stroke="#2563eb" strokeWidth="2"
            style={{ transformOrigin: 'center', animation: 'circleGrow 0.5s ease forwards' }}
          />
          <path
            d="M20 33 L28 41 L44 25" fill="none" stroke="#2563eb" strokeWidth="3"
            strokeLinecap="round" strokeLinejoin="round" strokeDasharray="48" strokeDashoffset="48"
            style={{ animation: 'checkDraw 0.4s ease 0.4s forwards' }}
          />
        </svg>
      </div>
      <div className="text-center">
        <h3 className="text-2xl font-bold text-foreground mb-2">Message Sent!</h3>
        <p className="text-text-secondary">We&apos;ll get back to you within 24 hours.</p>
      </div>
    </div>
  );
}

/* ─────────────────────────── PAGE COMPONENT ─────────────────────────── */

export default function UKLandingPage() {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /* ── Contact Form State ── */
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const isFieldActive = (field: string, value: string) => focusedField === field || value.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await dataService.submitLead({
        name: formData.name,
        email: formData.email,
        message: `[UK Agency Inquiry] ${formData.message}`,
      });

      if (!result.success) {
        throw new Error(result.error || 'Unable to submit inquiry.');
      }

      setSuccess(true);
      setFormData({ name: '', email: '', message: '' });
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : String(submitError ?? 'Unknown error');
      console.error('UK lead submission failed:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const scrollTo = (id: string, context?: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
    if (context && (!formData.message || formData.message.startsWith('Inquiry for '))) {
      setFormData((prev) => ({
        ...prev,
        message: `Inquiry for ${context}: `,
      }));
    }
  };

  return (
    <main className="public-site flex flex-col min-h-screen">

      {/* ════════════════════════ HEADER ════════════════════════ */}
      <motion.header
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-5 sm:top-6 left-0 right-0 z-50 flex justify-center px-4 sm:px-8 pointer-events-none"
      >
        <nav className="pointer-events-auto w-auto gap-6 md:gap-12 lg:gap-20 bg-[#222326] dark:bg-[#18191c] text-white rounded-full px-3 sm:px-5 lg:px-6 py-2 shadow-2xl border border-slate-700/60 dark:border-slate-800/80 backdrop-blur-xl flex items-center justify-between transition-colors duration-300">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="flex items-center justify-center">
              <Image
                src="/bm-glow.png"
                alt="BMTech Logo"
                width={36}
                height={36}
                className="object-contain drop-shadow-[0_0_6px_rgba(37,99,235,0.7)] group-hover:drop-shadow-[0_0_12px_rgba(37,99,235,1)] transition-all duration-300"
                priority
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm sm:text-base font-extrabold tracking-tight text-white font-heading">
                Brothers
              </span>
              <span className="text-[8px] sm:text-[9px] font-bold tracking-[0.25em] text-slate-400 uppercase">
                MEDIATECH
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6">
            {UK_NAV_LINKS.map((link) => (
              <button
                key={link.label}
                onClick={() => scrollTo(link.href.replace('#', ''))}
                className="group relative text-[13px] xl:text-sm font-semibold text-slate-300 hover:text-white transition-colors duration-200 whitespace-nowrap bg-transparent border-none"
              >
                {link.label}
                <span className="absolute -bottom-1.5 left-0 w-0 h-[2px] bg-accent-blue transition-all duration-300 group-hover:w-full rounded-full" />
              </button>
            ))}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
            </button>
            <button
              onClick={() => scrollTo('contact')}
              className="relative overflow-hidden bg-gradient-to-r from-sky-400 to-blue-700 hover:from-blue-700 hover:to-sky-400 text-white px-5 py-2 text-[13px] font-bold rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.45)] group ml-1"
            >
              <span className="relative z-10">Start a Project</span>
            </button>
          </div>

          {/* Mobile Controls */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-white"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute top-20 left-4 right-4 pointer-events-auto max-w-md mx-auto bg-[#222326] text-white rounded-3xl p-6 shadow-2xl border border-slate-700/80 space-y-3.5 md:hidden z-50"
          >
            {UK_NAV_LINKS.map((link) => (
              <button
                key={link.label}
                onClick={() => scrollTo(link.href.replace('#', ''))}
                className="block w-full text-left px-4 py-2.5 text-base font-semibold text-slate-200 hover:text-white hover:bg-white/10 rounded-2xl transition-colors bg-transparent border-none"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => scrollTo('contact')}
              className="block w-full text-center bg-gradient-to-r from-sky-400 to-blue-700 text-white px-5 py-3 text-base font-bold mt-4 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.45)]"
            >
              Start a Project
            </button>
          </motion.div>
        )}
      </motion.header>

      {/* ════════════════════════ 1. HERO (GITHUB UNIVERSE DESIGN) ════════════════════════ */}
      <section className="relative min-h-[96vh] flex flex-col items-center justify-center pt-28 sm:pt-32 md:pt-36 pb-20 px-6 sm:px-12 md:px-20 overflow-hidden bg-[#faf9f5] dark:bg-[#07090e] text-slate-900 dark:text-white transition-colors duration-300">
        {/* Cosmic Aurora Top Spotlight (GitHub Universe style) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[520px] bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(59,130,246,0.3),rgba(99,102,241,0.18),transparent_70%)] pointer-events-none" />

        {/* Fine Technical Grid Mesh */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_35%,#000_60%,transparent_100%)] pointer-events-none" />

        {/* Subtle Ambient Nebula Glows */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.45, 0.25] }}
          transition={{ duration: 14, ease: 'easeInOut', repeat: Infinity }}
          className="absolute top-[18%] -left-[10%] w-[420px] h-[420px] rounded-full bg-blue-600/15 blur-[120px] pointer-events-none transform-gpu"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 16, ease: 'easeInOut', repeat: Infinity, delay: 2 }}
          className="absolute top-[28%] -right-[10%] w-[450px] h-[450px] rounded-full bg-indigo-600/15 blur-[130px] pointer-events-none transform-gpu"
        />

        <div className="max-w-5xl mx-auto text-center relative z-10 w-full">
          {/* GitHub Universe Monospace Telemetry Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="inline-flex items-center gap-2.5 mb-8 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-50 dark:bg-blue-950/40 backdrop-blur-xl shadow-[0_0_20px_rgba(59,130,246,0.15)]"
          >
            <span className="text-[11px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-300 border border-blue-400/30">
              UK Agency Partner
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs sm:text-sm font-semibold tracking-wide text-slate-800 dark:text-blue-100">
              White-Label Creative Production Desk
            </span>
          </motion.div>

          {/* High-Contrast Aurora Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] mb-6 font-heading"
          >
            Scale your content velocity
            <br />
            <span className="bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 dark:from-sky-300 dark:via-blue-400 dark:to-indigo-300 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(59,130,246,0.25)]">
              without expanding in-house payroll.
            </span>
          </motion.h1>

          {/* Supporting paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto font-body leading-relaxed font-normal"
          >
            BMTech operates as your agency&apos;s invisible, back-office production engine — delivering
            high-retention short-form edits, cinematic motion graphics, and video repurposing under your brand.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-16"
          >
            <button
              onClick={() => scrollTo('contact')}
              className="relative w-full sm:w-auto h-13 px-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-[0_0_25px_rgba(37,99,235,0.4)] hover:shadow-[0_0_35px_rgba(37,99,235,0.6)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start a Project
                <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <button
              onClick={() => scrollTo('portfolio')}
              className="w-full sm:w-auto h-13 px-8 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-blue-500/50 font-bold text-sm rounded-xl transition-all hover:scale-105 active:scale-95 shadow-sm flex items-center justify-center gap-2"
            >
              <Play size={15} className="text-blue-500" />
              View Our Work
            </button>
          </motion.div>

          {/* ── Universe Production Deck Centerpiece ── */}
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-4xl mx-auto rounded-2xl bg-surface/90 dark:bg-slate-950/80 backdrop-blur-2xl border border-slate-200 dark:border-slate-800/90 shadow-2xl dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden text-left relative group hover:border-blue-500/40 transition-colors duration-500"
          >
            {/* Top glowing edge */}
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-80" />

            {/* Console Header Bar */}
            <div className="px-5 py-3.5 bg-slate-100/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-3 font-mono text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline-block">
                  bmtech-engine // live-stream-ingest.uk // 4K_60FPS
                </span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                PRODUCTION ENGINE: ACTIVE
              </div>
            </div>

            {/* Multi-Track Timeline Visualizer */}
            <div className="p-6 sm:p-8 space-y-4">
              {/* Track 1: Ingest */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0 font-mono font-bold">
                    01
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Agency Footage Ingest</p>
                    <p className="text-text-secondary text-[11px]">London Agency Drive // 12 RAW Reels + B-Roll</p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 self-start sm:self-auto font-mono text-[11px] text-blue-500 dark:text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md">
                  <CheckCircle2 size={13} />
                  <span>SYNCED &bull; 48.2 GB</span>
                </div>
              </div>

              {/* Track 2: VFX & Grading */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 shrink-0 font-mono font-bold">
                    02
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Cinematic Colour &amp; Kinetic Motion</p>
                    <p className="text-text-secondary text-[11px]">Davinci Grading &bull; Dynamic Subtitles &bull; Sound SFX</p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 self-start sm:self-auto font-mono text-[11px] text-amber-500 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md">
                  <Activity size={13} className="animate-spin" />
                  <span>RENDERING &bull; 94%</span>
                </div>
              </div>

              {/* Track 3: White-Label Delivery */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0 font-mono font-bold">
                    03
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">White-Label Delivery SLA</p>
                    <p className="text-text-secondary text-[11px]">Anonymized Export &bull; Ready to Hand to Client</p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 self-start sm:self-auto font-mono text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md">
                  <ShieldCheck size={13} />
                  <span>DISPATCH READY &bull; 48H SLA</span>
                </div>
              </div>

              {/* Bottom Quick-Metrics Strip */}
              <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center border-t border-slate-200 dark:border-slate-800/80">
                <div className="p-2">
                  <p className="text-lg font-extrabold text-foreground font-heading">120+</p>
                  <p className="text-[11px] text-text-secondary">Edits Delivered/Mo</p>
                </div>
                <div className="p-2">
                  <p className="text-lg font-extrabold text-blue-500 font-heading">2–4 Days</p>
                  <p className="text-[11px] text-text-secondary">Standard Turnaround</p>
                </div>
                <div className="p-2">
                  <p className="text-lg font-extrabold text-foreground font-heading">100%</p>
                  <p className="text-[11px] text-text-secondary">White-Label Shield</p>
                </div>
                <div className="p-2">
                  <p className="text-lg font-extrabold text-indigo-500 font-heading">2 Rounds</p>
                  <p className="text-[11px] text-text-secondary">Guaranteed Revisions</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════ 2. PROBLEM (GITHUB UNIVERSE BENTO GRID) ════════════════════════ */}
      <section className="py-20 md:py-28 px-6 sm:px-12 md:px-24 bg-background relative overflow-hidden transition-colors duration-300">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-blue-600/5 dark:bg-blue-600/10 blur-[130px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="inline-flex items-center gap-2 mb-4 px-3.5 py-1 rounded-full border border-blue-500/20 bg-blue-500/10">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span className="font-mono text-[11px] font-bold tracking-[0.2em] uppercase text-blue-500">
                THE AGENCY SCALING PARADOX
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight mb-6 font-heading">
              Your clients need more video.
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 dark:from-blue-400 dark:via-indigo-300 dark:to-sky-300 bg-clip-text text-transparent">
                Your team shouldn&apos;t absorb the overhead.
              </span>
            </h2>
            <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
              Hiring in-house UK editors is costly and rigid. Freelancers are erratic. Client margins are under pressure.
              Here is how BMTech re-engineers your production pipeline:
            </p>
          </motion.div>

          {/* GitHub Universe 4-Card Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* Bento Card 1: Payroll Trap vs Flat Retainer */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={1}
              className="group relative p-8 rounded-2xl bg-surface/90 dark:bg-slate-950/70 border border-border dark:border-slate-800/90 shadow-sm hover:shadow-xl hover:border-blue-500/40 transition-all duration-300 flex flex-col justify-between overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors pointer-events-none" />
              <div>
                <div className="flex items-center justify-between gap-3 mb-6">
                  <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                    <TrendingDown size={22} />
                  </div>
                  <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400 font-bold px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                    SAVE ~65% OVERHEAD
                  </span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3 font-heading">
                  In-House Payroll Trap vs. Flat On-Demand Retainer
                </h3>
                <div className="space-y-3 my-4 text-sm">
                  <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/15 text-text-secondary">
                    <span className="font-semibold text-rose-500 mr-2">&times; UK In-House:</span>
                    £42,000+ salary + employer NI, pension, holiday cover, software licenses, and paid downtime between client briefs.
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-text-secondary">
                    <span className="font-semibold text-emerald-500 mr-2">&check; BMTech Model:</span>
                    Fixed monthly retainers starting at £299/mo. Zero payroll liability, zero HR headaches, scale capacity up or down instantly.
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-border/80 flex items-center gap-2 font-mono text-[11px] text-text-secondary">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>BENCHMARK // PREDICTABLE AGENCY PROFIT MARGINS</span>
              </div>
            </motion.div>

            {/* Bento Card 2: Freelancer Risk vs SLA Guarantee */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={2}
              className="group relative p-8 rounded-2xl bg-surface/90 dark:bg-slate-950/70 border border-border dark:border-slate-800/90 shadow-sm hover:shadow-xl hover:border-blue-500/40 transition-all duration-300 flex flex-col justify-between overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors pointer-events-none" />
              <div>
                <div className="flex items-center justify-between gap-3 mb-6">
                  <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                    <Clock size={22} />
                  </div>
                  <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 font-bold px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                    2–4 WORKING DAYS SLA
                  </span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3 font-heading">
                  Freelancer Drift vs. Ironclad Production SLA
                </h3>
                <div className="space-y-3 my-4 text-sm">
                  <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/15 text-text-secondary">
                    <span className="font-semibold text-rose-500 mr-2">&times; Freelancers:</span>
                    Ghosting right before client deadlines, juggling competing projects, variable video quality, and nickel-and-diming for revisions.
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-text-secondary">
                    <span className="font-semibold text-emerald-500 mr-2">&check; BMTech Model:</span>
                    Defined 2–4 working day turnarounds. 2 structured revision rounds per asset. Dedicated Slack/WhatsApp or portal communication.
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-border/80 flex items-center gap-2 font-mono text-[11px] text-text-secondary">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span>TIMELINES // NO MISSED CLIENT POSTING DATES</span>
              </div>
            </motion.div>

            {/* Bento Card 3: White-Label Invisibility Shield */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={3}
              className="group relative p-8 rounded-2xl bg-surface/90 dark:bg-slate-950/70 border border-border dark:border-slate-800/90 shadow-sm hover:shadow-xl hover:border-blue-500/40 transition-all duration-300 flex flex-col justify-between overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
              <div>
                <div className="flex items-center justify-between gap-3 mb-6">
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                    <ShieldCheck size={22} />
                  </div>
                  <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-bold px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    100% INVISIBLE TO CLIENTS
                  </span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3 font-heading">
                  Client Poaching Risk vs. 100% White-Label Shield
                </h3>
                <div className="space-y-3 my-4 text-sm">
                  <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/15 text-text-secondary">
                    <span className="font-semibold text-rose-500 mr-2">&times; Third Parties:</span>
                    Freelancers tagging client videos on their public portfolio or bypassing your agency to pitch your client directly.
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-text-secondary">
                    <span className="font-semibold text-emerald-500 mr-2">&check; BMTech Model:</span>
                    100% anonymized white-label files. Strict mutual NDAs. Delivered ready to pass directly to your client under your own brand banner.
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-border/80 flex items-center gap-2 font-mono text-[11px] text-text-secondary">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>CONFIDENTIALITY // YOUR CLIENTS NEVER SEE US</span>
              </div>
            </motion.div>

            {/* Bento Card 4: Repurposing Multiplier */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={4}
              className="group relative p-8 rounded-2xl bg-surface/90 dark:bg-slate-950/70 border border-border dark:border-slate-800/90 shadow-sm hover:shadow-xl hover:border-blue-500/40 transition-all duration-300 flex flex-col justify-between overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-2xl group-hover:bg-sky-500/10 transition-colors pointer-events-none" />
              <div>
                <div className="flex items-center justify-between gap-3 mb-6">
                  <div className="w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500">
                    <Layers size={22} />
                  </div>
                  <span className="font-mono text-[11px] text-sky-600 dark:text-sky-400 font-bold px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20">
                    10&times; CONTENT MULTIPLIER
                  </span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3 font-heading">
                  Wasted Long-Form Footage vs. Viral Short-Form Engine
                </h3>
                <div className="space-y-3 my-4 text-sm">
                  <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/15 text-text-secondary">
                    <span className="font-semibold text-rose-500 mr-2">&times; Untapped Media:</span>
                    Hours of client podcasts, webinars, and event recordings gather digital dust because nobody has time to extract short clips.
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-text-secondary">
                    <span className="font-semibold text-emerald-500 mr-2">&check; BMTech Model:</span>
                    Send 1 raw long-form recording &rarr; receive 10&ndash;20 viral vertical clips with punchy hooks, dynamic captions, and motion graphics.
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-border/80 flex items-center gap-2 font-mono text-[11px] text-text-secondary">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                <span>SCALE // MAXIMIZE CLIENT LIFETIME VALUE</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════════════ 3. PACKAGES ════════════════════════ */}
      <section id="packages" className="py-16 md:py-24 px-6 sm:px-12 md:px-24 bg-background transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="mb-12 text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-8 h-[2px] bg-blue-500" />
              <span className="text-blue-500 font-bold tracking-[0.2em] uppercase text-xs">Packages</span>
              <div className="w-8 h-[2px] bg-blue-500" />
            </div>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight mb-4">
              Monthly Production <span className="text-blue-500">Packages.</span>
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Fixed-price monthly packages designed for UK agencies. Predictable costs, consistent quality.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch"
          >
            {PACKAGES.map((pkg, i) => (
              <motion.div
                key={pkg.name}
                variants={fadeUp}
                custom={i}
                className={`group relative bg-surface/90 dark:bg-slate-950/80 backdrop-blur-xl rounded-2xl border shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full ${
                  pkg.highlighted
                    ? 'border-accent-blue/50 shadow-accent-blue/10 ring-1 ring-accent-blue/20'
                    : 'border-border hover:border-accent-blue/40 hover:shadow-accent-blue/5'
                }`}
              >
                {/* Highlighted badge */}
                {pkg.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-gradient-to-r from-sky-400 to-blue-700 text-white text-xs font-bold tracking-wide shadow-lg shadow-blue-600/30">
                      <Star size={12} /> Most Popular
                    </span>
                  </div>
                )}

                <div>
                  {/* Header */}
                  <div className={`p-6 pb-4 border-b ${
                    pkg.highlighted ? 'border-accent-blue/20' : 'border-border'
                  }`}>
                    <h3 className="text-lg font-bold text-foreground tracking-tight mb-3">{pkg.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-foreground">{pkg.price}</span>
                      <span className="text-text-secondary text-sm font-medium">{pkg.period}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="p-6">
                    <ul className="space-y-3">
                      {pkg.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-sm">
                          <div className="w-5 h-5 rounded-full bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check size={12} className="text-accent-blue" />
                          </div>
                          <span className="text-text-secondary leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* CTA Pinned to Bottom */}
                <div className="p-6 pt-2 mt-auto">
                  <button
                    onClick={() => scrollTo('contact', pkg.name)}
                    className={`w-full h-12 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-95 ${
                      pkg.highlighted
                        ? 'bg-gradient-to-r from-sky-400 to-blue-700 hover:from-blue-700 hover:to-sky-400 text-white shadow-lg shadow-blue-600/20'
                        : 'bg-surface border border-border text-foreground hover:border-accent-blue/40 hover:bg-accent-blue/5'
                    }`}
                  >
                    Get Started
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════ 4. SPECIALIST SERVICES ════════════════════════ */}
      <section id="services" className="py-16 md:py-24 px-6 sm:px-12 md:px-24 bg-background transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-[2px] bg-blue-500" />
              <span className="text-blue-500 font-bold tracking-[0.2em] uppercase text-xs">Specialist Services</span>
            </div>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight mb-4">
              Standalone <span className="text-blue-500">Services.</span>
            </h2>
            <p className="text-text-secondary max-w-2xl">
              These are separate, standalone services — not part of the monthly packages.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch"
          >
            {SPECIALIST_SERVICES.map((service, i) => (
              <motion.div
                key={service.title}
                variants={fadeUp}
                custom={i}
                className="group relative bg-surface/90 dark:bg-slate-950/80 backdrop-blur-xl rounded-2xl border border-border hover:border-accent-blue/40 shadow-sm hover:shadow-xl hover:shadow-accent-blue/5 transition-all duration-300 flex flex-col justify-between h-full"
              >
                <div>
                  {/* Header */}
                  <div className="p-6 pb-4 border-b border-border">
                    <div className="w-12 h-12 mb-4 rounded-xl bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center group-hover:bg-accent-blue/15 group-hover:border-accent-blue/30 transition-colors duration-300">
                      <service.icon size={22} className="text-accent-blue" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground tracking-tight">{service.title}</h3>
                  </div>

                  {/* Features */}
                  <div className="p-6">
                    <ul className="space-y-3">
                      {service.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-sm">
                          <div className="w-5 h-5 rounded-full bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check size={12} className="text-accent-blue" />
                          </div>
                          <span className="text-text-secondary leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* CTA Pinned to Bottom */}
                <div className="p-6 pt-2 mt-auto">
                  <button
                    onClick={() => scrollTo('contact', `${service.title} (${service.cta})`)}
                    className="w-full h-12 rounded-xl font-bold text-sm bg-surface border border-border text-foreground hover:border-accent-blue/40 hover:bg-accent-blue/5 transition-all hover:scale-[1.02] active:scale-95 inline-flex items-center justify-center gap-2 group/btn"
                  >
                    {service.cta}
                    <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════ 4. PORTFOLIO ════════════════════════ */}
      <section id="portfolio" className="py-16 md:py-24 px-6 sm:px-12 md:px-24 bg-background dark:bg-[#0b0f19] transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="mb-12 text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-8 h-[2px] bg-blue-500" />
              <span className="text-blue-500 font-bold tracking-[0.2em] uppercase text-xs">Portfolio</span>
              <div className="w-8 h-[2px] bg-blue-500" />
            </div>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight mb-4">
              Selected <span className="text-blue-500">Work.</span>
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              A selection of recent creative production delivered for agency partners.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {PORTFOLIO_PLACEHOLDERS.map((item, i) => (
              <motion.div
                key={item.id}
                variants={fadeUp}
                custom={i}
                className="group relative aspect-[9/16] sm:aspect-[4/5] rounded-2xl border border-border overflow-hidden bg-surface/60 hover:border-accent-blue/40 transition-all duration-300"
              >
                {/* Shimmer placeholder */}
                <div className="absolute inset-0 animate-shimmer" />
                {/* Overlay content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-14 h-14 rounded-full bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center mb-4">
                    <Clapperboard size={24} className="text-accent-blue/50" />
                  </div>
                  <span className="text-xs font-bold tracking-wider uppercase text-text-secondary/70">
                    {item.category}
                  </span>
                  <span className="text-[10px] text-text-secondary/40 mt-1">Coming Soon</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════ 5. HOW IT WORKS ════════════════════════ */}
      <section id="process" className="py-16 md:py-24 px-6 sm:px-12 md:px-24 bg-background overflow-hidden relative transition-colors duration-300">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="mb-10 md:mb-14"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-[2px] bg-blue-500" />
              <span className="text-blue-500 font-bold tracking-[0.2em] uppercase text-xs">Process</span>
            </div>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
              How It <span className="text-blue-500">Works.</span>
            </h2>
          </motion.div>

          {/* Timeline */}
          <div className="relative md:ml-12">
            <div className="absolute left-[19px] sm:left-[27px] top-6 bottom-0 w-[2px] bg-blue-500/20" />
            <div className="flex flex-col gap-8 sm:gap-10">
              {PROCESS_STEPS.map((step, i) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '0px 0px -35% 0px' }}
                  transition={{ duration: 0.6 }}
                  className="relative flex items-start gap-4 sm:gap-10 group"
                >
                  {/* Timeline Node */}
                  <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-background border-[2px] border-blue-500/30 group-hover:border-blue-500 transition-colors duration-500 mt-1 sm:mt-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-blue-500/50 group-hover:bg-blue-500 group-hover:shadow-[0_0_15px_rgba(0,180,255,0.8)] transition-all duration-500" />
                  </div>

                  {/* Content */}
                  <div className="flex flex-row items-start gap-4 sm:gap-8 flex-1 pt-1 sm:pt-3">
                    <div className="text-3xl sm:text-5xl font-black text-blue-500 w-10 sm:w-16 flex-shrink-0">
                      {step.number}
                    </div>
                    <div className="flex-1 mt-1 sm:mt-1.5">
                      <div className="flex items-center gap-3 mb-2 sm:mb-3">
                        <step.icon size={24} className="text-foreground hidden sm:block" />
                        <h3 className="text-xl sm:text-3xl font-bold text-foreground tracking-tight">{step.title}</h3>
                      </div>
                      <p className="text-sm sm:text-lg text-text-secondary max-w-xl leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════ 6. WHY BMTECH ════════════════════════ */}
      <section id="why" className="py-16 md:py-24 px-6 sm:px-12 md:px-24 bg-background transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-[2px] bg-blue-500" />
              <span className="text-blue-500 font-bold tracking-[0.2em] uppercase text-xs">Why BMTech</span>
            </div>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
              Built for <span className="text-blue-500">Agencies.</span>
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {WHY_POINTS.map((point, i) => (
              <motion.div
                key={point.title}
                variants={fadeUp}
                custom={i}
                className="group relative bg-surface/80 backdrop-blur-xl p-6 rounded-2xl border border-border hover:border-accent-blue/40 shadow-sm hover:shadow-xl hover:shadow-accent-blue/5 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-6 h-6 rounded-full bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center flex-shrink-0">
                    <Check size={14} className="text-accent-blue" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground tracking-tight">{point.title}</h3>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">{point.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>



      {/* ════════════════════════ 8. CONTACT FORM ════════════════════════ */}
      <section id="contact" className="py-16 md:py-20 px-6 sm:px-12 md:px-24 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {/* Left: Info */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-[2px] bg-blue-500" />
                <span className="text-blue-500 font-bold tracking-[0.2em] uppercase text-xs">Contact</span>
              </div>
              <h2 className="text-xl md:text-3xl font-extrabold mb-6 text-foreground">
                Let&apos;s Discuss{' '}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                  Your Project.
                </span>
              </h2>
              <p className="text-lg text-text-secondary mb-12">
                Tell us about your agency and the type of creative production you need.
                We&apos;ll respond within 24 hours.
              </p>
              <div className="space-y-8">
                {/* Email */}
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 shrink-0 bg-accent-blue/10 border border-accent-blue/20 rounded-full flex items-center justify-center">
                    <FileText size={20} className="text-accent-blue" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs uppercase font-semibold text-text-secondary tracking-wider">Email Us</p>
                    <p className="text-lg font-semibold text-foreground break-all">
                      brothersmediatech@gmail.com
                    </p>
                  </div>
                </div>
                {/* Location */}
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 shrink-0 bg-accent-blue/10 border border-accent-blue/20 rounded-full flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-blue"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs uppercase font-semibold text-text-secondary tracking-wider">Based In</p>
                    <p className="text-lg font-semibold text-foreground">India-based production team</p>
                    <p className="text-sm text-text-secondary">Serving UK agencies remotely</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <div className="bg-surface/80 backdrop-blur-xl p-8 rounded-2xl border border-border shadow-2xl transition-shadow duration-300 focus-within:shadow-accent-blue/10 focus-within:border-accent-blue/30">
              {success ? (
                <div className="h-full flex flex-col items-center justify-center text-center min-h-[360px]">
                  <SuccessCheckmark />
                  <Button onClick={() => setSuccess(false)} className="mt-8">
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error ? (
                    <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
                      {error}
                    </div>
                  ) : null}

                  {/* Name */}
                  <div className="relative">
                    <input
                      required
                      type="text"
                      id="uk-contact-name"
                      className="peer w-full bg-background dark:bg-[#0B0F19] border border-border rounded-lg h-14 px-4 pt-5 pb-2 focus:outline-none focus:border-accent-blue transition-colors text-foreground placeholder-transparent"
                      placeholder="Name"
                      value={formData.name}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <label
                      htmlFor="uk-contact-name"
                      className={`absolute left-4 transition-all duration-200 pointer-events-none
                        ${isFieldActive('name', formData.name)
                          ? 'top-2 text-[10px] font-bold uppercase tracking-wider text-accent-blue'
                          : 'top-4 text-sm text-text-secondary'
                        }`}
                    >
                      Your Name
                    </label>
                  </div>

                  {/* Email */}
                  <div className="relative">
                    <input
                      required
                      type="email"
                      id="uk-contact-email"
                      className="peer w-full bg-background dark:bg-[#0B0F19] border border-border rounded-lg h-14 px-4 pt-5 pb-2 focus:outline-none focus:border-accent-blue transition-colors text-foreground placeholder-transparent"
                      placeholder="Email"
                      value={formData.email}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    <label
                      htmlFor="uk-contact-email"
                      className={`absolute left-4 transition-all duration-200 pointer-events-none
                        ${isFieldActive('email', formData.email)
                          ? 'top-2 text-[10px] font-bold uppercase tracking-wider text-accent-blue'
                          : 'top-4 text-sm text-text-secondary'
                        }`}
                    >
                      Email Address
                    </label>
                  </div>

                  {/* Message */}
                  <div className="relative">
                    <textarea
                      required
                      rows={4}
                      id="uk-contact-message"
                      className="peer w-full bg-background dark:bg-[#0B0F19] border border-border rounded-lg p-4 pt-7 focus:outline-none focus:border-accent-blue transition-colors text-foreground resize-none placeholder-transparent"
                      placeholder="Message"
                      value={formData.message}
                      onFocus={() => setFocusedField('message')}
                      onBlur={() => setFocusedField(null)}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                    <label
                      htmlFor="uk-contact-message"
                      className={`absolute left-4 transition-all duration-200 pointer-events-none
                        ${isFieldActive('message', formData.message)
                          ? 'top-2 text-[10px] font-bold uppercase tracking-wider text-accent-blue'
                          : 'top-4 text-sm text-text-secondary'
                        }`}
                    >
                      Tell us about your project
                    </label>
                  </div>

                  <Button
                    disabled={loading}
                    type="submit"
                    className="w-full h-14 rounded-xl text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      'Submit Inquiry'
                    )}
                  </Button>

                  <p className="text-center text-xs text-text-secondary/70 mt-2 -mb-2 flex items-center justify-center gap-1">
                    <Lock size={12} /> Your information is secure and never shared.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════ FOOTER ════════════════════════ */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent-blue/30 to-transparent" />

      <footer className="py-12 bg-background px-6 sm:px-12 md:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <h2 className="text-lg font-bold tracking-tight text-foreground mb-3">
                BM<span className="text-accent-blue">Tech</span>
              </h2>
              <p className="text-text-secondary text-sm max-w-xs leading-relaxed mb-6">
                India-based creative production team serving UK agencies with premium video editing,
                motion graphics, and content repurposing.
              </p>
              {/* Social */}
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
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-4">Quick Links</h3>
              <ul className="space-y-3">
                {UK_NAV_LINKS.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => scrollTo(link.href.replace('#', ''))}
                      className="text-sm text-text-secondary hover:text-accent-blue transition-colors duration-200 inline-flex items-center gap-1 group/link bg-transparent border-none cursor-pointer"
                    >
                      <span className="w-0 group-hover/link:w-2 h-px bg-accent-blue transition-all duration-200" />
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-4">Services</h3>
              <ul className="space-y-3">
                {['Short-Form Editing', 'Motion Graphics', 'Reels & TikTok', 'Content Repurposing'].map(
                  (service) => (
                    <li key={service}>
                      <button
                        onClick={() => scrollTo('services')}
                        className="text-sm text-text-secondary hover:text-accent-blue transition-colors duration-200 inline-flex items-center gap-1 group/link bg-transparent border-none cursor-pointer"
                      >
                        <span className="w-0 group-hover/link:w-2 h-px bg-accent-blue transition-all duration-200" />
                        {service}
                      </button>
                    </li>
                  ),
                )}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-4">Contact Info</h3>
              <ul className="space-y-3">
                <li className="text-sm text-text-secondary">brothersmediatech@gmail.com</li>
                <li className="text-sm text-text-secondary">India-based, serving UK agencies</li>
                <li className="text-sm text-text-secondary">Mon – Fri, 10 AM – 7 PM IST</li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="h-px bg-border/50 mb-8" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-text-secondary text-sm">
              © 2026 Brothers Mediatech. All rights reserved.
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
