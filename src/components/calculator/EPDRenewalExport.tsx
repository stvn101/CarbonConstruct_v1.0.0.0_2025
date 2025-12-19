/**
 * EPD Renewal Export Component
 * Generates a bulk export of materials needing EPD updates for procurement teams
 */

import { Download, FileSpreadsheet, FileJson, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface ExpiryWarning {
  id: string;
  materialName: string;
  epdNumber?: string;
  manufacturer?: string;
  expiryDate: string;
  daysUntil: number;
  status: 'expired' | 'critical' | 'warning' | 'upcoming';
}

interface EPDRenewalExportProps {
  expiryWarnings: ExpiryWarning[];
  projectName?: string;
}

export function EPDRenewalExport({ expiryWarnings, projectName = 'Project' }: EPDRenewalExportProps) {
  const { toast } = useToast();

  if (expiryWarnings.length === 0) return null;

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'expired': return 'EXPIRED';
      case 'critical': return 'CRITICAL (≤30 days)';
      case 'warning': return 'WARNING (≤90 days)';
      case 'upcoming': return 'UPCOMING (≤180 days)';
      default: return status.toUpperCase();
    }
  };

  const generateCSV = () => {
    const headers = [
      'Material Name',
      'EPD Number',
      'Manufacturer',
      'Expiry Date',
      'Days Until Expiry',
      'Status',
      'Priority',
      'Action Required'
    ].join(',');

    const rows = expiryWarnings.map(warning => {
      const priority = warning.status === 'expired' ? 'URGENT' : 
                      warning.status === 'critical' ? 'HIGH' : 
                      warning.status === 'warning' ? 'MEDIUM' : 'LOW';
      
      const action = warning.status === 'expired' 
        ? 'Contact supplier immediately for updated EPD'
        : warning.status === 'critical'
        ? 'Initiate EPD renewal process'
        : warning.status === 'warning'
        ? 'Schedule EPD renewal with supplier'
        : 'Monitor and plan for future renewal';

      return [
        `"${warning.materialName.replace(/"/g, '""')}"`,
        `"${warning.epdNumber || 'N/A'}"`,
        `"${warning.manufacturer || 'N/A'}"`,
        warning.expiryDate,
        warning.daysUntil,
        getStatusLabel(warning.status),
        priority,
        `"${action}"`
      ].join(',');
    });

    return [headers, ...rows].join('\n');
  };

  const generateJSON = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      projectName,
      summary: {
        total: expiryWarnings.length,
        expired: expiryWarnings.filter(w => w.status === 'expired').length,
        critical: expiryWarnings.filter(w => w.status === 'critical').length,
        warning: expiryWarnings.filter(w => w.status === 'warning').length,
        upcoming: expiryWarnings.filter(w => w.status === 'upcoming').length,
      },
      materials: expiryWarnings.map(warning => ({
        materialName: warning.materialName,
        epdNumber: warning.epdNumber || null,
        manufacturer: warning.manufacturer || null,
        expiryDate: warning.expiryDate,
        daysUntilExpiry: warning.daysUntil,
        status: warning.status,
        priority: warning.status === 'expired' ? 'urgent' : 
                 warning.status === 'critical' ? 'high' : 
                 warning.status === 'warning' ? 'medium' : 'low',
      })),
    };
    return JSON.stringify(exportData, null, 2);
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const csv = generateCSV();
    const filename = `epd-renewal-list-${projectName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`;
    downloadFile(csv, filename, 'text/csv;charset=utf-8');
    toast({
      title: "Export Complete",
      description: `EPD renewal list exported as CSV (${expiryWarnings.length} materials)`,
    });
  };

  const handleExportJSON = () => {
    const json = generateJSON();
    const filename = `epd-renewal-list-${projectName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
    downloadFile(json, filename, 'application/json');
    toast({
      title: "Export Complete",
      description: `EPD renewal list exported as JSON (${expiryWarnings.length} materials)`,
    });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "Print Blocked",
        description: "Please allow popups to print the EPD renewal list",
        variant: "destructive",
      });
      return;
    }

    const expiredItems = expiryWarnings.filter(w => w.status === 'expired');
    const criticalItems = expiryWarnings.filter(w => w.status === 'critical');
    const warningItems = expiryWarnings.filter(w => w.status === 'warning');
    const upcomingItems = expiryWarnings.filter(w => w.status === 'upcoming');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>EPD Renewal List - ${projectName}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; max-width: 210mm; margin: 0 auto; }
          h1 { color: #1a1a1a; border-bottom: 2px solid #b91c1c; padding-bottom: 8px; }
          .header { margin-bottom: 20px; }
          .summary { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
          .summary-item { padding: 8px 12px; border-radius: 4px; font-size: 12px; }
          .expired { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
          .critical { background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; }
          .warning { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
          .upcoming { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 11px; }
          th, td { padding: 8px; border: 1px solid #e5e7eb; text-align: left; }
          th { background: #f9fafb; font-weight: 600; }
          .section-title { margin-top: 24px; font-size: 14px; font-weight: 600; color: #374151; }
          .footer { margin-top: 24px; font-size: 10px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 12px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>⚠️ EPD Renewal List for Procurement</h1>
          <p><strong>Project:</strong> ${projectName}</p>
          <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="summary">
          ${expiredItems.length > 0 ? `<div class="summary-item expired"><strong>${expiredItems.length}</strong> Expired</div>` : ''}
          ${criticalItems.length > 0 ? `<div class="summary-item critical"><strong>${criticalItems.length}</strong> Critical (≤30 days)</div>` : ''}
          ${warningItems.length > 0 ? `<div class="summary-item warning"><strong>${warningItems.length}</strong> Warning (≤90 days)</div>` : ''}
          ${upcomingItems.length > 0 ? `<div class="summary-item upcoming"><strong>${upcomingItems.length}</strong> Upcoming (≤180 days)</div>` : ''}
        </div>

        ${expiredItems.length > 0 ? `
          <div class="section-title" style="color: #b91c1c;">🚨 Expired EPDs (Immediate Action Required)</div>
          <table>
            <thead>
              <tr><th>Material</th><th>EPD Number</th><th>Manufacturer</th><th>Expired On</th><th>Days Overdue</th></tr>
            </thead>
            <tbody>
              ${expiredItems.map(w => `
                <tr style="background: #fef2f2;">
                  <td><strong>${w.materialName}</strong></td>
                  <td style="font-family: monospace;">${w.epdNumber || '-'}</td>
                  <td>${w.manufacturer || '-'}</td>
                  <td>${new Date(w.expiryDate).toLocaleDateString()}</td>
                  <td style="color: #b91c1c; font-weight: 600;">${Math.abs(w.daysUntil)} days</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}

        ${criticalItems.length > 0 ? `
          <div class="section-title" style="color: #c2410c;">⚡ Critical - Expiring Within 30 Days</div>
          <table>
            <thead>
              <tr><th>Material</th><th>EPD Number</th><th>Manufacturer</th><th>Expiry Date</th><th>Days Left</th></tr>
            </thead>
            <tbody>
              ${criticalItems.map(w => `
                <tr style="background: #fff7ed;">
                  <td><strong>${w.materialName}</strong></td>
                  <td style="font-family: monospace;">${w.epdNumber || '-'}</td>
                  <td>${w.manufacturer || '-'}</td>
                  <td>${new Date(w.expiryDate).toLocaleDateString()}</td>
                  <td style="color: #c2410c; font-weight: 600;">${w.daysUntil} days</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}

        ${warningItems.length > 0 ? `
          <div class="section-title" style="color: #b45309;">⏰ Warning - Expiring Within 90 Days</div>
          <table>
            <thead>
              <tr><th>Material</th><th>EPD Number</th><th>Manufacturer</th><th>Expiry Date</th><th>Days Left</th></tr>
            </thead>
            <tbody>
              ${warningItems.map(w => `
                <tr style="background: #fffbeb;">
                  <td>${w.materialName}</td>
                  <td style="font-family: monospace;">${w.epdNumber || '-'}</td>
                  <td>${w.manufacturer || '-'}</td>
                  <td>${new Date(w.expiryDate).toLocaleDateString()}</td>
                  <td style="color: #b45309;">${w.daysUntil} days</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}

        ${upcomingItems.length > 0 ? `
          <div class="section-title" style="color: #1d4ed8;">📅 Upcoming - Expiring Within 180 Days</div>
          <table>
            <thead>
              <tr><th>Material</th><th>EPD Number</th><th>Manufacturer</th><th>Expiry Date</th><th>Days Left</th></tr>
            </thead>
            <tbody>
              ${upcomingItems.map(w => `
                <tr>
                  <td>${w.materialName}</td>
                  <td style="font-family: monospace;">${w.epdNumber || '-'}</td>
                  <td>${w.manufacturer || '-'}</td>
                  <td>${new Date(w.expiryDate).toLocaleDateString()}</td>
                  <td>${w.daysUntil} days</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}

        <div class="footer">
          <p><strong>Notes for Procurement:</strong></p>
          <ul style="margin-top: 8px;">
            <li>Contact material suppliers or EPD program operators to obtain updated certifications</li>
            <li>EPD renewals typically take 4-8 weeks to process</li>
            <li>Expired EPDs may affect project compliance with EN 15804+A2 and Green Star requirements</li>
          </ul>
          <p style="margin-top: 12px;">Generated by CarbonConstruct - ${new Date().toISOString()}</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  return (
    <TooltipProvider>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Download className="h-4 w-4" />
                Export for Procurement
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Export EPD renewal list for procurement team</p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleExportCSV}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export as CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportJSON}>
            <FileJson className="h-4 w-4 mr-2" />
            Export as JSON
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print Procurement List
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
}
