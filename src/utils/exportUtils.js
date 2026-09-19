/**
 * Export Utilities for RemeTym Reports
 * Supports PDF, Excel (.csv / .xls), and Audit PDF generation.
 */

export const exportToCSV = (filename, headers, rows) => {
  if (!rows || rows.length === 0) {
    alert('No data available to export.');
    return;
  }

  const csvRows = [];

  // Add Headers
  csvRows.push(headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(','));

  // Add Rows
  rows.forEach((row) => {
    const values = headers.map((header) => {
      const val = row[header] !== undefined && row[header] !== null ? row[header] : '';
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  });

  const csvString = '\uFEFF' + csvRows.join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToExcel = (filename, headers, rows) => {
  exportToCSV(filename, headers, rows);
};

export const exportToPDF = (filename, title, headers, rowsData) => {
  if (!rowsData || rowsData.length === 0) {
    alert('No data available to generate report.');
    return;
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    exportToCSV(filename, headers, rowsData);
    return;
  }

  const tableHeaderHtml = headers.map((h) => `<th style="border:1px solid #CBD5E1;padding:8px 12px;background:#F1F5F9;text-align:left;font-size:12px;color:#334155;">${h}</th>`).join('');

  const tableBodyHtml = rowsData
    .map(
      (row) =>
        `<tr>${headers
          .map(
            (h) =>
              `<td style="border:1px solid #E2E8F0;padding:8px 12px;font-size:12px;color:#0F172A;">${
                row[h] !== undefined && row[h] !== null ? row[h] : '-'
              }</td>`
          )
          .join('')}</tr>`
    )
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title} - RemeTym Report</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 24px; color: #0F172A; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #16A34A; padding-bottom: 12px; margin-bottom: 20px; }
          .logo { font-size: 20px; font-weight: 800; color: #16A34A; }
          .subtitle { font-size: 12px; color: #64748B; }
          .title { font-size: 18px; font-weight: 700; margin-bottom: 16px; color: #0F172A; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          .footer { margin-top: 24px; font-size: 11px; color: #94A3B8; text-align: center; border-top: 1px solid #E2E8F0; padding-top: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">RemeTym</div>
            <div class="subtitle">Intelligent Medicine Stock & Expiry Management System</div>
          </div>
          <div style="text-align: right; font-size: 12px; color: #64748B;">
            Generated: ${new Date().toLocaleString()}
          </div>
        </div>

        <div class="title">${title}</div>

        <table>
          <thead>
            <tr>${tableHeaderHtml}</tr>
          </thead>
          <tbody>
            ${tableBodyHtml}
          </tbody>
        </table>

        <div class="footer">
          Government PHC Intelligent Medicine Stock & Expiry Management System
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

export const exportTransferAuditPDF = (adminUser, transferHistory) => {
  if (!transferHistory || transferHistory.length === 0) {
    alert('No transfer history records available to export.');
    return;
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups for this site to generate the Audit PDF.');
    return;
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const adminName = adminUser?.name || adminUser?.username || 'System Administrator';

  const rowsHtml = transferHistory.map((t) => {
    const statusUpper = (t.status || 'COMPLETED').toUpperCase();
    const statusColor = statusUpper.includes('REJECT')
      ? '#DC2626'
      : statusUpper.includes('PENDING')
      ? '#D97706'
      : '#16A34A';

    return `
      <tr>
        <td style="font-weight:700;color:#2563EB;">${t.transferId || '-'}</td>
        <td style="color:#0284C7;">${t.requestId || '-'}</td>
        <td style="font-weight:600;">${t.medicineName || '-'}</td>
        <td><code>${t.batchNumber || '-'}</code></td>
        <td>${t.sourcePhcName || '-'}</td>
        <td>${t.destPhcName || '-'}</td>
        <td style="font-weight:700;text-align:center;">${t.quantity || 0}</td>
        <td>${t.requestedBy || '-'}</td>
        <td>${t.approvedBy || '-'}</td>
        <td>${t.approvalDate ? new Date(t.approvalDate).toLocaleDateString() : '-'}</td>
        <td style="font-weight:700;color:${statusColor};">${t.status || 'COMPLETED'}</td>
      </tr>
    `;
  }).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Remetyme - Medicine Transfer Audit Report</title>
        <style>
          @page { size: A4 portrait; margin: 12mm; }
          body { font-family: Helvetica, Arial, sans-serif; padding: 12px; color: #0F172A; font-size: 10px; }
          .header { border-bottom: 2.5px solid #16A34A; padding-bottom: 10px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: flex-end; }
          .title-main { font-size: 17px; font-weight: 800; color: #0F172A; margin: 0; }
          .subtitle { font-size: 12px; font-weight: 700; color: #16A34A; margin-top: 3px; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px; background: #F8FAFC; border: 1px solid #E2E8F0; padding: 8px 12px; border-radius: 6px; margin-bottom: 14px; }
          .meta-item { font-size: 9px; color: #64748B; font-weight: 600; text-transform: uppercase; }
          .meta-val { font-size: 11px; font-weight: 700; color: #0F172A; margin-top: 2px; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          th { background-color: #1E293B; color: #FFFFFF; font-size: 9px; font-weight: 700; text-transform: uppercase; padding: 6px 5px; text-align: left; border: 1px solid #1E293B; }
          td { padding: 5px 5px; font-size: 9px; border: 1px solid #CBD5E1; text-align: left; }
          code { font-family: monospace; background: #F1F5F9; padding: 1px 4px; border-radius: 3px; }
          .footer { position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 9px; color: #64748B; border-top: 1px solid #CBD5E1; padding-top: 6px; background: #FFF; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title-main">Remetyme – Medicine Transfer Audit Report</h1>
            <div class="subtitle">National System Administrator</div>
          </div>
          <div style="text-align:right;">
            <div style="font-weight:800;font-size:13px;color:#16A34A;">Government Health System</div>
            <div style="font-size:9px;color:#64748B;">Official Audit Documentation</div>
          </div>
        </div>

        <div class="meta-grid">
          <div class="meta-item">GENERATED DATE<div class="meta-val">${dateStr}</div></div>
          <div class="meta-item">GENERATED TIME<div class="meta-val">${timeStr}</div></div>
          <div class="meta-item">GENERATED BY<div class="meta-val">${adminName}</div></div>
          <div class="meta-item">TOTAL TRANSFERS<div class="meta-val">${transferHistory.length}</div></div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Transfer ID</th>
              <th>Request ID</th>
              <th>Medicine Name</th>
              <th>Batch</th>
              <th>Source PHC</th>
              <th>Destination PHC</th>
              <th>Qty</th>
              <th>Requested By</th>
              <th>Approved By</th>
              <th>Approval Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="footer">
          Government PHC Intelligent Medicine Stock & Expiry Management System
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

export const exportDhoReportPDF = (filename, title, scopeText, headers, rowsData) => {
  if (!rowsData || rowsData.length === 0) {
    alert('No data available to generate report.');
    return;
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to export the PDF report.');
    return;
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  const tableHeaderHtml = headers.map((h) => `<th style="background:#1E293B;color:#FFF;padding:8px 10px;font-size:11px;text-align:left;border:1px solid #1E293B;font-weight:700;text-transform:uppercase;">${h}</th>`).join('');

  const tableBodyHtml = rowsData
    .map(
      (row) =>
        `<tr>${headers
          .map(
            (h) =>
              `<td style="border:1px solid #CBD5E1;padding:7px 10px;font-size:11px;color:#0F172A;">${
                row[h] !== undefined && row[h] !== null ? row[h] : '-'
              }</td>`
          )
          .join('')}</tr>`
    )
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title} - RemeTym DHO Report</title>
        <style>
          @page { size: A4 landscape; margin: 10mm; }
          body { font-family: 'Segoe UI', Helvetica, Arial, sans-serif; padding: 16px; color: #0F172A; }
          .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2.5px solid #16A34A; padding-bottom: 10px; margin-bottom: 14px; }
          .title-main { font-size: 18px; font-weight: 800; color: #0F172A; margin: 0; }
          .subtitle { font-size: 12px; font-weight: 700; color: #16A34A; margin-top: 2px; }
          .scope-bar { background: #F1F5F9; border: 1px solid #CBD5E1; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; color: #334155; margin-bottom: 14px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          tr { page-break-inside: avoid; }
          .footer { margin-top: 20px; font-size: 10px; color: #64748B; text-align: center; border-top: 1px solid #E2E8F0; padding-top: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title-main">RemeTym – District Health Office Report</h1>
            <div class="subtitle">${title}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-weight:800;font-size:12px;color:#16A34A;">Government District Health System</div>
            <div style="font-size:10px;color:#64748B;">Generated: ${dateStr} ${timeStr}</div>
          </div>
        </div>

        <div class="scope-bar">
          ${scopeText || 'District Scope'} | Total Records: <strong>${rowsData.length}</strong>
        </div>

        <table>
          <thead>
            <tr>${tableHeaderHtml}</tr>
          </thead>
          <tbody>
            ${tableBodyHtml}
          </tbody>
        </table>

        <div class="footer">
          District Health Office Intelligent Medicine Stock & Demand Forecasting System
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 250);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
