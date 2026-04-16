'use client';
import React, { useEffect, useState } from 'react';
import ServiceCard from './ServiceCard';
import { Service } from '@/services/dataService';
import { useData } from '@/hooks/useData';

export default function Services() {
  const { data: services, loading, error } = useData<Service>('services');

  return (
    <section id="services" className="py-24 px-6 sm:px-12 md:px-24 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">Our Services</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            From design to development, we provide comprehensive solutions to elevate your digital
            presence.
          </p>
        </div>

        {loading && <p className="text-center text-text-secondary">Loading services...</p>}
        {error && <p className="text-center text-red-500">Error: {error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                title={service.title || service.name}
                description={service.description}
                iconName={service.icon}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
