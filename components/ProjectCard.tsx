'use client';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import { Button } from './ui/Button';
import { useState, useRef, useEffect, useCallback } from 'react';

import { formatUrl, ensureValidImageUrl } from '@/lib/utils';

interface ProjectCardProps {
  title: string;
  category: string;
  image: string;
  link: string;
}

export default function ProjectCard({ title, category, image, link }: ProjectCardProps) {
  const safeImageUrl = ensureValidImageUrl(image);
  const [active, setActive] = useState(false);
  const thumbRef = useRef<HTMLDivElement>(null);
  const imageLayerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const prefersReducedMotion = useRef(false);

  const updateClip = useCallback(() => {
    const container = thumbRef.current;
    const imageLayer = imageLayerRef.current;
    if (!container || !imageLayer) return;

    if (prefersReducedMotion.current) {
      imageLayer.style.clipPath = 'inset(0% 0 0 0)';
      return;
    }

    const rect = container.getBoundingClientRect();
    const vh = window.innerHeight;

    // Start revealing when the card is already inside the viewport (not the very edge).
    // Fully revealed when the top of the thumbnail reaches 25% from the top.
    const startY = vh * 0.55;    // element top at 55% viewport height → 0% revealed
    const endY = vh * 0.1;       // element top at 10% viewport height → 100% revealed

    const progress = Math.min(1, Math.max(0, (startY - rect.top) / (startY - endY)));
    const clipPercent = (1 - progress) * 100;

    imageLayer.style.clipPath = `inset(${clipPercent}% 0 0 0)`;
  }, []);

  const onScroll = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(updateClip);
  }, [updateClip]);

  useEffect(() => {
    // Check reduced motion preference
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Initial calculation
    updateClip();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [onScroll, updateClip]);

  return (
    <div
      className="group rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-600 dark:hover:border-blue-500 shadow-sm hover:shadow-xl transition-all duration-300"
      onClick={() => setActive(!active)}
    >
      <div ref={thumbRef} className="relative h-48 sm:h-64 md:h-72 w-full overflow-hidden">
        {/* ── Layer 0: Branded BMTech placeholder (sits behind image) ── */}
        <div className="absolute inset-0 z-0 flex flex-col items-center justify-center">
          {/* Shimmer base */}
          <div className="animate-shimmer absolute inset-0" />
          {/* Subtle diagonal texture */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(135deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 12px)',
            }}
          />
          {/* Monogram mark */}
          <div className="relative z-10 flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center backdrop-blur-sm shadow-lg shadow-blue-600/5">
              <span className="text-3xl font-extrabold tracking-tighter leading-none">
                <span className="text-slate-800 dark:text-white">B</span>
                <span className="text-blue-600">M</span>
              </span>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
              BMTech
            </span>
          </div>
        </div>

        {/* ── Layer 1: Real image — clip-path scrubbed by scroll ── */}
        <div
          ref={imageLayerRef}
          className="absolute inset-0 z-10"
          style={{ clipPath: 'inset(100% 0 0 0)' }}
        >
          <Image
            src={safeImageUrl}
            alt={title}
            fill
            className={`
              object-cover
              ${active ? 'grayscale-0' : 'grayscale'}
              group-hover:grayscale-0
              transition-[filter] duration-500
            `}
          />
        </div>

        {/* ── Layer 2: Hover overlay with Live Demo button ── */}
        <div
          className={`
            absolute inset-0 z-20 flex items-center justify-center
            bg-black/50 transition-opacity duration-300
            ${active ? 'opacity-100' : 'opacity-0'}
            group-hover:opacity-100
          `}
        >
          <a href={formatUrl(link)} target="_blank" rel="noopener noreferrer">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 text-white backdrop-blur border-white/20 hover:bg-white/20"
            >
              Live Demo <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </a>
        </div>
      </div>

      {/* ── Card content — always visible ── */}
      <div className="p-5">
        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-wider uppercase mb-1 block">
          {category}
        </span>
        <h4 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h4>
      </div>
    </div>
  );
}
