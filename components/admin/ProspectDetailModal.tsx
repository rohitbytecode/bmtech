'use client';

import React from 'react';
import { X, Building2, Phone, Mail, Globe, MapPin, Target, CheckCircle2, AlertTriangle, Info, Calendar } from 'lucide-react';
import type { Prospect } from '@/types/marketing';
import { cn } from '@/lib/utils';

interface ProspectDetailModalProps {
  prospect: Prospect | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProspectDetailModal({ prospect, isOpen, onClose }: ProspectDetailModalProps) {
  if (!isOpen || !prospect) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-surface border border-border/50 rounded-xl shadow-2xl shadow-black/10 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex-none p-6 border-b border-border/50 bg-background/50 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-text-primary tracking-tight">{prospect.business_name}</h2>
              <span className={cn(
                "px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider",
                prospect.sales_priority === 'very_high' ? "bg-accent-blue/10 text-accent-blue border border-accent-blue/20" :
                prospect.sales_priority === 'high' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                prospect.sales_priority === 'medium' ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                "bg-slate-500/10 text-slate-500 border border-slate-500/20"
              )}>
                {prospect.sales_priority || 'Unscored'} Priority
              </span>
            </div>
            <p className="text-sm text-text-secondary flex items-center gap-2">
              <span className={cn(
                "w-2 h-2 rounded-full",
                prospect.status === 'qualified' ? 'bg-emerald-500' :
                prospect.status === 'rejected' ? 'bg-rose-500' :
                prospect.status === 'assigned' || prospect.status === 'calling' ? 'bg-accent-blue' :
                'bg-amber-500'
              )}></span>
              {prospect.status.replace(/_/g, ' ').toUpperCase()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-border transition-colors outline-none"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Identity & Contact */}
            <div className="space-y-6">
              <section>
                <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2 border-b border-border/50 pb-2">
                  <Building2 size={16} className="text-text-secondary" /> Identity & Contact
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-text-secondary block">Industry</span>
                    <span className="text-sm font-medium">{prospect.industry || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-text-secondary block">Business Description</span>
                    <span className="text-sm">{prospect.business_description || 'No description available'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-text-secondary flex items-center gap-1"><Phone size={12}/> Phone</span>
                      <span className="text-sm font-medium">{prospect.phone || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-text-secondary flex items-center gap-1"><Mail size={12}/> Email</span>
                      <span className="text-sm font-medium">{prospect.email || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Location */}
              <section>
                <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2 border-b border-border/50 pb-2">
                  <MapPin size={16} className="text-text-secondary" /> Location
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-text-secondary block">Address</span>
                      <span className="text-sm">{prospect.address_line || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-text-secondary block">City</span>
                      <span className="text-sm">{prospect.city || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-text-secondary block">State/Region</span>
                      <span className="text-sm">{prospect.state_region || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-text-secondary block">Country</span>
                      <span className="text-sm">{prospect.country || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Analysis & Web Presence */}
            <div className="space-y-6">
              
              <section>
                <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2 border-b border-border/50 pb-2">
                  <Globe size={16} className="text-text-secondary" /> Web Presence
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-text-secondary block">Website</span>
                    {prospect.website ? (
                      <a href={prospect.website.startsWith('http') ? prospect.website : `https://${prospect.website}`} target="_blank" rel="noopener noreferrer" className="text-sm text-accent-blue hover:underline font-medium">
                        {prospect.website}
                      </a>
                    ) : (
                      <span className="text-sm text-text-secondary italic">No website detected</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-secondary">Has Social:</span>
                      {prospect.has_social_presence ? <CheckCircle2 size={16} className="text-emerald-500" /> : <X size={16} className="text-text-secondary" />}
                    </div>
                    <div>
                      <span className="text-xs text-text-secondary block">Data Quality Score</span>
                      <span className="text-sm font-medium">{prospect.data_quality_score ?? 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2 border-b border-border/50 pb-2">
                  <Target size={16} className="text-text-secondary" /> Opportunity Analysis
                </h3>
                
                <div className="bg-background border border-border p-4 rounded-lg mb-4 flex items-center justify-between">
                  <span className="font-semibold text-text-primary">Overall Opportunity</span>
                  <span className="text-2xl font-bold text-accent-blue">{prospect.opportunity_score ?? 'N/A'}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-surface border border-border/50 rounded-md">
                    <span className="text-xs text-text-secondary block mb-1">Web Development</span>
                    <span className="font-semibold">{prospect.opportunity_web ?? '-'}</span>
                  </div>
                  <div className="p-3 bg-surface border border-border/50 rounded-md">
                    <span className="text-xs text-text-secondary block mb-1">SEO</span>
                    <span className="font-semibold">{prospect.opportunity_seo ?? '-'}</span>
                  </div>
                  <div className="p-3 bg-surface border border-border/50 rounded-md">
                    <span className="text-xs text-text-secondary block mb-1">Marketing</span>
                    <span className="font-semibold">{prospect.opportunity_marketing ?? '-'}</span>
                  </div>
                  <div className="p-3 bg-surface border border-border/50 rounded-md">
                    <span className="text-xs text-text-secondary block mb-1">Design/Brand</span>
                    <span className="font-semibold">{prospect.opportunity_design ?? '-'}</span>
                  </div>
                </div>
              </section>

            </div>
          </div>

          <section className="pt-4 border-t border-border/50">
            <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Info size={16} className="text-text-secondary" /> System Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-text-secondary">
              <div><span className="block font-medium mb-1">ID</span><span className="font-mono text-[10px] break-all">{prospect.id}</span></div>
              <div><span className="block font-medium mb-1 flex items-center gap-1"><Calendar size={12}/> Discovered</span>{new Date(prospect.created_at).toLocaleString()}</div>
              <div><span className="block font-medium mb-1 flex items-center gap-1"><Calendar size={12}/> Last Updated</span>{new Date(prospect.updated_at).toLocaleString()}</div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
