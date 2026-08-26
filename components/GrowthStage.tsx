'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Smartphone, 
  Globe, 
  Bot, 
  Sparkles, 
  BarChart3, 
  Share2, 
  Target, 
  Layers, 
  TrendingUp, 
  CheckCircle2, 
  Megaphone
} from 'lucide-react';

const springTransition = {
  type: 'spring' as const,
  stiffness: 450,
  damping: 20
};

export default function GrowthStage() {
  return (
    <section id="services" className="w-full pt-0 pb-28 px-6 sm:px-12 md:px-20 bg-background dark:bg-[#0b0f19] text-foreground transition-colors duration-300 relative overflow-hidden font-sans">
      <div className="max-w-[1360px] mx-auto">
        
        {/* ==================== SECTION HEADER ==================== */}
        <div className="text-center mb-24 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-blue/10 text-accent-blue text-xs sm:text-sm font-bold mb-4 border border-accent-blue/20">
              <Megaphone className="w-4 h-4 text-accent-blue" />
              <span>Digital Marketing & Tech Powerhouse</span>
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-[52px] font-extrabold text-foreground tracking-tight mb-6 leading-tight">
              Our Services & Growth Architecture
            </h2>
            <p className="text-text-secondary text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
              From targeted Meta Ads Campaigns & Organic Social Media Engagement to custom Web & Mobile Apps, BMTech drives real traffic, builds brand awareness, and converts prospects into paying customers.
            </p>
          </motion.div>

          {/* VALUE PROPOSITION BADGES WITH DYNAMIC CURSOR TAGS */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex flex-wrap items-center justify-center gap-4 mt-8"
          >
            <div 
              data-cursor-badge="META ADS"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border text-xs sm:text-sm font-semibold shadow-sm hover:-translate-y-1 transition-transform duration-200 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>High-ROI Meta Ads & Google Ad Campaigns</span>
            </div>
            <div 
              data-cursor-badge="ORGANIC"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border text-xs sm:text-sm font-semibold shadow-sm hover:-translate-y-1 transition-transform duration-200 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Organic Social Media Traffic & Engagement</span>
            </div>
            <div 
              data-cursor-badge="APPS & SAAS"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border text-xs sm:text-sm font-semibold shadow-sm hover:-translate-y-1 transition-transform duration-200 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Custom Web & Mobile App Development</span>
            </div>
          </motion.div>
        </div>

        {/* ==================== TRACK 1: FOR BUSINESSES & PRODUCTS (WITH DYNAMIC CURSOR BADGES & HOVER LIFT) ==================== */}
        <div className="mb-28">
          
          {/* Track Heading */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-16"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-sky-400 dark:border-sky-500/50 bg-sky-50 dark:bg-sky-500/10 text-foreground font-bold text-xl shadow-sm">
              <span className="w-3.5 h-3.5 rounded-full bg-sky-500 animate-pulse"></span>
              <span>For Businesses</span>
            </div>
            <span className="text-text-secondary text-lg font-medium">
              From first MVP launch to market-leading enterprise
            </span>
          </motion.div>

          {/* 4 STAGES GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
            
            {/* STAGE 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -18 }}
              transition={springTransition}
              data-cursor-badge="LAUNCH"
              className="flex flex-col items-center text-center group cursor-pointer"
            >
              {/* Badge */}
              <span className="px-5 py-2 rounded-full text-xs font-extrabold bg-[#fef3c7] dark:bg-amber-900/40 text-[#92400e] dark:text-amber-300 mb-5 shadow-sm uppercase tracking-wider group-hover:scale-105 transition-transform duration-200">
                Just Getting Started
              </span>

              {/* Title Pill */}
              <div className="flex items-center gap-3 px-6 py-3.5 rounded-full bg-surface dark:bg-slate-800/90 border border-border dark:border-slate-700/80 shadow-lg group-hover:border-amber-400 group-hover:shadow-amber-500/20 group-hover:-translate-y-1 transition-all duration-200 mb-4">
                <span className="text-base font-bold text-foreground">Brand Awareness & Launch</span>
                <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm font-bold group-hover:scale-125 group-hover:-translate-y-1 group-hover:translate-x-1 transition-all duration-200">
                  ↑
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-text-secondary max-w-[260px] mb-6 min-h-[48px] leading-relaxed">
                Organic Social Media Traffic, Brand Identity, Core Meta Ads Setup & Web MVP
              </p>

              {/* Animated Dotted Vertical Line */}
              <div className="w-0.5 h-14 border-r-2 border-dashed border-amber-400 dark:border-amber-500/60 mb-6 relative overflow-hidden">
                <motion.div 
                  animate={{ y: [0, 56] }} 
                  transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                  className="w-full h-4 bg-amber-400/90 rounded-full" 
                />
              </div>

              {/* Mockup Card 1 */}
              <div className="w-full flex-1 bg-surface/90 dark:bg-slate-900/80 border border-border dark:border-slate-800 rounded-3xl p-6 shadow-md group-hover:shadow-2xl group-hover:border-amber-400/60 transition-all duration-200 flex flex-col justify-between items-center">
                <div className="w-full bg-background dark:bg-slate-800/90 rounded-2xl p-5 border border-border shadow-sm mb-4 group-hover:scale-[1.02] transition-transform duration-200">
                  <div className="flex items-center justify-between bg-surface dark:bg-slate-900 p-3.5 rounded-xl mb-4 border border-border">
                    <Megaphone className="w-6 h-6 text-amber-500 group-hover:rotate-12 transition-transform duration-200" />
                    <div className="text-right">
                      <span className="text-lg font-extrabold text-foreground block">$25,000</span>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded">CUSTOMERS</span>
                    </div>
                  </div>
                  <div className="flex justify-center gap-3">
                    <div className="p-3 rounded-xl bg-surface border border-border text-amber-500 shadow-sm group-hover:scale-110 transition-transform duration-200">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div className="p-3 rounded-xl bg-surface border border-border text-amber-500 shadow-sm group-hover:scale-110 transition-transform duration-200">
                      <Share2 className="w-5 h-5" />
                    </div>
                    <div className="p-3 rounded-xl bg-surface border border-border text-amber-500 shadow-sm group-hover:scale-110 transition-transform duration-200">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Meta Ads & Organic Launch</span>
              </div>
            </motion.div>

            {/* STAGE 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -18 }}
              transition={springTransition}
              data-cursor-badge="META ADS"
              className="flex flex-col items-center text-center group cursor-pointer"
            >
              {/* Badge */}
              <span className="px-5 py-2 rounded-full text-xs font-extrabold bg-[#f3e8ff] dark:bg-purple-900/40 text-[#6b21a8] dark:text-purple-300 mb-5 shadow-sm uppercase tracking-wider group-hover:scale-105 transition-transform duration-200">
                Business Growth
              </span>

              {/* Title Pill */}
              <div className="flex items-center gap-3 px-6 py-3.5 rounded-full bg-surface dark:bg-slate-800/90 border border-border dark:border-slate-700/80 shadow-lg group-hover:border-purple-400 group-hover:shadow-purple-500/20 group-hover:-translate-y-1 transition-all duration-200 mb-4">
                <span className="text-base font-bold text-foreground">High-ROI Meta & Ad Campaigns</span>
                <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm font-bold group-hover:scale-125 group-hover:-translate-y-1 group-hover:translate-x-1 transition-all duration-200">
                  ↑
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-text-secondary max-w-[260px] mb-6 min-h-[48px] leading-relaxed">
                Targeted Meta & Google Ad Campaigns, Instagram Organic Engagement & Mobile Apps
              </p>

              {/* Animated Dotted Vertical Line */}
              <div className="w-0.5 h-14 border-r-2 border-dashed border-purple-400 dark:border-purple-500/60 mb-6 relative overflow-hidden">
                <motion.div 
                  animate={{ y: [0, 56] }} 
                  transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                  className="w-full h-4 bg-purple-500/90 rounded-full" 
                />
              </div>

              {/* Mockup Card 2 */}
              <div className="w-full flex-1 bg-surface/90 dark:bg-slate-900/80 border border-border dark:border-slate-800 rounded-3xl p-6 shadow-md group-hover:shadow-2xl group-hover:border-purple-400/60 transition-all duration-200 flex flex-col justify-between items-center">
                <div className="w-full bg-background dark:bg-slate-800/90 rounded-2xl p-5 border border-border shadow-sm mb-4 group-hover:scale-[1.02] transition-transform duration-200">
                  <div className="flex items-end justify-center gap-3 h-20 bg-surface dark:bg-slate-900 p-3 rounded-xl mb-4 border border-border">
                    <div className="w-7 bg-sky-100 dark:bg-sky-900/40 text-sky-500 text-xs flex items-center justify-center rounded-t h-10 font-bold">↑</div>
                    <div className="w-7 bg-sky-200 dark:bg-sky-800/60 text-sky-600 text-xs flex items-center justify-center rounded-t h-14 font-bold">↑</div>
                    <div className="w-7 bg-sky-500 text-white text-xs flex items-center justify-center rounded-t h-18 font-bold shadow-md group-hover:h-20 transition-all duration-200">↑</div>
                    <div className="w-2.5 h-16 bg-sky-400/80 rounded-full ml-1 animate-pulse"></div>
                  </div>
                  <div className="flex justify-center gap-3">
                    <div className="p-3 rounded-xl bg-surface border border-border text-purple-500 shadow-sm group-hover:scale-110 transition-transform duration-200">
                      <Target className="w-5 h-5" />
                    </div>
                    <div className="p-3 rounded-xl bg-surface border border-border text-purple-500 shadow-sm group-hover:scale-110 transition-transform duration-200">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div className="p-3 rounded-xl bg-surface border border-border text-purple-500 shadow-sm group-hover:scale-110 transition-transform duration-200">
                      <Share2 className="w-5 h-5" />
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Ad Campaigns & Traffic</span>
              </div>
            </motion.div>

            {/* STAGE 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -18 }}
              transition={springTransition}
              data-cursor-badge="SCALE"
              className="flex flex-col items-center text-center group cursor-pointer"
            >
              {/* Badge */}
              <span className="px-5 py-2 rounded-full text-xs font-extrabold bg-[#dcfce7] dark:bg-emerald-900/40 text-[#166534] dark:text-emerald-300 mb-5 shadow-sm uppercase tracking-wider group-hover:scale-105 transition-transform duration-200">
                Scaling Operations
              </span>

              {/* Title Pill */}
              <div className="flex items-center gap-3 px-6 py-3.5 rounded-full bg-surface dark:bg-slate-800/90 border border-border dark:border-slate-700/80 shadow-lg group-hover:border-emerald-400 group-hover:shadow-emerald-500/20 group-hover:-translate-y-1 transition-all duration-200 mb-4">
                <span className="text-base font-bold text-foreground">Omnichannel Marketing & Apps</span>
                <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm font-bold group-hover:scale-125 group-hover:-translate-y-1 group-hover:translate-x-1 transition-all duration-200">
                  ↑
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-text-secondary max-w-[260px] mb-6 min-h-[48px] leading-relaxed">
                High-Engagement Organic Content, Scaled Meta Ads, Multi-Platform Web & Mobile Apps
              </p>

              {/* Animated Dotted Vertical Line */}
              <div className="w-0.5 h-14 border-r-2 border-dashed border-emerald-400 dark:border-emerald-500/60 mb-6 relative overflow-hidden">
                <motion.div 
                  animate={{ y: [0, 56] }} 
                  transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                  className="w-full h-4 bg-emerald-500/90 rounded-full" 
                />
              </div>

              {/* Mockup Card 3 */}
              <div className="w-full flex-1 bg-surface/90 dark:bg-slate-900/80 border border-border dark:border-slate-800 rounded-3xl p-6 shadow-md group-hover:shadow-2xl group-hover:border-emerald-400/60 transition-all duration-200 flex flex-col justify-between items-center">
                <div className="w-full bg-background dark:bg-slate-800/90 rounded-2xl p-5 border border-border shadow-sm mb-4 group-hover:scale-[1.02] transition-transform duration-200">
                  <div className="relative w-full h-20 bg-surface dark:bg-slate-900 rounded-xl mb-4 overflow-hidden border border-border flex items-center justify-center">
                    <svg viewBox="0 0 100 50" className="w-full h-full opacity-30 fill-emerald-500">
                      <path d="M10,20 Q30,10 50,25 T90,15 L90,45 L10,45 Z" />
                    </svg>
                    <span className="absolute left-6 top-4 text-amber-500 text-base animate-bounce">📍</span>
                    <span className="absolute left-16 top-3 text-purple-500 text-base animate-bounce">📍</span>
                    <span className="absolute right-8 top-5 text-emerald-500 text-base animate-bounce">📍</span>
                  </div>
                  <div className="flex justify-center gap-3">
                    <div className="p-3 rounded-xl bg-surface border border-border text-emerald-500 shadow-sm group-hover:scale-110 transition-transform duration-200">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div className="p-3 rounded-xl bg-surface border border-border text-emerald-500 shadow-sm group-hover:scale-110 transition-transform duration-200">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div className="p-3 rounded-xl bg-surface border border-border text-emerald-500 shadow-sm group-hover:scale-110 transition-transform duration-200">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Organic Reach & Conversion</span>
              </div>
            </motion.div>

            {/* STAGE 4 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -18 }}
              transition={springTransition}
              data-cursor-badge="ENTERPRISE"
              className="flex flex-col items-center text-center group cursor-pointer"
            >
              {/* Badge */}
              <span className="px-5 py-2 rounded-full text-xs font-extrabold bg-[#ebdcfc] dark:bg-purple-950/50 text-[#581c87] dark:text-purple-300 mb-5 shadow-sm uppercase tracking-wider group-hover:scale-105 transition-transform duration-200">
                Enterprise Ready
              </span>

              {/* Title Pill */}
              <div className="flex items-center gap-3 px-6 py-3.5 rounded-full bg-surface dark:bg-slate-800/90 border border-border dark:border-slate-700/80 shadow-lg group-hover:border-indigo-400 group-hover:shadow-indigo-500/20 group-hover:-translate-y-1 transition-all duration-200 mb-4">
                <span className="text-base font-bold text-foreground">Enterprise Growth & SaaS</span>
                <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm font-bold group-hover:scale-125 group-hover:-translate-y-1 group-hover:translate-x-1 transition-all duration-200">
                  ↑
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-text-secondary max-w-[260px] mb-6 min-h-[48px] leading-relaxed">
                Full-Scale Ad Campaign Management, AI Lead Workflows & 24/7 Team
              </p>

              {/* Animated Dotted Vertical Line */}
              <div className="w-0.5 h-14 border-r-2 border-dashed border-indigo-500 dark:border-indigo-400/60 mb-6 relative overflow-hidden">
                <motion.div 
                  animate={{ y: [0, 56] }} 
                  transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                  className="w-full h-4 bg-indigo-500/90 rounded-full" 
                />
              </div>

              {/* Mockup Card 4 */}
              <div className="w-full flex-1 bg-surface/90 dark:bg-slate-900/80 border border-border dark:border-slate-800 rounded-3xl p-6 shadow-md group-hover:shadow-2xl group-hover:border-indigo-400/60 transition-all duration-200 flex flex-col justify-between items-center">
                <div className="w-full bg-background dark:bg-slate-800/90 rounded-2xl p-5 border border-border shadow-sm mb-4 group-hover:scale-[1.02] transition-transform duration-200">
                  <div className="flex items-center justify-between bg-surface dark:bg-slate-900 p-3 rounded-xl mb-4 border border-border">
                    <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                      <Bot className="w-5 h-5 text-indigo-500" /> AI Lead Workflow
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div className="flex justify-center gap-3">
                    <div className="p-3 rounded-xl bg-surface border border-border text-indigo-500 shadow-sm group-hover:scale-110 transition-transform duration-200">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="p-3 rounded-xl bg-surface border border-border text-indigo-500 shadow-sm group-hover:scale-110 transition-transform duration-200">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="p-3 rounded-xl bg-surface border border-border text-indigo-500 shadow-sm group-hover:scale-110 transition-transform duration-200">
                      <Layers className="w-5 h-5" />
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Enterprise Ads & AI Suite</span>
              </div>
            </motion.div>

          </div>
        </div>

        {/* ==================== TRACK 2: FOR PROFESSIONALS & PARTNERS (WITH DYNAMIC CURSOR BADGES) ==================== */}
        <div>
          
          {/* Track Heading */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-24"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-amber-400 dark:border-amber-500/50 bg-amber-50 dark:bg-amber-500/10 text-foreground font-bold text-xl shadow-sm">
              <span className="w-3.5 h-3.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span>For Partners & Agencies</span>
            </div>
            <span className="text-text-secondary text-lg font-medium">
              From solo creator to white-label enterprise agency
            </span>
          </motion.div>

          {/* ASCENDING STAIRCASE PATHWAY */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-8 relative items-start pt-6 pb-8">
            
            {/* STEP 1 (Bottom Left) */}
            <motion.div 
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              data-cursor-badge="CREATOR"
              className="flex flex-col items-center md:items-start text-center md:text-left group relative md:translate-y-24 cursor-pointer"
            >
              <div className="flex items-center gap-3 px-7 py-3.5 rounded-full bg-surface border border-border shadow-xl group-hover:border-amber-400 transition-colors duration-200 mb-5">
                <span className="text-base font-bold text-foreground">Solo Founder / Creator</span>
                <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm font-bold">
                  ↑
                </span>
              </div>
              <div className="p-5 rounded-2xl bg-surface/80 border border-border/80 shadow-md group-hover:border-amber-400/50 transition-colors duration-200 w-full">
                <p className="text-sm text-text-secondary leading-relaxed">
                  Organic social media strategy, initial Meta ads setup, brand engagement & landing page
                </p>
              </div>

              {/* Curved Animated SVG Connector 1 */}
              <div className="hidden md:block absolute -right-11 -top-5 w-28 h-12 pointer-events-none z-10">
                <svg width="110" height="44" viewBox="0 0 110 44" fill="none">
                  <path d="M 5 44 C 45 44, 65 12, 105 12" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="5 5" className="animate-[flowDash_1.2s_linear_infinite]" />
                </svg>
              </div>
            </motion.div>

            {/* STEP 2 (Elevated Level 2) */}
            <motion.div 
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              data-cursor-badge="AGENCY"
              className="flex flex-col items-center md:items-start text-center md:text-left group relative md:translate-y-16 cursor-pointer"
            >
              <div className="flex items-center gap-3 px-7 py-3.5 rounded-full bg-surface border border-border shadow-xl group-hover:border-purple-400 transition-colors duration-200 mb-5">
                <span className="text-base font-bold text-foreground">Growing Agency</span>
                <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm font-bold">
                  ↑
                </span>
              </div>
              <div className="p-5 rounded-2xl bg-surface/80 border border-border/80 shadow-md group-hover:border-purple-400/50 transition-colors duration-200 w-full">
                <p className="text-sm text-text-secondary leading-relaxed">
                  High-converting Meta & Google ad campaigns, organic traffic growth & full stack web app
                </p>
              </div>

              {/* Curved Animated SVG Connector 2 */}
              <div className="hidden md:block absolute -right-11 -top-5 w-28 h-12 pointer-events-none z-10">
                <svg width="110" height="44" viewBox="0 0 110 44" fill="none">
                  <path d="M 5 44 C 45 44, 65 12, 105 12" stroke="#a855f7" strokeWidth="2.5" strokeDasharray="5 5" className="animate-[flowDash_1.2s_linear_infinite]" />
                </svg>
              </div>
            </motion.div>

            {/* STEP 3 (Elevated Level 3) */}
            <motion.div 
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              data-cursor-badge="FIRM"
              className="flex flex-col items-center md:items-start text-center md:text-left group relative md:translate-y-8 cursor-pointer"
            >
              <div className="flex items-center gap-3 px-7 py-3.5 rounded-full bg-surface border border-border shadow-xl group-hover:border-emerald-400 transition-colors duration-200 mb-5">
                <span className="text-base font-bold text-foreground">Multi-Branch Firm</span>
                <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm font-bold">
                  ↑
                </span>
              </div>
              <div className="p-5 rounded-2xl bg-surface/80 border border-border/80 shadow-md group-hover:border-emerald-400/50 transition-colors duration-200 w-full">
                <p className="text-sm text-text-secondary leading-relaxed">
                  Omnichannel Meta ads, high-engagement Instagram management & custom iOS/Android apps
                </p>
              </div>

              {/* Curved Animated SVG Connector 3 */}
              <div className="hidden md:block absolute -right-11 -top-5 w-28 h-12 pointer-events-none z-10">
                <svg width="110" height="44" viewBox="0 0 110 44" fill="none">
                  <path d="M 5 44 C 45 44, 65 12, 105 12" stroke="#10b981" strokeWidth="2.5" strokeDasharray="5 5" className="animate-[flowDash_1.2s_linear_infinite]" />
                </svg>
              </div>
            </motion.div>

            {/* STEP 4 (Top Right) */}
            <motion.div 
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              data-cursor-badge="PARTNER"
              className="flex flex-col items-center md:items-start text-center md:text-left group relative md:translate-y-0 cursor-pointer"
            >
              <div className="flex items-center gap-3 px-7 py-3.5 rounded-full bg-surface border border-border shadow-xl group-hover:border-indigo-400 transition-colors duration-200 mb-5">
                <span className="text-base font-bold text-foreground">Enterprise Partner</span>
                <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm font-bold">
                  ↑
                </span>
              </div>
              <div className="p-5 rounded-2xl bg-surface/80 border border-border/80 shadow-md group-hover:border-indigo-400/50 transition-colors duration-200 w-full">
                <p className="text-sm text-text-secondary leading-relaxed">
                  Full-scale ad budget management, viral organic traffic funnels & custom SaaS platforms
                </p>
              </div>
            </motion.div>

          </div>
        </div>

      </div>
    </section>
  );
}
