'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '../../services/authService';
import Link from 'next/link';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const { error: authError } = await authService.signIn(email, password);

    if (authError) {
      setError(authError);
      setIsLoading(false);
      return;
    }

    const redirectPath = searchParams.get('redirect') || '/dashboard';
    router.push(redirectPath);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-surface p-8 shadow-xl shadow-black/20 border border-border">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-text-primary">
            Welcome back
          </h2>
          <p className="mt-2 text-center text-sm text-text-secondary">
            Sign in to access your dashboard
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-900/30 p-4 border border-red-500/40">
            <div className="flex">
              <div className="text-sm text-red-400">{error}</div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4 rounded-md">
            <div>
              <label
                className="block text-sm font-medium text-text-secondary"
                htmlFor="email-address"
              >
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
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 text-text-primary placeholder-text-secondary focus:border-accent-blue focus:outline-none focus:ring-accent-blue sm:text-sm transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-lg bg-accent-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2 focus:ring-offset-background transition-all disabled:opacity-70"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>

        <p className="mt-4 text-center text-sm text-text-secondary">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="font-medium text-accent-blue hover:text-blue-400 transition-colors"
          >
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
}
