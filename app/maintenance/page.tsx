import { Settings } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Site Under Maintenance | BMTech',
  description: 'We are currently performing scheduled maintenance.',
};

export default function MaintenancePage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-background p-6">
      <div className="max-w-md text-center space-y-6 animate-in fade-in zoom-in duration-700">
        <div className="flex justify-center">
          <div className="p-5 rounded-full bg-accent-blue/10 border border-accent-blue/20 shadow-lg shadow-accent-blue/10">
            <Settings className="w-16 h-16 text-accent-blue animate-[spin_4s_linear_infinite]" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-text-primary tracking-tight">System Update</h1>
          <p className="text-text-secondary text-lg">
            We are currently upgrading our systems to provide you with an even better experience.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border">
          <p className="text-sm font-semibold text-text-primary uppercase tracking-widest text-accent-blue">
            Estimated time: Short Term
          </p>
          <p className="text-xs text-text-secondary mt-1">
            Our team is working hard to bring the site back online quickly. Thank you for your
            patience!
          </p>
        </div>
      </div>
    </div>
  );
}
