'use client';

import AuthGuard from '../../components/AuthGuard';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, role } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await authService.signOut();
    router.push('/login');
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        <nav className="bg-white border-b border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between items-center">
              <div className="flex">
                <div className="flex flex-shrink-0 items-center">
                  <span className="text-xl font-bold text-blue-600">BMTech</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-600">
                  {user?.email} ({role})
                </span>
                <button
                  onClick={handleLogout}
                  className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="py-10">
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="rounded-xl bg-white shadow-sm border border-slate-200 p-8">
                <h1 className="text-2xl font-bold text-slate-900 mb-6">Dashboard Overview</h1>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="overflow-hidden rounded-xl border border-blue-100 bg-blue-50/50 p-6">
                    <dt className="truncate text-sm font-medium text-blue-800">Total Services</dt>
                    <dd className="mt-2 text-3xl font-semibold tracking-tight text-blue-900">0</dd>
                  </div>
                  
                  <div className="overflow-hidden rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
                    <dt className="truncate text-sm font-medium text-slate-500">Active Leads</dt>
                    <dd className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">0</dd>
                  </div>
                  
                  <div className="overflow-hidden rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
                    <dt className="truncate text-sm font-medium text-slate-500">Projects Setup</dt>
                    <dd className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">0</dd>
                  </div>
                </div>

                <div className="mt-8 border-t border-slate-200 pt-8">
                  <p className="text-slate-600">
                    Your environment is fully integrated with Supabase. Setup your database schemas based on the setup guide to see real data here.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
