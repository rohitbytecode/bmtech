'use client';
import React from 'react';
import ServiceCard from './ServiceCard';
import { Service } from '@/services/dataService';
import { useData } from '@/hooks/useData';

export default function Services() {
  const { data: services, loading, error } = useData<Service>('services');

  return (
    <section id="services" className="py-24 px-6 sm:px-12 md:px-24 bg-background dark:bg-[#0b0f19] text-slate-900 dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 text-center">
          <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-accent-blue bg-accent-blue/8 px-4 py-1.5 rounded-full mb-4">
            Specialist Services
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">Standalone Services</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            These are separate, standalone services, not part of the monthly packages.
          </p>
        </div>

        {loading && <p className="text-center text-slate-500">Loading services...</p>}
        {error && <p className="text-center text-red-500">Error: {error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                title={service.title || service.name}
                description={service.description}
                iconName={service.icon}
                features={service.features}
                cta={service.cta}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
