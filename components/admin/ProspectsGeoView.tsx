'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, MapPin, Building2, Globe, TrendingUp, Users, ExternalLink, CheckCircle, XCircle, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import type { Prospect } from '@/types/marketing';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

// Country ISO 2-letter codes for flagcdn
const countryCodes: Record<string, string> = {
  'United States': 'us', 'USA': 'us', 'US': 'us',
  'United Kingdom': 'gb', 'UK': 'gb', 'GB': 'gb',
  'Canada': 'ca', 'CA': 'ca',
  'Australia': 'au', 'AU': 'au',
  'India': 'in', 'IN': 'in',
  'Germany': 'de', 'DE': 'de',
  'France': 'fr', 'FR': 'fr',
  'Japan': 'jp', 'JP': 'jp',
  'Brazil': 'br', 'BR': 'br',
  'Mexico': 'mx', 'MX': 'mx',
  'Spain': 'es', 'ES': 'es',
  'Italy': 'it', 'IT': 'it',
  'Netherlands': 'nl', 'NL': 'nl',
  'Singapore': 'sg', 'SG': 'sg',
  'UAE': 'ae', 'United Arab Emirates': 'ae',
  'South Africa': 'za', 'ZA': 'za',
  'China': 'cn', 'CN': 'cn',
  'South Korea': 'kr', 'KR': 'kr',
  'Indonesia': 'id', 'ID': 'id',
  'Philippines': 'ph', 'PH': 'ph',
  'Thailand': 'th', 'TH': 'th',
  'Vietnam': 'vn', 'VN': 'vn',
  'Pakistan': 'pk', 'PK': 'pk',
  'Bangladesh': 'bd', 'BD': 'bd',
  'Nigeria': 'ng', 'NG': 'ng',
  'Egypt': 'eg', 'EG': 'eg',
  'Russia': 'ru', 'RU': 'ru',
  'Turkey': 'tr', 'TR': 'tr',
  'Saudi Arabia': 'sa', 'SA': 'sa',
};

function CountryFlag({ country, className }: { country: string; className?: string }) {
  if (country === 'Unknown') {
    return (
      <div className={cn("flex items-center justify-center text-accent-blue bg-accent-blue/10 rounded-full", className)}>
        <Globe size={18} />
      </div>
    );
  }

  const code = countryCodes[country];
  if (!code) {
    return (
      <div className={cn("flex items-center justify-center text-text-secondary bg-surface border border-border rounded-sm", className)}>
        <MapPin size={16} />
      </div>
    );
  }

  return (
    <img
      src={`https://flagcdn.com/${code}.svg`}
      alt={`${country} flag`}
      className={cn("object-cover rounded-sm border border-border/50", className)}
      loading="lazy"
    />
  );
}

const statusColors: Record<string, { bg: string; text: string; bar: string }> = {
  discovered: { bg: 'bg-amber-500/10', text: 'text-amber-500', bar: 'bg-amber-500' },
  assigned: { bg: 'bg-blue-500/10', text: 'text-blue-500', bar: 'bg-blue-500' },
  qualified: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', bar: 'bg-emerald-500' },
  rejected: { bg: 'bg-rose-500/10', text: 'text-rose-500', bar: 'bg-rose-500' },
  calling: { bg: 'bg-indigo-500/10', text: 'text-indigo-500', bar: 'bg-indigo-500' },
  callback_required: { bg: 'bg-orange-500/10', text: 'text-orange-500', bar: 'bg-orange-500' },
  validating: { bg: 'bg-cyan-500/10', text: 'text-cyan-500', bar: 'bg-cyan-500' },
  ready_for_call: { bg: 'bg-teal-500/10', text: 'text-teal-500', bar: 'bg-teal-500' },
};

interface GeoHierarchy {
  [country: string]: {
    count: number;
    states: {
      [state: string]: {
        count: number;
        cities: {
          [city: string]: {
            count: number;
            prospects: Prospect[];
          };
        };
      };
    };
    statusBreakdown: Record<string, number>;
    avgOpportunityScore: number;
  };
}

interface ProspectsGeoViewProps {
  hierarchy: GeoHierarchy;
  total: number;
  isLoading: boolean;
  onViewProspect: (prospect: Prospect) => void;
  onEditProspect: (prospect: Prospect) => void;
  onAssignProspect: (prospect: Prospect) => void;
  onApproveProspect: (prospect: Prospect) => void;
  onRejectProspect: (prospect: Prospect) => void;
  onDeleteProspect: (prospect: Prospect) => void;
}

function StatusBar({ breakdown, total }: { breakdown: Record<string, number>; total: number }) {
  if (total === 0) return null;
  const entries = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);

  return (
    <div className="flex items-center gap-1.5 mt-2">
      <div className="flex-1 h-2 bg-border/30 rounded-full overflow-hidden flex">
        {entries.map(([status, count]) => {
          const colors = statusColors[status] || statusColors.discovered;
          const pct = (count / total) * 100;
          return (
            <div
              key={status}
              className={cn('h-full transition-all duration-500', colors.bar)}
              style={{ width: `${pct}%` }}
              title={`${status}: ${count}`}
            />
          );
        })}
      </div>
    </div>
  );
}

function StatusLegend({ breakdown }: { breakdown: Record<string, number> }) {
  const entries = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
      {entries.map(([status, count]) => {
        const colors = statusColors[status] || statusColors.discovered;
        return (
          <div key={status} className="flex items-center gap-1.5">
            <div className={cn('w-2 h-2 rounded-full', colors.bar)} />
            <span className="text-[10px] text-text-secondary capitalize">
              {status.replace(/_/g, ' ')} <span className="font-bold text-text-primary">{count}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Country Card ──
function CountryCard({
  country,
  data,
  isExpanded,
  onToggle,
  onViewProspect,
  onEditProspect,
  onAssignProspect,
  onApproveProspect,
  onRejectProspect,
  onDeleteProspect,
}: {
  country: string;
  data: GeoHierarchy[string];
  isExpanded: boolean;
  onToggle: () => void;
  onViewProspect: (p: Prospect) => void;
  onEditProspect: (p: Prospect) => void;
  onAssignProspect: (p: Prospect) => void;
  onApproveProspect: (p: Prospect) => void;
  onRejectProspect: (p: Prospect) => void;
  onDeleteProspect: (p: Prospect) => void;
}) {
  const stateCount = Object.keys(data.states).length;
  const cityCount = Object.values(data.states).reduce(
    (acc, s) => acc + Object.keys(s.cities).length, 0
  );

  return (
    <motion.div
      layout
      className={cn(
        'rounded-xl border transition-all duration-300',
        isExpanded
          ? 'border-accent-blue/40 bg-accent-blue/[0.02] shadow-lg shadow-accent-blue/5 col-span-full'
          : 'border-border/50 bg-surface hover:border-accent-blue/30 hover:shadow-md hover:shadow-accent-blue/5'
      )}
    >
      {/* Country Header */}
      <button
        onClick={onToggle}
        className="w-full text-left p-5 group"
      >
        <div className="flex items-center gap-3 mb-2">
          <CountryFlag country={country} className="w-8 h-8" />
          <h3 className="text-lg font-bold text-text-primary tracking-tight truncate flex-1">
            {country}
          </h3>
          <div className="shrink-0 px-3 py-1 bg-accent-blue/10 border border-accent-blue/20 rounded-lg text-center">
            <span className="text-xl font-black text-accent-blue leading-none">{data.count}</span>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-text-secondary shrink-0"
          >
            <ChevronRight size={16} />
          </motion.div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
          <span className="flex items-center gap-1">
            <Users size={12} className="text-accent-blue" />
            <span className="font-bold text-text-primary">{data.count}</span> prospects
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={12} />
            {stateCount} {stateCount === 1 ? 'state' : 'states'}
          </span>
          <span className="flex items-center gap-1">
            <Building2 size={12} />
            {cityCount} {cityCount === 1 ? 'city' : 'cities'}
          </span>
          {data.avgOpportunityScore > 0 && (
            <span className="flex items-center gap-1">
              <TrendingUp size={12} className="text-emerald-500" />
              <span className="font-semibold text-emerald-500">{data.avgOpportunityScore}</span> avg opp
            </span>
          )}
        </div>

        <StatusBar breakdown={data.statusBreakdown} total={data.count} />
        {isExpanded && <StatusLegend breakdown={data.statusBreakdown} />}
      </button>

      {/* Expanded: States */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
            animate={{ height: 'auto', opacity: 1, overflow: 'visible' }}
            exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="w-full"
          >
            <div className="px-5 pb-5 space-y-3">
              <div className="h-px bg-border/50" />
              {Object.entries(data.states)
                .sort((a, b) => b[1].count - a[1].count)
                .map(([state, stateData]) => (
                  <StateCard
                    key={state}
                    state={state}
                    data={stateData}
                    onViewProspect={onViewProspect}
                    onEditProspect={onEditProspect}
                    onAssignProspect={onAssignProspect}
                    onApproveProspect={onApproveProspect}
                    onRejectProspect={onRejectProspect}
                    onDeleteProspect={onDeleteProspect}
                  />
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── State Card ──
function StateCard({
  state,
  data,
  onViewProspect,
  onEditProspect,
  onAssignProspect,
  onApproveProspect,
  onRejectProspect,
  onDeleteProspect,
}: {
  state: string;
  data: GeoHierarchy[string]['states'][string];
  onViewProspect: (p: Prospect) => void;
  onEditProspect: (p: Prospect) => void;
  onAssignProspect: (p: Prospect) => void;
  onApproveProspect: (p: Prospect) => void;
  onRejectProspect: (p: Prospect) => void;
  onDeleteProspect: (p: Prospect) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const cityCount = Object.keys(data.cities).length;

  return (
    <div className={cn(
      'rounded-lg border transition-all duration-200',
      isExpanded ? 'border-indigo-500/30 bg-indigo-500/[0.03]' : 'border-border/40 bg-background/50 hover:border-indigo-500/20'
    )}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left px-4 py-3 flex items-center gap-3"
      >
        <div className="h-8 w-8 rounded-md bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
          <MapPin size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-text-primary truncate">{state}</span>
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.15 }}
              className="text-text-secondary"
            >
              <ChevronRight size={14} />
            </motion.div>
          </div>
          <span className="text-[11px] text-text-secondary">
            {data.count} prospects · {cityCount} {cityCount === 1 ? 'city' : 'cities'}
          </span>
        </div>
        <span className="text-sm font-black text-indigo-400 px-2.5 py-1 bg-indigo-500/10 rounded-md">
          {data.count}
        </span>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
            animate={{ height: 'auto', opacity: 1, overflow: 'visible' }}
            exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="w-full"
          >
            <div className="px-4 pb-4 space-y-2">
              <div className="h-px bg-border/40" />
              {Object.entries(data.cities)
                .sort((a, b) => b[1].count - a[1].count)
                .map(([city, cityData]) => (
                  <CityCard
                    key={city}
                    city={city}
                    data={cityData}
                    onViewProspect={onViewProspect}
                    onEditProspect={onEditProspect}
                    onAssignProspect={onAssignProspect}
                    onApproveProspect={onApproveProspect}
                    onRejectProspect={onRejectProspect}
                    onDeleteProspect={onDeleteProspect}
                  />
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── City Card ──
function CityCard({
  city,
  data,
  onViewProspect,
  onEditProspect,
  onAssignProspect,
  onApproveProspect,
  onRejectProspect,
  onDeleteProspect,
}: {
  city: string;
  data: { count: number; prospects: Prospect[] };
  onViewProspect: (p: Prospect) => void;
  onEditProspect: (p: Prospect) => void;
  onAssignProspect: (p: Prospect) => void;
  onApproveProspect: (p: Prospect) => void;
  onRejectProspect: (p: Prospect) => void;
  onDeleteProspect: (p: Prospect) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={cn(
      'rounded-lg border transition-all duration-200',
      isExpanded ? 'border-emerald-500/30 bg-emerald-500/[0.03]' : 'border-border/30 bg-surface/50 hover:border-emerald-500/20'
    )}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left px-3 py-2.5 flex items-center gap-2.5"
      >
        <div className="h-6 w-6 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
          <Building2 size={12} />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[13px] font-semibold text-text-primary truncate block">{city}</span>
        </div>
        <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
          {data.count}
        </span>
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.15 }}
          className="text-text-secondary"
        >
          <ChevronRight size={12} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
            animate={{ height: 'auto', opacity: 1, overflow: 'visible' }}
            exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="w-full"
          >
            <div className="px-3 pb-3">
              <div className="h-px bg-border/30 mb-2" />
              <div className="space-y-1.5">
                {data.prospects.map((p) => (
                  <ProspectRow
                    key={p.id}
                    prospect={p}
                    onView={onViewProspect}
                    onEdit={onEditProspect}
                    onAssign={onAssignProspect}
                    onApprove={onApproveProspect}
                    onReject={onRejectProspect}
                    onDelete={onDeleteProspect}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Prospect Row ──
function ProspectRow({
  prospect,
  onView,
  onEdit,
  onAssign,
  onApprove,
  onReject,
  onDelete,
}: {
  prospect: Prospect;
  onView: (p: Prospect) => void;
  onEdit: (p: Prospect) => void;
  onAssign: (p: Prospect) => void;
  onApprove: (p: Prospect) => void;
  onReject: (p: Prospect) => void;
  onDelete: (p: Prospect) => void;
}) {
  const colors = statusColors[prospect.status] || statusColors.discovered;

  return (
    <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-md bg-background/60 border border-border/30 hover:border-accent-blue/30 group transition-all duration-150">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-text-primary truncate">{prospect.business_name}</span>
          <span className={cn(
            'px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shrink-0',
            colors.bg, colors.text
          )}>
            {prospect.status.replace(/_/g, ' ')}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-[11px] text-text-secondary">
          {prospect.phone && <span>{prospect.phone}</span>}
          {prospect.industry && <span className="truncate max-w-[120px]">{prospect.industry}</span>}
          {prospect.opportunity_score != null && (
            <span className="font-mono text-emerald-500">Opp: {prospect.opportunity_score}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 relative z-10">
        <button
          onClick={(e) => { e.stopPropagation(); onApprove(prospect); }}
          title="Mark as Qualified"
          className="h-6 w-6 rounded flex items-center justify-center text-accent-blue hover:bg-accent-blue/10 transition-colors"
        >
          <CheckCircle size={12} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onReject(prospect); }}
          title="Mark as Rejected"
          className="h-6 w-6 rounded flex items-center justify-center text-rose-500 hover:bg-rose-500/10 transition-colors"
        >
          <XCircle size={12} />
        </button>
        <ActionDropdown>
          <button
            onClick={(e) => { e.stopPropagation(); onAssign(prospect); }}
            className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-text-primary hover:bg-background transition-colors text-left"
          >
            <Users size={12} className="text-emerald-500" /> Assign
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onView(prospect); }}
            className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-text-primary hover:bg-background transition-colors text-left"
          >
            <ExternalLink size={12} className="text-accent-blue" /> View Details
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(prospect); }}
            className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-text-primary hover:bg-background transition-colors text-left"
          >
            <Edit2 size={12} className="text-text-secondary" /> Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(prospect); }}
            className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-rose-500 hover:bg-rose-500/10 transition-colors text-left"
          >
            <Trash2 size={12} /> Delete
          </button>
        </ActionDropdown>
      </div>
    </div>
  );
}

// ── Loading Skeleton ──
function GeoSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="rounded-xl border border-border/30 bg-surface p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-border/30" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-border/30 rounded w-2/3" />
              <div className="h-3 bg-border/20 rounded w-1/2" />
            </div>
          </div>
          <div className="h-2 bg-border/20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ── Main Component ──
export function ProspectsGeoView({
  hierarchy,
  total,
  isLoading,
  onViewProspect,
  onEditProspect,
  onAssignProspect,
  onApproveProspect,
  onRejectProspect,
  onDeleteProspect,
}: ProspectsGeoViewProps) {
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);

  if (isLoading) return <GeoSkeleton />;

  const countries = Object.entries(hierarchy)
    .sort((a, b) => {
      // Push "Unknown" to the end
      if (a[0] === 'Unknown') return 1;
      if (b[0] === 'Unknown') return -1;
      return b[1].count - a[1].count;
    });

  if (countries.length === 0) {
    return (
      <div className="w-full bg-surface border border-border/50 rounded-xl p-12 flex flex-col items-center justify-center text-center">
        <div className="h-16 w-16 bg-accent-blue/5 rounded-2xl flex items-center justify-center text-accent-blue/40 mb-4">
          <Globe size={32} />
        </div>
        <h3 className="text-base font-bold text-text-primary mb-1">No geographic data</h3>
        <p className="text-sm text-text-secondary max-w-sm">
          Prospects don&apos;t have location data yet. Add country, state, and city info to see them categorized here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="flex items-center gap-6 px-1 text-xs text-text-secondary">
        <span className="flex items-center gap-1.5">
          <Globe size={14} className="text-accent-blue" />
          <span className="font-bold text-text-primary text-sm">{countries.length}</span> countries
        </span>
        <span className="flex items-center gap-1.5">
          <Users size={14} className="text-emerald-500" />
          <span className="font-bold text-text-primary text-sm">{total}</span> total prospects
        </span>
        <div className="flex-1" />
        <span className="text-[10px] text-text-secondary/60">Click a country to drill down</span>
      </div>

      {/* Country Grid */}
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {countries.map(([country, data]) => (
          <CountryCard
            key={country}
            country={country}
            data={data}
            isExpanded={expandedCountry === country}
            onToggle={() => setExpandedCountry(expandedCountry === country ? null : country)}
            onViewProspect={onViewProspect}
            onEditProspect={onEditProspect}
            onAssignProspect={onAssignProspect}
            onApproveProspect={onApproveProspect}
            onRejectProspect={onRejectProspect}
            onDeleteProspect={onDeleteProspect}
          />
        ))}
      </motion.div>
    </div>
  );
}

function ActionDropdown({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [openUpwards, setOpenUpwards] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // If there's less than 160px of space below, open upwards
      setOpenUpwards(spaceBelow < 160);
    }
    setOpen(!open);
  };

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        onClick={toggleOpen}
        className="h-6 w-6 rounded flex items-center justify-center text-text-secondary hover:text-accent-blue hover:bg-accent-blue/10 transition-colors"
      >
        <MoreVertical size={12} />
      </button>
      {open && (
        <div className={cn(
          "absolute right-0 w-36 rounded-md bg-surface border border-border shadow-lg z-50 py-1 flex flex-col items-stretch overflow-hidden",
          openUpwards ? "bottom-full mb-1" : "top-full mt-1"
        )}>
          {children}
        </div>
      )}
    </div>
  );
}
