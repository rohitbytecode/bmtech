'use client';

import React, { useState, useEffect } from 'react';
import { authService } from '@/services/authService';
import { DataTable } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/Button';
import { Plus, Loader2 } from 'lucide-react';
import { ModalForm } from '@/components/admin/ModalForm';
import { InputField, SelectField } from '@/components/admin/FormFields';

export default function TeamPage() {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'caller',
  });

  useEffect(() => {
    loadTeam();
  }, []);

  const loadTeam = async () => {
    setLoading(true);
    const { data } = await authService.getTeamMembers();
    if (data) setTeam(data);
    setLoading(false);
  };

  const handleOpenInvite = () => {
    setFormData({ name: '', email: '', role: 'caller' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const { success, password, error } = await authService.inviteTeamMember(
      formData.email,
      formData.name,
      formData.role
    );

    setIsSubmitting(false);

    if (success) {
      setIsModalOpen(false);
      loadTeam();
      alert(`User ${formData.email} added successfully!\n\nTemporary Password: ${password}\n\nPlease share this password with them.`);
    } else {
      alert(`Failed to invite user: ${error}`);
    }
  };

  const columns = [
    { header: 'Name', accessor: (user: any) => user.name || 'N/A' },
    { header: 'Email', accessor: 'email' },
    { 
      header: 'Role', 
      accessor: (user: any) => (
        <span className="capitalize px-2 py-1 bg-surface border border-border/60 rounded-md text-xs font-semibold">
          {user.role}
        </span>
      )
    },
    { 
      header: 'Joined', 
      accessor: (user: any) => user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A' 
    },
    { 
      header: 'Last Sign In', 
      accessor: (user: any) => user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never' 
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Team Management</h1>
          <p className="text-text-secondary text-sm">Manage your team members and callers.</p>
        </div>
        <Button onClick={handleOpenInvite} className="gap-2">
          <Plus size={16} /> Invite Member
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-accent-blue" size={32} />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={team}
        />
      )}

      <ModalForm
        title="Add Team Member"
        description="Create a new user account. A temporary password will be generated for them."
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Create User"
      >
        <div className="space-y-4">
          <InputField
            label="Name (Optional)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. John Doe"
          />
          <InputField
            label="Email Address"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="john@example.com"
          />
          <SelectField
            label="Role"
            required
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            options={[
              { label: 'Caller', value: 'caller' },
              { label: 'Admin', value: 'admin' },
              { label: 'Team', value: 'team' },
            ]}
          />
        </div>
      </ModalForm>
    </div>
  );
}
