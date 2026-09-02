'use client';

import React, { useState, useEffect } from 'react';
import { Users, Briefcase, Package, ArrowUpRight, Loader2 } from 'lucide-react';
import { StatCard } from '@/components/admin/StatCard';
import { DataTable, Column } from '@/components/admin/DataTable';
import Link from 'next/link';
import { dataService, Lead } from '@/services/dataService';
import { marketingService } from '@/services/marketingService';

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
  const [marketingStats, setMarketingStats] = useState({
    totalProspects: 0,
    readyToCall: 0,
    assigned: 0,
    callbacks: 0,
    qualified: 0,
    rejected: 0,
    totalCalls: 0,
    conversionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const [leadsRes, statsRes, mktStatsRes] = await Promise.all([
          dataService.getLeads(),
          dataService.getDashboardStats(),
          marketingService.getMarketingDashboardStats()
        ]);

        if (leadsRes.error) throw new Error(leadsRes.error);
        if (statsRes.error) throw new Error(statsRes.error);
        if (mktStatsRes.error) throw new Error(mktStatsRes.error);

        setLeads(leadsRes.data || []);
        setStats(statsRes.data || { totalLeads: 0, totalProjects: 0, totalPackages: 0 });
        if (mktStatsRes.data) {
          setMarketingStats(mktStatsRes.data);
        }
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

        <div className="space-y-6 mt-8">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <h2 className="text-lg font-bold text-text-primary tracking-tight">Marketing Overview</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-surface rounded-lg border border-border flex flex-col justify-between hover:border-accent-blue/30 transition-colors">
              <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-widest">Total Prospects</span>
              <span className="text-2xl font-bold mt-1 text-text-primary">{marketingStats.totalProspects}</span>
            </div>
            <div className="p-4 bg-surface rounded-lg border border-border flex flex-col justify-between hover:border-accent-blue/30 transition-colors">
              <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-widest">Ready to Call</span>
              <span className="text-2xl font-bold mt-1 text-accent-blue">{marketingStats.readyToCall}</span>
            </div>
            <div className="p-4 bg-surface rounded-lg border border-border flex flex-col justify-between hover:border-accent-blue/30 transition-colors">
              <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-widest">Assigned to Callers</span>
              <span className="text-2xl font-bold mt-1 text-emerald-500">{marketingStats.assigned}</span>
            </div>
            <div className="p-4 bg-surface rounded-lg border border-border flex flex-col justify-between hover:border-accent-blue/30 transition-colors">
              <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-widest">Total Calls Logged</span>
              <span className="text-2xl font-bold mt-1 text-indigo-400">{marketingStats.totalCalls}</span>
            </div>
            <div className="p-4 bg-surface rounded-lg border border-border flex flex-col justify-between hover:border-accent-blue/30 transition-colors">
              <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-widest">Callbacks Required</span>
              <span className="text-2xl font-bold mt-1 text-amber-500">{marketingStats.callbacks}</span>
            </div>
            <div className="p-4 bg-surface rounded-lg border border-border flex flex-col justify-between hover:border-accent-blue/30 transition-colors">
              <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-widest">Qualified Leads</span>
              <span className="text-2xl font-bold mt-1 text-emerald-500">{marketingStats.qualified}</span>
            </div>
            <div className="p-4 bg-surface rounded-lg border border-border flex flex-col justify-between hover:border-accent-blue/30 transition-colors">
              <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-widest">Rejected Leads</span>
              <span className="text-2xl font-bold mt-1 text-rose-500">{marketingStats.rejected}</span>
            </div>
            <div className="p-4 bg-surface rounded-lg border border-accent-blue/30 bg-accent-blue/5 flex flex-col justify-between relative overflow-hidden">
              <span className="text-[10px] font-semibold text-accent-blue uppercase tracking-widest">Conversion Rate</span>
              <div className="flex items-end gap-2 mt-1">
                <span className="text-3xl font-black text-accent-blue">{marketingStats.conversionRate}%</span>
              </div>
            </div>
          </div>
        </div>
      
      <div className="space-y-6 mt-12">
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
