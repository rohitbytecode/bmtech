'use client';

import React, { useState, useEffect } from 'react';
import { marketingService } from '@/services/marketingService';
import type { Prospect } from '@/types/marketing';
import { DataTable } from '@/components/admin/DataTable';
import { Loader2, XCircle } from 'lucide-react';

export default function RejectedProspectsPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProspects();
  }, []);

  const loadProspects = async () => {
    setLoading(true);
    const { data } = await marketingService.getProspects({ status: 'rejected' });
    if (data) setProspects(data);
    setLoading(false);
  };

  const columns = [
    { header: 'Business Name', accessor: 'business_name' as keyof Prospect },
    { header: 'Industry', accessor: 'industry' as keyof Prospect },
    { header: 'Reason', accessor: (p: Prospect) => p.business_description || 'N/A' }, // Simplification for display
    { header: 'Rejected At', accessor: (p: Prospect) => new Date(p.updated_at).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Rejected Prospects</h1>
          <p className="text-text-secondary text-sm">History of businesses marked as not interested, invalid, or spam.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-accent-blue" size={32} />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={prospects}
          onEdit={(prospect) => console.log('View Prospect', prospect)}
        />
      )}
    </div>
  );
}
