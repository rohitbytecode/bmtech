'use client';

import { useState, useEffect, useRef } from 'react';

export default function EasterEgg() {
  const [hovered, setHovered] = useState(false);
  const [cracked, setCracked] = useState(false);
  const eggRef = useRef<HTMLDivElement>(null);

  // Reset cracked state when hover ends
  useEffect(() => {
    if (!hovered) {
      const t = setTimeout(() => setCracked(false), 400);
      return () => clearTimeout(t);
    }
  }, [hovered]);

  return (
    <div
      ref={eggRef}
      className="easter-egg-wrapper"
      onMouseEnter={() => {
        setHovered(true);
        setCracked(true);
      }}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: 'default' }}
    >
      {/* The bouncing egg */}
      <div className={`easter-egg ${cracked ? 'easter-egg--cracked' : ''}`}>
        <svg
          width="28"
          height="34"
          viewBox="0 0 28 34"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="easter-egg__svg"
        >
          {/* Egg body */}
          <ellipse
            cx="14"
            cy="18"
            rx="12"
            ry="15"
            fill="url(#eggGrad)"
            stroke="rgba(37,99,235,0.3)"
            strokeWidth="1"
          />
          {/* Decorative zigzag band */}
          <path
            d="M4 16 L7 13 L10 16 L13 13 L16 16 L19 13 L22 16 L24 14"
            stroke="rgba(37,99,235,0.5)"
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Small dots decoration */}
          <circle cx="9" cy="22" r="1.2" fill="rgba(37,99,235,0.35)" />
          <circle cx="14" cy="24" r="1.2" fill="rgba(37,99,235,0.35)" />
          <circle cx="19" cy="22" r="1.2" fill="rgba(37,99,235,0.35)" />
          {/* Shine highlight */}
          <ellipse
            cx="10"
            cy="11"
            rx="3"
            ry="4"
            fill="rgba(255,255,255,0.15)"
            transform="rotate(-15 10 11)"
          />
          <defs>
            <linearGradient id="eggGrad" x1="14" y1="3" x2="14" y2="33" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1e3a5f" />
              <stop offset="50%" stopColor="#0f1d30" />
              <stop offset="100%" stopColor="#0a1220" />
            </linearGradient>
          </defs>
        </svg>

        {/* Crack overlay when hovered */}
        {cracked && (
          <svg
            width="28"
            height="34"
            viewBox="0 0 28 34"
            fill="none"
            className="easter-egg__crack"
          >
            <path
              d="M14 5 L12 10 L15 12 L11 16 L14 18"
              stroke="rgba(37,99,235,0.8)"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>

      {/* Bounce shadow */}
      <div className="easter-egg__shadow" />

      {/* Tooltip message */}
      <div className={`easter-egg__tooltip ${hovered ? 'easter-egg__tooltip--visible' : ''}`}>
        <span className="easter-egg__tooltip-icon"></span>
        <span>You&apos;ve found an easter egg!</span>
      </div>
    </div>
  );
}
