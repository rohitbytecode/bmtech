'use client';

import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Loader2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { cn } from '@/lib/utils';

interface ExportColumn<T> {
  header: string;
  accessor: keyof T | ((item: T) => any);
}

interface ExportActionsProps<T> {
  data: T[];
  columns: ExportColumn<T>[];
  filename: string;
  reportTitle: string;
  filtersActive?: boolean;
  onFetchAll?: () => Promise<T[]>;
}

export function ExportActions<T>({
  data,
  columns,
  filename,
  reportTitle,
  filtersActive = false,
  onFetchAll,
}: ExportActionsProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<string | null>(null);

  // Helper to extract string values for export
  const extractValue = (item: T, accessor: keyof T | ((item: T) => any)): string => {
    try {
      const val = typeof accessor === 'function' ? accessor(item) : item[accessor];
      if (val === null || val === undefined) return '';
      if (typeof val === 'object') return JSON.stringify(val);
      return String(val);
    } catch (e) {
      return '';
    }
  };

  const exportExcel = async (exportAll: boolean = false) => {
    setIsExporting(true);
    setExportType(exportAll ? 'Excel (All)' : 'Excel');
    setIsOpen(false); // Close menu early to show loading state on main button
    try {
      // Small timeout to allow UI to show loading state
      await new Promise((resolve) => setTimeout(resolve, 100));

      const exportData = exportAll && onFetchAll ? await onFetchAll() : data;

      const rows = exportData.map((item) => {
        const rowData: Record<string, string> = {};
        columns.forEach((col) => {
          rowData[col.header] = extractValue(item, col.accessor);
        });
        return rowData;
      });

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
      
      const date = new Date().toISOString().split('T')[0];
      XLSX.writeFile(workbook, `${filename}_${date}.xlsx`);
    } catch (error) {
      console.error('Failed to export Excel:', error);
      alert('Failed to export to Excel.');
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  const exportPDF = async (exportAll: boolean = false) => {
    setIsExporting(true);
    setExportType(exportAll ? 'PDF (All)' : 'PDF');
    setIsOpen(false);
    try {
      await new Promise((resolve) => setTimeout(resolve, 100));

      const exportData = exportAll && onFetchAll ? await onFetchAll() : data;
      const generatedAt = new Date().toLocaleString();
      const dateShort = new Date().toISOString().split('T')[0];

      const doc = new jsPDF({ orientation: 'landscape' });
      const pageWidth = (doc.internal.pageSize as any).getWidth();
      const pageHeight = (doc.internal.pageSize as any).getHeight();
      const margin = 14;

      // ── Helper: Draw branded header on every page ──
      const drawHeader = (isFirstPage: boolean) => {
        // Top accent bar
        doc.setFillColor(219, 53, 69); // BMTech red
        doc.rect(0, 0, pageWidth, 4, 'F');

        // Brand name
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(219, 53, 69);
        doc.text('BMTech', margin, 16);

        // Thin separator line under header
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.3);
        doc.line(margin, 19, pageWidth - margin, 19);

        if (isFirstPage) {
          // Report title
          doc.setFontSize(15);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(30, 30, 30);
          doc.text(reportTitle, margin, 28);

          // Metadata row
          doc.setFontSize(8.5);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100, 100, 100);
          doc.text(`Generated: ${generatedAt}`, margin, 34);
          doc.text(`Total Records: ${exportData.length}`, margin + 80, 34);
          if (filtersActive) {
            doc.text('Filtered Report', margin + 140, 34);
            // small colored badge
            doc.setFillColor(255, 243, 205);
            doc.setDrawColor(255, 193, 7);
            doc.setLineWidth(0.2);
            doc.roundedRect(margin + 138, 30.5, 28, 5, 1, 1, 'FD');
            doc.setFontSize(7);
            doc.setTextColor(133, 100, 4);
            doc.text('FILTERED', margin + 140.5, 34);
          }

          // Report type badge
          const badgeText = exportAll ? 'FULL EXPORT' : 'PAGE EXPORT';
          const badgeColor = exportAll ? [16, 185, 129] : [59, 130, 246]; // emerald / blue
          doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
          doc.roundedRect(pageWidth - margin - 30, 10, 30, 6, 1.5, 1.5, 'F');
          doc.setFontSize(7);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(255, 255, 255);
          doc.text(badgeText, pageWidth - margin - 28, 14);
        }
      };

      // ── Helper: Draw footer on every page ──
      const drawFooter = (currentPage: number, totalPages: number) => {
        // Footer separator line
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.3);
        doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);

        // Left: branding
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(160, 160, 160);
        doc.text('BMTech \u00B7 Confidential', margin, pageHeight - 9);

        // Center: page number
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(100, 100, 100);
        const pageStr = `Page ${currentPage} of ${totalPages}`;
        const pageStrWidth = doc.getTextWidth(pageStr);
        doc.text(pageStr, (pageWidth - pageStrWidth) / 2, pageHeight - 9);

        // Right: date
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(160, 160, 160);
        const dateStr = generatedAt;
        const dateStrWidth = doc.getTextWidth(dateStr);
        doc.text(dateStr, pageWidth - margin - dateStrWidth, pageHeight - 9);
      };

      // ── Table data ──
      const tableData = exportData.map((item) =>
        columns.map((col) => extractValue(item, col.accessor))
      );

      // ── Draw first-page header ──
      drawHeader(true);

      // ── Generate the table ──
      let currentPageNum = 1;

      autoTable(doc, {
        startY: 40,
        margin: { top: 26, right: margin, bottom: 20, left: margin },
        head: [columns.map((col) => col.header)],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [15, 23, 42],   // slate-900
          textColor: [255, 255, 255],
          fontSize: 8,
          fontStyle: 'bold',
          cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },
          halign: 'left',
          lineColor: [30, 41, 59],   // slate-800
          lineWidth: 0.1,
        },
        bodyStyles: {
          fontSize: 7.5,
          textColor: [50, 50, 50],
          cellPadding: { top: 3, right: 3, bottom: 3, left: 3 },
          lineColor: [230, 230, 230],
          lineWidth: 0.1,
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252], // slate-50
        },
        styles: {
          overflow: 'linebreak',
          halign: 'left',
          valign: 'middle',
          font: 'helvetica',
        },
        columnStyles: {
          0: { minCellWidth: 35, fontStyle: 'bold', textColor: [20, 20, 20] }, // Business Name - bold
          1: { cellWidth: 28 },  // Phone
          2: { cellWidth: 35 },  // Email
          3: { cellWidth: 42 },  // Website
          4: { cellWidth: 18 },  // Country
          5: { cellWidth: 18 },  // City
          6: { cellWidth: 22 },  // Industry
          7: { cellWidth: 18 },  // Status
          8: { cellWidth: 16 },  // Priority
          9: { cellWidth: 16, halign: 'center' },  // Opp Score
        },
        didDrawPage: function () {
          const pageNum = (doc as any).internal.getNumberOfPages();
          if (pageNum > currentPageNum) {
            currentPageNum = pageNum;
            // Draw header on continuation pages
            drawHeader(false);
          }
        },
      });

      // ── Draw footers on ALL pages with correct "Page X of Y" ──
      const totalPages = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        drawFooter(i, totalPages);
      }

      doc.save(`${filename}_${dateShort}.pdf`);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to export to PDF.');
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting || data.length === 0}
        className="gap-2"
      >
        {isExporting ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Generating {exportType}...
          </>
        ) : (
          <>
            <Download size={14} />
            Export
          </>
        )}
        {!isExporting && <ChevronDown size={14} className={cn("transition-transform", isOpen && "rotate-180")} />}
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-surface border border-border ring-1 ring-black ring-opacity-5 z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="py-1" role="menu" aria-orientation="vertical">
              <button
                onClick={() => exportExcel(false)}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background hover:text-accent-blue transition-colors gap-2"
                role="menuitem"
              >
                <FileSpreadsheet size={14} className="text-emerald-500" />
                Export Page to Excel
              </button>
              <button
                onClick={() => exportPDF(false)}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background hover:text-accent-blue transition-colors gap-2 border-b border-border/50 pb-3 mb-1"
                role="menuitem"
              >
                <FileText size={14} className="text-rose-500" />
                Export Page to PDF
              </button>
              {onFetchAll && (
                <>
                  <button
                    onClick={() => exportExcel(true)}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background hover:text-accent-blue transition-colors gap-2 mt-1"
                    role="menuitem"
                  >
                    <FileSpreadsheet size={14} className="text-emerald-500" />
                    Export All Data to Excel
                  </button>
                  <button
                    onClick={() => exportPDF(true)}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background hover:text-accent-blue transition-colors gap-2"
                    role="menuitem"
                  >
                    <FileText size={14} className="text-rose-500" />
                    Export All Data to PDF
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
