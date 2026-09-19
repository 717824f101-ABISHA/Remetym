/**
 * Remetyme Healthcare Inventory System - Professional Tabular PDF Export Utility
 * Generates a clean, print-ready HTML document for reports containing only tabular data,
 * header metadata, and summary metrics. Excludes sidebars, navigation, and action buttons.
 */

export const exportReportToPdf = ({
  reportTitle = 'Healthcare Inventory & Analytics Report',
  facilityName = 'Health Facility',
  districtName = 'Health District',
  generatedBy = 'Authorized System User',
  summaryMetrics = [],
  tableHeaders = [],
  tableRows = [],
  additionalNote = ''
}) => {
  const generatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const printWindow = window.open('', '_blank', 'width=1050,height=800');
  if (!printWindow) {
    alert('Please allow popups to generate the PDF report.');
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>${reportTitle} - Remetyme Health System</title>
      <style>
        @page {
          size: A4 landscape;
          margin: 15mm;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #0F172A;
          background-color: #FFFFFF;
          margin: 0;
          padding: 20px;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .report-header {
          border-bottom: 3px solid #16A34A;
          padding-bottom: 12px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .brand-title {
          font-size: 20px;
          font-weight: 800;
          color: #15803D;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 0 4px 0;
        }
        .report-subtitle {
          font-size: 16px;
          font-weight: 700;
          color: #0F172A;
          margin: 0;
        }
        .metadata-box {
          text-align: right;
          font-size: 12px;
          color: #475569;
          line-height: 1.5;
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
          margin-bottom: 20px;
        }
        .metric-card {
          background-color: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          padding: 10px 14px;
        }
        .metric-label {
          font-size: 11px;
          font-weight: 600;
          color: #64748B;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .metric-value {
          font-size: 18px;
          font-weight: 800;
          color: #0F172A;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
          margin-bottom: 20px;
        }
        th {
          background-color: #F1F5F9;
          color: #1E293B;
          font-weight: 700;
          text-align: left;
          padding: 10px 12px;
          border: 1px solid #CBD5E1;
        }
        td {
          padding: 9px 12px;
          border: 1px solid #E2E8F0;
          color: #334155;
        }
        tr:nth-child(even) td {
          background-color: #F8FAFC;
        }
        .badge {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 700;
          text-align: center;
        }
        .badge-success { background-color: #DCFCE7; color: #166534; }
        .badge-info { background-color: #E0F2FE; color: #075985; }
        .badge-warning { background-color: #FEF3C7; color: #92400E; }
        .badge-danger { background-color: #FEE2E2; color: #991B1B; }

        .report-footer {
          margin-top: 30px;
          padding-top: 10px;
          border-top: 1px solid #E2E8F0;
          font-size: 11px;
          color: #64748B;
          display: flex;
          justify-content: space-between;
        }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div className="report-header">
        <div>
          <div className="brand-title">Remetyme Government Health Platform</div>
          <div className="report-subtitle">${reportTitle}</div>
        </div>
        <div className="metadata-box">
          <div><strong>Facility:</strong> ${facilityName} (${districtName})</div>
          <div><strong>Generated:</strong> ${generatedDate}</div>
          <div><strong>Authorized By:</strong> ${generatedBy}</div>
        </div>
      </div>

      ${
        summaryMetrics.length > 0
          ? `
        <div className="metrics-grid">
          ${summaryMetrics
            .map(
              (m) => `
            <div className="metric-card">
              <div className="metric-label">${m.label}</div>
              <div className="metric-value">${m.value}</div>
            </div>
          `
            )
            .join('')}
        </div>
      `
          : ''
      }

      <table>
        <thead>
          <tr>
            ${tableHeaders.map((h) => `<th>${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${tableRows
            .map(
              (row) => `
            <tr>
              ${row
                .map((cell) => {
                  if (typeof cell === 'object' && cell !== null && cell.badge) {
                    return `<td><span className="badge ${cell.badgeClass}">${cell.text}</span></td>`;
                  }
                  return `<td>${cell}</td>`;
                })
                .join('')}
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>

      ${
        additionalNote
          ? `<div style="font-size: 11px; color: #475569; font-style: italic; margin-top: 10px;">Note: ${additionalNote}</div>`
          : ''
      }

      <div className="report-footer">
        <div>Official Government Healthcare Inventory System — Confidentially Generated</div>
        <div>Page 1 of 1</div>
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
