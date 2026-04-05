"use client";
import { Button } from "./ui/Button";
import { ArrowRight, PlayCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-24 px-6 sm:px-12 md:px-24 bg-background overflow-hidden text-center">
      {/* Decorative Blur and Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] bg-accent-blue/30 blur-[100px] rounded-full opacity-30 animate-pulse"></div>
      <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] bg-blue-900/30 blur-[120px] rounded-full opacity-30"></div>

      <div className="max-w-4xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-6 flex justify-center"
        >
          <span className="px-4 py-2 rounded-full border border-accent-blue/30 bg-accent-blue/5 text-accent-blue text-xs font-semibold uppercase tracking-widest leading-none">
            Next Generation Digital Agency
          </span>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight text-white"
        >
          We Handle Your Digital. <br className="hidden md:block" />
          <span className="text-accent-blue">You Grow Your Business.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-text-secondary mb-12 max-w-2xl mx-auto font-body"
        >
          Partner with BMTech for world-class graphics, video production, IT infrastructure, 
          and social media scaling. Your vision, our expertise.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 py-4"
        >
          <Button size="lg" className="w-full sm:w-auto h-14 group">
            Get Started <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="outline" size="lg" className="w-full sm:w-auto h-14">
            View Portfolio <PlayCircle className="ml-2" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
