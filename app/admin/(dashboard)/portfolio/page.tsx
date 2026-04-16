'use client';

import React, { useState } from 'react';
import { Plus, Search, Image as ImageIcon, Loader2 } from 'lucide-react';
import { DataTable, Column } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/Button';
import { ModalForm } from '@/components/admin/ModalForm';
import { InputField, SelectField } from '@/components/admin/FormFields';

const CATEGORIES = [
  { value: 'IT Services', label: 'IT Services' },
  { value: 'Creative Design & Visual Solutions', label: 'Creative Design & Visual Solutions' },
  {
    value: 'Video Production & Multimedia Services',
    label: 'Video Production & Multimedia Services',
  },
  { value: 'Social Media Management & Strategy', label: 'Social Media Management & Strategy' },
];
import { useData } from '@/hooks/useData';
import { Project, dataService } from '@/services/dataService';

import { formatUrl } from '@/lib/utils';

const projectColumns: Column<Project>[] = [
  {
    header: 'Project',
    accessor: (project) => (
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 bg-surface border border-border rounded-lg flex items-center justify-center text-text-secondary overflow-hidden shrink-0">
          {project.image ? (
            <img src={project.image} alt={project.title} className="h-full w-full object-cover" />
          ) : (
            <ImageIcon size={18} />
          )}
        </div>
        <span className="font-semibold text-text-primary">{project.title}</span>
      </div>
    ),
  },
  { header: 'Category', accessor: 'category' },
  {
    header: 'Live URL',
    accessor: (project) => (
      <a
        href={formatUrl(project.link)}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent-blue hover:underline font-medium"
      >
        View Site
      </a>
    ),
  },
];

export default function PortfolioPage() {
  const { data: projects, loading, error, refresh } = useData<Project>('projects');
  const [isOpen, setIsOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setIsOpen(true);
  };

  const handleDelete = async (project: Project) => {
    if (!confirm(`Are you sure you want to delete "${project.title}"?`)) return;

    try {
      const res = await dataService.deleteProject(project.id);
      if (res.success) {
        refresh();
      } else {
        alert('Failed to delete project: ' + res.error);
      }
    } catch (err) {
      alert('An unexpected error occurred');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const projectData = {
      title: formData.get('title') as string,
      category: formData.get('category') as string,
      link: formData.get('link') as string,
      image: formData.get('image') as string,
    };

    try {
      let res;
      if (editingProject) {
        res = await dataService.updateProject(editingProject.id, projectData);
      } else {
        res = await dataService.createProject(projectData);
      }

      if (res.success) {
        setIsOpen(false);
        setEditingProject(null);
        refresh();
      } else {
        alert('Failed to save project: ' + res.error);
      }
    } catch (err) {
      alert('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProjects = Array.isArray(projects)
    ? projects.filter(
        (p) =>
          (p.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (p.category?.toLowerCase() || '').includes(searchTerm.toLowerCase()),
      )
    : [];

  if (error) {
    return (
      <div className="p-8 text-center bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400">
        <p className="font-bold mb-2">Error loading projects</p>
        <p className="text-sm opacity-80">{error}</p>
        <Button onClick={() => refresh()} variant="secondary" className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative group flex-1 max-w-lg">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent-blue transition-colors"
            size={20}
          />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-14 pl-12 pr-4 bg-surface border border-border rounded-2xl text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue/40 transition-all duration-300"
          />
        </div>
        <Button
          onClick={() => {
            setEditingProject(null);
            setIsOpen(true);
          }}
          className="h-14 px-8 gap-2 group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" /> Add
          New Project
        </Button>
      </div>

      <div className="space-y-6">
        <div className="p-1 px-4 text-sm font-semibold text-text-secondary uppercase tracking-widest border-l-4 border-accent-blue">
          Project Portfolio ({filteredProjects.length})
        </div>
        <DataTable
          data={filteredProjects}
          columns={projectColumns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={loading}
        />
      </div>

      <ModalForm
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setEditingProject(null);
        }}
        title={editingProject ? 'Edit Project' : 'Add New Project'}
        description="Showcase your best work to potential clients."
        submitLabel={editingProject ? 'Update Project' : 'Create Project'}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            name="title"
            label="Project Title"
            placeholder="e.g., Agency Website"
            required
            defaultValue={editingProject?.title}
          />
          <SelectField
            name="category"
            label="Category"
            options={CATEGORIES}
            required
            defaultValue={editingProject?.category}
          />
          <InputField
            name="link"
            label="Live URL"
            placeholder="e.g., https://bmtech.com"
            required
            defaultValue={editingProject?.link}
          />
          <div className="md:col-span-2">
            <InputField
              name="image"
              label="Image URL"
              placeholder="e.g., /assets/project.jpg"
              defaultValue={editingProject?.image}
            />
          </div>
        </div>
      </ModalForm>
    </div>
  );
}
