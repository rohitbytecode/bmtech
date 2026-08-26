'use client';
import React, { useRef, useEffect, useState } from 'react';
import PricingCard from './PricingCard';
import { MaintenancePlan } from '@/services/dataService';
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

export default function Maintenance() {
  const { data: plans, loading, error } = useData<MaintenancePlan>('maintenancePlans');

  return (
    <section id="maintenance" className="py-24 px-6 sm:px-12 md:px-24 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 text-center">
          <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-accent-blue bg-accent-blue/8 px-4 py-1.5 rounded-full mb-4">
            🛡️ Support Tiers
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">Maintenance Plans</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Secure, scale, and optimize your digital presence with our monthly support tiers.
          </p>
        </div>

        {loading && <p className="text-center text-text-secondary">Loading plans...</p>}
        {error && <p className="text-center text-red-500">Error: {error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => {
              // Parse features if it's a JSON string
              let parsedFeatures = plan.features;
              if (typeof parsedFeatures === 'string') {
                try {
                  parsedFeatures = JSON.parse(parsedFeatures);
                } catch (e) {
                  parsedFeatures = [];
                }
              }
              return (
                <CardReveal key={plan.id} delay={index * 120}>
                  <PricingCard
                    name={plan.name}
                    price={plan.price}
                    features={parsedFeatures as string[]}
                    highlighted={plan.highlighted}
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
