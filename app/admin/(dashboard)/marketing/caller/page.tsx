'use client';

import React, { useState, useEffect } from 'react';
import { marketingService } from '@/services/marketingService';
import { Button } from '@/components/ui/Button';
import { Phone, CheckCircle, XCircle, Loader2, Mail, Globe, MapPin, Copy, Calendar, Navigation } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/admin/PageHeader';

export default function CallerDashboard() {
  const [assignedProspects, setAssignedProspects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    setLoading(true);
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;
    const userRole = session?.session?.user?.user_metadata?.role;
    const isSuperAdmin = session?.session?.user?.user_metadata?.is_super_admin === true;
    const isAdmin = userRole === 'admin' || isSuperAdmin;
    
    if (userId) {
      const targetCallerId = isAdmin ? undefined : userId;
      const { data } = await marketingService.getAssignmentsForCaller(targetCallerId, 'assigned');
      if (data) {
        setAssignedProspects(data.map((d: any) => ({ ...d.prospects, assignment_id: d.id, caller_id: d.caller_id })));
      }
    }
    setLoading(false);
  };

  const handleOutcome = async (assignmentId: string, prospectId: string, callerId: string, outcome: string) => {
    setIsSubmitting(true);
    const result = await marketingService.logCallOutcome(assignmentId, prospectId, callerId, outcome);
    
    if (result.success) {
      setAssignedProspects(prev => prev.filter(p => p.id !== prospectId));
    } else {
      alert("Failed to log outcome: " + result.error);
    }
    setIsSubmitting(false);
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent-blue" />
        <span className="ml-3 text-lg font-medium text-text-secondary">Loading your assignments...</span>
      </div>
    );
  }

  if (assignedProspects.length === 0) {
    return (
      <div className="text-center py-32 bg-surface rounded-lg border border-border mt-6">
        <div className="h-20 w-20 bg-accent-blue/5 rounded-full flex items-center justify-center text-accent-blue/30 mx-auto mb-6">
          <CheckCircle size={40} />
        </div>
        <h2 className="text-xl font-bold mb-2 text-text-primary">You're All Caught Up!</h2>
        <p className="text-text-secondary max-w-sm mx-auto">You have no active prospects assigned to call right now. Take a break or check back later.</p>
      </div>
    );
  }

  const currentProspect = assignedProspects[0];

  return (
    <div className="flex flex-col h-full space-y-6">
      <PageHeader 
        title="Caller Workspace" 
        description="Review business context, engage, and log the outcome."
      >
        <div className="text-sm font-medium bg-surface px-4 py-2 rounded-full border border-border shadow-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent-blue animate-pulse"></span>
          {assignedProspects.length} Remaining in Queue
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Prospect Context */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-surface rounded-lg p-6 border border-border shadow-sm space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-1">{currentProspect.business_name}</h2>
                <p className="text-text-secondary text-sm flex items-center gap-2">
                  <MapPin size={14} />
                  {currentProspect.city ? `${currentProspect.city}, ${currentProspect.country || ''}` : 'Location unknown'}
                  <span className="mx-2">•</span>
                  {currentProspect.industry || 'Industry unspecified'}
                </p>
              </div>
              {currentProspect.sales_priority && (
                <span className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                  currentProspect.sales_priority === 'very_high' ? "bg-accent-blue/10 text-accent-blue border border-accent-blue/20" :
                  currentProspect.sales_priority === 'high' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                  currentProspect.sales_priority === 'medium' ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                  "bg-slate-500/10 text-slate-500 border border-slate-500/20"
                )}>
                  {currentProspect.sales_priority} Priority
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-background rounded-lg border border-border flex flex-col justify-center">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1"><Phone size={12}/> Phone Number</span>
                  {currentProspect.phone && (
                    <button onClick={() => handleCopy(currentProspect.phone, 'phone')} className="text-xs text-text-secondary hover:text-accent-blue transition-colors">
                      {copiedField === 'phone' ? <CheckCircle size={14} className="text-emerald-500"/> : <Copy size={14}/>}
                    </button>
                  )}
                </div>
                {currentProspect.phone ? (
                  <a href={`tel:${currentProspect.phone}`} className="font-mono text-xl font-bold text-accent-blue hover:underline">
                    {currentProspect.phone}
                  </a>
                ) : (
                  <span className="text-text-secondary italic">Not available</span>
                )}
              </div>
              
              <div className="p-5 bg-background rounded-lg border border-border flex flex-col justify-center">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1"><Mail size={12}/> Email Address</span>
                  {currentProspect.email && (
                    <button onClick={() => handleCopy(currentProspect.email, 'email')} className="text-xs text-text-secondary hover:text-accent-blue transition-colors">
                      {copiedField === 'email' ? <CheckCircle size={14} className="text-emerald-500"/> : <Copy size={14}/>}
                    </button>
                  )}
                </div>
                {currentProspect.email ? (
                  <a href={`mailto:${currentProspect.email}`} className="font-medium text-text-primary hover:text-accent-blue truncate">
                    {currentProspect.email}
                  </a>
                ) : (
                  <span className="text-text-secondary italic">Not available</span>
                )}
              </div>
            </div>

            <div className="p-4 bg-background rounded-lg border border-border">
               <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1 mb-2">
                <Navigation size={12} className="rotate-90"/> Business Context
               </span>
               <p className="text-sm text-text-primary leading-relaxed">
                 {currentProspect.business_description || 'No detailed description available for this business. You will need to qualify them entirely during the call.'}
               </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-text-secondary" />
              <span className="text-sm text-text-secondary">Website:</span>
              {currentProspect.website ? (
                <a href={currentProspect.website.startsWith('http') ? currentProspect.website : `https://${currentProspect.website}`} target="_blank" rel="noopener noreferrer" className="text-sm text-accent-blue hover:underline font-medium truncate max-w-[300px]">
                  {currentProspect.website}
                </a>
              ) : (
                <span className="text-sm text-text-secondary italic">No website detected</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-surface rounded-lg p-5 border border-border shadow-sm">
              <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4 border-b border-border/50 pb-2">Opportunity Scores</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Overall Score</span>
                  <span className="font-bold text-accent-blue">{currentProspect.opportunity_score ?? 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Web</span>
                  <span className="text-sm font-medium">{currentProspect.opportunity_web ?? '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">SEO</span>
                  <span className="text-sm font-medium">{currentProspect.opportunity_seo ?? '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Marketing</span>
                  <span className="text-sm font-medium">{currentProspect.opportunity_marketing ?? '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Design</span>
                  <span className="text-sm font-medium">{currentProspect.opportunity_design ?? '-'}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-surface rounded-lg p-5 border border-border shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4 border-b border-border/50 pb-2">Data Quality</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 flex items-center justify-center">
                    <span className="font-bold text-sm text-emerald-500">{currentProspect.data_quality_score ?? 0}</span>
                  </div>
                  <div className="text-xs text-text-secondary">
                    Higher quality scores indicate more reliable contact information and business context.
                  </div>
                </div>
              </div>
              <div className="text-xs text-text-secondary flex items-center gap-1 mt-4 pt-4 border-t border-border/50">
                <Calendar size={12}/> Discovered {new Date(currentProspect.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Logging */}
        <div className="bg-surface rounded-lg p-6 border border-border shadow-sm flex flex-col h-fit sticky top-6">
          <h3 className="text-sm font-bold text-text-primary mb-1">Log Call Outcome</h3>
          <p className="text-xs text-text-secondary mb-6">Select the result of your call attempt.</p>
          
          <div className="space-y-3">
            <Button 
              disabled={isSubmitting} 
              onClick={() => handleOutcome(currentProspect.assignment_id, currentProspect.id, currentProspect.caller_id, 'interested')} 
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white gap-2 shadow-emerald-500/20 h-12 text-sm"
            >
              <CheckCircle size={16} /> Interested / Qualified
            </Button>
            
            <Button 
              disabled={isSubmitting} 
              onClick={() => handleOutcome(currentProspect.assignment_id, currentProspect.id, currentProspect.caller_id, 'callback_required')} 
              variant="outline" 
              className="w-full h-10 text-sm"
            >
              Callback Required
            </Button>
            
            <Button 
              disabled={isSubmitting} 
              onClick={() => handleOutcome(currentProspect.assignment_id, currentProspect.id, currentProspect.caller_id, 'no_answer')} 
              variant="outline" 
              className="w-full h-10 text-sm"
            >
              No Answer
            </Button>

            <div className="pt-4 border-t border-border/50 mt-2 space-y-3">
              <Button 
                disabled={isSubmitting} 
                onClick={() => handleOutcome(currentProspect.assignment_id, currentProspect.id, currentProspect.caller_id, 'not_interested')} 
                variant="ghost" 
                className="w-full h-10 text-sm text-text-secondary hover:text-rose-500 hover:bg-rose-500/10"
              >
                Not Interested
              </Button>
              
              <Button 
                disabled={isSubmitting} 
                onClick={() => handleOutcome(currentProspect.assignment_id, currentProspect.id, currentProspect.caller_id, 'invalid_number')} 
                variant="ghost"
                className="w-full h-10 text-sm text-text-secondary hover:text-rose-500 hover:bg-rose-500/10"
              >
                <XCircle size={16} className="mr-2" /> Invalid Number / Closed
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
