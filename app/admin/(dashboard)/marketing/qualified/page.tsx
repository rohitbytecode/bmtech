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

export default function QualifiedLeadsPage() {
  const [leads, setLeads] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalItems, setTotalItems] = useState(0);

  // Detail Modal
  const [detailProspect, setDetailProspect] = useState<Prospect | null>(null);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    const { data, count } = await marketingService.getProspectsPaginated(page, pageSize, { status: 'qualified' });
    if (data) setLeads(data);
    if (count !== undefined) setTotalItems(count);
    setLoading(false);
  }, [page, pageSize]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const columns = [
    { header: 'Business Name', accessor: 'business_name' as keyof Prospect, className: 'font-bold max-w-[200px] truncate' },
    { header: 'Phone', accessor: (p: Prospect) => <span className="font-mono text-xs">{p.phone || '-'}</span> },
    { header: 'Country', accessor: 'country' as keyof Prospect },
    { header: 'Opportunity', accessor: (p: Prospect) => <span className="font-bold text-accent-blue">{p.opportunity_score || 'N/A'}</span> },
    { header: 'Priority', accessor: (p: Prospect) => (
      <span className={cn(
        "text-xs font-semibold",
        p.sales_priority === 'very_high' ? "text-accent-blue" :
        p.sales_priority === 'high' ? "text-emerald-500" :
        p.sales_priority === 'medium' ? "text-amber-500" :
        "text-text-secondary"
      )}>
        {p.sales_priority ? p.sales_priority.replace('_', ' ').toUpperCase() : '-'}
      </span>
    )},
    { header: 'Qualified At', accessor: (p: Prospect) => <span className="text-xs text-text-secondary">{new Date(p.updated_at).toLocaleDateString()}</span> },
  ];

  const exportColumns = [
    { header: 'Business Name', accessor: 'business_name' as keyof Prospect },
    { header: 'Phone', accessor: 'phone' as keyof Prospect },
    { header: 'Email', accessor: 'email' as keyof Prospect },
    { header: 'Website', accessor: 'website' as keyof Prospect },
    { header: 'Country', accessor: 'country' as keyof Prospect },
    { header: 'City', accessor: 'city' as keyof Prospect },
    { header: 'Opportunity Score', accessor: 'opportunity_score' as keyof Prospect },
    { header: 'Qualified Date', accessor: (p: Prospect) => new Date(p.updated_at).toLocaleDateString() },
  ];

  return (
    <div className="flex flex-col h-full space-y-4">
      <PageHeader 
        title="Qualified Leads" 
        description="Prospects marked as INTERESTED by the calling team."
      >
        <ExportActions 
          data={leads} 
          columns={exportColumns}
          filename="BMTech_Qualified_Leads"
          reportTitle="Qualified Leads Report"
        />
      </PageHeader>

      <div className="flex-1 min-h-0 bg-surface border border-border/50 rounded-lg shadow-sm flex flex-col">
        <DataTable
          columns={columns}
          data={leads}
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
