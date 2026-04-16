'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Shield, Key, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useSearchParams, useRouter } from 'next/navigation';
import { webauthnClient } from '@/lib/webauthnClient';

function EnrollmentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = searchParams.get('token');
  const email = searchParams.get('email'); // Ideally email is also in the token or passed

  const handleEnroll = async () => {
    if (!token) {
      setError('Missing enrollment token.');
      return;
    }

    // Ask for email if missing (or we could have encoded it in the token)
    let userEmail = email;
    if (!userEmail) {
      userEmail = prompt('Enter your administrator email to bind this device:') || '';
    }
    if (!userEmail) return;

    setLoading(true);
    setError(null);

    try {
      await webauthnClient.register(userEmail, token);
      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Enrollment failed. The link may be expired or used.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 bg-[linear-gradient(to_bottom_right,#0B0F19,#111827)]">
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-surface border border-border rounded-3xl p-8 md:p-12 shadow-2xl shadow-black/50 text-center space-y-8 overflow-hidden">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-accent-blue/20 blur-2xl rounded-full"></div>
            <div className="relative h-20 w-20 bg-accent-blue/10 border border-accent-blue/20 rounded-2xl flex items-center justify-center mx-auto">
              {success ? (
                <CheckCircle2 size={40} className="text-emerald-400" />
              ) : error ? (
                <AlertCircle size={40} className="text-rose-400" />
              ) : (
                <Key size={40} className="text-accent-blue" />
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {success ? 'Device Trusted' : 'Hardware Enrollment'}
            </h1>
            <p className="text-text-secondary leading-relaxed text-sm">
              {success
                ? 'This hardware is now cryptographically bound to your account. Redirecting to secure login...'
                : "You have been invited to register this hardware as a trusted administrative node. This process uses your device's secure enclave (TPM)."}
            </p>
          </div>

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {!success && (
            <div className="space-y-4">
              <Button
                onClick={handleEnroll}
                className="w-full h-14 gap-2"
                disabled={loading || !token}
              >
                {loading ? <Loader2 className="animate-spin" /> : <Shield size={18} />}
                Authorize This Device
              </Button>

              <p className="text-[10px] text-text-secondary/50 uppercase font-bold tracking-[0.2em]">
                One-Time Use Only • Hardware Encrypted
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EnrollmentPage() {
  return (
    <Suspense fallback={<div>Loading security context...</div>}>
      <EnrollmentContent />
    </Suspense>
  );
}
