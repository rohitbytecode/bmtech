'use client';

import React, { useState, useEffect } from 'react';
import { marketingService } from '@/services/marketingService';
import type { Prospect } from '@/types/marketing';
import { DataTable } from '@/components/admin/DataTable';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function QualifiedLeadsPage() {
  const [leads, setLeads] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    setLoading(true);
    const { data } = await marketingService.getProspects({ status: 'qualified' });
    if (data) setLeads(data);
    setLoading(false);
  };

  const columns = [
    { header: 'Business Name', accessor: 'business_name' as keyof Prospect },
    { header: 'Industry', accessor: 'industry' as keyof Prospect },
    { header: 'Opportunity', accessor: (p: Prospect) => p.opportunity_score || 'N/A' },
    { header: 'Sales Priority', accessor: 'sales_priority' as keyof Prospect },
    { header: 'Qualified At', accessor: (p: Prospect) => new Date(p.updated_at).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Qualified Leads</h1>
          <p className="text-text-secondary text-sm">Prospects marked as INTERESTED by the calling team.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-accent-blue" size={32} />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={leads}
          onEdit={(lead) => console.log('View Lead', lead)}
        />
      )}
    </div>
  );
}
