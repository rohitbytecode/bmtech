import React from 'react';

export function NextJsIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 180 180" fill="none" className={className}>
      <circle cx="90" cy="90" r="90" fill="currentColor" className="text-slate-900 dark:text-white" />
      <path
        d="M149.508 157.52L69.142 54H54V126H67.882V70.622L137.666 160.77C141.83 159.88 145.79 158.78 149.508 157.52Z"
        fill="url(#next_grad)"
      />
      <rect x="115" y="54" width="14" height="72" fill="url(#next_grad)" />
      <defs>
        <linearGradient id="next_grad" x1="109" y1="116.5" x2="144.5" y2="160.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function ReactIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <circle cx="50" cy="50" r="8" fill="#61DAFB" />
      <ellipse cx="50" cy="50" rx="38" ry="14" stroke="#61DAFB" strokeWidth="4" />
      <ellipse cx="50" cy="50" rx="38" ry="14" stroke="#61DAFB" strokeWidth="4" transform="rotate(60 50 50)" />
      <ellipse cx="50" cy="50" rx="38" ry="14" stroke="#61DAFB" strokeWidth="4" transform="rotate(120 50 50)" />
    </svg>
  );
}

export function VueIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 128 128" fill="none" className={className}>
      <path d="M78.8 10L64 35.4L49.2 10H0l64 110L128 10H78.8z" fill="#41B883" />
      <path d="M78.8 10L64 35.4L49.2 10H25.6L64 76.5L102.4 10H78.8z" fill="#35495E" />
    </svg>
  );
}

export function NestIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 256" fill="none" className={className}>
      <path
        d="M219.7 131.6c-4.4-1.3-8.8 1.4-9.9 5.8-2.6 10.7-9.5 20.3-18.9 26.2-14.8 9.3-34.5 7.1-46.8-5.3L130 144.2c16.3-21.7 28.5-46.3 36-72.7 1.4-4.8-1.4-9.8-6.2-11.2-4.8-1.4-9.8 1.4-11.2 6.2-6.9 24.3-18.1 46.8-33.1 66.8l-12.7-12.7c-9.6-9.6-25.2-9.6-34.8 0L24.8 163c-14.1 14.1-14.1 36.9 0 51 14.1 14.1 36.9 14.1 51 0l38.9-38.9c18.5 16.6 46 18.9 67.2 5.6 14.2-8.9 24.6-23.4 28.5-39.7 1.3-4.3-1.4-8.8-5.7-10.1z"
        fill="#E0234E"
      />
    </svg>
  );
}

export function AdonisIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <path d="M50 5L90 85H70L50 45L30 85H10L50 5Z" fill="#5A45FF" />
      <circle cx="50" cy="70" r="10" fill="#5A45FF" />
    </svg>
  );
}

export function GitHubIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 96" fill="currentColor" className={`${className} text-slate-900 dark:text-white`}>
      <path fillRule="evenodd" clipRule="evenodd" d="M48 0C21.49 0 0 21.49 0 48c0 21.21 13.75 39.2 32.82 45.55 2.4.44 3.28-1.04 3.28-2.31 0-1.14-.04-4.16-.07-8.17-13.35 2.9-16.17-6.43-16.17-6.43-2.18-5.54-5.33-7.02-5.33-7.02-4.36-2.98.33-2.92.33-2.92 4.82.34 7.36 4.95 7.36 4.95 4.28 7.34 11.23 5.22 13.97 3.99.43-3.1 1.67-5.22 3.04-6.42-10.66-1.21-21.87-5.33-21.87-23.73 0-5.24 1.87-9.53 4.94-12.89-.5-1.21-2.14-6.1 0.47-12.71 0 0 4.03-1.29 13.2 4.92 3.83-1.07 7.94-1.6 12.02-1.62 4.08.02 8.19.55 12.03 1.62 9.16-6.21 13.18-4.92 13.18-4.92 2.62 6.61.98 11.5.49 12.71 3.08 3.36 4.93 7.65 4.93 12.89 0 18.45-11.23 22.5-21.93 23.69 1.72 1.48 3.26 4.41 3.26 8.89 0 6.42-.06 11.6-.06 13.18 0 1.28.87 2.78 3.3 2.31C82.26 87.19 96 69.2 96 48 96 21.49 74.51 0 48 0z" />
    </svg>
  );
}

export function VercelIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" fill="currentColor" className={`${className} text-slate-900 dark:text-white`}>
      <path d="M256 48L512 464H0L256 48Z" />
    </svg>
  );
}

export function SupabaseIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <path d="M57.6 92.5c-2.3 3.1-7.2 1.3-6.9-2.5l3.8-40.4H10.8c-4 0-6.1-4.7-3.4-7.7L50.2 4.5c2.3-3.1 7.2-1.3 6.9 2.5l-3.8 40.4h43.7c4 0 6.1 4.7 3.4 7.7L57.6 92.5z" fill="url(#supa_g)" />
      <defs>
        <linearGradient id="supa_g" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3ECF8E" />
          <stop offset="1" stopColor="#249D61" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function HostingerIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="#673DE6" className={className}>
      <rect width="100" height="100" rx="20" fill="#673DE6" />
      <path d="M30 25v50h14V57h12v18h14V25H56v18H44V25H30z" fill="white" />
    </svg>
  );
}

export function AwsIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <path d="M20 70c20 15 45 15 60 0" stroke="#FF9900" strokeWidth="6" strokeLinecap="round" />
      <path d="M75 66l7 6-8 4" stroke="#FF9900" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <text x="50%" y="48%" dominantBaseline="middle" textAnchor="middle" fill="#FF9900" fontWeight="900" fontSize="30" fontFamily="sans-serif">
        AWS
      </text>
    </svg>
  );
}

export function AzureIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 96" fill="none" className={className}>
      <path d="M34.5 12h27L38 48.5 12 84h24.5l25-35.5L34.5 12z" fill="#0078D4" />
      <path d="M38.5 48.5L62 12h22L48 84H23.5l15-35.5z" fill="#50E6FF" />
    </svg>
  );
}

export function TailwindIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <path
        d="M25 35c4.2-8.3 10.4-12.5 18.7-12.5 12.5 0 16.7 12.5 25 12.5 5.6 0 10.4-2.8 14.6-8.3-4.2 8.3-10.4 12.5-18.7 12.5-12.5 0-16.7-12.5-25-12.5-5.6 0-10.4 2.8-14.6 8.3zM12.5 60c4.2-8.3 10.4-12.5 18.7-12.5 12.5 0 16.7 12.5 25 12.5 5.6 0 10.4-2.8 14.6-8.3-4.2 8.3-10.4 12.5-18.7 12.5-12.5 0-16.7-12.5-25-12.5-5.6 0-10.4 2.8-14.6 8.3z"
        fill="#06B6D4"
      />
    </svg>
  );
}

export function TypescriptIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <rect width="100" height="100" rx="16" fill="#3178C6" />
      <path d="M48 65v-6h-9v-24h9v-6H25v6h9v24h-9v6h23zm33-1c-2.3 1.5-5.5 2.2-9.6 2.2-4.5 0-8-.9-10.5-2.7-2.5-1.8-3.7-4.4-3.7-7.8 0-3 1-5.3 3.1-7.1 2.1-1.7 5.7-3.2 10.8-4.4 3.7-.9 6.2-1.7 7.5-2.4 1.3-.7 1.9-1.6 1.9-2.7 0-1.2-.5-2.1-1.6-2.7-1.1-.6-2.6-.9-4.7-.9-2.1 0-4.1.4-6 1.2-1.9.8-3.5 2-4.8 3.5l-4-4.5c1.8-2.2 4.1-3.9 6.9-5.1 2.8-1.2 5.9-1.8 9.3-1.8 4.3 0 7.8.9 10.3 2.7 2.5 1.8 3.7 4.3 3.7 7.5 0 2.8-1 5-3 6.6-2 1.6-5.5 3-10.4 4.1-3.9.9-6.5 1.7-7.8 2.5-1.3.8-1.9 1.7-1.9 2.9 0 1.3.6 2.3 1.8 3 1.2.7 2.9 1.1 5.2 1.1 2.5 0 4.9-.5 7.1-1.5 2.2-1 4.1-2.4 5.6-4.3l4.3 4.8c-2 2.4-4.5 4.2-7.5 5.5z" fill="white" />
    </svg>
  );
}

export function NodeIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <path d="M50 5L90 27.5V72.5L50 95L10 72.5V27.5L50 5Z" fill="#5FA04E" />
      <path d="M50 15L80 32V68L50 85L20 68V32L50 15Z" fill="#333333" />
      <path d="M50 35v30M35 42.5l30 15" stroke="#5FA04E" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function DockerIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="#2496ED" className={className}>
      <rect x="20" y="45" width="12" height="10" rx="2" />
      <rect x="35" y="45" width="12" height="10" rx="2" />
      <rect x="50" y="45" width="12" height="10" rx="2" />
      <rect x="35" y="32" width="12" height="10" rx="2" />
      <rect x="50" y="32" width="12" height="10" rx="2" />
      <rect x="65" y="45" width="12" height="10" rx="2" />
      <path d="M10 60c5-5 15-5 25 0s25 5 35 0 15-5 20 0c0 15-10 25-40 25S10 75 10 60z" />
    </svg>
  );
}

export function PythonIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <path d="M48 5c-15 0-18 6-18 14v10h36v4H30C16 33 10 40 10 55s6 20 20 20h8V63c0-10 8-18 18-18h18V31c0-14-7-26-26-26z" fill="#3776AB" />
      <circle cx="36" cy="18" r="3" fill="white" />
      <path d="M52 95c15 0 18-6 18-14V71H34v-4h36c14 0 20-7 20-22s-6-20-20-20h-8v12c0 10-8 18-18 18H26v14c0 14 7 26 26 26z" fill="#FFD43B" />
      <circle cx="64" cy="82" r="3" fill="#3776AB" />
    </svg>
  );
}

export function PostgresIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <path d="M50 10c-22 0-40 18-40 40 0 18 12 33 28 38v-12c-10-3-16-12-16-22 0-13 11-24 24-24s24 11 24 24c0 10-6 19-16 22v12c16-5 28-20 28-38 0-22-18-40-40-40z" fill="#4169E1" />
      <circle cx="42" cy="40" r="5" fill="#336791" />
    </svg>
  );
}

export function MongoIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <path d="M50 5C45 25 20 40 20 65c0 18 13 30 30 30s30-12 30-30C80 40 55 25 50 5z" fill="#47A248" />
      <path d="M50 5v90c17 0 30-12 30-30C80 40 55 25 50 5z" fill="#499D4A" />
      <path d="M50 15v70" stroke="#3F8E41" strokeWidth="3" />
    </svg>
  );
}

export function GraphqlIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <path d="M50 10L85 30V70L50 90L15 70V30L50 10Z" stroke="#E10098" strokeWidth="6" />
      <path d="M50 10V90M15 30L85 70M85 30L15 70" stroke="#E10098" strokeWidth="4" />
      <circle cx="50" cy="10" r="7" fill="#E10098" />
      <circle cx="85" cy="30" r="7" fill="#E10098" />
      <circle cx="85" cy="70" r="7" fill="#E10098" />
      <circle cx="50" cy="90" r="7" fill="#E10098" />
      <circle cx="15" cy="70" r="7" fill="#E10098" />
      <circle cx="15" cy="30" r="7" fill="#E10098" />
    </svg>
  );
}

export function FigmaIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <circle cx="35" cy="25" r="15" fill="#F24E1E" />
      <circle cx="65" cy="25" r="15" fill="#FF7262" />
      <circle cx="35" cy="50" r="15" fill="#A259FF" />
      <circle cx="65" cy="50" r="15" fill="#1ABCFE" />
      <path d="M20 75c0 8.3 6.7 15 15 15s15-6.7 15-15V60H20v15z" fill="#0ACF83" />
    </svg>
  );
}
