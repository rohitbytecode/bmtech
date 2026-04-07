import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-surface p-8 shadow-xl shadow-black/20 border border-border">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-red-900/25 flex items-center justify-center mx-auto">
            <Shield className="h-8 w-8 text-red-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-text-primary">Access Denied</h1>
            <p className="mt-2 text-sm text-text-secondary">
              You don't have permission to access this resource.
            </p>
          </div>
        </div>

        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium text-red-300">Why are you seeing this?</p>
          <ul className="text-sm text-red-300/80 list-disc list-inside space-y-1">
            <li>Your account role doesn't have access to this page</li>
            <li>The content may have been removed or restricted</li>
            <li>Contact support if you believe this is a mistake</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="block w-full text-center rounded-lg bg-accent-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-accent-blue transition-all"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="block w-full text-center rounded-lg bg-border/50 px-4 py-2.5 text-sm font-semibold text-text-primary hover:bg-border focus:outline-none focus:ring-2 focus:ring-accent-blue transition-all"
          >
            Return Home
          </Link>
        </div>

        <p className="text-center text-xs text-text-secondary">
          Need help?{' '}
          <a href="mailto:support@bmtech.com" className="text-accent-blue hover:text-blue-400">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}
