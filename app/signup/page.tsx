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
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-surface p-8 shadow-xl shadow-black/20 border border-border">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-text-primary">
            Create an account
          </h2>
          <p className="mt-2 text-center text-sm text-text-secondary">
            Join us to get started with our multi-service agency
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-900/30 p-4 border border-red-500/40">
            <div className="flex items-start gap-3">
              <div className="text-sm text-red-400 flex-1">{error}</div>
            </div>
          </div>
        )}

        {message && (
          <div className="rounded-md bg-accent-blue/10 p-4 border border-accent-blue/30">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-accent-blue flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-300 flex-1">{message}</div>
            </div>
          </div>
        )}

        {showVerificationPending ? (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="h-12 w-12 rounded-full bg-accent-blue/15 flex items-center justify-center mx-auto">
                <Mail className="h-6 w-6 text-accent-blue" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary">Email Verification Sent</h3>
              <p className="text-sm text-text-secondary">
                We&apos;ve sent a confirmation link to <strong className="text-text-primary">{email}</strong>. Click the link in the email to verify your account.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleResendEmail}
                disabled={isResending}
                className="w-full rounded-lg bg-surface px-4 py-2.5 text-sm font-semibold text-text-primary border border-border hover:bg-border/50 focus:outline-none focus:ring-2 focus:ring-accent-blue transition-all disabled:opacity-70"
              >
                {isResending ? 'Resending...' : 'Didn\'t receive the email? Resend'}
              </button>

              <Link
                href="/login"
                className="block w-full text-center rounded-lg bg-accent-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-accent-blue transition-all"
              >
                Go to Login
              </Link>
            </div>

            <p className="text-xs text-text-secondary text-center">
              Having trouble? Check your spam folder or contact support.
            </p>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSignup}>
            <div className="space-y-4 rounded-md">
              <div>
                <label className="block text-sm font-medium text-text-secondary" htmlFor="email-address">
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
                  className="mt-1 block w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 text-text-primary placeholder-text-secondary focus:border-accent-blue focus:outline-none focus:ring-accent-blue sm:text-sm transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary" htmlFor="password">
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
                  className="mt-1 block w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 text-text-primary placeholder-text-secondary focus:border-accent-blue focus:outline-none focus:ring-accent-blue sm:text-sm transition-colors"
                  placeholder="••••••••"
                  minLength={6}
                />
                <p className="mt-1 text-xs text-text-secondary">Must be at least 6 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary">Account Type</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'client' | 'team')}
                  className="mt-1 block w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 text-text-primary focus:border-accent-blue focus:outline-none focus:ring-accent-blue sm:text-sm transition-colors"
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
                className="group relative flex w-full justify-center rounded-lg bg-accent-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2 focus:ring-offset-background transition-all disabled:opacity-70"
              >
                {isLoading ? 'Creating account...' : 'Sign Up'}
              </button>
            </div>
          </form>
        )}

        {!showVerificationPending && (
          <p className="mt-4 text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-accent-blue hover:text-blue-400 transition-colors">
              Sign in instead
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
