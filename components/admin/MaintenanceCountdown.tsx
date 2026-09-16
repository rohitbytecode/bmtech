'use client';

import { useEffect, useState } from 'react';

const targetTime = new Date('2026-09-20T20:00:00+05:30').getTime();

type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getTimeLeft(): Countdown {
  const distance = Math.max(0, targetTime - Date.now());

  return {
    days: Math.floor(distance / 86400000),
    hours: Math.floor((distance / 3600000) % 24),
    minutes: Math.floor((distance / 60000) % 60),
    seconds: Math.floor((distance / 1000) % 60),
  };
}

const units: { key: keyof Countdown; label: string }[] = [
  { key: 'days', label: 'Days' },
  { key: 'hours', label: 'Hours' },
  { key: 'minutes', label: 'Min' },
  { key: 'seconds', label: 'Sec' },
];

export default function MaintenanceCountdown() {
  const [timeLeft, setTimeLeft] = useState<Countdown | null>(null);

  useEffect(() => {
    const updateCountdown = () => setTimeLeft(getTimeLeft());
    updateCountdown();

    const interval = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="mt-10 max-w-lg" aria-live="polite">
      <div className="mb-3 flex items-center justify-between text-[10px] font-semibold tracking-[0.18em] text-sky-200/60 uppercase">
        <span>Systems return window</span>
        <span>20 Sep · 8:00 PM IST</span>
      </div>
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {units.map(({ key, label }) => (
          <div
            key={key}
            className="group relative overflow-hidden rounded-2xl border border-sky-300/15 bg-sky-300/[0.07] px-2 py-3 text-center shadow-[0_0_22px_rgba(37,99,235,0.08)] backdrop-blur-sm"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/70 to-transparent opacity-70 transition-opacity group-hover:opacity-100" />
            <p className="font-mono text-xl font-semibold tabular-nums text-white sm:text-2xl">
              {timeLeft ? String(timeLeft[key]).padStart(2, '0') : '--'}
            </p>
            <p className="mt-1 text-[9px] font-semibold tracking-[0.16em] text-white/40 uppercase">
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
