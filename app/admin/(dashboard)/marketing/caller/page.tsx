'use client';

import React, { useState, useEffect } from 'react';
import { marketingService } from '@/services/marketingService';
import type { Prospect } from '@/types/marketing';
import { Button } from '@/components/ui/Button';
import { Phone, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function CallerDashboard() {
  const [assignedProspects, setAssignedProspects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    setLoading(true);
    // Determine caller ID from current session
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;
    
    if (userId) {
      const { data } = await marketingService.getAssignmentsForCaller(userId, 'assigned');
      if (data) {
        setAssignedProspects(data.map((d: any) => ({ ...d.prospects, assignment_id: d.id })));
      }
    }
    setLoading(false);
  };

  const handleOutcome = async (prospectId: string, outcome: string) => {
    // TODO: Implement actual call logging
    console.log(`Logged ${outcome} for prospect ${prospectId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin text-accent-blue" size={32} />
      </div>
    );
  }

  if (assignedProspects.length === 0) {
    return (
      <div className="text-center py-20 bg-surface rounded-3xl border border-border">
        <Phone size={48} className="mx-auto text-text-secondary mb-4 opacity-50" />
        <h2 className="text-xl font-bold mb-2">No Prospects Assigned</h2>
        <p className="text-text-secondary">You have no active prospects to call right now.</p>
      </div>
    );
  }

  const currentProspect = assignedProspects[0];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Caller Dashboard</h1>
          <p className="text-text-secondary text-sm">Review the business and log the call outcome.</p>
        </div>
        <div className="text-sm font-medium bg-surface px-4 py-2 rounded-full border border-border">
          {assignedProspects.length} Remaining
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface rounded-[32px] p-8 border border-border space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-accent-blue mb-2">{currentProspect.business_name}</h2>
              <p className="text-text-secondary">{currentProspect.industry} • {currentProspect.city}, {currentProspect.country}</p>
            </div>
            {currentProspect.sales_priority && (
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-accent-blue/10 text-accent-blue border border-accent-blue/20">
                {currentProspect.sales_priority} Priority
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-background rounded-2xl border border-border">
              <span className="text-xs text-text-secondary uppercase">Phone Number</span>
              <p className="font-medium text-lg mt-1">{currentProspect.phone || 'N/A'}</p>
            </div>
            <div className="p-4 bg-background rounded-2xl border border-border">
              <span className="text-xs text-text-secondary uppercase">Website</span>
              <p className="font-medium mt-1">{currentProspect.website || 'No website'}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3">Opportunity Analysis</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['Web', 'Marketing', 'SEO', 'Design'].map((type) => (
                <div key={type} className="p-3 bg-background rounded-xl border border-border text-center">
                  <span className="text-xs text-text-secondary block mb-1">{type}</span>
                  <span className="font-bold">
                    {currentProspect[`opportunity_${type.toLowerCase()}`] || '-'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-[32px] p-8 border border-border space-y-6">
          <h3 className="text-lg font-bold mb-4">Log Outcome</h3>
          <div className="space-y-3">
            <Button onClick={() => handleOutcome(currentProspect.id, 'interested')} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white gap-2">
              <CheckCircle size={18} /> Interested
            </Button>
            <Button onClick={() => handleOutcome(currentProspect.id, 'callback_required')} variant="outline" className="w-full">
              Callback Required
            </Button>
            <Button onClick={() => handleOutcome(currentProspect.id, 'not_interested')} variant="outline" className="w-full">
              Not Interested
            </Button>
            <Button onClick={() => handleOutcome(currentProspect.id, 'no_answer')} variant="outline" className="w-full">
              No Answer
            </Button>
            <Button onClick={() => handleOutcome(currentProspect.id, 'invalid_number')} className="w-full hover:bg-rose-500/10 hover:text-rose-500 border-none">
              <XCircle size={18} className="mr-2" /> Invalid Number
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
