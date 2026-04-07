'use client';

import { useState } from 'react';
import AuthGuard from '../../components/AuthGuard';
import { useAuth } from '../../hooks/useAuth';
import { useSubmissions } from '../../hooks/useSubmissions';
import { authService } from '../../services/authService';
import { useRouter } from 'next/navigation';
import { Mail, LogOut, User, CheckCircle, AlertCircle, Send, Clock, FileText } from 'lucide-react';

export default function ClientDashboardPage() {
  const { user, emailVerified, loading: authLoading } = useAuth();
  const { submissions, submissionCount, loading: submissionsLoading } = useSubmissions();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'submissions'>('profile');

  const handleLogout = async () => {
    await authService.signOut();
    router.push('/login');
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="space-y-4 text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-accent-blue border-t-transparent mx-auto"></div>
          <p className="text-sm text-text-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="sticky top-16 z-50 bg-surface border-b border-border shadow-sm shadow-black/10">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-accent-blue">BMTech</span>
                <span className="text-xs font-medium text-text-secondary bg-border/50 px-2 py-1 rounded">CLIENT</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm font-medium text-text-primary">{user?.email}</p>
                  <p className={`text-xs font-medium ${emailVerified ? 'text-green-400' : 'text-orange-400'}`}>
                    {emailVerified ? '✓ Verified' : '⚠ Not verified'}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-lg bg-border/50 px-4 py-2 text-sm font-medium text-text-secondary hover:bg-border hover:text-text-primary transition-colors"
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
            <div className="mb-6 rounded-lg bg-orange-900/20 border border-orange-500/30 p-4 flex items-start gap-3">
              <AlertCircle className="text-orange-400 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-semibold text-orange-300">Email Not Verified</h3>
                <p className="text-sm text-orange-300/80 mt-1">
                  Check your inbox for a verification email. This helps us keep your account secure.
                </p>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="mb-6 flex gap-4 border-b border-border">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'profile'
                  ? 'text-accent-blue border-accent-blue'
                  : 'text-text-secondary border-transparent hover:text-text-primary'
              }`}
            >
              <User size={16} />
              Account Profile
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'submissions'
                  ? 'text-accent-blue border-accent-blue'
                  : 'text-text-secondary border-transparent hover:text-text-primary'
              }`}
            >
              <Mail size={16} />
              My Submissions
              {submissionCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-accent-blue rounded-full">
                  {submissionCount}
                </span>
              )}
            </button>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Information Card */}
              <div className="rounded-xl bg-surface shadow-sm shadow-black/10 border border-border p-6">
                <h2 className="text-lg font-semibold text-text-primary mb-4">Account Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-text-secondary">Email Address</label>
                    <p className="text-sm text-text-primary mt-1 font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-text-secondary">Account Type</label>
                    <p className="text-sm text-text-primary mt-1 font-medium capitalize">
                      {user?.user_metadata?.role || 'Client'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-text-secondary">Account Status</label>
                    <div className="flex items-center gap-2 mt-1">
                      {emailVerified ? (
                        <>
                          <CheckCircle size={16} className="text-green-400" />
                          <span className="text-sm text-green-400 font-medium">Active</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle size={16} className="text-orange-400" />
                          <span className="text-sm text-orange-400 font-medium">Pending Verification</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-text-secondary">Member Since</label>
                    <p className="text-sm text-text-primary mt-1">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recently'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <div className="rounded-xl bg-accent-blue/10 border border-accent-blue/20 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-300">Profile Completeness</p>
                      <p className="text-2xl font-bold text-text-primary mt-1">75%</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-accent-blue/15 flex items-center justify-center">
                      <User className="text-accent-blue" size={24} />
                    </div>
                  </div>
                  <div className="mt-4 w-full bg-accent-blue/20 rounded-full h-2">
                    <div className="bg-accent-blue h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>

                <div className="rounded-xl bg-green-900/15 border border-green-500/20 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-300">Email Verified</p>
                      <p className="text-2xl font-bold text-text-primary mt-1">{emailVerified ? '✓ Yes' : '✗ No'}</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-green-500/15 flex items-center justify-center">
                      {emailVerified ? (
                        <CheckCircle className="text-green-400" size={24} />
                      ) : (
                        <AlertCircle className="text-orange-400" size={24} />
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-purple-900/15 border border-purple-500/20 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-300">Total Submissions</p>
                      {submissionsLoading ? (
                        <div className="h-8 w-12 bg-purple-500/20 rounded mt-2 animate-pulse"></div>
                      ) : (
                        <p className="text-2xl font-bold text-text-primary mt-1">{submissionCount}</p>
                      )}
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-purple-500/15 flex items-center justify-center">
                      <Send className="text-purple-400" size={24} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submissions Tab */}
          {activeTab === 'submissions' && (
            <div className="rounded-xl bg-surface shadow-sm shadow-black/10 border border-border overflow-hidden">
              {submissionsLoading ? (
                <div className="p-8 text-center">
                  <div className="space-y-4">
                    <div className="h-8 w-full bg-border rounded animate-pulse"></div>
                    <div className="h-8 w-full bg-border rounded animate-pulse"></div>
                    <div className="h-8 w-full bg-border rounded animate-pulse"></div>
                  </div>
                </div>
              ) : submissionCount === 0 ? (
                <div className="text-center py-12 px-8">
                  <FileText size={48} className="mx-auto text-text-secondary mb-4" />
                  <h3 className="text-lg font-semibold text-text-primary mb-2">No Submissions Yet</h3>
                  <p className="text-text-secondary mb-6">
                    You haven't submitted any inquiries or requests yet.
                  </p>
                  <a
                    href="/#contact"
                    className="inline-block rounded-lg bg-accent-blue px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                  >
                    Submit Your First Request
                  </a>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-background border-b border-border">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary">Service</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary">Message</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((submission, index) => (
                        <tr key={submission.id} className={index !== submissions.length - 1 ? 'border-b border-border' : ''}>
                          <td className="px-6 py-4 text-sm text-text-primary">{submission.name}</td>
                          <td className="px-6 py-4 text-sm text-text-secondary">{submission.service_id || 'General'}</td>
                          <td className="px-6 py-4 text-sm text-text-secondary max-w-xs truncate">{submission.message}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              submission.status === 'new'
                                ? 'bg-accent-blue/15 text-blue-300'
                                : submission.status === 'contacted'
                                ? 'bg-green-500/15 text-green-300'
                                : 'bg-border text-text-secondary'
                            }`}>
                              {submission.status || 'new'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-text-secondary flex items-center gap-1">
                            <Clock size={14} />
                            {submission.created_at ? new Date(submission.created_at).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Support Section */}
          <div className="mt-8 rounded-xl bg-surface border border-border p-6 text-center">
            <p className="text-sm text-text-secondary mb-3">
              Need help? Have questions about our services?
            </p>
            <a
              href="/#contact"
              className="inline-flex items-center gap-2 text-accent-blue hover:text-blue-400 font-medium text-sm transition-colors"
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
