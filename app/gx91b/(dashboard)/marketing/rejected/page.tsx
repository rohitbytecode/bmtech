'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { marketingService } from '@/services/marketingService';
import type { Prospect } from '@/types/marketing';
import { DataTable } from '@/components/admin/DataTable';
import { Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/admin/PageHeader';
import { Pagination } from '@/components/admin/Pagination';
import { ExportActions } from '@/components/admin/ExportActions';
import { ProspectDetailModal } from '@/components/admin/ProspectDetailModal';
import { cn } from '@/lib/utils';

export default function RejectedProspectsPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalItems, setTotalItems] = useState(0);

  // Detail Modal
  const [detailProspect, setDetailProspect] = useState<Prospect | null>(null);

  const loadProspects = useCallback(async () => {
    setLoading(true);
    const { data, count } = await marketingService.getProspectsPaginated(page, pageSize, { status: 'rejected' });
    if (data) setProspects(data);
    if (count !== undefined) setTotalItems(count);
    setLoading(false);
  }, [page, pageSize]);

  useEffect(() => {
    loadProspects();
  }, [loadProspects]);

  const columns = [
    { header: 'Business Name', accessor: 'business_name' as keyof Prospect, className: 'font-bold max-w-[200px] truncate' },
    { header: 'Phone', accessor: (p: Prospect) => <span className="font-mono text-xs">{p.phone || '-'}</span> },
    { header: 'Country', accessor: 'country' as keyof Prospect },
    { header: 'Notes / Reason', accessor: (p: Prospect) => <span className="text-xs text-text-secondary truncate max-w-[250px] inline-block">{p.business_description || 'No reason specified'}</span> },
    { header: 'Rejected At', accessor: (p: Prospect) => <span className="text-xs text-text-secondary">{new Date(p.updated_at).toLocaleDateString()}</span> },
  ];

  const exportColumns = [
    { header: 'Business Name', accessor: 'business_name' as keyof Prospect },
    { header: 'Phone', accessor: 'phone' as keyof Prospect },
    { header: 'Website', accessor: 'website' as keyof Prospect },
    { header: 'Country', accessor: 'country' as keyof Prospect },
    { header: 'Reason', accessor: 'business_description' as keyof Prospect },
    { header: 'Rejected Date', accessor: (p: Prospect) => new Date(p.updated_at).toLocaleDateString() },
  ];

  return (
    <div className="flex flex-col h-full space-y-4">
      <PageHeader 
        title="Rejected Prospects" 
        description="History of businesses marked as not interested, invalid, or spam."
      >
        <ExportActions 
          data={prospects} 
          columns={exportColumns}
          filename="BMTech_Rejected_Prospects"
          reportTitle="Rejected Prospects Log"
        />
      </PageHeader>

      <div className="flex-1 min-h-0 bg-surface border border-border/50 rounded-lg shadow-sm flex flex-col">
        <DataTable
          columns={columns}
          data={prospects}
          isLoading={loading}
          onView={setDetailProspect}
        />
        <Pagination 
          currentPage={page}
          pageSize={pageSize}
          totalItems={totalItems}
          totalPages={Math.ceil(totalItems / pageSize)}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </div>

      <ProspectDetailModal
        prospect={detailProspect}
        isOpen={!!detailProspect}
        onClose={() => setDetailProspect(null)}
      />
    </div>
  );
}
