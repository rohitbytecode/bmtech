'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Shield,
  Key,
  Smartphone,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Monitor,
  Fingerprint,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { InputField } from '@/components/admin/FormFields';
import { webauthnClient } from '@/lib/webauthnClient';
import { cn } from '@/lib/utils';

export default function DeviceOnboardingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'verifying' | 'ready' | 'registering' | 'success' | 'error'>(
    'verifying',
  );
  const [error, setError] = useState<string | null>(null);
  const [deviceName, setDeviceName] = useState('');
  const [inviteData, setInviteData] = useState<any>(null);
  const [webauthnFailed, setWebauthnFailed] = useState(false);
  const [enrollMethod, setEnrollMethod] = useState<'webauthn' | 'token'>('webauthn');

  // 1. Verify token on mount
  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('No invitation token found in the URL.');
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch('/api/invite/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();

        if (data.success) {
          setInviteData(data);
          setStatus('ready');
        } else {
          setStatus('error');
          setError(data.error || 'Invalid invitation');
        }
      } catch (err) {
        setStatus('error');
        setError('Connection error. Please try again.');
      }
    };

    verifyToken();
  }, [token]);

  // 2. Handle WebAuthn Registration (primary method)
  const handleWebauthnEnroll = async () => {
    if (!deviceName || !token) return;
    setStatus('registering');
    setEnrollMethod('webauthn');

    try {
      await webauthnClient.register('New Device', token, deviceName);
      setStatus('success');
      setTimeout(() => {
        router.push('/admin/login');
      }, 3000);
    } catch (err: any) {
      console.warn('[Invite] WebAuthn registration failed:', err.message);
      setWebauthnFailed(true);
      setStatus('ready');
      // Don't show an alert — the UI will now show the fallback option
    }
  };

  // 3. Handle Token-Based Registration (fallback)
  const handleTokenEnroll = async () => {
    if (!deviceName || !token) return;
    setStatus('registering');
    setEnrollMethod('token');

    try {
      const res = await fetch('/api/auth/device-enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, deviceName }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Token enrollment failed');
      }

      // Store the credential ID in a secure cookie so the proxy accepts this device
      document.cookie = `bmtech_hardware_verified=${result.credentialId}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax; Secure`;

      setStatus('success');
      setTimeout(() => {
        router.push('/admin/login');
      }, 3000);
    } catch (err: any) {
      setStatus('ready');
      setError(err.message || 'Enrollment failed');
    }
  };

  // 4. Combined handler — tries WebAuthn first, then falls back
  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (webauthnFailed) {
      await handleTokenEnroll();
    } else {
      await handleWebauthnEnroll();
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B10] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent-blue/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />

      <div className="w-full max-w-md z-10">
        <div className="text-center space-y-4 mb-10">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-accent-blue/20 to-emerald-500/20 border border-white/10 shadow-2xl">
            <Shield size={32} className="text-accent-blue" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Access Invite</h1>
          <p className="text-text-secondary text-sm">
            Securely onboard your new device to BMTech Lab.
          </p>
        </div>

        <div className="bg-surface/50 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl space-y-8">
          {status === 'verifying' && (
            <div className="py-10 flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-accent-blue" size={32} />
              <p className="text-text-secondary font-medium">Verifying invitation...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="py-6 flex flex-col items-center text-center gap-6">
              <div className="h-16 w-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400">
                <AlertTriangle size={32} />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold">Invitation Error</h4>
                <p className="text-text-secondary text-sm">{error}</p>
              </div>
              <Button onClick={() => router.push('/')} variant="outline" className="w-full">
                Back to Site
              </Button>
            </div>
          )}

          {status === 'ready' && (
            <form onSubmit={handleOnboard} className="space-y-6">
              <div className="space-y-4">
                {/* Show WebAuthn failure notice and fallback option */}
                {webauthnFailed && (
                  <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
                    <AlertTriangle size={20} className="text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs text-amber-300 font-semibold">
                        Hardware passkey unavailable on this device
                      </p>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        Your device doesn't support passkeys (Windows Hello PIN not set up, or browser restrictions).
                        Using secure token enrollment instead — your device will still be cryptographically authorized.
                      </p>
                    </div>
                  </div>
                )}

                {!webauthnFailed && (
                  <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-text-secondary leading-relaxed">
                      This invitation is valid. Once you register this device, it will be added to
                      your verified hardware list.
                    </p>
                  </div>
                )}

                <InputField
                  label="Device Friendly Name"
                  placeholder="e.g., My Personal iPhone"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full h-12 text-lg gap-2">
                {webauthnFailed ? (
                  <>
                    <Key size={18} />
                    Authorize with Secure Token
                  </>
                ) : (
                  <>
                    <Fingerprint size={18} />
                    Register Device
                  </>
                )}
              </Button>

              {!webauthnFailed && (
                <button
                  type="button"
                  onClick={() => setWebauthnFailed(true)}
                  className="w-full text-xs text-text-secondary/60 hover:text-text-secondary transition-colors text-center"
                >
                  Having trouble? Use alternative enrollment →
                </button>
              )}
            </form>
          )}

          {status === 'registering' && (
            <div className="py-10 text-center space-y-6">
              <div className="relative h-20 w-20 mx-auto">
                <Loader2 className="animate-spin text-accent-blue h-full w-full" size={40} />
                <Monitor className="absolute inset-0 m-auto text-white" size={24} />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold">
                  {enrollMethod === 'webauthn' ? 'Waiting for Hardware...' : 'Authorizing Device...'}
                </h4>
                <p className="text-text-secondary text-sm italic">
                  {enrollMethod === 'webauthn'
                    ? 'Follow the biometric prompt on your screen.'
                    : 'Generating secure device token...'}
                </p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="py-10 text-center space-y-6 animate-in zoom-in-95 duration-500">
              <div className="h-20 w-20 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mx-auto border border-emerald-500/20 shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)]">
                <CheckCircle2 size={40} />
              </div>
              <div className="space-y-2">
                <h4 className="text-2xl font-bold">Onboarding Complete!</h4>
                <p className="text-text-secondary text-sm">
                  This device is now trusted. Redirecting to login...
                </p>
              </div>
            </div>
          )}
        </div>

        <p className="mt-8 text-center text-[10px] text-text-secondary/50 uppercase tracking-[0.2em] font-medium">
          Zero-Trust Security &bull; WebAuthn Protected
        </p>
      </div>
    </div>
  );
}
