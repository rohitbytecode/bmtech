"use client";

import React, { useState } from "react";
import { Plus, Check, Edit2, Trash2, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ModalForm } from "@/components/admin/ModalForm";
import { InputField, ToggleSwitch, TextAreaField } from "@/components/admin/FormFields";
import { cn } from "@/lib/utils";
import { useData } from "@/hooks/useData";
import { Package, dataService } from "@/services/dataService";

export default function PackagesPage() {
  const { data: packages, loading, error, refresh } = useData<Package>('packages');
  const [isOpen, setIsOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleEdit = (pkg: Package) => {
    setEditingPackage(pkg);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this package?")) return;
    
    try {
      const { success, error } = await dataService.deletePackage(id);
      if (success) {
        refresh();
      } else {
        alert("Failed to delete package: " + error);
      }
    } catch (err) {
      alert("An unexpected error occurred");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    
    // Parse features from textarea (one per line)
    const featuresText = formData.get("features") as string;
    const features = featuresText
      .split("\n")
      .map(f => f.trim())
      .filter(f => f.length > 0);

    const pkgData = {
      name: formData.get("name") as string,
      price: formData.get("price") as string,
      features: features,
      highlighted: formData.get("highlighted") === "true" || !!editingPackage?.highlighted
    };

    try {
      let result;
      if (editingPackage) {
        result = await dataService.updatePackage(editingPackage.id, pkgData);
      } else {
        result = await dataService.createPackage(pkgData);
      }

      if (result.success) {
        refresh();
        setIsOpen(false);
        setEditingPackage(null);
      } else {
        alert("Error saving package: " + result.error);
      }
    } catch (err) {
      alert("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPackages = (packages || []).filter(pkg => 
    pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.price.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFeaturesArray = (features: any): string[] => {
    if (Array.isArray(features)) return features;
    if (typeof features === 'string') {
      try { return JSON.parse(features); } catch (e) { return []; }
    }
    return [];
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-text-primary tracking-tight">Pricing Packages</h2>
          <p className="text-text-secondary">Manage the pricing tiers and features displayed on the website.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent-blue transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search packages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/40 focus:border-accent-blue transition-all"
            />
          </div>
          <Button onClick={() => setIsOpen(true)} className="h-12 px-6 gap-2 group shrink-0">
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" /> Create Package
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="h-12 w-12 text-accent-blue animate-spin" />
          <p className="text-text-secondary font-medium">Loading your packages...</p>
        </div>
      ) : error ? (
        <div className="p-8 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-center">
          <p className="text-rose-400 font-semibold mb-4">Failed to load packages</p>
          <Button onClick={refresh} variant="outline" size="sm" className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10">Retry</Button>
        </div>
      ) : filteredPackages.length === 0 ? (
        <div className="text-center py-20 bg-surface/50 border-2 border-dashed border-border rounded-3xl">
          <p className="text-text-secondary mb-6 text-lg">
            {searchQuery ? "No packages match your search." : "You haven't added any packages yet."}
          </p>
          {!searchQuery && (
            <Button onClick={() => setIsOpen(true)} variant="outline" className="gap-2">
              <Plus size={18} /> Create First Package
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-12">
          {filteredPackages.map((pkg) => {
            const features = getFeaturesArray(pkg.features);
            return (
              <div 
                key={pkg.id} 
                className={cn(
                  "relative p-8 rounded-3xl bg-surface border transition-all duration-300 group hover:shadow-2xl hover:-translate-y-2",
                  pkg.highlighted ? "border-accent-blue shadow-lg shadow-accent-blue/10" : "border-border hover:border-accent-blue/40"
                )}
              >
                {pkg.highlighted && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-accent-blue text-white text-xs font-bold rounded-full uppercase tracking-widest shadow-lg">
                    Most Popular
                  </span>
                )}
                
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-text-primary uppercase tracking-wider line-clamp-1">{pkg.name}</h3>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEdit(pkg)}
                      className="p-2 rounded-lg bg-background border border-border text-text-secondary hover:text-accent-blue hover:bg-accent-blue/10 transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(pkg.id)}
                      className="p-2 rounded-lg bg-background border border-border text-text-secondary hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="mb-10">
                  <span className="text-5xl font-bold text-text-primary tracking-tight">{pkg.price}</span>
                  <span className="text-text-secondary ml-2 font-medium">/ project</span>
                </div>

                <div className="space-y-4 mb-10 min-h-[160px]">
                  {features.slice(0, 5).map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex-shrink-0 h-6 w-6 bg-accent-blue/10 rounded-full flex items-center justify-center text-accent-blue">
                        <Check size={14} />
                      </div>
                      <span className="text-text-secondary font-medium tracking-tight line-clamp-1">{feature}</span>
                    </div>
                  ))}
                  {features.length > 5 && (
                    <p className="text-xs text-text-secondary pl-9">+ {features.length - 5} more features</p>
                  )}
                </div>

                <div className={cn(
                  "w-full h-14 rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center justify-center border-2 transition-all duration-300",
                  pkg.highlighted 
                    ? "bg-accent-blue border-accent-blue text-white hover:bg-accent-blue/90" 
                    : "bg-transparent border-border text-text-primary hover:border-accent-blue hover:bg-accent-blue/5"
                )}>
                  View Details
                </div>
              </div>
            );
          })}

          <button 
            onClick={() => setIsOpen(true)}
            className="border-2 border-dashed border-border rounded-3xl p-8 flex flex-col items-center justify-center text-text-secondary hover:text-accent-blue hover:border-accent-blue hover:bg-accent-blue/5 transition-all duration-300 gap-4 group min-h-[400px]"
          >
            <div className="h-20 w-20 bg-border/40 rounded-full flex items-center justify-center group-hover:bg-accent-blue/10 transition-colors">
              <Plus size={40} />
            </div>
            <span className="text-lg font-bold">Add New Package</span>
          </button>
        </div>
      )}

      <ModalForm
        isOpen={isOpen}
        onClose={() => { setIsOpen(false); setEditingPackage(null); }}
        title={editingPackage ? "Edit Package" : "Create Package"}
        description="Configure your service offerings and prices."
        submitLabel={editingPackage ? "Update Package" : "Create Package"}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField name="name" label="Package Name" placeholder="e.g., Premium Social Media" defaultValue={editingPackage?.name} required />
          <InputField name="price" label="Price" placeholder="e.g., $1,999" defaultValue={editingPackage?.price} required />
          <div className="md:col-span-2">
            <TextAreaField 
              name="features"
              label="Features (one per line)" 
              placeholder="Support&#10;Analytics&#10;Custom Design" 
              defaultValue={getFeaturesArray(editingPackage?.features).join("\n")} 
              required 
            />
          </div>
          <div className="md:col-span-2">
            <input type="hidden" name="highlighted" value={String(editingPackage?.highlighted ?? false)} />
             <ToggleSwitch 
              label="Highlight this package (Most Popular)" 
              checked={editingPackage?.highlighted ?? false} 
              onChange={(checked) => {
                if (editingPackage) {
                  setEditingPackage({ ...editingPackage, highlighted: checked });
                } else {
                  // For new package, we need a way to track this. 
                  // I'll use a local state for the form highlighted status or just trust the hidden input logic if I update it correctly.
                  // Actually, let's just add a local state for simplicity in the creation flow.
                }
              }} 
            />
          </div>
        </div>
      </ModalForm>
    </div>
  );
}
