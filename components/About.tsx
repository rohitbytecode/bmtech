'use client';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useData } from '@/hooks/useData';
import { Settings } from '@/services/dataService';

interface Metric {
  raw: string;
  numeric: number | null;
  suffix: string;
  label: string;
}

function parseMetric(rawValue: string, label: string): Metric {
  // Try to extract a leading number and the rest as suffix
  const match = rawValue.match(/^(\d+)(.*)/);
  if (match) {
    return {
      raw: rawValue,
      numeric: parseInt(match[1], 10),
      suffix: match[2],
      label,
    };
  }
  return { raw: rawValue, numeric: null, suffix: '', label };
}

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function AnimatedStat({ metric }: { metric: Metric }) {
  const [display, setDisplay] = useState(metric.numeric !== null ? '0' : metric.raw);
  const [glowing, setGlowing] = useState(false);
  const hasAnimated = useRef(false);

  const animate = useCallback(() => {
    if (metric.numeric === null || hasAnimated.current) return;
    hasAnimated.current = true;

    const duration = 1600;
    const target = metric.numeric;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);
      const current = Math.round(easedProgress * target);
      setDisplay(String(current));

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        setDisplay(String(target));
        setGlowing(true);
        setTimeout(() => setGlowing(false), 800);
      }
    }

    requestAnimationFrame(tick);
  }, [metric.numeric]);

  return {
    animate,
    element: (
      <div>
        <h4
          className={`text-4xl font-bold text-accent-blue mb-2 inline-block rounded-lg px-2 py-1 transition-all ${
            glowing ? 'stat-glow' : ''
          }`}
        >
          {display}
          {metric.suffix}
        </h4>
        <p className="text-sm text-text-secondary">{metric.label}</p>
      </div>
    ),
  };
}

export default function About() {
  const { data: settings } = useData<Settings>('settings');
  const s = settings?.[0];
  const sectionRef = useRef<HTMLDivElement>(null);
  const hasTriggered = useRef(false);
  const [triggerAnimation, setTriggerAnimation] = useState(false);

  const metrics: Metric[] = [
    parseMetric('80+', 'Projects Delivered'),
    parseMetric('99%', 'Customer Retention'),
    parseMetric('2+', 'Years Experience'),
    parseMetric('Mon-Fri', 'Support Window'),
  ];

  // Refs to trigger each stat's animation
  const animateCallbacks = useRef<Array<() => void>>([]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTriggered.current) {
          hasTriggered.current = true;
          setTriggerAnimation(true);
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (triggerAnimation) {
      animateCallbacks.current.forEach((cb) => cb());
    }
  }, [triggerAnimation]);

  const statElements = metrics.map((metric, i) => {
    const stat = AnimatedStat({ metric });
    animateCallbacks.current[i] = stat.animate;
    return <React.Fragment key={i}>{stat.element}</React.Fragment>;
  });

  return (
    <section
      id="about"
      className="py-16 md:py-20 px-6 sm:px-12 md:px-24 bg-background"
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl md:text-4xl font-bold mb-8 text-foreground">
          About {s?.agency_name || 'BMTech'}
        </h2>
        <p className="text-lg md:text-xl text-text-secondary font-body leading-relaxed">
          {s?.about_text ||
            `At BMTech, we specialize in high-impact digital experiences for businesses looking 
           to scale and modernize. With over 200+ successful projects and a dedicated 
           team of designers, developers, and strategists, we bring the premium creative 
           edge that your brand deserves.`}
        </p>
        <div ref={sectionRef} className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {statElements}
        </div>
      </div>
    </section>
  );
}
