"use client";

import React, { useState } from "react";
import { Plus, Check, Edit2, Trash2, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ModalForm } from "@/components/admin/ModalForm";
import { InputField, ToggleSwitch, TextAreaField } from "@/components/admin/FormFields";
import { cn } from "@/lib/utils";
import { useData } from "@/hooks/useData";
import { MaintenancePlan, dataService } from "@/services/dataService";

export default function MonthlyPackagesPage() {
  const { data: plans, loading, error, refresh } = useData<MaintenancePlan>('maintenancePlans');
  const [isOpen, setIsOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MaintenancePlan | null>(null);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleEdit = (plan: MaintenancePlan) => {
    setEditingPlan(plan);
    setIsHighlighted(!!plan.highlighted);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this maintenance plan?")) return;
    
    try {
      const { success, error } = await dataService.deleteMaintenancePlan(id);
      if (success) {
        refresh();
      } else {
        alert("Failed to delete plan: " + error);
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

    const planData = {
      name: formData.get("name") as string,
      price: formData.get("price") as string,
      features: features,
      highlighted: isHighlighted,
      id: editingPlan ? editingPlan.id : crypto.randomUUID(), // Assuming text ID might be generated if not UUID, wait, does supabase auto-generate if we provide a standard UUID? The schema has id TEXT PRIMARY KEY for maintenance_plans. We can use a random string.
    };

    try {
      let result;
      if (editingPlan) {
        result = await dataService.updateMaintenancePlan(editingPlan.id, planData);
      } else {
        result = await dataService.createMaintenancePlan(planData);
      }

      if (result.success) {
        refresh();
        setIsOpen(false);
        setEditingPlan(null);
        setIsHighlighted(false);
      } else {
        alert("Error saving plan: " + result.error);
      }
    } catch (err) {
      alert("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPlans = (plans || []).filter(plan => 
    plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.price.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h2 className="text-3xl font-bold text-text-primary tracking-tight">Monthly Packages (Maintenance)</h2>
          <p className="text-text-secondary">Manage the monthly support tiers and maintenance plans.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent-blue transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search plans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/40 focus:border-accent-blue transition-all"
            />
          </div>
          <Button onClick={() => { setIsOpen(true); setIsHighlighted(false); setEditingPlan(null); }} className="h-12 px-6 gap-2 group shrink-0">
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" /> Create Plan
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="h-12 w-12 text-accent-blue animate-spin" />
          <p className="text-text-secondary font-medium">Loading your plans...</p>
        </div>
      ) : error ? (
        <div className="p-8 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-center">
          <p className="text-rose-400 font-semibold mb-4">Failed to load plans</p>
          <Button onClick={refresh} variant="outline" size="sm" className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10">Retry</Button>
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="text-center py-20 bg-surface/50 border-2 border-dashed border-border rounded-3xl">
          <p className="text-text-secondary mb-6 text-lg">
            {searchQuery ? "No plans match your search." : "You haven't added any plans yet."}
          </p>
          {!searchQuery && (
            <Button onClick={() => setIsOpen(true)} variant="outline" className="gap-2">
              <Plus size={18} /> Create First Plan
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-12">
          {filteredPlans.map((plan) => {
            const features = getFeaturesArray(plan.features);
            return (
              <div 
                key={plan.id} 
                className={cn(
                  "relative p-8 rounded-3xl bg-surface border transition-all duration-300 group hover:shadow-2xl hover:-translate-y-2",
                  plan.highlighted ? "border-accent-blue shadow-lg shadow-accent-blue/10" : "border-border hover:border-accent-blue/40"
                )}
              >
                {plan.highlighted && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-accent-blue text-white text-xs font-bold rounded-full uppercase tracking-widest shadow-lg">
                    Most Popular
                  </span>
                )}
                
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-text-primary uppercase tracking-wider line-clamp-1">{plan.name}</h3>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEdit(plan)}
                      className="p-2 rounded-lg bg-background border border-border text-text-secondary hover:text-accent-blue hover:bg-accent-blue/10 transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(plan.id)}
                      className="p-2 rounded-lg bg-background border border-border text-text-secondary hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="mb-10">
                  <span className="text-5xl font-bold text-text-primary tracking-tight">{plan.price}</span>
                  <span className="text-text-secondary ml-2 font-medium">/ mo</span>
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
                  plan.highlighted 
                    ? "bg-accent-blue border-accent-blue text-white hover:bg-accent-blue/90" 
                    : "bg-transparent border-border text-text-primary hover:border-accent-blue hover:bg-accent-blue/5"
                )}>
                  View Details
                </div>
              </div>
            );
          })}

          <button 
            onClick={() => { setIsOpen(true); setIsHighlighted(false); setEditingPlan(null); }}
            className="border-2 border-dashed border-border rounded-3xl p-8 flex flex-col items-center justify-center text-text-secondary hover:text-accent-blue hover:border-accent-blue hover:bg-accent-blue/5 transition-all duration-300 gap-4 group min-h-[400px]"
          >
            <div className="h-20 w-20 bg-border/40 rounded-full flex items-center justify-center group-hover:bg-accent-blue/10 transition-colors">
              <Plus size={40} />
            </div>
            <span className="text-lg font-bold">Add New Plan</span>
          </button>
        </div>
      )}

      <ModalForm
        isOpen={isOpen}
        onClose={() => { setIsOpen(false); setEditingPlan(null); setIsHighlighted(false); }}
        title={editingPlan ? "Edit Plan" : "Create Plan"}
        description="Configure your monthly maintenance plans."
        submitLabel={editingPlan ? "Update Plan" : "Create Plan"}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField name="name" label="Plan Name" placeholder="e.g., Standard" defaultValue={editingPlan?.name} required />
          <InputField name="price" label="Price" placeholder="e.g., $199/mo" defaultValue={editingPlan?.price} required />
          <div className="md:col-span-2">
            <TextAreaField 
              name="features"
              label="Features (one per line)" 
              placeholder="Daily Backups&#10;Performance Tuning&#10;Monthly Report" 
              defaultValue={getFeaturesArray(editingPlan?.features).join("\n")} 
              required 
            />
          </div>
          <div className="md:col-span-2">
            <input type="hidden" name="highlighted" value={String(isHighlighted)} />
             <ToggleSwitch 
              label="Highlight this plan (Most Popular)" 
              checked={isHighlighted} 
              onChange={setIsHighlighted} 
            />
          </div>
        </div>
      </ModalForm>
    </div>
  );
}
