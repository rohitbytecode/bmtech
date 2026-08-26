'use client';

import { useAuth } from '../hooks/useAuth';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeContext';
import { motion } from 'framer-motion';

export default function Header() {
  const { user, isAuthenticated, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin')) {
    return null;
  }

  const navLinks = [
    { label: 'Services', href: '#services' },
    { label: 'Portfolio', href: '#portfolio' },
    { label: 'Process', href: '#process' },
    { label: 'Pricing', href: '#packages' },
    { label: 'About Us', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 flex pointer-events-none"
    >
      <nav className="pointer-events-auto w-full bg-[#121212]/20 backdrop-blur-xl text-white px-6 sm:px-10 lg:px-16 py-4 flex items-center justify-between border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.1)] transition-colors duration-300">
        
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0 flex-1">
          <div className="flex items-center justify-center">
            <span className="text-2xl sm:text-3xl font-black italic tracking-tighter text-accent-blue font-sans">
              BM
            </span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-base sm:text-lg font-extrabold tracking-tight text-white font-heading">
              Brothers
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.25em] text-slate-400 uppercase">
              MEDIATECH
            </span>
          </div>
        </Link>

        {/* Center: Navigation Links (Desktop) */}
        <div className="hidden lg:flex items-center justify-center gap-7 xl:gap-10 flex-[2]">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="group relative text-[13px] xl:text-sm font-semibold text-slate-300 hover:text-white transition-colors duration-200 whitespace-nowrap"
            >
              {link.label}
              <span className="absolute -bottom-1.5 left-0 w-0 h-[2px] bg-accent-blue transition-all duration-300 group-hover:w-full rounded-full"></span>
            </a>
          ))}
        </div>

        {/* Right Actions: Theme Toggle + CTA Button */}
        <div className="hidden md:flex items-center justify-end gap-5 shrink-0 flex-1">
          {/* Square Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 border border-slate-600 text-slate-300 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-center h-10 w-10"
            aria-label="Toggle Theme"
            data-cursor-badge="theme"
          >
            {theme === 'dark' ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
          </button>

          {/* Solid Square CTA Button with White Shadow */}
          {loading ? (
            <div className="h-10 w-32 bg-slate-700/50 rounded-xl animate-pulse"></div>
          ) : isAuthenticated ? (
            <Link
              href="/dashboard"
              className="relative overflow-hidden bg-gradient-to-r from-accent-blue to-rose-600 hover:from-rose-600 hover:to-accent-blue text-white px-6 py-2.5 text-sm font-bold rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(219,53,69,0.4)] group"
              data-cursor-badge="dashboard"
            >
              <span className="relative z-10">Dashboard</span>
            </Link>
          ) : (
            <a
              href="#contact"
              className="relative overflow-hidden bg-gradient-to-r from-accent-blue to-rose-600 hover:from-rose-600 hover:to-accent-blue text-white px-6 py-2.5 text-sm font-bold rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(219,53,69,0.4)] group"
              data-cursor-badge="talk"
            >
              <span className="relative z-10">Start Project</span>
            </a>
          )}
        </div>

        {/* Mobile Controls */}
        <div className="flex md:hidden items-center justify-end flex-1 gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 border border-slate-600 text-slate-300 hover:text-white h-10 w-10 flex items-center justify-center"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-white h-10 w-10 flex items-center justify-center"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 pointer-events-auto bg-[#121212] text-white p-6 shadow-2xl border-b border-slate-700/80 md:hidden z-50 flex flex-col gap-2"
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-base font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-center bg-gradient-to-r from-accent-blue to-rose-600 text-white px-5 py-3 text-base font-bold mt-4 rounded-xl shadow-[0_0_20px_rgba(219,53,69,0.4)]"
          >
            Start Project
          </a>
        </motion.div>
      )}
    </motion.header>
  );
}
