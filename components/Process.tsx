'use client';
import React from 'react';
import { ClipboardList, Palette, Code, Rocket, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  { icon: ClipboardList, name: 'Plan', desc: 'Setting goals and roadmaps.' },
  { icon: Palette, name: 'Design', desc: 'Creating visual brilliance.' },
  { icon: Code, name: 'Build', desc: 'Developing with precision.' },
  { icon: Rocket, name: 'Launch', desc: 'Setting live to the world.' },
  { icon: ShieldCheck, name: 'Maintain', desc: 'Ensuring long-term growth.' },
];

export default function Process() {
  return (
    <section className="pt-12 md:pt-16 pb-10 md:pb-16 px-6 sm:px-12 md:px-24 bg-background overflow-hidden relative transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Area */}
        <div className="mb-10 md:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-[2px] bg-rose-600"></div>
              <span className="text-rose-600 font-bold tracking-[0.2em] uppercase text-xs">Process</span>
            </div>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
              How We <span className="text-rose-600">Work.</span>
            </h2>
          </motion.div>
        </div>

        {/* Timeline Area */}
        <div className="relative md:ml-12">
          {/* Vertical Line */}
          {/* Left position: Mobile node is w-10 (40px) -> center is 20px -> left-19px for 2px line. Desktop node is w-14 (56px) -> center is 28px -> left-27px. */}
          <div className="absolute left-[19px] sm:left-[27px] top-6 bottom-0 w-[2px] bg-rose-600/20"></div>

          <div className="flex flex-col gap-8 sm:gap-10">
            {steps.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -35% 0px" }}
                transition={{ duration: 0.6 }}
                className="relative flex items-start gap-4 sm:gap-10 group"
              >
                {/* Timeline Node */}
                <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-background border-[2px] border-rose-600/30 group-hover:border-rose-600 transition-colors duration-500 mt-1 sm:mt-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-rose-600/50 group-hover:bg-rose-600 group-hover:shadow-[0_0_15px_rgba(225,29,72,0.8)] transition-all duration-500"></div>
                </div>
                
                {/* Content Container */}
                <div className="flex flex-row items-start gap-4 sm:gap-8 flex-1 pt-1 sm:pt-3">
                  {/* Step Number */}
                  <div className="text-3xl sm:text-5xl font-black text-rose-600 w-10 sm:w-16 flex-shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  
                  {/* Text Box */}
                  <div className="flex-1 mt-1 sm:mt-1.5">
                    <div className="flex items-center gap-3 mb-2 sm:mb-3">
                      <step.icon size={24} className="text-foreground hidden sm:block" />
                      <h3 className="text-xl sm:text-3xl font-bold text-foreground tracking-tight">{step.name}</h3>
                    </div>
                    <p className="text-sm sm:text-lg text-text-secondary max-w-xl leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
