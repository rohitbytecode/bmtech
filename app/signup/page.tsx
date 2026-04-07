'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../services/authService';
import Link from 'next/link';
import { Mail } from 'lucide-react';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'client' | 'team'>('client');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showVerificationPending, setShowVerificationPending] = useState(false);

  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    const { error: authError } = await authService.signUp(email, password, role);

    if (authError) {
      setError(authError);
      setIsLoading(false);
      return;
    }

    setShowVerificationPending(true);
    setMessage('Check your email for the confirmation link. Click it to verify your email address.');
    setIsLoading(false);
  };

  const handleResendEmail = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsResending(true);
    setError('');
    setMessage('');

    const { error: resendError } = await authService.resendEmailVerification(email);

    if (resendError) {
      setError('Failed to resend email. ' + resendError);
    } else {
      setMessage('Verification email sent! Check your inbox (and spam folder).');
      setShowVerificationPending(true);
    }

    setIsResending(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl shadow-blue-900/5">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
            Create an account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Join us to get started with our multi-service agency
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 border border-red-200">
            <div className="flex items-start gap-3">
              <div className="text-sm text-red-700 flex-1">{error}</div>
            </div>
          </div>
        )}

        {message && (
          <div className="rounded-md bg-blue-50 p-4 border border-blue-200">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700 flex-1">{message}</div>
            </div>
          </div>
        )}

        {showVerificationPending ? (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Email Verification Sent</h3>
              <p className="text-sm text-slate-600">
                We&apos;ve sent a confirmation link to <strong>{email}</strong>. Click the link in the email to verify your account.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleResendEmail}
                disabled={isResending}
                className="w-full rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all disabled:opacity-70"
              >
                {isResending ? 'Resending...' : 'Didn\'t receive the email? Resend'}
              </button>

              <Link
                href="/login"
                className="block w-full text-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
              >
                Go to Login
              </Link>
            </div>

            <p className="text-xs text-slate-500 text-center">
              Having trouble? Check your spam folder or contact support.
            </p>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSignup}>
            <div className="space-y-4 rounded-md shadow-sm">
              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor="email-address">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full appearance-none rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-blue-600 sm:text-sm transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full appearance-none rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-blue-600 sm:text-sm transition-colors"
                  placeholder="••••••••"
                  minLength={6}
                />
                <p className="mt-1 text-xs text-slate-500">Must be at least 6 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Account Type</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'client' | 'team')}
                  className="mt-1 block w-full appearance-none rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-blue-600 sm:text-sm transition-colors bg-white"
                >
                  <option value="client">Client</option>
                  <option value="team">Team Member</option>
                </select>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-all disabled:opacity-70"
              >
                {isLoading ? 'Creating account...' : 'Sign Up'}
              </button>
            </div>
          </form>
        )}

        {!showVerificationPending && (
          <p className="mt-4 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
              Sign in instead
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
