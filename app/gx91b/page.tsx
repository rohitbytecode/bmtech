import Link from 'next/link';
import { ArrowUpRight, Command, LockKeyhole, Radio, Sparkles } from 'lucide-react';

const diagnostics = [
  { label: 'Core systems', value: 'Upgrading', color: 'bg-amber-400' },
  { label: 'Data vault', value: 'Encrypted', color: 'bg-sky-400' },
  { label: 'Admin access', value: 'Paused', color: 'bg-rose-400' },
];

export default function AdminRoot() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#071225] px-5 py-8 text-white sm:px-10 lg:px-16">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_28%,rgba(37,99,235,0.24),transparent_24%),radial-gradient(circle_at_15%_80%,rgba(14,165,233,0.16),transparent_30%),linear-gradient(135deg,#071225_0%,#0b1530_52%,#101b2c_100%)]" />
      <div className="pointer-events-none absolute -right-32 -top-32 -z-10 h-[28rem] w-[28rem] rounded-full border border-sky-300/10 sm:h-[38rem] sm:w-[38rem]">
        <div className="absolute inset-8 rounded-full border border-sky-300/10" />
        <div className="absolute inset-16 rounded-full border border-dashed border-sky-300/15 [animation:spin_28s_linear_infinite]" />
      </div>

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col">
        <header className="flex items-center justify-between border-b border-white/10 pb-6">
          <Link
            href="/"
            className="group flex items-center gap-3 text-sm font-semibold tracking-[0.18em] text-white/80 uppercase"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-sky-300/25 bg-sky-300/10 text-sky-300 transition-transform group-hover:rotate-12">
              <Command size={17} />
            </span>
            BM / Control
          </Link>
          <div className="flex items-center gap-2 text-xs font-medium tracking-[0.16em] text-white/45 uppercase">
            <span className="h-2 w-2 animate-pulse rounded-full bg-sky-300" />
            Private console
          </div>
        </header>

        <section className="grid flex-1 items-center gap-14 py-16 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.8fr)] lg:gap-24">
          <div className="max-w-2xl">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-amber-200/8 px-4 py-2 text-xs font-semibold tracking-[0.16em] text-amber-200 uppercase">
              <Sparkles size={14} />
              Scheduled recalibration
            </div>
            <h1 className="max-w-xl text-5xl font-semibold leading-[0.98] tracking-[-0.04em] text-white sm:text-7xl">
              The control room is <span className="text-sky-300">getting sharper.</span>
            </h1>
            <p className="mt-8 max-w-lg text-base leading-7 text-white/55 sm:text-lg">
              We are tuning the BMTech admin console behind the scenes. Your workspace and data are
              secure while this upgrade is in progress.
            </p>
            <Link
              href="/"
              className="mt-10 inline-flex items-center gap-3 rounded-full bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-[0_0_26px_rgba(37,99,235,0.4)] transition hover:bg-blue-500"
            >
              Return to BMTech
              <ArrowUpRight size={17} />
            </Link>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-blue-950/40 backdrop-blur-xl sm:p-8">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:32px_32px]" />
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-medium tracking-[0.16em] text-white/40 uppercase">
                  <span>System status</span>
                  <Radio size={16} className="text-sky-300" />
                </div>
                <div className="relative mx-auto flex h-44 w-44 items-center justify-center">
                  <div className="absolute inset-0 animate-ping rounded-full border border-sky-300/25 [animation-duration:3s]" />
                  <div className="absolute inset-5 rounded-full border border-dashed border-sky-300/30 [animation:spin_16s_linear_infinite]" />
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border border-sky-200/40 bg-sky-300/15 shadow-[0_0_70px_rgba(56,189,248,0.32)]">
                    <LockKeyhole size={30} className="text-sky-200" />
                  </div>
                </div>
                <div className="space-y-3 border-t border-white/10 pt-5">
                  {diagnostics.map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-sm">
                      <span className="text-white/45">{item.label}</span>
                      <span className="flex items-center gap-2 text-white/80">
                        <span className={`h-1.5 w-1.5 rounded-full ${item.color}`} />
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-5 rounded-2xl border border-white/10 bg-[#122044]/90 px-4 py-3 shadow-xl backdrop-blur-md">
              <p className="text-[10px] tracking-[0.16em] text-white/35 uppercase">Next check-in</p>
              <p className="mt-1 font-mono text-sm text-sky-200">IN A LITTLE WHILE</p>
            </div>
          </div>
        </section>

        <footer className="flex flex-col gap-3 border-t border-white/10 pt-5 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <span>Admin route /gx91b</span>
          <span>BMTech operations · 2026</span>
        </footer>
      </div>
    </main>
  );
}
