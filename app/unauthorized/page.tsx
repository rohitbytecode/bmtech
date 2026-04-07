import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl shadow-blue-900/5">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Access Denied</h1>
            <p className="mt-2 text-sm text-slate-600">
              You don't have permission to access this resource.
            </p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium text-red-900">Why are you seeing this?</p>
          <ul className="text-sm text-red-800 list-disc list-inside space-y-1">
            <li>Your account role doesn't have access to this page</li>
            <li>The content may have been removed or restricted</li>
            <li>Contact support if you believe this is a mistake</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="block w-full text-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="block w-full text-center rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
          >
            Return Home
          </Link>
        </div>

        <p className="text-center text-xs text-slate-500">
          Need help?{' '}
          <a href="mailto:support@bmtech.com" className="text-blue-600 hover:text-blue-500">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}
