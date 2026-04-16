'use client';
import React from 'react';
import { ClipboardList, Palette, Code, Rocket, ShieldCheck } from 'lucide-react';

const steps = [
  { icon: ClipboardList, name: 'Plan', desc: 'Setting goals and roadmaps.' },
  { icon: Palette, name: 'Design', desc: 'Creating visual brilliance.' },
  { icon: Code, name: 'Build', desc: 'Developing with precision.' },
  { icon: Rocket, name: 'Launch', desc: 'Setting live to the world.' },
  { icon: ShieldCheck, name: 'Maintain', desc: 'Ensuring long-term growth.' },
];

export default function Process() {
  return (
    <section className="py-24 px-6 sm:px-12 md:px-24 bg-background overflow-hidden relative">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center text-white">How We Work</h2>

        <div className="relative w-full">
          {/* Connector Line */}
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-border/50 -translate-y-1/2 hidden lg:block"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 relative z-10">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mb-6 group-hover:border-accent-blue group-hover:bg-accent-blue/10 transition-all duration-300 shadow-xl">
                  <step.icon
                    size={28}
                    className="text-text-secondary group-hover:text-accent-blue transition-colors"
                  />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{step.name}</h3>
                <p className="text-sm text-text-secondary">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
