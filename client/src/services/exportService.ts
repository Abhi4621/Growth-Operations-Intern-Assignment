import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Lead } from '../../../shared/types.js';

export const exportService = {
  // Export Leads to CSV
  exportLeadsToCSV: (leads: Lead[], filename = 'growthops-leads.csv') => {
    const headers = [
      'Business Name',
      'Website',
      'Contact Person or Role',
      'Business Problem',
      'Outreach Status',
      'Last Action Date',
      'Next Follow-up Date',
      'Priority',
      'Next Action',
      'Reason for Priority'
    ];

    const rows = leads.map(l => [
      `"${(l.businessName || '').replace(/"/g, '""')}"`,
      `"${(l.website || '').replace(/"/g, '""')}"`,
      `"${(l.contactPerson || '').replace(/"/g, '""')}"`,
      `"${(l.businessProblem || '').replace(/"/g, '""')}"`,
      `"${(l.outreachStatus || '').replace(/"/g, '""')}"`,
      `"${l.lastActionDate || ''}"`,
      `"${l.nextFollowUpDate || ''}"`,
      `"${l.priority || ''}"`,
      `"${(l.nextAction || '').replace(/"/g, '""')}"`,
      `"${(l.reasonForPriority || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // Export Leads to Excel (.xlsx)
  exportLeadsToExcel: (leads: Lead[], filename = 'growthops-operations-tracker.xlsx') => {
    const formattedData = leads.map(l => ({
      'Business Name': l.businessName,
      'Website': l.website,
      'Contact Person': l.contactPerson,
      'Business Problem': l.businessProblem,
      'Outreach Status': l.outreachStatus,
      'Last Action Date': l.lastActionDate,
      'Next Follow-up Date': l.nextFollowUpDate,
      'Priority': l.priority,
      'Next Action': l.nextAction,
      'Reason for Priority': l.reasonForPriority,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    // Adjust column widths
    worksheet['!cols'] = [
      { wch: 18 }, // Business Name
      { wch: 22 }, // Website
      { wch: 24 }, // Contact
      { wch: 35 }, // Problem
      { wch: 16 }, // Status
      { wch: 14 }, // Last Action
      { wch: 16 }, // Next Follow-up
      { wch: 10 }, // Priority
      { wch: 35 }, // Next Action
      { wch: 40 }, // Reason
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Operations Tracker');
    XLSX.writeFile(workbook, filename);
  },

  // Export Founder Update to PDF
  exportFounderUpdateToPDF: async (elementId: string, filename = 'Founder-Update-Memo.pdf') => {
    const element = document.getElementById(elementId);
    if (!element) {
      window.print();
      return;
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(filename);
    } catch (err) {
      console.warn('Direct PDF canvas generation encountered issue, invoking browser print dialog:', err);
      window.print();
    }
  },
};
