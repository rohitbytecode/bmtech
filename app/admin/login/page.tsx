"use client";
// Admin Login Page with Enterprise SSO

import React, { useState } from "react";
import { Lock, Mail, ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/admin/FormFields";

import { authorizeCurrentDevice, isDeviceAuthorized, getDeviceFingerprint } from "@/lib/device";
import { authService } from "@/services/authService";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deviceFingerprint, setDeviceFingerprint] = useState("");

  React.useEffect(() => {
    setDeviceFingerprint(getDeviceFingerprint());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // 1. Standard Supabase Sign In
    const { data: loginData, error: loginError } = await authService.signIn(email, password);

    if (loginError || !loginData?.session) {
      setError(loginError || "Login failed. Please check your credentials.");
      setIsLoading(false);
      return;
    }

    // 2. Verify Super Admin Status securely
    try {
      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: loginData.session.user.id })
      });

      const result = await response.json();

      if (response.ok && result.is_super_admin === true) {
        // Successfully verified as super admin
        authorizeCurrentDevice(); // Keep the device fingerprinting for extra security
        window.location.href = "/admin/dashboard";
      } else {
        // Not a super admin or error
        await authService.signOut();
        setError(result.error || "Access Denied: Super Admin privileges strictly required.");
        setIsLoading(false);
      }
    } catch (err) {
      await authService.signOut();
      setError("System authorization error. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 selection:bg-accent-blue selection:text-white">
      {/* Background blobs for depth */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent-blue/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent-blue/5 rounded-full blur-[100px] animate-pulse delay-700"></div>
      </div>

      <div className="w-full max-w-[480px] space-y-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center space-y-4">
          <div className="h-20 w-20 bg-surface border border-border rounded-3xl mx-auto flex items-center justify-center text-accent-blue shadow-2xl shadow-accent-blue/20 group hover:scale-110 transition-transform duration-500">
            <Lock size={40} className="group-hover:rotate-12 transition-transform" />
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight text-text-primary">
              BMTech <span className="text-accent-blue">Admin</span>
            </h1>
            <p className="text-text-secondary font-medium uppercase tracking-[0.2em] text-xs">
              Secure access to core systems
            </p>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-[2.5rem] p-10 md:p-12 shadow-3xl relative overflow-hidden backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm font-semibold flex items-center gap-3 animate-head-shake">
                <Shield size={18} /> {error}
              </div>
            )}

            <InputField
              label="Corporate Email"
              type="email"
              placeholder="Enter admin mail id"
              required
              className="group"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <InputField
              label="Security Key"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer group text-text-secondary hover:text-text-primary transition-colors">
                <input type="checkbox" className="w-4 h-4 rounded border-border bg-background accent-accent-blue focus:ring-accent-blue/40" />
                <span>Stay signed in</span>
              </label>
              {/* <a href="#" className="text-accent-blue hover:text-accent-blue/80 font-bold transition-colors">Reset Key</a> */}
            </div>

            <Button
              type="submit"
              className="w-full h-16 text-lg font-bold uppercase tracking-widest gap-3 shadow-xl shadow-accent-blue/20 group overflow-hidden"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Verifying...</span>
                </div>
              ) : (
                <>
                  Initialize Dashboard <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          {/* Quick login divider */}
          <div className="mt-10 relative text-center">
            <span className="text-[10px] font-mono text-text-secondary uppercase tracking-widest bg-background/50 px-2 py-1 rounded">
              Hardware ID: <span className="text-accent-blue">{deviceFingerprint}</span>
            </span>
          </div>
        </div>

        <p className="text-center text-text-secondary text-sm">
          Technical issues? <a href="#" className="text-text-primary underline font-semibold decoration-accent-blue/40 underline-offset-4 decoration-2">Contact System Architect</a>
        </p>
      </div>
    </div>
  );
}
