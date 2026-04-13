"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Shield, Key, Smartphone, Loader2, CheckCircle2, AlertTriangle, Monitor } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/admin/FormFields";
import { webauthnClient } from "@/lib/webauthnClient";
import { cn } from "@/lib/utils";

export default function DeviceOnboardingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<'verifying' | 'ready' | 'registering' | 'success' | 'error'>('verifying');
  const [error, setError] = useState<string | null>(null);
  const [deviceName, setDeviceName] = useState("");
  const [inviteData, setInviteData] = useState<any>(null);

  // 1. Verify token on mount
  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError("No invitation token found in the URL.");
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch("/api/invite/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token })
        });
        const data = await res.json();
        
        if (data.success) {
          setInviteData(data);
          setStatus('ready');
        } else {
          setStatus('error');
          setError(data.error || "Invalid invitation");
        }
      } catch (err) {
        setStatus('error');
        setError("Connection error. Please try again.");
      }
    };

    verifyToken();
  }, [token]);

  // 2. Handle Registration
  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceName || !token) return;

    setStatus('registering');
    try {
      // We don't have the user's email here yet, so we pass the token. 
      // The upgraded API will find the user associated with this token.
      await webauthnClient.register("New Device", token, deviceName);
      setStatus('success');
      
      // Auto-redirect after 3 seconds
      setTimeout(() => {
        router.push("/admin/login");
      }, 3000);
    } catch (err: any) {
      setStatus('ready');
      alert("Registration failed: " + err.message);
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
          <p className="text-text-secondary text-sm">Securely onboard your new device to BMTech Lab.</p>
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
              <Button onClick={() => router.push("/")} variant="outline" className="w-full">
                Back to Site
              </Button>
            </div>
          )}

          {status === 'ready' && (
            <form onSubmit={handleOnboard} className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-text-secondary leading-relaxed">
                    This invitation is valid. Once you register this device, it will be added to your verified hardware list.
                  </p>
                </div>
                
                <InputField 
                  label="Device Friendly Name"
                  placeholder="e.g., My Personal iPhone"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full h-12 text-lg">
                Register Device
              </Button>
            </form>
          )}

          {status === 'registering' && (
            <div className="py-10 text-center space-y-6">
              <div className="relative h-20 w-20 mx-auto">
                <Loader2 className="animate-spin text-accent-blue h-full w-full" size={40} />
                <Monitor className="absolute inset-0 m-auto text-white" size={24} />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold">Waiting for Hardware...</h4>
                <p className="text-text-secondary text-sm italic">Follow the biometric prompt on your screen.</p>
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
                <p className="text-text-secondary text-sm">This device is now trusted. Redirecting to login...</p>
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
