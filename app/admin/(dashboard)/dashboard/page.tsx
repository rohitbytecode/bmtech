'use client';

import React, { useState, useEffect } from 'react';
import { Users, Briefcase, Package, ArrowUpRight, Loader2 } from 'lucide-react';
import { StatCard } from '@/components/admin/StatCard';
import { DataTable, Column } from '@/components/admin/DataTable';
import Link from 'next/link';
import { dataService, Lead } from '@/services/dataService';

const leadsColumns: Column<Lead>[] = [
  { header: 'Name', accessor: 'name' },
  { header: 'Email', accessor: 'email' },
  {
    header: 'Message',
    accessor: (lead) => (
      <div className="max-w-xs truncate text-text-secondary font-normal" title={lead.message}>
        {lead.message}
      </div>
    ),
  },
  {
    header: 'Status',
    accessor: (lead) => (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${
          lead.status === 'new'
            ? 'bg-accent-blue/10 text-accent-blue'
            : 'bg-emerald-400/10 text-emerald-400'
        }`}
      >
        {lead.status.toUpperCase()}
      </span>
    ),
  },
  {
    header: 'Date',
    accessor: (lead) => {
      const date = new Date(lead.created_at);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

      if (diffInHours < 1) return 'Just now';
      if (diffInHours < 24) return `${diffInHours} hours ago`;
      if (diffInHours < 48) return 'Yesterday';
      return date.toLocaleDateString();
    },
  },
];

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalProjects: 0,
    totalPackages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const [leadsRes, statsRes] = await Promise.all([
          dataService.getLeads(),
          dataService.getDashboardStats(),
        ]);

        if (leadsRes.error) throw new Error(leadsRes.error);
        if (statsRes.error) throw new Error(statsRes.error);

        setLeads(leadsRes.data || []);
        setStats(statsRes.data || { totalLeads: 0, totalProjects: 0, totalPackages: 0 });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent-blue" />
        <span className="ml-3 text-lg font-medium text-text-secondary">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-500/10 p-6 text-center text-red-500 border border-red-500/20">
        <h3 className="text-lg font-bold mb-2">Error Loading Dashboard</h3>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <StatCard
          label="Total Leads"
          value={stats.totalLeads}
          icon={Users}
          trend={{ value: 'Live', isUp: true }}
        />
        <StatCard
          label="Total Projects"
          value={stats.totalProjects}
          icon={Briefcase}
          trend={{ value: 'Live', isUp: true }}
        />
        <StatCard label="Active Packages" value={stats.totalPackages} icon={Package} />
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">Recent Leads</h2>
          <Link
            href="/admin/leads"
            className="text-accent-blue hover:text-accent-blue/80 text-sm font-semibold flex items-center gap-1 transition-colors"
          >
            View All <ArrowUpRight size={16} />
          </Link>
        </div>
        <DataTable data={leads.slice(0, 5)} columns={leadsColumns} />
      </div>
    </div>
  );
}
