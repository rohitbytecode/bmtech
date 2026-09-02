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
}

export function ExportActions<T>({
  data,
  columns,
  filename,
  reportTitle,
  filtersActive = false,
}: ExportActionsProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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

  const exportExcel = async () => {
    setIsExporting(true);
    try {
      // Small timeout to allow UI to show loading state
      await new Promise((resolve) => setTimeout(resolve, 100));

      const rows = data.map((item) => {
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
      setIsOpen(false);
    }
  };

  const exportPDF = async () => {
    setIsExporting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 100));

      const doc = new jsPDF({ orientation: 'landscape' });
      
      // BMTech Branding Header
      doc.setFontSize(20);
      doc.setTextColor(219, 53, 69); // #db3545 (Accent Blue/Red theme)
      doc.text('BMTech', 14, 22);
      
      doc.setFontSize(14);
      doc.setTextColor(13, 13, 13); // text-primary
      doc.text(reportTitle, 14, 32);
      
      doc.setFontSize(10);
      doc.setTextColor(75, 85, 99); // text-secondary
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 40);
      
      if (filtersActive) {
        doc.text('Note: This report reflects active filters.', 14, 46);
      }

      const tableData = data.map((item) =>
        columns.map((col) => extractValue(item, col.accessor))
      );

      autoTable(doc, {
        startY: 55,
        head: [columns.map((col) => col.header)],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [15, 22, 41], // Dark header background
          textColor: 255,
          fontSize: 9,
          fontStyle: 'bold',
        },
        bodyStyles: {
          fontSize: 8,
          textColor: 50,
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251],
        },
        styles: {
          cellPadding: 3,
        },
        didDrawPage: function (data: any) {
          // Footer
          const str = 'Page ' + (doc as any).internal.getNumberOfPages();
          doc.setFontSize(8);
          doc.setTextColor(150);
          const pageSize = (doc as any).internal.pageSize;
          const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
          doc.text(str, data.settings.margin.left, pageHeight - 10);
        },
      });

      const date = new Date().toISOString().split('T')[0];
      doc.save(`${filename}_${date}.pdf`);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to export to PDF.');
    } finally {
      setIsExporting(false);
      setIsOpen(false);
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
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Download size={14} />
        )}
        Export
        <ChevronDown size={14} className={cn("transition-transform", isOpen && "rotate-180")} />
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-surface border border-border ring-1 ring-black ring-opacity-5 z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="py-1" role="menu" aria-orientation="vertical">
              <button
                onClick={exportExcel}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background hover:text-accent-blue transition-colors gap-2"
                role="menuitem"
              >
                <FileSpreadsheet size={14} className="text-emerald-500" />
                Export to Excel
              </button>
              <button
                onClick={exportPDF}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background hover:text-accent-blue transition-colors gap-2"
                role="menuitem"
              >
                <FileText size={14} className="text-rose-500" />
                Export to PDF
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
