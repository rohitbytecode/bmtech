'use client';
import React, { useEffect, useState } from 'react';
import PricingCard from './PricingCard';
import { MaintenancePlan } from '@/services/dataService';
import { useData } from '@/hooks/useData';

export default function Maintenance() {
  const { data: plans, loading, error } = useData<MaintenancePlan>('maintenancePlans');

  return (
    <section id="maintenance" className="py-24 px-6 sm:px-12 md:px-24 bg-surface/50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">Maintenance Plans</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Secure, scale, and optimize your digital presence with our monthly support tiers.
          </p>
        </div>

        {loading && <p className="text-center text-text-secondary">Loading plans...</p>}
        {error && <p className="text-center text-red-500">Error: {error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => {
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
                <PricingCard
                  key={plan.id}
                  name={plan.name}
                  price={plan.price}
                  features={parsedFeatures as string[]}
                  highlighted={plan.highlighted}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
