'use client';

import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export default function CustomCursor() {
  const [isHovered, setIsHovered] = useState(false);
  const [cursorText, setCursorText] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Smooth fluid spring physics matching UniQual
  const springConfig = { damping: 26, stiffness: 280, mass: 0.4 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  useEffect(() => {
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    if (isTouchDevice) return;

    setIsVisible(true);

    const updateMousePosition = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) {
        setIsHovered(false);
        setCursorText('');
        return;
      }

      // 1. Check explicitly targeted header action buttons (Theme Toggle, Phone, Let's Talk)
      const badgeTarget = target.closest('[data-cursor-badge]') as HTMLElement | null;
      if (badgeTarget) {
        const type = badgeTarget.getAttribute('data-cursor-badge');
        if (type === 'theme') {
          const isDark = document.documentElement.classList.contains('dark');
          setCursorText(isDark ? 'LIGHT MODE' : 'DARK MODE');
        } else if (type === 'call') {
          setCursorText('CALL');
        } else if (type === 'talk') {
          setCursorText('TALK');
        } else if (type === 'dashboard') {
          setCursorText('ADMIN');
        }
        setIsHovered(true);
        return;
      }

      // 2. Check portfolio project card tiles
      const isProjectCardTile =
        target.closest('.portfolio-card') ||
        target.closest('[data-cursor="view"]');

      if (isProjectCardTile) {
        setCursorText('VIEW');
        setIsHovered(true);
        return;
      }

      // 3. For standard navbar links (Home, Services, Portfolio, About Us, Case Studies, Pricing, Contact)
      // and general buttons: Expand cursor circle, but NO text badge box!
      const isInteractive =
        target.closest('a') ||
        target.closest('button') ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('select') ||
        target.closest('[role="button"]') ||
        target.closest('.interactive') ||
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'H1' ||
        target.tagName === 'H2';

      setIsHovered(!!isInteractive);
      setCursorText('');
    };

    const handleMouseLeaveWindow = () => setIsVisible(false);
    const handleMouseEnterWindow = () => setIsVisible(true);

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseleave', handleMouseLeaveWindow);
    document.addEventListener('mouseenter', handleMouseEnterWindow);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeaveWindow);
      document.removeEventListener('mouseenter', handleMouseEnterWindow);
    };
  }, [cursorX, cursorY]);

  if (!isVisible) return null;

  return (
    <>
      <motion.div
        style={{
          x: smoothX,
          y: smoothY,
        }}
        animate={{
          scale: isHovered ? 3.0 : 1,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{
          scale: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
          opacity: { duration: 0.2 },
        }}
        className="fixed top-0 left-0 w-3 h-3 -mt-2.5 -ml-2.5 rounded-full bg-white mix-blend-difference pointer-events-none z-[99999] select-none shadow-none"
      />

      {cursorText && (
        <motion.div
          style={{
            x: smoothX,
            y: smoothY,
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.15 }}
          className="fixed top-0 left-0 pointer-events-none z-[99999] select-none translate-x-4 -translate-y-6"
        >
          <span className="inline-block bg-sky-400 text-slate-900 text-[9px] font-extrabold tracking-[0.2em] px-2.5 py-1 uppercase shadow-md">
            {cursorText}
          </span>
        </motion.div>
      )}
    </>
  );
}
