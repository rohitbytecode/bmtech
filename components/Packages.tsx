'use client';
import React, { useRef, useEffect, useState } from 'react';
import PricingCard from './PricingCard';
import { Package } from '@/services/dataService';
import { useData } from '@/hooks/useData';

function CardReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default function Packages() {
  const { data: packages, loading, error } = useData<Package>('packages');

  return (
    <section id="packages" className="py-24 px-6 sm:px-12 md:px-24 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 text-center">
          <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-accent-blue bg-accent-blue/8 px-4 py-1.5 rounded-full mb-4">
            💎 Bundles
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">Combo Packages</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Optimized bundles to give you more value and complete digital transformations.
          </p>
        </div>

        {loading && <p className="text-center text-text-secondary">Loading packages...</p>}
        {error && <p className="text-center text-red-500">Error: {error}</p>}

        {!loading && !error && packages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-text-secondary">No active packages available at the moment.</p>
          </div>
        )}

        {!loading && !error && packages.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => {
              // Parse features robustly
              let parsedFeatures: string[] = [];
              if (Array.isArray(pkg.features)) {
                parsedFeatures = pkg.features;
              } else if (typeof pkg.features === 'string') {
                try {
                  const parsed = JSON.parse(pkg.features);
                  parsedFeatures = Array.isArray(parsed) ? parsed : [];
                } catch (e) {
                  parsedFeatures = [];
                }
              }

              return (
                <CardReveal key={pkg.id} delay={index * 120}>
                  <PricingCard
                    name={pkg.name}
                    price={pkg.price}
                    features={parsedFeatures}
                    highlighted={pkg.highlighted}
                  />
                </CardReveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
