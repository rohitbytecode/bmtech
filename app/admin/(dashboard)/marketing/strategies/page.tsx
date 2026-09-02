'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { marketingService } from '@/services/marketingService';
import type { Strategy } from '@/types/marketing';
import { DataTable } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/Button';
import { Plus, Play, Loader2 } from 'lucide-react';
import { ModalForm } from '@/components/admin/ModalForm';
import { InputField, TextAreaField, SelectField } from '@/components/admin/FormFields';
import { supabase } from '@/lib/supabaseClient';
import { PageHeader } from '@/components/admin/PageHeader';
import { Pagination } from '@/components/admin/Pagination';
import { cn } from '@/lib/utils';

export default function StrategiesPage() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalItems, setTotalItems] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [runningId, setRunningId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'draft' as any,
    target_industries: '',
    target_countries: '',
    target_cities: '',
  });

  const loadStrategies = useCallback(async () => {
    setLoading(true);
    const { data, count } = await marketingService.getStrategiesPaginated(page, pageSize);
    if (data) setStrategies(data);
    if (count !== undefined) setTotalItems(count);
    setLoading(false);
  }, [page, pageSize]);

  useEffect(() => {
    loadStrategies();
  }, [loadStrategies]);

  const handleOpenNew = () => {
    setEditingId(null);
    setFormData({ 
      name: '', 
      description: '', 
      status: 'draft',
      target_industries: '',
      target_countries: '',
      target_cities: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (strategy: Strategy) => {
    setEditingId(strategy.id);
    setFormData({
      name: strategy.name,
      description: strategy.description || '',
      status: strategy.status,
      target_industries: strategy.target_industries?.join(', ') || '',
      target_countries: strategy.target_countries?.join(', ') || '',
      target_cities: strategy.target_cities?.join(', ') || '',
    });
    setIsModalOpen(true);
  };

  const handleRunStrategy = async (strategy: Strategy) => {
    if (strategy.status !== 'active') {
      alert('Only active strategies can be run.');
      return;
    }
    if (!window.confirm(`Run strategy "${strategy.name}"? This will start a new discovery job.`)) return;

    setRunningId(strategy.id);
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      if (!token) {
        alert('Not authenticated.');
        return;
      }

      const res = await fetch('/api/admin/marketing/crawler/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ strategyId: strategy.id }),
      });

      const result = await res.json();
      if (!res.ok) {
        alert(`Failed to start job: ${result.error}`);
      } else {
        alert(`Discovery job started (ID: ${result.job?.id?.slice(0, 8)}). The crawler will process it within 60 seconds.`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setRunningId(null);
    }
  };

  const handleDelete = async (strategy: Strategy) => {
    if (window.confirm(`Are you sure you want to delete the strategy "${strategy.name}"?`)) {
      const { success } = await marketingService.deleteStrategy(strategy.id);
      if (success) {
        loadStrategies();
      } else {
        alert("Failed to delete strategy");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Retrieve current user ID to set 'created_by'
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id || 'unknown';

    let success = false;
    
    const parsedIndustries = formData.target_industries.split(',').map(s => s.trim()).filter(Boolean);
    const parsedCountries = formData.target_countries.split(',').map(s => s.trim()).filter(Boolean);
    const parsedCities = formData.target_cities.split(',').map(s => s.trim()).filter(Boolean);

    if (editingId) {
      const result = await marketingService.updateStrategy(editingId, {
        name: formData.name,
        description: formData.description,
        status: formData.status,
        target_industries: parsedIndustries,
        target_countries: parsedCountries,
        target_cities: parsedCities,
      });
      success = result.success;
    } else {
      const result = await marketingService.createStrategy({
        name: formData.name,
        description: formData.description,
        status: formData.status,
        target_industries: parsedIndustries,
        target_countries: parsedCountries,
        target_regions: [],
        target_cities: parsedCities,
        target_services: [],
        qualification_criteria: '',
        created_by: userId
      });
      success = result.success;
    }

    setIsSubmitting(false);

    if (success) {
      setIsModalOpen(false);
      loadStrategies();
    } else {
      alert(`Failed to ${editingId ? 'update' : 'create'} strategy`);
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name' as keyof Strategy, className: 'font-bold max-w-[200px] truncate' },
    { header: 'Status', accessor: (s: Strategy) => (
      <span className={cn(
        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
        s.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' :
        s.status === 'paused' ? 'bg-amber-500/10 text-amber-500' :
        'bg-slate-500/10 text-slate-500'
      )}>
        {s.status}
      </span>
    )},
    { header: 'Description', accessor: (s: Strategy) => <span className="truncate max-w-[250px] inline-block text-text-secondary text-xs">{s.description || '-'}</span> },
    { header: 'Countries', accessor: (s: Strategy) => <span className="text-xs truncate max-w-[150px] inline-block">{s.target_countries?.length > 0 ? s.target_countries.join(', ') : 'Global'}</span> },
    { header: 'Industries', accessor: (s: Strategy) => <span className="text-xs truncate max-w-[150px] inline-block">{s.target_industries?.length > 0 ? s.target_industries.join(', ') : 'All'}</span> },
    { header: 'Created', accessor: (s: Strategy) => <span className="text-xs text-text-secondary">{new Date(s.created_at).toLocaleDateString()}</span> },
    { header: 'Actions', accessor: (s: Strategy) => (
      <button
        onClick={() => handleRunStrategy(s)}
        disabled={s.status !== 'active' || runningId === s.id}
        title={s.status !== 'active' ? 'Strategy must be active to run' : 'Start discovery job'}
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all duration-150',
          s.status === 'active' && runningId !== s.id
            ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 cursor-pointer'
            : 'bg-slate-500/10 text-slate-500 cursor-not-allowed opacity-50'
        )}
      >
        {runningId === s.id
          ? <Loader2 size={12} className="animate-spin" />
          : <Play size={12} />}
        {runningId === s.id ? 'Starting…' : 'Run'}
      </button>
    )},
  ];

  return (
    <div className="flex flex-col h-full">
      <PageHeader 
        title="Marketing Strategies" 
        description="Manage outbound marketing campaigns and targeting parameters."
      >
        <Button onClick={handleOpenNew}>
          <Plus size={14} /> New Strategy
        </Button>
      </PageHeader>

      <div className="flex-1 min-h-0 bg-surface border border-border/50 rounded-lg shadow-sm flex flex-col">
        <DataTable
          columns={columns}
          data={strategies}
          isLoading={loading}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
        />
        <Pagination 
          currentPage={page}
          pageSize={pageSize}
          totalItems={totalItems}
          totalPages={Math.ceil(totalItems / pageSize)}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </div>

      <ModalForm
        title={editingId ? "Edit Strategy" : "Create Strategy"}
        description={editingId ? "Update existing strategy details." : "Define a new outbound marketing strategy."}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel={editingId ? "Save Changes" : "Create Strategy"}
      >
        <div className="space-y-4">
          <InputField
            label="Strategy Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. US Fitness Centers"
          />
          <TextAreaField
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the goal of this strategy..."
          />
          <SelectField
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            options={[
              { label: 'Draft', value: 'draft' },
              { label: 'Active', value: 'active' },
              { label: 'Paused', value: 'paused' },
            ]}
          />
          <InputField
            label="Target Industries (comma-separated)"
            required
            value={formData.target_industries}
            onChange={(e) => setFormData({ ...formData, target_industries: e.target.value })}
            placeholder="e.g. fitness center, gym"
          />
          <InputField
            label="Target Countries (comma-separated)"
            required
            value={formData.target_countries}
            onChange={(e) => setFormData({ ...formData, target_countries: e.target.value })}
            placeholder="e.g. USA, Canada"
          />
          <InputField
            label="Target Cities (comma-separated)"
            value={formData.target_cities}
            onChange={(e) => setFormData({ ...formData, target_cities: e.target.value })}
            placeholder="e.g. New York, Austin"
          />
        </div>
      </ModalForm>
    </div>
  );
}
