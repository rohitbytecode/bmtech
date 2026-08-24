'use client';

import { useAuth } from '../hooks/useAuth';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Sun, Moon, Phone, ArrowRight } from 'lucide-react';
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
    { label: 'Home', href: '/' },
    { label: 'Services', href: '#services' },
    { label: 'Portfolio', href: '#portfolio' },
    { label: 'About Us', href: '#about' },
    { label: 'Case Studies', href: '#portfolio' },
    { label: 'Pricing', href: '#packages' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-5 sm:top-6 left-0 right-0 z-50 flex justify-center px-4 sm:px-8 pointer-events-none"
    >
      <nav className="pointer-events-auto w-full max-w-[1360px] bg-[#222326] dark:bg-[#18191c] text-white rounded-full px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 shadow-2xl border border-slate-700/60 dark:border-slate-800/80 backdrop-blur-xl flex items-center justify-between transition-colors duration-300">
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="flex items-center justify-center">
            <span className="text-2xl sm:text-3xl font-black italic tracking-tighter text-blue-500 font-sans">
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

        {/* Center Navigation Links (Desktop) */}
        <div className="hidden lg:flex items-center gap-2.5 lg:gap-4 xl:gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-xs lg:text-xs xl:text-sm font-semibold text-slate-200 hover:text-white transition-colors duration-200 whitespace-nowrap"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right Actions: Theme Toggle + Phone + CTA Button */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3 shrink-0">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 lg:p-2.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle Theme"
            data-cursor-badge="theme"
          >
            {theme === 'dark' ? <Sun size={19} className="text-amber-400" /> : <Moon size={19} />}
          </button>

          {/* Phone Call Button */}
          <a
            href="tel:+917778864972"
            className="p-2 lg:p-2.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Call Us"
            data-cursor-badge="call"
          >
            <Phone size={18} />
          </a>

          {/* Primary Action Button */}
          {loading ? (
            <div className="h-11 w-28 bg-slate-700 rounded-full animate-pulse"></div>
          ) : isAuthenticated ? (
            <Link
              href="/dashboard"
              className="rounded-full bg-blue-600 hover:bg-blue-500 text-white px-4 lg:px-5 xl:px-7 py-2.5 lg:py-3 text-xs lg:text-sm font-bold transition-all shadow-lg flex items-center gap-2 whitespace-nowrap"
              data-cursor-badge="dashboard"
            >
              Dashboard
              <ArrowRight size={15} />
            </Link>
          ) : (
            <a
              href="#contact"
              className="rounded-full bg-blue-600 hover:bg-blue-500 text-white px-4 lg:px-5 xl:px-7 py-2.5 lg:py-3 text-xs lg:text-sm font-bold transition-all shadow-lg hover:shadow-blue-500/30 flex items-center gap-2 whitespace-nowrap"
              data-cursor-badge="talk"
            >
              Let&apos;s Talk
              <ArrowRight size={15} />
            </a>
          )}
        </div>

        {/* Mobile Controls */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-slate-300 hover:text-white"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-white"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="absolute top-20 left-4 right-4 pointer-events-auto max-w-md mx-auto bg-[#222326] text-white rounded-3xl p-6 shadow-2xl border border-slate-700/80 space-y-3.5 md:hidden z-50"
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 text-base font-semibold text-slate-200 hover:text-white hover:bg-white/10 rounded-2xl transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-center rounded-full bg-blue-600 text-white px-5 py-3 text-base font-bold mt-4 shadow-lg"
          >
            Let&apos;s Talk →
          </a>
        </motion.div>
      )}
    </motion.header>
  );
}
