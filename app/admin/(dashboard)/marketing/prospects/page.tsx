'use client';

import React, { useState, useEffect } from 'react';
import { marketingService } from '@/services/marketingService';
import { supabase } from '@/lib/supabaseClient';
import type { Prospect } from '@/types/marketing';
import { DataTable } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/Button';
import { Plus, Users, Loader2 } from 'lucide-react';
import { ModalForm } from '@/components/admin/ModalForm';
import { InputField, TextAreaField, SelectField } from '@/components/admin/FormFields';

export default function ProspectsPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [callers, setCallers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
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

  useEffect(() => {
    loadProspects();
    loadCallers();
  }, []);

  const loadProspects = async () => {
    setLoading(true);
    const { data } = await marketingService.getProspects();
    if (data) setProspects(data);
    setLoading(false);
  };

  const loadCallers = async () => {
    const { data } = await marketingService.getCallers();
    if (data) setCallers(data);
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
      sales_priority: prospect.sales_priority,
    });
    setIsModalOpen(true);
  };

  const handleOpenAssign = (prospect: Prospect) => {
    setAssigningProspect(prospect);
    setSelectedCallerId('');
    setIsAssignModalOpen(true);
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
    if (!assigningProspect || !selectedCallerId) return;
    
    setIsSubmitting(true);
    
    const { data: session } = await supabase.auth.getSession();
    const assignedBy = session?.session?.user?.id || 'unknown';

    // 1. Create the assignment record
    const assignmentResult = await marketingService.assignProspect({
      prospect_id: assigningProspect.id,
      caller_id: selectedCallerId,
      assigned_by: assignedBy,
      status: 'assigned',
      assigned_at: new Date().toISOString()
    });

    if (assignmentResult.success) {
      // 2. Update prospect status
      await marketingService.updateProspect(assigningProspect.id, {
        status: 'assigned'
      });
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
        data_quality_score: 100, // Manual entry assumed high quality
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
    { header: 'Business Name', accessor: 'business_name' as keyof Prospect },
    { header: 'Status', accessor: 'status' as keyof Prospect },
    { header: 'Opportunity Score', accessor: (p: Prospect) => p.opportunity_score || 'N/A' },
    { header: 'Sales Priority', accessor: 'sales_priority' as keyof Prospect },
    { header: 'Created At', accessor: (p: Prospect) => new Date(p.created_at).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Prospects</h1>
          <p className="text-text-secondary text-sm">Manage discovered and manually added business prospects.</p>
        </div>
        <Button onClick={handleOpenNew} className="gap-2">
          <Plus size={16} /> Add Prospect
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-accent-blue" size={32} />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={prospects}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          onAssign={handleOpenAssign}
        />
      )}

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
            label="Select Caller"
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
    </div>
  );
}
