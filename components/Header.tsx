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
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1.0, delay: 1.6, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-50 bg-white/90 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/50 transition-colors"
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 justify-between items-center">
          {/* Logo / Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center">
              <span className="text-2xl font-black italic tracking-tighter text-blue-600 dark:text-blue-500 font-sans">
                BM
              </span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white font-heading">
                Brothers
              </span>
              <span className="text-[9px] font-bold tracking-[0.25em] text-slate-500 uppercase">
                MEDIATECH
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-7">
            {navLinks.map((link, idx) => (
              <a
                key={link.label}
                href={link.href}
                className={`relative py-1 text-xs font-semibold transition-colors after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-blue-600 dark:after:bg-blue-400 after:transition-all after:duration-300 after:ease-out ${
                  idx === 0
                    ? 'text-blue-600 dark:text-blue-400 font-bold after:w-full'
                    : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 after:w-0 hover:after:w-full'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right Actions: Theme Toggle + Phone + Let's Talk */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle Theme"
              data-cursor-badge="theme"
            >
              {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
            </button>

            {/* Phone Call Icon */}
            <a
              href="tel:+1234567890"
              className="p-2.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Call Us"
              data-cursor-badge="call"
            >
              <Phone size={16} />
            </a>

            {loading ? (
              <div className="h-10 w-28 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse"></div>
            ) : isAuthenticated ? (
              <Link
                href="/dashboard"
                className="rounded-full bg-blue-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-md flex items-center gap-2"
                data-cursor-badge="dashboard"
              >
                Dashboard
                <ArrowRight size={14} />
              </Link>
            ) : (
              <a
                href="#contact"
                className="rounded-full bg-[#1e40af] hover:bg-blue-700 px-6 py-2.5 text-xs font-bold text-white transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                data-cursor-badge="talk"
              >
                Let&apos;s Talk
                <ArrowRight size={14} />
              </a>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-800 dark:text-white"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 py-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center rounded-full bg-blue-600 px-4 py-2.5 text-sm font-bold text-white mt-4"
            >
              Let&apos;s Talk →
            </a>
          </div>
        )}
      </nav>
    </motion.header>
  );
}

