'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Mail, Calendar, Loader2 } from 'lucide-react';
import { DataTable, Column } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { dataService, Lead } from '@/services/dataService';

const leadsColumns: Column<Lead>[] = [
  {
    header: 'Lead Info',
    accessor: (lead) => (
      <div className="flex flex-col gap-1">
        <span className="font-bold text-text-primary">{lead.name}</span>
        <span className="text-xs text-text-secondary flex items-center gap-1">
          <Mail size={12} /> {lead.email}
        </span>
      </div>
    ),
  },
  {
    header: 'Message',
    accessor: (lead) => (
      <div
        className="max-w-md text-sm text-text-secondary line-clamp-2 italic"
        title={lead.message}
      >
        "{lead.message}"
      </div>
    ),
  },
  {
    header: 'Status',
    accessor: (lead) => (
      <span
        className={cn(
          'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider',
          lead.status === 'new'
            ? 'bg-accent-blue text-white'
            : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
        )}
      >
        {lead.status}
      </span>
    ),
  },
  {
    header: 'Received',
    accessor: (lead) => (
      <div className="flex items-center gap-2 text-text-secondary text-sm">
        <Calendar size={14} /> {new Date(lead.created_at).toLocaleDateString()}
      </div>
    ),
  },
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
  });

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const { data, error } = await dataService.getLeads();
      if (error) throw new Error(error);

      const leadsList = data || [];
      setLeads(leadsList);

      setStats({
        total: leadsList.length,
        new: leadsList.filter((l) => l.status === 'new').length,
        contacted: leadsList.filter((l) => l.status === 'contacted').length,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleDelete = async (lead: Lead) => {
    if (!confirm(`Are you sure you want to delete the inquiry from ${lead.name}?`)) return;

    const { success, error } = await dataService.deleteLead(lead.id);
    if (!success) {
      alert(`Error deleting lead: ${error}`);
      return;
    }

    fetchLeads();
  };

  const handleViewDetails = (lead: Lead) => {
    alert(`Lead Details:\n\nName: ${lead.name}\nEmail: ${lead.email}\n\nMessage:\n${lead.message}`);
  };

  const filteredLeads = leads.filter(
    (lead) =>
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.message.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleExportCSV = () => {
    if (!filteredLeads.length) {
      alert("No data to export");
      return;
    }

    const headers = ["Name", "Email", "Message", "Status", "Created At"];

    const rows = filteredLeads.map((lead) => [
      lead.name,
      lead.email,
      lead.message,
      lead.status,
      new Date(lead.created_at).toLocaleString(),
    ]);

    const csvContent =
      [headers, ...rows]
        .map((row) =>
          row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "leads.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && leads.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent-blue" />
        <span className="ml-3 text-lg font-medium text-text-secondary">Loading leads...</span>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-text-primary tracking-tight">Leads & Inquiries</h2>
          <p className="text-text-secondary">Track and manage conversion from your landing page.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group min-w-[200px] md:min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 pl-9 pr-3 bg-surface border border-border rounded-md text-sm"
            />
          </div>

          <Button variant="secondary" size="icon" onClick={fetchLeads}>
            <Filter size={16} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <DataTable
            data={filteredLeads}
            columns={leadsColumns}
            onView={handleViewDetails}
            onDelete={handleDelete}
            isLoading={loading && leads.length === 0}
          />
        </div>

        <div className="space-y-6">
          <div className="p-5 rounded-lg bg-surface border border-border space-y-4">
            <h3 className="font-semibold text-text-primary border-b border-border pb-3 text-sm">
              Conversion Overview
            </h3>

            <div className="space-y-4 pt-1 text-sm">
              <div className="flex justify-between">
                <span>New Leads</span>
                <span>{stats.new.toString().padStart(2, '0')}</span>
              </div>

              <div className="flex justify-between">
                <span>Total Inquiries</span>
                <span>{stats.total.toString().padStart(2, '0')}</span>
              </div>

              <div className="flex justify-between">
                <span>Contacted</span>
                <span>{stats.contacted}</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-lg bg-surface border border-border flex flex-col gap-3">
            <p className="text-sm text-text-secondary">
              Download leads for offline use.
            </p>

            <Button
              variant="outline"
              className="w-full"
              size="sm"
              onClick={handleExportCSV}
            >
              Export to CSV
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}