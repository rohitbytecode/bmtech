"use client";

import React, { useState } from "react";
import { Plus, Search, Loader2 } from "lucide-react";
import { DataTable, Column } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/Button";
import { ModalForm } from "@/components/admin/ModalForm";
import { InputField, TextAreaField } from "@/components/admin/FormFields";
import { useData } from "@/hooks/useData";
import { dataService, Service } from "@/services/dataService";

const serviceColumns: Column<Service>[] = [
  { header: "Title", accessor: "name" },
  { header: "Icon", accessor: "icon" },
];

export default function ServicesPage() {
  const { data: services, loading, error, refresh } = useData<Service>('services');
  const [isOpen, setIsOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setIsOpen(true);
  };

  const handleAdd = () => {
    setEditingService(null);
    setIsOpen(true);
  };

  const handleDelete = async (service: Service) => {
    if (confirm(`Are you sure you want to delete ${service.name}?`)) {
      try {
        const res = await dataService.deleteService(service.id);
        if (res.success) {
          refresh();
        } else {
          alert("Error: " + res.error);
        }
      } catch (err) {
        alert("Delete failed");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    
    const serviceData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      icon: (formData.get("icon") as string) || "Palette",
    };

    const runSubmit = async () => {
      try {
        let res;
        if (editingService) {
          res = await dataService.updateService(editingService.id, serviceData);
        } else {
          res = await dataService.createService(serviceData as Omit<Service, 'id' | 'created_at'>);
        }

        if (res.success) {
          setIsOpen(false);
          refresh();
        } else {
          alert("Error: " + res.error);
        }
      } catch (err) {
        alert("Submission failed");
      } finally {
        setSubmitting(false);
      }
    };

    runSubmit();
  };

  const filteredServices = Array.isArray(services) ? services.filter(s => 
    (s.name?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  ) : [];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative group flex-1 max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent-blue transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search services..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 pl-12 pr-4 bg-surface border border-border rounded-2xl text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue/40 transition-all duration-300"
          />
        </div>
        <Button onClick={handleAdd} className="h-14 px-8 gap-2 group">
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" /> Add New Service
        </Button>
      </div>

      <div className="space-y-6">
        <div className="p-1 px-4 text-sm font-semibold text-text-secondary uppercase tracking-widest border-l-4 border-accent-blue">
          Service Catalog ({filteredServices.length})
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-secondary gap-4">
            <Loader2 className="animate-spin text-accent-blue" size={40} />
            <p className="font-medium animate-pulse">Loading Services...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-rose-500/10 border border-rose-500/20 rounded-2xl">
            <p className="text-rose-400 font-medium">Error loading services: {error}</p>
          </div>
        ) : (
          <DataTable 
            data={filteredServices} 
            columns={serviceColumns} 
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      <ModalForm
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={editingService ? "Edit Service" : "Add New Service"}
        description={editingService ? "Update the details of your service below." : "Fill in the information to create a new service."}
        submitLabel={editingService ? "Update Service" : "Create Service"}
        isSubmitting={submitting}
        onSubmit={handleSubmit}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField 
            label="Service Title" 
            name="name"
            placeholder="e.g., UI/UX Design" 
            required 
            defaultValue={editingService?.name}
          />
          <InputField 
            label="Icon Name" 
            name="icon"
            placeholder="e.g., Palette, Code2" 
            required 
            defaultValue={editingService?.icon || "Palette"}
          />
          <div className="md:col-span-2">
            <TextAreaField 
              label="Description" 
              name="description"
              placeholder="Describe what this service includes..." 
              required 
              defaultValue={editingService?.description}
            />
          </div>
        </div>
      </ModalForm>
    </div>
  );
}

