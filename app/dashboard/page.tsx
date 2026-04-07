'use client';

import { useState } from 'react';
import AuthGuard from '../../components/AuthGuard';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { useRouter } from 'next/navigation';
import { Mail, LogOut, User, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function ClientDashboardPage() {
  const { user, emailVerified, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'submissions'>('profile');

  const handleLogout = async () => {
    await authService.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="space-y-4 text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="text-sm text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-blue-600">BMTech</span>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">CLIENT</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">{user?.email}</p>
                  <p className={`text-xs font-medium ${emailVerified ? 'text-green-600' : 'text-orange-600'}`}>
                    {emailVerified ? '✓ Verified' : '⚠ Not verified'}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Email Verification Alert */}
          {!emailVerified && (
            <div className="mb-6 rounded-lg bg-orange-50 border border-orange-200 p-4 flex items-start gap-3">
              <AlertCircle className="text-orange-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-semibold text-orange-900">Email Not Verified</h3>
                <p className="text-sm text-orange-800 mt-1">
                  Check your inbox for a verification email. This helps us keep your account secure.
                </p>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="mb-6 flex gap-4 border-b border-slate-200">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'profile'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-slate-600 border-transparent hover:text-slate-900'
              }`}
            >
              <User size={16} className="inline-block mr-2" />
              Account Profile
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'submissions'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-slate-600 border-transparent hover:text-slate-900'
              }`}
            >
              <Mail size={16} className="inline-block mr-2" />
              My Submissions
            </button>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Information Card */}
              <div className="rounded-xl bg-white shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Account Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-slate-600">Email Address</label>
                    <p className="text-sm text-slate-900 mt-1 font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600">Account Type</label>
                    <p className="text-sm text-slate-900 mt-1 font-medium capitalize">
                      {user?.user_metadata?.role || 'Client'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600">Account Status</label>
                    <div className="flex items-center gap-2 mt-1">
                      {emailVerified ? (
                        <>
                          <CheckCircle size={16} className="text-green-600" />
                          <span className="text-sm text-green-600 font-medium">Active</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle size={16} className="text-orange-600" />
                          <span className="text-sm text-orange-600 font-medium">Pending Verification</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600">Member Since</label>
                    <p className="text-sm text-slate-900 mt-1">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recently'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <div className="rounded-xl bg-blue-50 border border-blue-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-800">Profile Completeness</p>
                      <p className="text-2xl font-bold text-blue-900 mt-1">75%</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <User className="text-blue-600" size={24} />
                    </div>
                  </div>
                  <div className="mt-4 w-full bg-blue-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>

                <div className="rounded-xl bg-green-50 border border-green-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-800">Email Verified</p>
                      <p className="text-2xl font-bold text-green-900 mt-1">{emailVerified ? '✓ Yes' : '✗ No'}</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                      {emailVerified ? (
                        <CheckCircle className="text-green-600" size={24} />
                      ) : (
                        <AlertCircle className="text-orange-600" size={24} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submissions Tab */}
          {activeTab === 'submissions' && (
            <div className="rounded-xl bg-white shadow-sm border border-slate-200 p-8">
              <div className="text-center py-12">
                <Mail size={48} className="mx-auto text-slate-400 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Submissions Yet</h3>
                <p className="text-slate-600 mb-6">
                  You haven't submitted any inquiries or requests yet.
                </p>
                <a
                  href="/#contact"
                  className="inline-block rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  Submit Your First Request
                </a>
              </div>
            </div>
          )}

          {/* Support Section */}
          <div className="mt-8 rounded-xl bg-slate-50 border border-slate-200 p-6 text-center">
            <p className="text-sm text-slate-600 mb-3">
              Need help? Have questions about our services?
            </p>
            <a
              href="/#contact"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Contact us
              <span>→</span>
            </a>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
