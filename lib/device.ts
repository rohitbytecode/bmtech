'use client';

// Simple device fingerprinting utility
export function getDeviceFingerprint(): string {
  if (typeof window === 'undefined') return '';

  const screen = window.screen;
  const navigator = window.navigator;

  // Combine some non-private characteristics to create a unique-ish ID
  const fingerprint = [
    navigator.userAgent,
    screen.width,
    screen.height,
    screen.colorDepth,
    navigator.language,
    navigator.hardwareConcurrency || 4,
  ].join('###');

  // Basic hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  const id = Math.abs(hash).toString(16).toUpperCase();

  // Sync to cookie for middleware/server access
  if (typeof document !== 'undefined') {
    document.cookie = `bmtech_hw_id=${id}; path=/; max-age=31536000; SameSite=Lax`;
  }

  return id;
}

// In a real app, these would come from your database (Supabase)
const AUTHORIZED_DEVICES_KEY = 'bmtech_authorized_devices';

export function isDeviceAuthorized(): boolean {
  if (typeof window === 'undefined') return false;

  const currentFingerprint = getDeviceFingerprint();
  const authorizedDevices = JSON.parse(localStorage.getItem(AUTHORIZED_DEVICES_KEY) || '[]');

  return authorizedDevices.includes(currentFingerprint);
}

export function authorizeCurrentDevice() {
  if (typeof window === 'undefined') return;

  const currentFingerprint = getDeviceFingerprint();
  const authorizedDevices = JSON.parse(localStorage.getItem(AUTHORIZED_DEVICES_KEY) || '[]');

  if (!authorizedDevices.includes(currentFingerprint)) {
    authorizedDevices.push(currentFingerprint);
    localStorage.setItem(AUTHORIZED_DEVICES_KEY, JSON.stringify(authorizedDevices));
  }
}
