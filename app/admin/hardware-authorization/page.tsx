'use client';

import React, { useEffect, useState } from 'react';
import { ShieldAlert, Monitor, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getDeviceFingerprint } from '@/lib/device';
import { dataService } from '@/services/dataService';
import { useRouter, useSearchParams } from 'next/navigation';

export default function HardwareAuthorizationPage() {
  const [hwId, setHwId] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAuto = searchParams.get('auto') === 'true';

  useEffect(() => {
    const id = getDeviceFingerprint();
    setHwId(id);

    // Auto-redirect if already authorized
    const checkAuth = async () => {
      // Ensure we have an ID before checking
      const currentId = id || getDeviceFingerprint();
      if (!currentId) return;

      const { data } = await dataService.getAuthorizedDevices();
      if (data?.some((d: any) => d.device_id === currentId)) {
        setSuccess(true);
        // Add a tiny delay to ensure cookie is fully flushed in the browser
        setTimeout(() => {
          window.location.href = '/admin/dashboard';
        }, 500);
      }
    };
    checkAuth();
  }, []);

  const handleEnroll = async () => {
    setLoading(true);
    try {
      const { success: ok, error } = await dataService.authorizeDevice(
        hwId,
        `Primary Device (${new Date().toLocaleDateString()})`,
      );
      if (ok) {
        setSuccess(true);
        // Force a full location change to ensure middleware picks up the new DB state and cookie
        setTimeout(() => {
          window.location.href = '/admin/dashboard';
        }, 1000);
      } else {
        alert('Enrollment failed: ' + (typeof error === 'object' ? JSON.stringify(error) : error));
      }
    } catch (err) {
      alert('An unexpected error occurred during enrollment.');
      console.error(err);
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
              ) : (
                <ShieldAlert size={40} className="text-accent-blue" />
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {success ? 'Success!' : isAuto ? 'Welcome, Admin' : 'Access Denied'}
            </h1>
            <p className="text-text-secondary leading-relaxed">
              {success
                ? 'This device has been authorized. Redirecting...'
                : isAuto
                  ? 'This is your first login. For your security, we need to authorize this hardware device to access the Admin Panel.'
                  : 'Your current hardware node is not authorized to access the system. Please enroll this device or contact another admin.'}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-background/50 border border-border space-y-4">
            <div className="flex items-center justify-center gap-2 text-accent-blue">
              <Monitor size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Hardware ID</span>
            </div>
            <p className="text-2xl font-mono font-bold text-text-primary tracking-tighter uppercase">
              {hwId || '--------'}
            </p>
          </div>

          {!success && (
            <div className="space-y-4">
              <Button
                onClick={handleEnroll}
                className="w-full h-14 gap-2"
                disabled={loading || !hwId}
              >
                {loading ? <Loader2 className="animate-spin" /> : <ArrowRight size={20} />}
                {isAuto ? 'Enroll this Device' : 'Request Authorization'}
              </Button>

              <button
                onClick={() => router.push('/')}
                className="text-sm text-text-secondary hover:text-white transition-colors underline underline-offset-4"
              >
                Back to Site
              </button>
            </div>
          )}
        </div>

        <p className="text-center mt-8 text-xs text-text-secondary/50 font-medium tracking-widest uppercase">
          BMTech High-Security Environment
        </p>
      </div>
    </div>
  );
}
