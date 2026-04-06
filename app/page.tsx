import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Portfolio from "@/components/Portfolio";
import Packages from "@/components/Packages";
import Maintenance from "@/components/Maintenance";
import Process from "@/components/Process";
import About from "@/components/About";
import Contact from "@/components/Contact";

const requiredEnv = [
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
];

function isEnvLoaded() {
  return requiredEnv.every(Boolean);
}

export default function Home() {
  if (!isEnvLoaded()) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="max-w-xl rounded-3xl border border-red-500 bg-slate-900/90 p-10 shadow-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-red-400 mb-4">Configuration Required</h1>
          <p className="text-sm text-slate-300 leading-relaxed mb-6">
            The homepage is unavailable because the required environment variables are not loaded.
            Please create a <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs">.env</code> file with the following keys:
          </p>
          <ul className="mb-6 list-disc pl-5 space-y-2 text-slate-300">
            <li><code>NEXT_PUBLIC_SUPABASE_URL</code></li>
            <li><code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li>
          </ul>
          <p className="text-sm text-slate-400">Reload the page after adding the values to restore access.</p>
        </div>
      </main>
    );
  }

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
