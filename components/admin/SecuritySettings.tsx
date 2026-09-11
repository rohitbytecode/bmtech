import React from 'react';
import { Shield } from 'lucide-react';

export function SecuritySettings() {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-1 border-l-4 border-accent-blue pl-6">
        <h3 className="text-2xl font-bold text-text-primary tracking-tight">
          Security Settings
        </h3>
        <p className="text-text-secondary text-sm">
          Authentication is currently managed securely via email and password.
        </p>
      </div>

      <div className="p-8 rounded-3xl bg-surface border border-border flex flex-col items-center text-center space-y-6 shadow-xl shadow-black/10">
        <div className="h-16 w-16 rounded-2xl bg-accent-blue/10 flex items-center justify-center text-accent-blue">
          <Shield size={32} />
        </div>
        <div className="space-y-2">
          <h4 className="text-lg font-bold text-text-primary">
            Standard Authentication
          </h4>
          <p className="text-sm text-text-secondary max-w-md mx-auto">
            Hardware zero-trust authentication has been disabled for this environment.
            Please use your secure email and password to log in. Role-based access controls remain fully active.
          </p>
        </div>
      </div>
    </div>
  );
}
