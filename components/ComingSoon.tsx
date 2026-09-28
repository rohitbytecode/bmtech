'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Sparkles, Shield, Clock, Film, RotateCcw } from 'lucide-react';
import gsap from 'gsap';

/* ─────────────────────────── LOKI FONT POOL ─────────────────────────── */
const FONT_POOL = [
  { family: "'Cinzel', serif", weight: '900', style: 'normal' },
  { family: "'Syne', sans-serif", weight: '800', style: 'normal' },
  { family: "'Abril Fatface', serif", weight: '400', style: 'normal' },
  { family: "'Space Mono', monospace", weight: '700', style: 'normal' },
  { family: "'Playfair Display', serif", weight: '900', style: 'italic' },
  { family: "'Righteous', cursive", weight: '400', style: 'normal' },
  { family: "'Impact', 'Arial Black', sans-serif", weight: '900', style: 'normal' },
  { family: "'Georgia', serif", weight: '700', style: 'normal' },
  { family: "'Courier New', monospace", weight: '700', style: 'normal' },
  { family: "'Trebuchet MS', sans-serif", weight: '800', style: 'normal' },
] as const;

/* Curated harmonious settled fonts for "COMING SOON" (10 non-space characters) */
const SETTLED_FONT_INDICES = [
  0, // C -> Cinzel (Regal Classical)
  1, // O -> Syne (Wide Futuristic)
  2, // M -> Abril Fatface (Heavy Didone)
  3, // I -> Space Mono (Tech Terminal)
  4, // N -> Playfair Display (High Fashion Italic)
  5, // G -> Righteous (Retro Display)
  6, // S -> Impact (Industrial Block)
  0, // O -> Cinzel (Sharp Roman)
  4, // O -> Playfair Display (Artful Serif)
  1, // N -> Syne (Modernist Sans)
];

const COMING_LETTERS = ['C', 'O', 'M', 'I', 'N', 'G'];
const SOON_LETTERS = ['S', 'O', 'O', 'N'];

export default function ComingSoon() {
  const containerRef = useRef<HTMLDivElement>(null);
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);
  const pulseBadgeRef = useRef<HTMLDivElement>(null);
  const tickerTrackRef = useRef<HTMLDivElement>(null);

  // Deterministic initial state to prevent SSR hydration mismatches
  const [fontIndices, setFontIndices] = useState<number[]>(SETTLED_FONT_INDICES);
  const [settled, setSettled] = useState<boolean[]>(() =>
    new Array(SETTLED_FONT_INDICES.length).fill(true),
  );
  const [isMorphing, setIsMorphing] = useState<boolean>(false);

  // Loki Title Shuffling Sequence
  // Loki Title Accelerating Shuffling Sequence (10s total, 1000ms -> 300ms)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerLokiAnimation = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const startTime = Date.now();
    const TOTAL_DURATION = 4000; // 4 seconds total
    const INITIAL_INTERVAL = 1000; // starts at 1 second
    const MIN_INTERVAL = 300;     // floor cap at 300ms

    const tick = () => {
      const elapsed = Date.now() - startTime;

      if (elapsed >= TOTAL_DURATION) {
        // Lock into harmonious settled fonts
        setFontIndices(SETTLED_FONT_INDICES);
        setSettled(new Array(SETTLED_FONT_INDICES.length).fill(true));
        setIsMorphing(false);
        return;
      }

      setIsMorphing(true);
      setSettled(new Array(SETTLED_FONT_INDICES.length).fill(false));

      // Flip characters to new random fonts
      setFontIndices((prev) =>
        prev.map((currentIdx) => {
          let nextIdx = Math.floor(Math.random() * FONT_POOL.length);
          while (nextIdx === currentIdx && FONT_POOL.length > 1) {
            nextIdx = Math.floor(Math.random() * FONT_POOL.length);
          }
          return nextIdx;
        }),
      );

      // Accelerate: reduce interval by 200ms per elapsed second (clamped at 300ms floor)
      const secondsPassed = Math.floor(elapsed / 1000);
      const nextDelay = Math.max(MIN_INTERVAL, INITIAL_INTERVAL - secondsPassed * 200);

      timerRef.current = setTimeout(tick, nextDelay);
    };

    // First transition after initial 1000ms
    timerRef.current = setTimeout(tick, INITIAL_INTERVAL);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Run Loki morph on client mount
  useEffect(() => {
    const cleanup = triggerLokiAnimation();

    return () => {
      if (cleanup) cleanup();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [triggerLokiAnimation]);

  // Ambient GSAP Background Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (orb1Ref.current) {
        gsap.to(orb1Ref.current, {
          x: '+=35',
          y: '-=25',
          scale: 1.12,
          duration: 7,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }

      if (orb2Ref.current) {
        gsap.to(orb2Ref.current, {
          x: '-=40',
          y: '+=30',
          scale: 0.92,
          duration: 8.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }

      if (pulseBadgeRef.current) {
        gsap.to(pulseBadgeRef.current, {
          boxShadow: '0 0 25px rgba(37, 99, 235, 0.5)',
          scale: 1.02,
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut',
        });
      }

      if (tickerTrackRef.current) {
        gsap.to(tickerTrackRef.current, {
          xPercent: -50,
          duration: 25,
          repeat: -1,
          ease: 'none',
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const marqueeItems = [
    'BMTech UK Agency Suite',
    'White-Label Creative Engine',
    'High Velocity Production',
    'Private Beta In Progress',
    'Reels, TikTok & Motion Graphics',
  ];

  return (
    <div
      ref={containerRef}
      className="relative h-screen max-h-screen w-full flex flex-col justify-between overflow-hidden bg-[#070a12] text-white selection:bg-[#2563eb] selection:text-white"
    >
      {/* ── GOOGLE FONTS STYLESHEET HOIST ── */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Cinzel:wght@700;900&family=Playfair+Display:ital,wght@0,900;1,700&family=Righteous&family=Space+Mono:wght@700&family=Syne:wght@800&display=swap"
      />

      {/* ── BACKGROUND IMAGE & GRADIENT OVERLAYS ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/hero-bg.png"
          alt="BMTech Background"
          fill
          priority
          className="object-cover object-center opacity-30 mix-blend-screen scale-105"
        />
        <div className="absolute inset-0 bg-radial from-[#2563eb]/20 via-[#070a12]/85 to-[#070a12]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* ── FLOATING AMBIENT GLOW ORBS ── */}
      <div
        ref={orb1Ref}
        className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#2563eb]/20 blur-[110px] pointer-events-none z-0"
      />
      <div
        ref={orb2Ref}
        className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-cyan-500/15 blur-[120px] pointer-events-none z-0"
      />

      {/* ── COMPACT TOP NAVIGATION BAR ── */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-5 pb-3 flex items-center justify-between shrink-0">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:border-[#2563eb]/60 group-hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            <Image src="/bm-glow.png" alt="BMTech Logo" width={22} height={22} className="object-contain" />
          </div>
          <span className="font-bold tracking-tight text-base sm:text-lg text-white">
            BM<span className="text-[#2563eb]">Tech</span>
            <span className="text-[10px] ml-1.5 px-1.5 py-0.5 rounded bg-white/10 text-white/70 uppercase tracking-widest font-mono">
              UK
            </span>
          </span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-white/75 hover:text-white px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Global Site
        </Link>
      </header>

      {/* ── CENTRAL HERO CONTENT (NON-SCROLLABLE FIT) ── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-2 text-center max-w-4xl mx-auto my-auto shrink-0">
        {/* Status Badge with Live Pulse */}
        <div
          ref={pulseBadgeRef}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2563eb]/10 border border-[#2563eb]/30 text-xs font-semibold text-blue-300 mb-5 backdrop-blur-md"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2563eb]" />
          </span>
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Exclusive UK Agency Launch • Opening Soon</span>
        </div>

        {/* ── LOKI MULTI-FONT TITLE ANIMATION ── */}
        <div
          onClick={triggerLokiAnimation}
          title="Click to replay font morph animation"
          className="group relative cursor-pointer select-none mb-4 flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-7 gap-y-1"
        >
          {/* Replay indicator on hover */}
          <div className="absolute -top-6 right-0 opacity-0 group-hover:opacity-80 transition-opacity duration-200 flex items-center gap-1.5 text-[10px] text-blue-300/80 font-mono">
            <RotateCcw className={`w-3 h-3 ${isMorphing ? 'animate-spin' : ''}`} />
            <span>Click to Morph</span>
          </div>

          {/* WORD: "COMING" */}
          <div className="flex items-center justify-center">
            {COMING_LETTERS.map((char, i) => {
              const fontObj = FONT_POOL[fontIndices[i]] || FONT_POOL[0];
              const isCharSettled = settled[i];

              return (
                <span
                  key={`c-${i}`}
                  style={{
                    fontFamily: fontObj.family,
                    fontWeight: fontObj.weight,
                    fontStyle: fontObj.style,
                    textTransform: 'uppercase',
                  }}
                  className={`inline-block text-5xl sm:text-7xl md:text-8xl lg:text-9xl transition-all duration-150 leading-none drop-shadow-[0_0_35px_rgba(37,99,235,0.7)] ${
                    isCharSettled
                      ? 'text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-100 to-sky-300 scale-100'
                      : 'text-sky-300 scale-105 opacity-90'
                  }`}
                >
                  {char}
                </span>
              );
            })}
          </div>

          {/* WORD: "SOON" */}
          <div className="flex items-center justify-center">
            {SOON_LETTERS.map((char, i) => {
              const letterIndex = 6 + i;
              const fontObj = FONT_POOL[fontIndices[letterIndex]] || FONT_POOL[0];
              const isCharSettled = settled[letterIndex];

              return (
                <span
                  key={`s-${i}`}
                  style={{
                    fontFamily: fontObj.family,
                    fontWeight: fontObj.weight,
                    fontStyle: fontObj.style,
                    textTransform: 'uppercase',
                  }}
                  className={`inline-block text-5xl sm:text-7xl md:text-8xl lg:text-9xl transition-all duration-150 leading-none drop-shadow-[0_0_35px_rgba(37,99,235,0.7)] ${
                    isCharSettled
                      ? 'text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-100 to-cyan-300 scale-100'
                      : 'text-cyan-300 scale-105 opacity-90'
                  }`}
                >
                  {char}
                </span>
              );
            })}
          </div>
        </div>

        {/* Secondary Subtitle */}
        <h2 className="text-lg sm:text-2xl md:text-3xl font-bold tracking-tight text-white mb-2.5">
          High-Velocity Creative Production,{' '}
          <span className="bg-gradient-to-r from-blue-400 via-[#60a5fa] to-cyan-300 bg-clip-text text-transparent">
            Tailored for the UK.
          </span>
        </h2>

        <p className="text-xs sm:text-sm md:text-base text-white/70 max-w-xl mb-5 leading-relaxed font-light">
          We are finalizing our dedicated white-label creative infrastructure for UK agencies. The portal is currently in private preview.
        </p>

        {/* Compact Feature Pills */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full max-w-lg mb-6 text-left">
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-sm">
            <div className="p-1.5 rounded-lg bg-[#2563eb]/10 text-blue-400 shrink-0">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white leading-tight">White-Label</p>
              <p className="text-[10px] text-white/50 leading-tight">Under your brand</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-sm">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white leading-tight">24-48h Delivery</p>
              <p className="text-[10px] text-white/50 leading-tight">Rapid turnaround</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-sm">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
              <Film className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white leading-tight">Full-Scale Edits</p>
              <p className="text-[10px] text-white/50 leading-tight">Reels & TikTok</p>
            </div>
          </div>
        </div>

        {/* Single Primary Action Button */}
        <div className="flex items-center justify-center">
          <Link
            href="/"
            className="px-7 py-3 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-xs sm:text-sm shadow-[0_0_25px_rgba(37,99,235,0.45)] hover:shadow-[0_0_35px_rgba(37,99,235,0.65)] transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <span>Explore Global BMTech</span>
            <ArrowLeft className="w-3.5 h-3.5 rotate-180 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </main>

      {/* ── GSAP INFINITE TICKER MARQUEE (PINNED FOOTER) ── */}
      <footer className="relative z-10 w-full border-t border-white/10 bg-black/40 backdrop-blur-md py-2.5 overflow-hidden shrink-0">
        <div className="flex whitespace-nowrap">
          <div ref={tickerTrackRef} className="flex gap-8 items-center text-[11px] tracking-widest uppercase font-mono text-white/40 will-change-transform">
            {[...marqueeItems, ...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, idx) => (
              <span key={idx} className="flex items-center gap-8">
                <span>{item}</span>
                <span className="text-[#2563eb]">✦</span>
              </span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
