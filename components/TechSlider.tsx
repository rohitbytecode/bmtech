'use client';

import React from 'react';

interface TechItem {
  name: string;
  iconPath: string;
  isDarkMonochrome?: boolean;
}

const technologies: TechItem[] = [
  { name: 'NEXT.JS', iconPath: '/logos/nextjs.svg', isDarkMonochrome: true },
  { name: 'REACT', iconPath: '/logos/react.svg' },
  { name: 'VUE.JS', iconPath: '/logos/vue.svg' },
  { name: 'NESTJS', iconPath: '/logos/nestjs.svg' },
  { name: 'ADONISJS', iconPath: '/logos/adonisjs.svg' },
  { name: 'GITHUB', iconPath: '/logos/github.svg', isDarkMonochrome: true },
  { name: 'VERCEL', iconPath: '/logos/vercel.svg', isDarkMonochrome: true },
  { name: 'SUPABASE', iconPath: '/logos/supabase.svg' },
  { name: 'HOSTINGER', iconPath: '/logos/hostinger.svg' },
  { name: 'AWS', iconPath: '/logos/aws.svg' },
  { name: 'AZURE', iconPath: '/logos/azure.svg' },
  { name: 'TAILWIND CSS', iconPath: '/logos/tailwindcss.svg' },
  { name: 'TYPESCRIPT', iconPath: '/logos/typescript.svg' },
  { name: 'NODE.JS', iconPath: '/logos/nodejs.svg' },
  { name: 'DOCKER', iconPath: '/logos/docker.svg' },
  { name: 'PYTHON', iconPath: '/logos/python.svg' },
  { name: 'POSTGRESQL', iconPath: '/logos/postgresql.svg' },
  { name: 'MONGODB', iconPath: '/logos/mongodb.svg' },
  { name: 'GRAPHQL', iconPath: '/logos/graphql.svg' },
  { name: 'FIGMA', iconPath: '/logos/figma.svg' },
];

export default function TechSlider() {
  // Triple items list for smooth infinite loop without jump
  const marqueeList = [...technologies, ...technologies, ...technologies];

  return (
    <section className="relative py-10 sm:py-14 md:py-16 my-6 sm:my-10 bg-[#faf9f5] dark:bg-[#0b0f19] overflow-hidden select-none transition-colors duration-300">
      {/* Refined Calligraphy Badge Header Inside Lines */}
      <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
        <p className="font-serif italic text-base sm:text-lg md:text-xl text-blue-600 dark:text-blue-400 font-medium tracking-wide">
          ✦ Powered by Industry-Leading Technologies & Frameworks ✦
        </p>
      </div>

      {/* Soft gradient fade edges */}
      <div className="absolute top-0 bottom-0 left-0 w-24 sm:w-44 bg-gradient-to-r from-[#faf9f5] dark:from-[#0b0f19] to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-24 sm:w-44 bg-gradient-to-l from-[#faf9f5] dark:from-[#0b0f19] to-transparent z-10 pointer-events-none" />

      {/* Marquee Track */}
      <div className="flex w-max animate-marquee whitespace-nowrap items-center py-3">
        {marqueeList.map((tech, index) => {
          const isOutlined = index % 2 === 1;
          return (
            <React.Fragment key={`${tech.name}-${index}`}>
              <div className="inline-flex items-center gap-4 sm:gap-6 group">
                <div className="transition-transform duration-300 group-hover:scale-110 shrink-0">
                  <img
                    src={tech.iconPath}
                    alt={`${tech.name} Official Logo`}
                    className={`w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 object-contain ${
                      tech.isDarkMonochrome ? 'dark:invert' : ''
                    }`}
                    loading="eager"
                  />
                </div>
                <span
                  className={`text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-black tracking-tight transition-colors duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 ${
                    isOutlined
                      ? 'text-transparent stroke-text'
                      : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {tech.name}
                </span>
              </div>

              {/* Red Square Separator Dot matching UniQual */}
              <span className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 bg-rose-600 inline-block mx-10 sm:mx-14 md:mx-18 shrink-0 shadow-md rotate-45" />
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
}
