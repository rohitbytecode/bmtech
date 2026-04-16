import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function formatUrl(url: string) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) {
    return url;
  }
  return `https://${url}`;
}

export function ensureValidImageUrl(url: string, fallback = '/placeholder-project.jpg') {
  if (!url) return fallback;
  if (url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // If it's just a string like "dsdsd", check if it looks like a relative path without leading slash
  if (url.includes('.') && !url.includes(' ')) {
    return `https://${url}`;
  }
  return fallback;
}
