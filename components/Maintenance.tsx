"use client";
import React, { useEffect, useState } from "react";
import PricingCard from "./PricingCard";
import { getMaintenancePlans, MaintenancePlan } from "@/lib/data";

export default function Maintenance() {
  const [plans, setPlans] = useState<MaintenancePlan[]>([]);

  useEffect(() => {
    getMaintenancePlans().then(setPlans);
  }, []);

  return (
    <section id="maintenance" className="py-24 px-6 sm:px-12 md:px-24 bg-surface/50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">Maintenance Plans</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Secure, scale, and optimize your digital presence with our monthly support tiers.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <PricingCard
              key={plan.id}
              name={plan.name}
              price={plan.price}
              features={plan.features}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
