'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

function MagneticWord({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const [position, setPosition] = React.useState({ x: 0, y: 0, rotate: 0 });
  const [isRevealed, setIsRevealed] = React.useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const distanceX = (e.clientX - centerX) * 0.15;
    const distanceY = (e.clientY - centerY) * 0.15;
    const rotation = (e.clientX - centerX) * 0.015;
    setPosition({ x: distanceX, y: distanceY, rotate: rotation });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0, rotate: 0 });
  };

  return (
    <div className={`py-1.5 px-4 -mx-4 ${isRevealed ? 'overflow-visible' : 'overflow-hidden'}`}>
      <motion.div
        initial={{ y: '110%', opacity: 0 }}
        animate={{ y: '0%', opacity: 1 }}
        onAnimationComplete={() => setIsRevealed(true)}
        transition={{
          duration: 1.1,
          delay: delay,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <motion.span
          ref={ref}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          animate={{ x: position.x, y: position.y, rotate: position.rotate }}
          transition={{ type: 'spring', stiffness: 220, damping: 18, mass: 0.2 }}
          className={`inline-block cursor-pointer select-none transform-gpu will-change-transform ${className}`}
        >
          {children}
        </motion.span>
      </motion.div>
    </div>
  );
}

function SeamlessVideoLoop({ src }: { src: string }) {
  const video1Ref = React.useRef<HTMLVideoElement>(null);
  const video2Ref = React.useRef<HTMLVideoElement>(null);
  const [activeVideo, setActiveVideo] = React.useState<1 | 2>(1);

  React.useEffect(() => {
    const v1 = video1Ref.current;
    const v2 = video2Ref.current;
    if (!v1 || !v2) return;

    let crossfading = false;

    const checkTime = () => {
      const currentVideo = activeVideo === 1 ? v1 : v2;
      const nextVideo = activeVideo === 1 ? v2 : v1;

      if (currentVideo.duration && currentVideo.currentTime >= currentVideo.duration - 0.5 && !crossfading) {
        crossfading = true;
        nextVideo.currentTime = 0;
        nextVideo.play().catch(() => {});
        setActiveVideo(activeVideo === 1 ? 2 : 1);
        setTimeout(() => {
          crossfading = false;
        }, 600);
      }
    };

    const interval = setInterval(checkTime, 100);
    return () => clearInterval(interval);
  }, [activeVideo]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-2xl">
      <video
        ref={video1Ref}
        src={src}
        autoPlay
        muted
        playsInline
        className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ease-in-out ${
          activeVideo === 1 ? 'opacity-100 z-10' : 'opacity-0 z-0'
        }`}
      />
      <video
        ref={video2Ref}
        src={src}
        muted
        playsInline
        className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ease-in-out ${
          activeVideo === 2 ? 'opacity-100 z-10' : 'opacity-0 z-0'
        }`}
      />
    </div>
  );
}

export default function Hero() {
  const router = useRouter();

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center pt-24 sm:pt-28 md:pt-32 pb-16 px-6 sm:px-12 md:px-20 overflow-hidden bg-[#faf9f5] dark:bg-[#0b0f19] text-slate-900 dark:text-white transition-colors duration-300">
      {/* 1. Dark Mode Background Image (hero-bg.png) */}
      <div className="absolute inset-0 z-0 hidden dark:block">
        <Image
          src="/hero-bg.png"
          alt="Engineering Digital Excellence Background"
          fill
          className="object-cover object-center opacity-85 transition-opacity duration-500"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0f19]/90 via-[#0b0f19]/50 to-transparent" />
      </div>

      {/* 2. Light Mode Smooth Cream + Sky Blue Gradient Background */}
      <div className="absolute inset-0 z-0 dark:hidden bg-[#faf9f5] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-200/60 via-sky-100/30 to-[#faf9f5]">
        {/* Subtle dot matrix grid */}
        <div className="absolute inset-0 opacity-35 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      {/* Decorative Orbs - Optimized with Radial Gradients instead of heavy CSS blurs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.6, 0.3],
          rotate: [0, 90, 0]
        }}
        transition={{ duration: 15, ease: "easeInOut", repeat: Infinity }}
        className="absolute top-[10%] right-[10%] w-[350px] h-[350px] md:w-[500px] md:h-[500px] bg-[radial-gradient(closest-side,_var(--tw-gradient-stops))] from-sky-300/40 to-transparent dark:from-blue-600/30 pointer-events-none transform-gpu will-change-transform"
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.25, 1],
          opacity: [0.25, 0.55, 0.25],
          y: [0, -40, 0]
        }}
        transition={{ duration: 18, ease: "easeInOut", repeat: Infinity, delay: 2 }}
        className="absolute bottom-[5%] left-[5%] w-[300px] h-[300px] md:w-[400px] md:h-[400px] bg-[radial-gradient(closest-side,_var(--tw-gradient-stops))] from-amber-100/40 to-transparent dark:from-blue-900/20 pointer-events-none transform-gpu will-change-transform"
      />

      {/* Hero Content Grid (Left Text + Right idom 3D Knot PNG) */}
      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        {/* Left Column: Text & CTAs */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          {/* Headline (Cuberto Kinetic Typography Style) */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] mb-8 font-heading text-slate-900 dark:text-white max-w-2xl flex flex-col gap-0.5">
            <div>
              <MagneticWord delay={0.2} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Engineering
              </MagneticWord>
            </div>
            <div className="pl-6 sm:pl-10">
              <MagneticWord delay={0.35} className="text-blue-600 dark:text-blue-500 hover:text-sky-500 transition-colors">
                Digital Excellence.
              </MagneticWord>
            </div>
            <div>
              <MagneticWord delay={0.5} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                For Businesses
              </MagneticWord>
            </div>
            <div className="pl-6 sm:pl-10">
              <MagneticWord delay={0.65} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                That Want To Lead.
              </MagneticWord>
            </div>
          </h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.75 }}
            className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-xl font-body leading-relaxed font-medium"
          >
            We partner with forward-thinking enterprises to design, build, and scale world-class digital products and infrastructure.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-wrap items-center gap-4 w-full sm:w-auto"
          >
            <button
              onClick={() => {
                const contactSection = document.getElementById('contact');
                contactSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="relative w-full sm:w-auto h-14 px-8 bg-gradient-to-r from-accent-blue to-rose-600 text-white font-bold text-sm rounded-xl shadow-[0_0_20px_rgba(219,53,69,0.3)] hover:shadow-[0_0_30px_rgba(219,53,69,0.5)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Your Project
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>

            <button
              onClick={() => {
                const portfolioSection = document.getElementById('portfolio');
                portfolioSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto h-14 px-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:bg-white dark:hover:bg-slate-800 font-bold text-sm rounded-xl transition-all hover:scale-105 active:scale-95 shadow-sm flex items-center justify-center"
            >
              Our Work
            </button>
          </motion.div>
        </div>

        {/* Right Column: idom.png 3D Glass Knot Graphic */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="lg:col-span-5 relative flex items-center justify-center"
        >
          <motion.div
            animate={{
              y: [0, -14, 0],
              rotate: [0, 2, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="relative w-full max-w-[420px] aspect-square flex items-center justify-center transform-gpu will-change-transform"
          >
            <Image
              src="/idom.png"
              alt="3D Glass Ribbon Knot Graphic"
              width={420}
              height={420}
              className="object-contain filter drop-shadow-[0_20px_35px_rgba(37,99,235,0.2)]"
              priority
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
