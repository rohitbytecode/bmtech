"use client";
import React from "react";
import { useData } from "@/hooks/useData";
import { Settings } from "@/services/dataService";

export default function About() {
  const { data: settings } = useData<Settings>('settings');
  const s = settings?.[0];

  return (
    <section id="about" className="py-24 px-6 sm:px-12 md:px-24 bg-surface/50 border-y border-border">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-8 text-white">About {s?.agency_name || "BMTech"}</h2>
        <p className="text-lg md:text-xl text-text-secondary font-body leading-relaxed">
          {s?.about_text || `At BMTech, we specialize in high-impact digital experiences for businesses looking 
           to scale and modernize. With over 200+ successful projects and a dedicated 
           team of designers, developers, and strategists, we bring the premium creative 
           edge that your brand deserves.`}
        </p>
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-4xl font-bold text-accent-blue mb-2">80+</h4>
            <p className="text-sm text-text-secondary">Projects Delivered</p>
          </div>
          <div>
            <h4 className="text-4xl font-bold text-accent-blue mb-2">99%</h4>
            <p className="text-sm text-text-secondary">Customer Retention</p>
          </div>
          <div>
            <h4 className="text-4xl font-bold text-accent-blue mb-2">2+</h4>
            <p className="text-sm text-text-secondary">Years Experience</p>
          </div>
          <div>
            <h4 className="text-4xl font-bold text-accent-blue mb-2">Mon-Fri</h4>
            <p className="text-sm text-text-secondary">Support Window</p>
          </div>
        </div>
      </div>
    </section>
  );
}
