'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// ── Color palette for charts ──
const CHART_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#14b8a6', // teal
  '#6366f1', // indigo
  '#84cc16', // lime
  '#a855f7', // purple
];

// ═══════════════════════════════════════════════════════════
// HORIZONTAL BAR CHART
// ═══════════════════════════════════════════════════════════
interface BarChartItem {
  label: string;
  value: number;
  color?: string;
}

interface HorizontalBarChartProps {
  data: BarChartItem[];
  maxItems?: number;
  valueLabel?: string;
  className?: string;
}

export function HorizontalBarChart({
  data,
  maxItems = 10,
  valueLabel = 'Count',
  className,
}: HorizontalBarChartProps) {
  const items = data
    .sort((a, b) => b.value - a.value)
    .slice(0, maxItems);

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-text-secondary text-sm">
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...items.map((d) => d.value));

  return (
    <div className={cn('space-y-2.5', className)}>
      <div className="flex items-center justify-between text-[10px] text-text-secondary uppercase tracking-widest px-1">
        <span>Group</span>
        <span>{valueLabel}</span>
      </div>
      {items.map((item, idx) => {
        const pct = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        const color = item.color || CHART_COLORS[idx % CHART_COLORS.length];

        return (
          <div key={item.label} className="group">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[13px] font-medium text-text-primary truncate max-w-[60%]">
                {item.label}
              </span>
              <span className="text-[13px] font-bold text-text-primary tabular-nums">
                {item.value.toLocaleString()}
              </span>
            </div>
            <div className="h-6 bg-border/20 rounded-md overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, delay: idx * 0.05, ease: 'easeOut' }}
                className="h-full rounded-md relative overflow-hidden"
                style={{ backgroundColor: color }}
              >
                {/* Subtle shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </motion.div>
              {/* Percentage label inside bar */}
              {pct > 25 && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 + idx * 0.05 }}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/90"
                >
                  {Math.round(pct)}%
                </motion.span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// DONUT CHART (Canvas-based)
// ═══════════════════════════════════════════════════════════
interface DonutChartItem {
  label: string;
  value: number;
  color?: string;
}

interface DonutChartProps {
  data: DonutChartItem[];
  size?: number;
  centerLabel?: string;
  centerValue?: string | number;
  className?: string;
}

export function DonutChart({
  data,
  size = 200,
  centerLabel,
  centerValue,
  className,
}: DonutChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [animationProgress, setAnimationProgress] = useState(0);

  const filteredData = data.filter((d) => d.value > 0);
  const total = filteredData.reduce((s, d) => s + d.value, 0);

  // Animate on mount
  useEffect(() => {
    let start: number | null = null;
    const duration = 800;

    const animate = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimationProgress(eased);
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [data]);

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || total === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const outerRadius = (size / 2) - 8;
    const innerRadius = outerRadius * 0.62;

    ctx.clearRect(0, 0, size, size);

    // Draw background ring
    ctx.beginPath();
    ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
    ctx.arc(cx, cy, innerRadius, Math.PI * 2, 0, true);
    ctx.closePath();
    ctx.fillStyle = 'rgba(128, 128, 128, 0.06)';
    ctx.fill();

    // Draw segments
    let startAngle = -Math.PI / 2; // Start from top
    const endAngleLimit = startAngle + (Math.PI * 2 * animationProgress);

    filteredData.forEach((item, idx) => {
      const sliceAngle = (item.value / total) * Math.PI * 2;
      const actualEnd = Math.min(startAngle + sliceAngle, endAngleLimit);

      if (startAngle < endAngleLimit) {
        const color = item.color || CHART_COLORS[idx % CHART_COLORS.length];
        const isHovered = hoveredIndex === idx;
        const r = isHovered ? outerRadius + 3 : outerRadius;
        const ir = isHovered ? innerRadius - 2 : innerRadius;

        ctx.beginPath();
        ctx.arc(cx, cy, r, startAngle, actualEnd);
        ctx.arc(cx, cy, ir, actualEnd, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();

        // Subtle separator
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      startAngle += sliceAngle;
    });

    // Center text
    if (centerValue !== undefined) {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.font = `bold ${size * 0.14}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
      ctx.fillStyle = '#e2e8f0'; // text-primary-ish
      ctx.fillText(String(centerValue), cx, centerLabel ? cy - 6 : cy);

      if (centerLabel) {
        ctx.font = `500 ${size * 0.065}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
        ctx.fillStyle = '#94a3b8'; // text-secondary-ish
        ctx.fillText(centerLabel, cx, cy + size * 0.09);
      }
    }
  }, [filteredData, total, size, hoveredIndex, animationProgress, centerLabel, centerValue]);

  if (total === 0) {
    return (
      <div className="text-center py-8 text-text-secondary text-sm">
        No data available
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-6', className)}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className="shrink-0"
      />

      {/* Legend */}
      <div className="space-y-1.5 min-w-0 flex-1">
        {filteredData.map((item, idx) => {
          const color = item.color || CHART_COLORS[idx % CHART_COLORS.length];
          const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';

          return (
            <div
              key={item.label}
              className={cn(
                'flex items-center gap-2 px-2 py-1 rounded transition-colors cursor-default',
                hoveredIndex === idx ? 'bg-white/5' : ''
              )}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-[12px] text-text-secondary truncate flex-1">{item.label}</span>
              <span className="text-[12px] font-bold text-text-primary tabular-nums">{item.value}</span>
              <span className="text-[10px] text-text-secondary tabular-nums w-10 text-right">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SUMMARY STAT CARD (for reports)
// ═══════════════════════════════════════════════════════════
interface ReportStatProps {
  label: string;
  value: string | number;
  subValue?: string;
  accentColor?: string;
}

export function ReportStat({ label, value, subValue, accentColor = 'text-accent-blue' }: ReportStatProps) {
  return (
    <div className="p-4 bg-surface rounded-lg border border-border/50 hover:border-accent-blue/30 transition-colors">
      <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-widest block">
        {label}
      </span>
      <span className={cn('text-2xl font-black mt-1 block', accentColor)}>
        {value}
      </span>
      {subValue && (
        <span className="text-[11px] text-text-secondary block mt-0.5">{subValue}</span>
      )}
    </div>
  );
}
