'use client';

import React, { useState, useEffect } from 'react';
import { marketingService } from '@/services/marketingService';
import type { Strategy } from '@/types/marketing';
import { DataTable } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/Button';
import { Plus, Briefcase, Loader2 } from 'lucide-react';
import { ModalForm } from '@/components/admin/ModalForm';
import { InputField, TextAreaField, SelectField } from '@/components/admin/FormFields';
import { supabase } from '@/lib/supabaseClient';

export default function StrategiesPage() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'draft' as any,
  });

  useEffect(() => {
    loadStrategies();
  }, []);

  const loadStrategies = async () => {
    setLoading(true);
    const { data } = await marketingService.getStrategies();
    if (data) setStrategies(data);
    setLoading(false);
  };

  const handleOpenNew = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', status: 'draft' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (strategy: Strategy) => {
    setEditingId(strategy.id);
    setFormData({
      name: strategy.name,
      description: strategy.description || '',
      status: strategy.status,
    });
    setIsModalOpen(true);
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

    if (editingId) {
      const result = await marketingService.updateStrategy(editingId, {
        name: formData.name,
        description: formData.description,
        status: formData.status,
      });
      success = result.success;
    } else {
      const result = await marketingService.createStrategy({
        name: formData.name,
        description: formData.description,
        status: formData.status,
        target_industries: [],
        target_countries: [],
        target_regions: [],
        target_cities: [],
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
    { header: 'Name', accessor: 'name' as keyof Strategy },
    { header: 'Status', accessor: 'status' as keyof Strategy },
    { header: 'Target Industries', accessor: (s: Strategy) => s.target_industries?.join(', ') || 'N/A' },
    { header: 'Created At', accessor: (s: Strategy) => new Date(s.created_at).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Marketing Strategies</h1>
          <p className="text-text-secondary text-sm">Manage outbound marketing campaigns and targeting.</p>
        </div>
        <Button onClick={handleOpenNew} className="gap-2">
          <Plus size={16} /> New Strategy
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-accent-blue" size={32} />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={strategies}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
        />
      )}

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
        </div>
      </ModalForm>
    </div>
  );
}
