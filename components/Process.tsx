'use client';
import React, { useRef, useEffect, useState } from 'react';
import { ClipboardList, Palette, Code, Rocket, ShieldCheck } from 'lucide-react';

const steps = [
  { icon: ClipboardList, name: 'Plan', desc: 'Setting goals and roadmaps.' },
  { icon: Palette, name: 'Design', desc: 'Creating visual brilliance.' },
  { icon: Code, name: 'Build', desc: 'Developing with precision.' },
  { icon: Rocket, name: 'Launch', desc: 'Setting live to the world.' },
  { icon: ShieldCheck, name: 'Maintain', desc: 'Ensuring long-term growth.' },
];

function StepReveal({
  children,
  delay,
  index,
}: {
  children: React.ReactNode;
  delay: number;
  index: number;
}) {
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
      { threshold: 0.2 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(32px) scale(0.95)',
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default function Process() {
  return (
    <section className="py-16 md:py-20 px-6 sm:px-12 md:px-24 bg-background overflow-hidden relative">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        <h2 className="text-2xl md:text-4xl font-bold mb-16 text-center text-foreground">How We Work</h2>

        <div className="relative w-full">
          {/* Connector Line */}
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-border/50 -translate-y-1/2 hidden lg:block"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 relative z-10">
            {steps.map((step, i) => (
              <StepReveal key={i} delay={i * 200} index={i}>
                <div className="flex flex-col items-center text-center group">
                  {/* Step number */}
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent-blue/60 mb-3">
                    Step {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mb-6 group-hover:border-accent-blue group-hover:bg-accent-blue/10 transition-all duration-300 shadow-xl">
                    <step.icon
                      size={28}
                      className="text-text-secondary group-hover:text-accent-blue transition-colors"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{step.name}</h3>
                  <p className="text-sm text-text-secondary">{step.desc}</p>
                </div>
              </StepReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
