"use client";
import React from "react";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Portfolio from "@/components/Portfolio";
import Packages from "@/components/Packages";
import Maintenance from "@/components/Maintenance";
import Process from "@/components/Process";
import About from "@/components/About";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      <Hero />
      <Services />
      <Portfolio />
      <Packages />
      <Maintenance />
      <Process />
      <About />
      <Contact />
      
      {/* Mini Footer */}
      <footer className="py-12 border-t border-border bg-background px-6 sm:px-12 md:px-24">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-white mb-2">BM<span className="text-accent-blue">Tech</span></h2>
            <p className="text-text-secondary text-sm max-w-sm">Premium digital agency for modern brands.</p>
          </div>
          
          <div className="text-text-secondary text-xs font-medium space-x-6 uppercase tracking-wider">
             <a href="#services" className="hover:text-accent-blue transition-colors">Services</a>
             <a href="#portfolio" className="hover:text-accent-blue transition-colors">Portfolio</a>
             <a href="#contact" className="hover:text-accent-blue transition-colors">Contact</a>
          </div>
          
          <p className="text-text-secondary text-sm">© 2026 BMTech. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
