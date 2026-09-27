'use client';

import { useEffect, useState } from 'react';

type Countdown = {
  hours: number;
  minutes: number;
  seconds: number;
};

function getTimeLeft(targetTime: number): Countdown {
  const distance = Math.max(0, targetTime - Date.now());

  return {
    hours: Math.floor(distance / 3600000),
    minutes: Math.floor((distance / 60000) % 60),
    seconds: Math.floor((distance / 1000) % 60),
  };
}

const units: { key: keyof Countdown; label: string }[] = [
  { key: 'hours', label: 'Hours' },
  { key: 'minutes', label: 'Min' },
  { key: 'seconds', label: 'Sec' },
];

export default function MaintenanceCountdown({ targetDate }: { targetDate?: string }) {
  const [timeLeft, setTimeLeft] = useState<Countdown | null>(null);
  
  const targetTime = targetDate ? new Date(targetDate).getTime() : NaN;
  const isValid = !isNaN(targetTime);

  useEffect(() => {
    if (!isValid) {
      setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    const updateCountdown = () => setTimeLeft(getTimeLeft(targetTime));
    updateCountdown();

    const interval = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(interval);
  }, [targetTime, isValid]);

  const isCompleted =
    timeLeft &&
    timeLeft.hours === 0 &&
    timeLeft.minutes === 0 &&
    timeLeft.seconds === 0;

  if (isCompleted) {
    return (
      <div className="mt-10 max-w-lg" aria-live="polite">
        <div className="mb-3 flex items-center justify-between text-[10px] font-semibold tracking-[0.18em] text-emerald-300/60 uppercase">
          <span>Systems return window</span>
          <span>Online</span>
        </div>
        <div className="group relative overflow-hidden rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.07] px-4 py-4 text-center shadow-[0_0_22px_rgba(52,211,153,0.08)] backdrop-blur-sm">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/70 to-transparent opacity-70 transition-opacity group-hover:opacity-100" />
          <p className="font-mono text-xl font-semibold tabular-nums text-emerald-100 sm:text-2xl">
            Maintenance Complete
          </p>
          <p className="mt-1 text-[9px] font-semibold tracking-[0.16em] text-emerald-100/40 uppercase">
            Systems Ready
          </p>
        </div>
      </div>
    );
  }

  let dateString = '--';
  if (isValid) {
    const d = new Date(targetTime);
    dateString = `${d.getDate()} ${d.toLocaleString('en-US', { month: 'short' })} · ${d.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  }

  return (
    <div className="mt-10 max-w-lg" aria-live="polite">
      <div className="mb-3 flex items-center justify-between text-[10px] font-semibold tracking-[0.18em] text-sky-200/60 uppercase">
        <span>Systems return window</span>
        <span>{dateString}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
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
