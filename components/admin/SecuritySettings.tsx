"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  Monitor,
  Smartphone,
  Trash2,
  Plus,
  Loader2,
  HardDrive,
  ExternalLink,
  Key,
  AlertTriangle,
  Edit2,
  CheckCircle2,
  FlaskConical,
  Lock,
  Cpu,
  Fingerprint,
  CloudOff,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/admin/FormFields";
import { ModalForm } from "@/components/admin/ModalForm";
import { webauthnClient } from "@/lib/webauthnClient";
import { dataService } from "@/services/dataService";
import { cn } from "@/lib/utils";

function DevModeSecurityScreen() {
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setPulse((p) => !p), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[520px] overflow-hidden select-none animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full bg-amber-500/10 blur-[100px] animate-pulse" />
        <div className="absolute top-1/4 right-1/4 w-[200px] h-[200px] rounded-full bg-accent-blue/8 blur-[80px] animate-pulse delay-700" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #f59e0b 1px, transparent 1px), linear-gradient(to bottom, #f59e0b 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-8 max-w-md px-4">
        {/* Icon cluster */}
        <div className="relative">
          <div className="h-24 w-24 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-2xl shadow-amber-500/20">
            <FlaskConical size={44} className="text-amber-400" />
          </div>
          {/* Orbiting badge */}
          <div className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/40">
            <span className="text-[9px] font-black text-white uppercase leading-none">
              DEV
            </span>
          </div>
        </div>

        {/* Headline */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-widest">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full bg-amber-400 transition-opacity duration-700",
                pulse ? "opacity-100" : "opacity-20",
              )}
            />
            Development Environment
          </div>

          <h3 className="text-3xl font-extrabold text-text-primary tracking-tight leading-tight">
            Hardware Auth <br />
            <span className="text-amber-400">Bypassed</span>
          </h3>

          <p className="text-text-secondary text-sm leading-relaxed">
            Zero-Trust hardware authentication is{" "}
            <span className="text-amber-400 font-semibold">
              disabled in development
            </span>
            . All WebAuthn passkey checks, device registration, and session
            verification are skipped locally to keep your workflow fast.
          </p>
        </div>

        {/* Info cards */}
        <div className="w-full space-y-3">
          {[
            {
              icon: Fingerprint,
              label: "Passkey Registration",
              status: "Skipped",
              color: "text-amber-400",
              bg: "bg-amber-500/8 border-amber-500/15",
            },
            {
              icon: Cpu,
              label: "Hardware Verification",
              status: "Skipped",
              color: "text-amber-400",
              bg: "bg-amber-500/8 border-amber-500/15",
            },
            {
              icon: CloudOff,
              label: "Session API Calls",
              status: "Suppressed",
              color: "text-amber-400",
              bg: "bg-amber-500/8 border-amber-500/15",
            },
            {
              icon: Lock,
              label: "Production Auth",
              status: "Active on Deploy",
              color: "text-emerald-400",
              bg: "bg-emerald-500/8 border-emerald-500/15",
            },
          ].map(({ icon: Icon, label, status, color, bg }) => (
            <div
              key={label}
              className={cn(
                "flex items-center justify-between px-5 py-3 rounded-2xl border text-sm",
                bg,
              )}
            >
              <div className="flex items-center gap-3 text-text-secondary">
                <Icon size={16} className={color} />
                <span className="font-medium">{label}</span>
              </div>
              <span
                className={cn(
                  "text-[11px] font-bold uppercase tracking-wider",
                  color,
                )}
              >
                {status}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="pt-2 space-y-3 w-full">
          <p className="text-[11px] text-text-secondary/60 font-mono uppercase tracking-widest">
            To use hardware auth- deploy to production
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-text-secondary/50 font-medium">
            <span className="h-px w-8 bg-border" />
            <span>
              NODE_ENV = &quot;production&quot; enables full Zero-Trust
            </span>
            <span className="h-px w-8 bg-border" />
          </div>
        </div>

        {/* System Architect Credit */}
        <div className="relative flex items-center justify-center py-6 overflow-hidden select-none">
          {/* Ambient glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[60px] rounded-full bg-accent-blue/10 blur-[40px]" />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-2">
              <span className="h-px w-10 bg-gradient-to-r from-transparent to-accent-blue/30" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-text-secondary/30">
                System Architect
              </span>
              <span className="h-px w-10 bg-gradient-to-l from-transparent to-accent-blue/30" />
            </div>

            <p className="font-mono text-[11px] tracking-widest relative">
              <span className="relative z-10 text-accent-blue/80 font-semibold">
                Rohit More
              </span>

              <span className="absolute inset-0 text-accent-blue glow-text">
                Rohit More
              </span>
            </p>

            <p className="text-[9px] text-text-secondary/25 uppercase tracking-[0.2em] font-medium">
              Core systems handled by lead architect
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface Device {
  id: string;
  credential_id: string;
  device_name: string;
  created_at: string;
  last_used_at?: string;
  transports?: string[];
}

// Exported wrapper — no hooks here, safe env check
export function SecuritySettings() {
  if (process.env.NODE_ENV === "development") {
    return <DevModeSecurityScreen />;
  }
  return <SecuritySettingsPanel />;
}

// Full production UI — all hooks live here
function SecuritySettingsPanel() {
  const [authorizedDevices, setAuthorizedDevices] = useState<Device[]>([]);
  const [currentCredentialId, setCurrentCredentialId] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  // Recovery Codes State
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [isGeneratingCodes, setIsGeneratingCodes] = useState(false);

  // Registration & Rename State
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const [regDeviceName, setRegDeviceName] = useState("");
  const [editingDevice, setEditingDevice] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [inviteResult, setInviteResult] = useState<{
    url: string;
    expires: string;
  } | null>(null);

  const fetchSessionInfo = async () => {
    try {
      const res = await fetch("/api/admin/session/info");
      const data = await res.json();
      if (data.currentCredentialId) {
        setCurrentCredentialId(data.currentCredentialId);
      }
    } catch (err) {
      console.error("Failed to fetch session info:", err);
    }
  };

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const { data } = await dataService.getAuthorizedDevices();
      setAuthorizedDevices(data || []);
      await fetchSessionInfo();
    } catch (err) {
      console.error("Failed to fetch devices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const currentDeviceInList = authorizedDevices.find(
    (d) => d.credential_id === currentCredentialId,
  );

  const handleRegisterLocal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regDeviceName) return;

    setIsRegistering(true);
    try {
      const res = await fetch("/api/auth/webauthn/enrollment/generate-self", {
        method: "POST",
      });
      const { token, userEmail, error } = await res.json();
      if (error) throw new Error(error);

      await webauthnClient.register(userEmail, token, regDeviceName);

      alert("Device registered successfully!");
      setIsRegModalOpen(false);
      setRegDeviceName("");
      fetchDevices();
    } catch (err: any) {
      alert("Registration failed: " + err.message);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDevice || !regDeviceName) return;

    setIsRenaming(true);
    try {
      const res = await fetch("/api/admin/devices/rename", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingDevice.id, newName: regDeviceName }),
      });
      const data = await res.json();

      if (data.success) {
        setIsRenameModalOpen(false);
        setEditingDevice(null);
        setRegDeviceName("");
        fetchDevices();
      } else {
        alert("Failed to rename: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      alert("Error connecting to server.");
    } finally {
      setIsRenaming(false);
    }
  };

  const openRenameModal = (device: { id: string; name: string }) => {
    setEditingDevice(device);
    setRegDeviceName(device.name);
    setIsRenameModalOpen(true);
  };

  const handleGenerateInvite = async () => {
    try {
      const res = await fetch("/api/admin/invite/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "device_invite" }),
      });
      const result = await res.json();

      if (result.success) {
        setInviteResult({ url: result.inviteUrl, expires: result.expiresAt });
        setIsInviteModalOpen(true);
      } else {
        alert(
          "Failed to generate invite: " + (result.error || "Unknown error"),
        );
      }
    } catch (err) {
      alert("An error occurred generating invite.");
    }
  };

  const generateRecoveryCodes = async () => {
    if (
      !confirm(
        "Generating new codes will invalidate any previous recovery codes. Are you sure?",
      )
    )
      return;
    setIsGeneratingCodes(true);
    try {
      const res = await fetch("/api/admin/recovery/generate", {
        method: "POST",
      });
      const data = await res.json();
      if (data.codes) setRecoveryCodes(data.codes);
    } catch (err) {
      alert("Error connecting to server.");
    } finally {
      setIsGeneratingCodes(false);
    }
  };

  const downloadRecoveryCodes = () => {
    const text = `BMTECH ADMIN RECOVERY CODES\nGenerated: ${new Date().toLocaleString()}\n\nSAVE THESE CODES IN A SECURE PLACE!\n\n${recoveryCodes.map((c, i) => `${i + 1}. ${c}`).join("\n")}\n\nEach code can only be used once.`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bmtech-recovery-codes-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRemoveDevice = async (deviceId: string, deviceName: string) => {
    if (!confirm(`Are you sure you want to remove "${deviceName}"?`)) return;
    try {
      const res = await fetch("/api/admin/devices/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId }),
      });
      const result = await res.json();
      if (result.success) {
        if (result.removedSelf) {
          alert("Access revoked. You will be logged out.");
          window.location.href = "/admin/login";
        } else {
          fetchDevices();
        }
      }
    } catch (err) {
      alert("Error removing device.");
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-1 border-l-4 border-accent-blue pl-6">
        <h3 className="text-2xl font-bold text-text-primary tracking-tight">
          Zero-Trust Security
        </h3>
        <p className="text-text-secondary text-sm">
          Manage hardware-backed passkeys for secure admin access.
        </p>
      </div>

      {/* Safety Warning */}
      {authorizedDevices.length === 0 && (
        <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl space-y-3 animate-pulse">
          <div className="flex items-center gap-3 text-rose-400">
            <AlertTriangle size={24} />
            <h4 className="text-lg font-bold">Zero-Trust Bypass Active</h4>
          </div>
          <p className="text-sm text-text-secondary">
            Your account is currently vulnerable. Register your first device to
            enable strict protection.
          </p>
        </div>
      )}

      {/* Recovery Codes */}
      <div className="p-8 rounded-3xl bg-surface border border-border space-y-8 shadow-xl shadow-black/10">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-xl font-bold text-text-primary">
              Master Recovery Codes
            </h4>
            <p className="text-text-secondary text-sm">
              One-time codes to access your account if you lose your hardware.
            </p>
          </div>
          <Button
            onClick={generateRecoveryCodes}
            disabled={isGeneratingCodes}
            variant="outline"
            className="gap-2"
          >
            {isGeneratingCodes ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Key size={18} />
            )}
            Generate New Codes
          </Button>
        </div>
        {recoveryCodes.length > 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 p-6 bg-background/50 rounded-2xl border border-border font-mono text-sm">
              {recoveryCodes.map((code, i) => (
                <div key={i} className="text-text-primary">
                  {i + 1}. {code}
                </div>
              ))}
            </div>
            <Button
              onClick={downloadRecoveryCodes}
              className="bg-accent-blue w-full"
            >
              Download Keys
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        {/* Local Management Card (Smart) */}
        <div className="p-8 rounded-3xl bg-surface border border-border flex flex-col items-center text-center space-y-6 shadow-xl shadow-black/10">
          <div
            className={cn(
              "h-16 w-16 rounded-2xl flex items-center justify-center",
              currentDeviceInList
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-accent-blue/10 text-accent-blue",
            )}
          >
            {currentDeviceInList ? (
              <CheckCircle2 size={32} />
            ) : (
              <Key size={32} />
            )}
          </div>
          <div className="space-y-2">
            <h4 className="text-lg font-bold text-text-primary">
              {currentDeviceInList
                ? "This Device is Secured"
                : "Register This Device"}
            </h4>
            <p className="text-sm text-text-secondary">
              {currentDeviceInList
                ? `Successfully linked as "${currentDeviceInList.device_name}". You can rename it below.`
                : "Secure this computer's biometric session as a trusted passkey."}
            </p>
          </div>
          {currentDeviceInList ? (
            <Button
              onClick={() =>
                openRenameModal({
                  id: currentDeviceInList.id,
                  name: currentDeviceInList.device_name,
                })
              }
              variant="outline"
              className="w-full gap-2 border-emerald-500/20 text-emerald-400"
            >
              <Edit2 size={18} /> Rename This Device
            </Button>
          ) : (
            <Button
              onClick={() => setIsRegModalOpen(true)}
              className="w-full gap-2"
            >
              <Plus size={18} /> Register Passkey
            </Button>
          )}
        </div>

        {/* Remote Invite */}
        <div className="p-8 rounded-3xl bg-surface border border-border flex flex-col items-center text-center space-y-6 shadow-xl shadow-black/10">
          <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Smartphone size={32} />
          </div>
          <div className="space-y-2">
            <h4 className="text-lg font-bold text-text-primary">
              Add Another Device
            </h4>
            <p className="text-sm text-text-secondary">
              Enroll your phone or another workstation securely via a one-time
              link.
            </p>
          </div>
          <Button
            onClick={handleGenerateInvite}
            variant="secondary"
            className="w-full gap-2 border-emerald-500/20 hover:bg-emerald-500/10 text-emerald-400"
          >
            <ExternalLink size={18} /> Invite New Device
          </Button>
        </div>
      </div>

      {/* Device List */}
      <div className="bg-background border border-border rounded-3xl overflow-hidden shadow-2xl shadow-black/30">
        <div className="p-6 border-b border-border flex items-center justify-between bg-surface/50">
          <div className="flex items-center gap-3">
            <Shield size={20} className="text-accent-blue" />
            <span className="text-sm font-bold text-text-primary uppercase tracking-widest">
              Registered Hardware ({authorizedDevices.length})
            </span>
          </div>
        </div>

        <div className="divide-y divide-border">
          {authorizedDevices.map((device) => {
            const isCurrent = device.credential_id === currentCredentialId;
            return (
              <div
                key={device.id}
                className={cn(
                  "p-6 flex items-center justify-between group transition-colors",
                  isCurrent ? "bg-accent-blue/5" : "hover:bg-surface/50",
                )}
              >
                <div className="flex items-center gap-5">
                  <div
                    className={cn(
                      "h-12 w-12 rounded-2xl border flex items-center justify-center shadow-inner",
                      isCurrent
                        ? "bg-accent-blue/10 border-accent-blue/20 text-accent-blue"
                        : "bg-surface border-border text-text-secondary",
                    )}
                  >
                    <Monitor size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h5 className="font-bold text-text-primary">
                        {device.device_name}
                      </h5>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                          Current Session
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[10px] font-mono text-text-secondary/70">
                        ID: {device.credential_id.substring(0, 12)}...
                      </p>
                      <span className="h-1 w-1 rounded-full bg-border" />
                      <p className="text-[10px] text-text-secondary font-medium">
                        Last used{" "}
                        {device.last_used_at
                          ? new Date(device.last_used_at).toLocaleDateString()
                          : "Never"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      openRenameModal({
                        id: device.id,
                        name: device.device_name,
                      })
                    }
                    className="p-3 text-text-secondary hover:text-accent-blue hover:bg-accent-blue/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Edit2 size={20} />
                  </button>
                  <button
                    onClick={() =>
                      handleRemoveDevice(device.id, device.device_name)
                    }
                    className="p-3 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Register Modal */}
      <ModalForm
        isOpen={isRegModalOpen}
        onClose={() => setIsRegModalOpen(false)}
        title="Register Passkey"
        submitLabel={isRegistering ? "Confirming..." : "Register Device"}
        onSubmit={handleRegisterLocal}
        disabled={isRegistering}
      >
        <InputField
          label="Friendly Name"
          placeholder="e.g., My Office iMac"
          value={regDeviceName}
          onChange={(e) => setRegDeviceName(e.target.value)}
          required
        />
      </ModalForm>

      {/* Rename Modal */}
      <ModalForm
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        title="Rename Device"
        submitLabel={isRenaming ? "Saving..." : "Save Changes"}
        onSubmit={handleRenameSubmit}
        disabled={isRenaming}
      >
        <InputField
          label="New Friendly Name"
          value={regDeviceName}
          onChange={(e) => setRegDeviceName(e.target.value)}
          required
        />
      </ModalForm>
      {/* System Architect Credit */}
      <div className="relative flex items-center justify-center py-6 overflow-hidden select-none">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[60px] rounded-full bg-accent-blue/10 blur-[40px]" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-1.5">
          {/* Top label */}
          <div className="flex items-center gap-2">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-accent-blue/30" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-text-secondary/30">
              System Architect
            </span>
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-accent-blue/30" />
          </div>

          {/* Name with animated glow */}
          <p className="font-mono text-[11px] tracking-widest relative">
            <span className="relative z-10 text-accent-blue/80 font-semibold">
              Rohit More
            </span>

            {/* Animated glow layer (same as dev, but blue) */}
            <span className="absolute inset-0 text-accent-blue glow-text">
              Rohit More
            </span>
          </p>

          {/* Footer */}
          <p className="text-[9px] text-text-secondary/25 uppercase tracking-[0.2em] font-medium">
            Core systems handled by lead architect
          </p>
        </div>
      </div>

      {/* Invite Modal */}
      <ModalForm
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Device"
        description="Share this one-time link with your other device to enroll it securely."
        hideFooter
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-background border border-border font-mono text-xs break-all text-text-primary">
            {inviteResult?.url}
          </div>
          <Button
            className="w-full"
            onClick={() => {
              if (inviteResult) {
                navigator.clipboard.writeText(inviteResult.url);
                alert("Link copied to clipboard!");
              }
            }}
          >
            Copy Link
          </Button>
          <p className="text-[10px] text-rose-400 text-center font-bold uppercase tracking-widest">
            Expires in 10 minutes
          </p>
        </div>
      </ModalForm>
    </div>
  );
}
