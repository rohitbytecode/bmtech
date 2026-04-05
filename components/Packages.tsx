"use client";
import React, { useEffect, useState } from "react";
import PricingCard from "./PricingCard";
import { getPackages, Package } from "@/lib/data";

export default function Packages() {
  const [packages, setPackages] = useState<Package[]>([]);

  useEffect(() => {
    getPackages().then(setPackages);
  }, []);

  return (
    <section id="packages" className="py-24 px-6 sm:px-12 md:px-24 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">Combo Packages</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Optimized bundles to give you more value and complete digital transformations.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <PricingCard
              key={pkg.id}
              name={pkg.name}
              price={pkg.price}
              features={pkg.features}
              highlighted={pkg.highlighted}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
