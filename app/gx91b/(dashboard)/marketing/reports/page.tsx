'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { marketingService } from '@/services/marketingService';
import { PageHeader } from '@/components/admin/PageHeader';
import { ExportActions } from '@/components/admin/ExportActions';
import { HorizontalBarChart, DonutChart, ReportStat } from '@/components/admin/ReportChart';
import { Loader2, BarChart3, PieChart, Table2, RefreshCw, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SelectField } from '@/components/admin/FormFields';
import { cn } from '@/lib/utils';

type GroupByField = 'country' | 'state_region' | 'city' | 'industry' | 'status' | 'sales_priority';
type MetricType = 'count' | 'avgOpportunityScore' | 'avgDataQuality';

interface ReportGroup {
  count: number;
  avgOpportunityScore: number;
  avgDataQuality: number;
  statusBreakdown: Record<string, number>;
  prospects: any[];
}

const GROUP_BY_OPTIONS = [
  { label: 'Country', value: 'country' },
  { label: 'State / Region', value: 'state_region' },
  { label: 'City', value: 'city' },
  { label: 'Industry', value: 'industry' },
  { label: 'Status', value: 'status' },
  { label: 'Sales Priority', value: 'sales_priority' },
];

const METRIC_OPTIONS = [
  { label: 'Prospect Count', value: 'count' },
  { label: 'Avg Opportunity Score', value: 'avgOpportunityScore' },
  { label: 'Avg Data Quality', value: 'avgDataQuality' },
];

const STATUS_FILTER_OPTIONS = [
  { label: 'All Statuses', value: '' },
  { label: 'Discovered', value: 'discovered' },
  { label: 'Assigned', value: 'assigned' },
  { label: 'Qualified', value: 'qualified' },
  { label: 'Rejected', value: 'rejected' },
];

const PRIORITY_FILTER_OPTIONS = [
  { label: 'All Priorities', value: '' },
  { label: 'Very High', value: 'very_high' },
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
];

const groupByLabels: Record<string, string> = {
  country: 'Country',
  state_region: 'State / Region',
  city: 'City',
  industry: 'Industry',
  status: 'Status',
  sales_priority: 'Sales Priority',
};

const metricLabels: Record<string, string> = {
  count: 'Prospect Count',
  avgOpportunityScore: 'Avg Opportunity Score',
  avgDataQuality: 'Avg Data Quality',
};

export default function ReportsPage() {
  const [groupBy, setGroupBy] = useState<GroupByField>('country');
  const [metric, setMetric] = useState<MetricType>('count');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');

  const [reportData, setReportData] = useState<Record<string, ReportGroup>>({});
  const [totalProspects, setTotalProspects] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState<'bar' | 'donut'>('bar');

  const loadReport = useCallback(async () => {
    setLoading(true);
    const filters: any = {};
    if (statusFilter) filters.status = statusFilter;
    if (priorityFilter) filters.sales_priority = priorityFilter;
    if (countryFilter) filters.country = countryFilter;

    const { data, total } = await marketingService.getCustomReportData(groupBy, filters);
    setReportData(data);
    setTotalProspects(total);
    setLoading(false);
  }, [groupBy, statusFilter, priorityFilter, countryFilter]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  // ── Computed data ──
  const sortedEntries = Object.entries(reportData)
    .map(([label, data]) => ({
      label,
      value: data[metric],
      count: data.count,
      avgOpportunityScore: data.avgOpportunityScore,
      avgDataQuality: data.avgDataQuality,
    }))
    .sort((a, b) => b.value - a.value);

  const totalGroups = sortedEntries.length;
  const totalMetricSum = sortedEntries.reduce((s, e) => s + e.value, 0);
  const avgMetric = totalGroups > 0 ? Math.round(totalMetricSum / totalGroups) : 0;
  const maxMetric = sortedEntries.length > 0 ? sortedEntries[0].value : 0;
  const topGroup = sortedEntries.length > 0 ? sortedEntries[0].label : '-';

  // Chart data
  const barData = sortedEntries.map((e) => ({ label: e.label, value: e.value }));
  const donutData = sortedEntries.slice(0, 10).map((e) => ({ label: e.label, value: e.value }));

  // Export table data
  const exportColumns = [
    { header: groupByLabels[groupBy], accessor: 'label' as const },
    { header: 'Prospects', accessor: 'count' as const },
    { header: 'Avg Opp Score', accessor: 'avgOpportunityScore' as const },
    { header: 'Avg Data Quality', accessor: 'avgDataQuality' as const },
  ];

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Custom Reports"
        description="Build geographic and categorical reports for your prospects pipeline."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={loadReport}
          disabled={loading}
          className="gap-1.5"
        >
          <RefreshCw size={13} className={cn(loading && 'animate-spin')} />
          Refresh
        </Button>
      </PageHeader>

      {/* ── Report Builder ── */}
      <div className="bg-surface border border-border/50 rounded-xl p-5 mb-5 space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary uppercase tracking-widest">
          <Filter size={13} />
          Report Configuration
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              Group By
            </label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as GroupByField)}
              className="w-full px-3 py-2 bg-background border border-border/60 rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-blue/50 transition-colors"
            >
              {GROUP_BY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              Metric
            </label>
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value as MetricType)}
              className="w-full px-3 py-2 bg-background border border-border/60 rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-blue/50 transition-colors"
            >
              {METRIC_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border/60 rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-blue/50 transition-colors"
            >
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              Priority Filter
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border/60 rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-blue/50 transition-colors"
            >
              {PRIORITY_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              Country Search
            </label>
            <input
              type="text"
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              placeholder="e.g. India"
              className="w-full px-3 py-2 bg-background border border-border/60 rounded-lg text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-blue/50 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent-blue" />
          <span className="ml-3 text-lg font-medium text-text-secondary">Generating report...</span>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-5 pb-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ReportStat
              label="Total Prospects"
              value={totalProspects.toLocaleString()}
              accentColor="text-accent-blue"
            />
            <ReportStat
              label={`Total ${groupByLabels[groupBy]}s`}
              value={totalGroups}
              accentColor="text-indigo-400"
            />
            <ReportStat
              label={`Top ${groupByLabels[groupBy]}`}
              value={topGroup}
              subValue={`${maxMetric.toLocaleString()} ${metricLabels[metric].toLowerCase()}`}
              accentColor="text-emerald-500"
            />
            <ReportStat
              label={`Avg ${metricLabels[metric]}`}
              value={avgMetric.toLocaleString()}
              accentColor="text-amber-500"
            />
          </div>

          {/* Chart Toggle & Charts */}
          <div className="bg-surface border border-border/50 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border/40">
              <h3 className="text-sm font-bold text-text-primary">
                {metricLabels[metric]} by {groupByLabels[groupBy]}
              </h3>
              <div className="flex items-center bg-background border border-border/50 rounded-lg p-0.5">
                <button
                  onClick={() => setActiveChart('bar')}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all',
                    activeChart === 'bar'
                      ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/20'
                      : 'text-text-secondary hover:text-text-primary'
                  )}
                >
                  <BarChart3 size={12} />
                  Bar
                </button>
                <button
                  onClick={() => setActiveChart('donut')}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all',
                    activeChart === 'donut'
                      ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/20'
                      : 'text-text-secondary hover:text-text-primary'
                  )}
                >
                  <PieChart size={12} />
                  Donut
                </button>
              </div>
            </div>

            <div className="p-5">
              {activeChart === 'bar' ? (
                <HorizontalBarChart
                  data={barData}
                  maxItems={15}
                  valueLabel={metricLabels[metric]}
                />
              ) : (
                <div className="flex justify-center">
                  <DonutChart
                    data={donutData}
                    size={220}
                    centerValue={totalProspects}
                    centerLabel="Total"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-surface border border-border/50 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border/40">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <Table2 size={14} />
                Detailed Breakdown
              </h3>
              <ExportActions
                data={sortedEntries}
                columns={exportColumns}
                filename={`BMTech_Report_${groupBy}`}
                reportTitle={`Prospects by ${groupByLabels[groupBy]}`}
                filtersActive={!!statusFilter || !!priorityFilter || !!countryFilter}
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-max">
                <thead className="bg-background/95 sticky top-0 z-10">
                  <tr>
                    <th className="px-5 py-2.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">#</th>
                    <th className="px-5 py-2.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      {groupByLabels[groupBy]}
                    </th>
                    <th className="px-5 py-2.5 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">
                      Prospects
                    </th>
                    <th className="px-5 py-2.5 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">
                      Avg Opp Score
                    </th>
                    <th className="px-5 py-2.5 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">
                      Avg Data Quality
                    </th>
                    <th className="px-5 py-2.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Share
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {sortedEntries.map((entry, idx) => {
                    const pct = totalProspects > 0 ? ((entry.count / totalProspects) * 100).toFixed(1) : '0';
                    return (
                      <tr key={entry.label} className="hover:bg-background/50 transition-colors">
                        <td className="px-5 py-2.5 text-xs text-text-secondary font-mono">{idx + 1}</td>
                        <td className="px-5 py-2.5 text-sm font-semibold text-text-primary">{entry.label}</td>
                        <td className="px-5 py-2.5 text-sm text-text-primary font-bold text-right tabular-nums">
                          {entry.count.toLocaleString()}
                        </td>
                        <td className="px-5 py-2.5 text-sm text-right tabular-nums">
                          <span className={cn(
                            'font-semibold',
                            entry.avgOpportunityScore >= 70 ? 'text-emerald-500' :
                            entry.avgOpportunityScore >= 40 ? 'text-amber-500' :
                            'text-text-secondary'
                          )}>
                            {entry.avgOpportunityScore}
                          </span>
                        </td>
                        <td className="px-5 py-2.5 text-sm text-right tabular-nums">
                          <span className={cn(
                            'font-semibold',
                            entry.avgDataQuality >= 70 ? 'text-emerald-500' :
                            entry.avgDataQuality >= 40 ? 'text-amber-500' :
                            'text-text-secondary'
                          )}>
                            {entry.avgDataQuality}
                          </span>
                        </td>
                        <td className="px-5 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-border/30 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-accent-blue rounded-full transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-[11px] text-text-secondary font-mono w-10">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {sortedEntries.length === 0 && (
                <div className="text-center py-12 text-text-secondary text-sm">
                  No data found for the selected configuration.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
