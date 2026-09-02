'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { marketingService } from '@/services/marketingService';
import { supabase } from '@/lib/supabaseClient';
import type { Prospect } from '@/types/marketing';
import { DataTable } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/Button';
import { Plus, Loader2 } from 'lucide-react';
import { ModalForm } from '@/components/admin/ModalForm';
import { InputField, SelectField } from '@/components/admin/FormFields';
import { PageHeader } from '@/components/admin/PageHeader';
import { FilterBar, FilterDefinition } from '@/components/admin/FilterBar';
import { Pagination } from '@/components/admin/Pagination';
import { ExportActions } from '@/components/admin/ExportActions';
import { ProspectDetailModal } from '@/components/admin/ProspectDetailModal';
import { cn } from '@/lib/utils';

const FILTERS: FilterDefinition[] = [
  { key: 'search', label: 'Search name, phone...', type: 'search', options: [] },
  { key: 'status', label: 'All Statuses', type: 'select', options: [
      { label: 'Discovered', value: 'discovered' },
      { label: 'Assigned', value: 'assigned' },
      { label: 'Qualified', value: 'qualified' },
      { label: 'Rejected', value: 'rejected' },
  ]},
  { key: 'sales_priority', label: 'All Priorities', type: 'select', options: [
      { label: 'Very High', value: 'very_high' },
      { label: 'High', value: 'high' },
      { label: 'Medium', value: 'medium' },
      { label: 'Low', value: 'low' },
  ]},
];

export default function ProspectsPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [callers, setCallers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [detailProspect, setDetailProspect] = useState<Prospect | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [assigningProspect, setAssigningProspect] = useState<Prospect | null>(null);
  const [selectedCallerId, setSelectedCallerId] = useState('');
  
  const [formData, setFormData] = useState({
    business_name: '',
    website: '',
    phone: '',
    email: '',
    industry: '',
    sales_priority: 'medium' as any,
  });

  const loadProspects = useCallback(async () => {
    setLoading(true);
    const { data, count } = await marketingService.getProspectsPaginated(page, pageSize, filters);
    if (data) setProspects(data);
    if (count !== undefined) setTotalItems(count);
    setLoading(false);
  }, [page, pageSize, filters]);

  const loadCallers = async () => {
    const { data } = await marketingService.getCallers();
    if (data) setCallers(data);
  };

  useEffect(() => {
    loadProspects();
  }, [loadProspects]);

  useEffect(() => {
    loadCallers();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page on filter change
  };

  const handleClearFilters = () => {
    setFilters({});
    setPage(1);
  };

  const handleOpenNew = () => {
    setEditingId(null);
    setFormData({
      business_name: '',
      website: '',
      phone: '',
      email: '',
      industry: '',
      sales_priority: 'medium',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prospect: Prospect) => {
    setEditingId(prospect.id);
    setFormData({
      business_name: prospect.business_name,
      website: prospect.website || '',
      phone: prospect.phone || '',
      email: prospect.email || '',
      industry: prospect.industry || '',
      sales_priority: prospect.sales_priority || 'medium',
    });
    setIsModalOpen(true);
  };

  const handleOpenAssign = async (prospect: Prospect) => {
    setAssigningProspect(prospect);
    setSelectedCallerId(''); // reset initially
    setIsAssignModalOpen(true);
    
    // If it's already assigned, fetch the caller and populate the dropdown
    if (prospect.status === 'assigned') {
      const { data } = await marketingService.getAssignmentForProspect(prospect.id);
      if (data && data.caller_id) {
        setSelectedCallerId(data.caller_id);
      }
    }
  };

  const handleDelete = async (prospect: Prospect) => {
    if (window.confirm(`Are you sure you want to delete the prospect "${prospect.business_name}"?`)) {
      const { success } = await marketingService.deleteProspect(prospect.id);
      if (success) {
        loadProspects();
      } else {
        alert("Failed to delete prospect");
      }
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningProspect) return;
    if (!selectedCallerId) {
      alert("Please select a caller from the dropdown first!");
      return;
    }
    
    setIsSubmitting(true);
    const { data: session } = await supabase.auth.getSession();
    const assignedBy = session?.session?.user?.id || 'unknown';

    const assignmentResult = await marketingService.assignProspect({
      prospect_id: assigningProspect.id,
      caller_id: selectedCallerId,
      assigned_by: assignedBy,
      status: 'assigned',
      assigned_at: new Date().toISOString()
    });

    if (assignmentResult.success) {
      await marketingService.updateProspect(assigningProspect.id, { status: 'assigned' });
      setIsAssignModalOpen(false);
      loadProspects();
    } else {
      alert("Failed to assign prospect: " + assignmentResult.error);
    }
    setIsSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    let success = false;

    if (editingId) {
      const result = await marketingService.updateProspect(editingId, {
        business_name: formData.business_name,
        website: formData.website || null,
        phone: formData.phone || null,
        email: formData.email || null,
        industry: formData.industry || null,
        sales_priority: formData.sales_priority,
        has_website: !!formData.website,
      });
      success = result.success;
    } else {
      const result = await marketingService.createProspect({
        business_name: formData.business_name,
        website: formData.website || null,
        phone: formData.phone || null,
        email: formData.email || null,
        industry: formData.industry || null,
        sales_priority: formData.sales_priority,
        status: 'discovered',
        has_website: !!formData.website,
        has_social_presence: false,
        strategy_id: null,
        address_line: null,
        city: null,
        state_region: null,
        postal_code: null,
        country: null,
        timezone: null,
        business_description: null,
        website_quality: null,
        social_presence_quality: null,
        opportunity_web: null,
        opportunity_marketing: null,
        opportunity_seo: null,
        opportunity_design: null,
        data_quality_score: 100,
        opportunity_score: 50,
        last_verified_at: new Date().toISOString()
      });
      success = result.success;
    }

    setIsSubmitting(false);
    if (success) {
      setIsModalOpen(false);
      loadProspects();
    } else {
      alert(`Failed to ${editingId ? 'update' : 'create'} prospect`);
    }
  };

  const columns = [
    { header: 'Business', accessor: 'business_name' as keyof Prospect, className: 'font-bold' },
    { header: 'Phone', accessor: 'phone' as keyof Prospect },
    { header: 'Country', accessor: 'country' as keyof Prospect },
    { header: 'Industry', accessor: (p: Prospect) => p.industry ? <span className="truncate max-w-[150px] inline-block">{p.industry}</span> : '-' },
    { header: 'Status', accessor: (p: Prospect) => (
      <span className={cn(
        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
        p.status === 'qualified' ? 'bg-emerald-500/10 text-emerald-500' :
        p.status === 'rejected' ? 'bg-rose-500/10 text-rose-500' :
        p.status === 'assigned' || p.status === 'calling' ? 'bg-accent-blue/10 text-accent-blue' :
        'bg-amber-500/10 text-amber-500'
      )}>
        {p.status.replace('_', ' ')}
      </span>
    )},
    { header: 'Priority', accessor: (p: Prospect) => (
      <span className={cn(
        "text-xs font-semibold",
        p.sales_priority === 'very_high' ? "text-accent-blue" :
        p.sales_priority === 'high' ? "text-emerald-500" :
        p.sales_priority === 'medium' ? "text-amber-500" :
        "text-text-secondary"
      )}>
        {p.sales_priority ? p.sales_priority.replace('_', ' ').toUpperCase() : '-'}
      </span>
    )},
    { header: 'Opp Score', accessor: (p: Prospect) => <span className="font-mono">{p.opportunity_score || '-'}</span> },
    { header: 'Data Qual', accessor: (p: Prospect) => <span className="font-mono">{p.data_quality_score || '-'}</span> },
  ];

  const exportColumns = [
    { header: 'Business Name', accessor: 'business_name' as keyof Prospect },
    { header: 'Phone', accessor: 'phone' as keyof Prospect },
    { header: 'Email', accessor: 'email' as keyof Prospect },
    { header: 'Website', accessor: 'website' as keyof Prospect },
    { header: 'Country', accessor: 'country' as keyof Prospect },
    { header: 'City', accessor: 'city' as keyof Prospect },
    { header: 'Industry', accessor: 'industry' as keyof Prospect },
    { header: 'Status', accessor: 'status' as keyof Prospect },
    { header: 'Priority', accessor: 'sales_priority' as keyof Prospect },
    { header: 'Opportunity Score', accessor: 'opportunity_score' as keyof Prospect },
  ];

  return (
    <div className="flex flex-col h-full">
      <PageHeader 
        title="Prospects" 
        description="Manage discovered and manually added business prospects."
      >
        <ExportActions 
          data={prospects} 
          columns={exportColumns}
          filename="BMTech_Prospects"
          reportTitle="Prospects Report"
          filtersActive={Object.keys(filters).length > 0}
        />
        <Button onClick={handleOpenNew}>
          <Plus size={14} /> Add Prospect
        </Button>
      </PageHeader>

      <FilterBar 
        filters={FILTERS}
        values={filters}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      <div className="flex-1 min-h-0 bg-surface border border-border/50 rounded-lg shadow-sm flex flex-col">
        <DataTable
          columns={columns}
          data={prospects}
          isLoading={loading}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          onAssign={handleOpenAssign}
          onView={setDetailProspect}
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

      {/* CREATE / EDIT MODAL */}
      <ModalForm
        title={editingId ? "Edit Prospect" : "Add Prospect"}
        description={editingId ? "Update existing prospect details." : "Manually insert a business into the marketing pipeline."}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel={editingId ? "Save Changes" : "Add Prospect"}
      >
        <div className="space-y-4">
          <InputField
            label="Business Name"
            required
            value={formData.business_name}
            onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
            placeholder="e.g. ABC Fitness"
          />
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Website"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://..."
            />
            <InputField
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 ..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="contact@..."
            />
            <InputField
              label="Industry"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              placeholder="e.g. Healthcare, Fitness"
            />
          </div>
          <SelectField
            label="Sales Priority"
            value={formData.sales_priority}
            onChange={(e) => setFormData({ ...formData, sales_priority: e.target.value as any })}
            options={[
              { label: 'Low', value: 'low' },
              { label: 'Medium', value: 'medium' },
              { label: 'High', value: 'high' },
              { label: 'Very High', value: 'very_high' },
            ]}
          />
        </div>
      </ModalForm>

      {/* ASSIGN MODAL */}
      <ModalForm
        title="Assign Prospect"
        description={`Assign "${assigningProspect?.business_name}" to a caller.`}
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSubmit={handleAssignSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Confirm Assignment"
      >
        <div className="space-y-4 min-h-[150px]">
          <SelectField
            label="Caller"
            value={selectedCallerId}
            onChange={(e) => setSelectedCallerId(e.target.value)}
            options={callers.map(caller => ({
              label: caller.name || caller.email,
              value: caller.id
            }))}
            required
          />
          {callers.length === 0 && (
            <p className="text-sm text-yellow-600 bg-yellow-500/10 p-3 rounded-md border border-yellow-500/20">
              No users with the 'caller' role were found.
            </p>
          )}
        </div>
      </ModalForm>

      {/* PROSPECT DETAIL MODAL */}
      <ProspectDetailModal
        prospect={detailProspect}
        isOpen={!!detailProspect}
        onClose={() => setDetailProspect(null)}
      />
    </div>
  );
}
