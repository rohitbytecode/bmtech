"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, Mail, Phone, Calendar, Loader2 } from "lucide-react";
import { DataTable, Column } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { dataService, Lead } from "@/services/dataService";

const leadsColumns: Column<Lead>[] = [
  { 
    header: "Lead Info", 
    accessor: (lead) => (
      <div className="flex flex-col gap-1">
        <span className="font-bold text-text-primary">{lead.name}</span>
        <span className="text-xs text-text-secondary flex items-center gap-1"><Mail size={12} /> {lead.email}</span>
      </div>
    )
  },
  { 
    header: "Message", 
    accessor: (lead) => (
      <div className="max-w-md text-sm text-text-secondary line-clamp-2 italic" title={lead.message}>
        "{lead.message}"
      </div>
    )
  },
  { 
    header: "Status", 
    accessor: (lead) => (
      <span className={cn(
        "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
        lead.status === "new" ? "bg-accent-blue text-white" : 
        "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
      )}>
        {lead.status}
      </span>
    )
  },
  { 
    header: "Received", 
    accessor: (lead) => (
      <div className="flex items-center gap-2 text-text-secondary text-sm">
        <Calendar size={14} /> {new Date(lead.created_at).toLocaleDateString()}
      </div>
    )
  },
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    contacted: 0
  });

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const { data, error } = await dataService.getLeads();
      if (error) throw new Error(error);
      
      const leadsList = data || [];
      setLeads(leadsList);
      
      // Calculate stats
      setStats({
        total: leadsList.length,
        new: leadsList.filter(l => l.status === 'new').length,
        contacted: leadsList.filter(l => l.status === 'contacted').length
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load leads");
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
    
    // Refresh data
    fetchLeads();
  };

  const handleViewDetails = (lead: Lead) => {
    alert(`Lead Details:\n\nName: ${lead.name}\nEmail: ${lead.email}\n\nMessage:\n${lead.message}`);
  };

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent-blue transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search leads..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-surface border border-border rounded-xl text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue/40 transition-all"
            />
          </div>
          <Button variant="secondary" className="h-12 w-12 p-0 rounded-xl" onClick={fetchLeads}>
            <Filter size={20} />
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
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
            <h3 className="font-bold text-text-primary border-b border-border pb-4 uppercase text-xs tracking-widest text-accent-blue">Conversion Overview</h3>
            <div className="space-y-6 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary text-sm font-medium">New Leads</span>
                <span className="text-text-primary font-bold bg-accent-blue/10 px-2.5 py-1 rounded-lg text-xs">
                  {stats.new.toString().padStart(2, '0')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary text-sm font-medium">Total Inquiries</span>
                <span className="text-text-primary font-bold bg-surface border border-border px-2.5 py-1 rounded-lg text-xs">
                  {stats.total.toString().padStart(2, '0')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary text-sm font-medium">Contacted</span>
                <span className="text-emerald-400 font-bold text-xs">
                  {stats.contacted}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-accent-blue/5 border border-accent-blue/20 flex flex-col gap-4">
            <p className="text-sm font-medium text-text-primary">Download leads for offline use.</p>
            <Button variant="outline" className="w-full border-accent-blue/20 hover:bg-accent-blue/10">
              Export to CSV
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
