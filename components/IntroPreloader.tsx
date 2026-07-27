'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IntroPreloaderProps {
  onComplete?: () => void;
}

export default function IntroPreloader({ onComplete }: IntroPreloaderProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const timer = setTimeout(() => {
      setIsVisible(false);
      document.body.style.overflow = 'auto';
      if (onComplete) onComplete();
    }, 1500); 

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = 'auto';
    };
  }, [onComplete]);

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key="intro-preloader"
          initial={{ y: 0 }}
          exit={{
            y: '-100%',
            transition: {
              duration: 0.75,
              ease: [0.76, 0, 0.24, 1],
            },
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-[#0e0f12] text-white py-12 px-6 overflow-hidden select-none"
        >
          <div className="w-full max-w-7xl flex justify-between items-center opacity-0">
            <span className="text-xs font-bold tracking-widest">BMTECH</span>
          </div>

          <div className="relative flex flex-col items-center justify-center my-auto">
            <div className="flex items-center justify-center gap-6 sm:gap-8">
              {/* Expanding Blue Line from Left to Right */}
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                className="w-[58px] sm:w-[90px] h-[3px] bg-blue-500 rounded-full origin-left"
              />

              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.65, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col text-left"
              >
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.45, ease: 'easeOut' }}
                  className="flex items-center gap-2"
                >
                  <span className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white font-sans">
                    Brothers
                  </span>
                  <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>
                </motion.div>

                <motion.span
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6, ease: 'easeOut' }}
                  className="text-xs sm:text-base font-semibold tracking-[0.35em] text-blue-400 uppercase mt-1"
                >
                  MEDIATECH
                </motion.span>
              </motion.div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.75 }}
            className="text-center pb-4"
          >
            <p className="text-[10px] sm:text-xs font-semibold tracking-[0.45em] text-slate-400 uppercase">
              ENGINEERED &middot; CREATED &middot; ELEVATED
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
