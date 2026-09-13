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
    const cardCenter = rect.top + rect.height / 2;

    // Start revealing when the card's center is at 75% of the viewport.
    // Fully revealed when the card's center reaches the exact middle of the screen.
    const startY = vh * 0.75;
    const endY = vh * 0.5;

    const progress = Math.min(1, Math.max(0, (startY - cardCenter) / (startY - endY)));
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
      className="group rounded-xl overflow-hidden bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm hover:shadow-md transition-shadow duration-300"
      onClick={() => setActive(!active)}
    >
      <div ref={thumbRef} className="relative h-40 sm:h-44 md:h-48 w-full overflow-hidden">
        {/* ── Placeholder (sits behind image) ── */}
        <div className="absolute inset-0 z-0 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800">
          <div className="animate-shimmer absolute inset-0" />
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-xl bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center">
              <span className="text-xl font-extrabold tracking-tighter leading-none">
                <span className="text-slate-800 dark:text-white">B</span>
                <span className="text-accent-blue">M</span>
              </span>
            </div>
            <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              BMTech
            </span>
          </div>
        </div>

        {/* ── Real image — clip-path scrubbed by scroll ── */}
        <div
          ref={imageLayerRef}
          className="absolute inset-0 z-10"
          style={{ clipPath: 'inset(100% 0 0 0)' }}
        >
          <Image
            src={safeImageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>

        {/* ── Hover overlay with Live Demo button ── */}
        <div
          className={`
            absolute inset-0 z-20 flex items-center justify-center
            bg-black/40 transition-opacity duration-200
            ${active ? 'opacity-100' : 'opacity-0'}
            group-hover:opacity-100
          `}
        >
          <a href={formatUrl(link)} target="_blank" rel="noopener noreferrer">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 text-white backdrop-blur-sm border-white/20 hover:bg-white/25 rounded-full px-5 py-1.5 text-sm transition-colors"
            >
              Live Demo <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </a>
        </div>
      </div>

      {/* ── Card content ── */}
      <div className="px-4 py-3">
        <span className="text-[11px] font-medium text-accent-blue dark:text-rose-400 tracking-wide uppercase mb-0.5 block">
          {category}
        </span>
        <h4 className="text-[15px] font-semibold text-slate-900 dark:text-white leading-snug">{title}</h4>
      </div>
    </div>
  );
}
