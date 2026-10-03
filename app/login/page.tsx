import { Suspense } from 'react';
import type { Metadata } from 'next';
import LoginForm from './LoginForm';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}
    >
      <LoginForm />
    </Suspense>
  );
}
