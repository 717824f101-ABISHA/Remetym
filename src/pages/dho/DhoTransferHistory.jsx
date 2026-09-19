import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { requestService } from '../../services/requestService';
import { formatDateTime } from '../../utils/dateUtils';
import { exportDhoReportPDF } from '../../utils/exportUtils';
import { Search, Download } from 'lucide-react';

export const DhoTransferHistory = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      if (user) {
        try {
          const res = await requestService.getTransferHistory(user);
          if (isMounted) {
            setHistory(Array.isArray(res) ? res : []);
          }
        } catch (err) {
          console.error('Failed to load DHO transfer history:', err);
        }
      }
    };
    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const filteredHistory = history.filter(
    (item) =>
      (item.transferId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.medicineName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.sourcePhcName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.destPhcName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadPDF = () => {
    const districtLabel = user?.districtName || user?.districtId || 'District';
    const headers = ['Transfer ID', 'Req ID', 'Medicine Name', 'Batch', 'Source PHC', 'Dest PHC', 'Qty', 'Requested By', 'Approved By', 'Date Completed', 'Status'];
    const rows = filteredHistory.map((item) => ({
      'Transfer ID': item.transferId || '-',
      'Req ID': item.requestId || '-',
      'Medicine Name': item.medicineName || '-',
      'Batch': item.batchNumber || '-',
      'Source PHC': item.sourcePhcName || '-',
      'Dest PHC': item.destPhcName || '-',
      'Qty': item.quantity || 0,
      'Requested By': item.requestedBy || '-',
      'Approved By': item.approvedBy || '-',
      'Date Completed': formatDateTime(item.completionDate),
      'Status': item.status || 'COMPLETED'
    }));
    exportDhoReportPDF('DHO_Transfer_History_Report', `District Stock Movement & Transfer Audit Register`, `Scope: District ${districtLabel}`, headers, rows);
    showToast('✓ DHO Transfer History report exported successfully', 'success');
  };

  const districtLabel = user?.districtName || user?.districtId || 'District';

  return (
    <DashboardLayout title="District Transfer History">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <div style={{ position: 'relative', width: '380px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search transfer ID, medicine, PHCs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
          <Search
            size={18}
            color="var(--text-dim)"
            style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-dim)', fontWeight: 600 }}>
            Scope: District <strong>{districtLabel}</strong>
          </span>
          <button className="btn btn-primary" onClick={handleDownloadPDF}>
            <Download size={16} /> Download PDF
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Transfer ID</th>
                <th>Req ID</th>
                <th>Medicine Name</th>
                <th>Batch</th>
                <th>Source PHC</th>
                <th>Dest PHC</th>
                <th>Qty</th>
                <th>Requested By</th>
                <th>Approved By</th>
                <th>Date Completed</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
                    No completed district transfers.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => (
                  <tr key={item.transferId}>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{item.transferId}</td>
                    <td style={{ color: 'var(--primary)' }}>{item.requestId}</td>
                    <td style={{ fontWeight: 600 }}>{item.medicineName}</td>
                    <td><code>{item.batchNumber}</code></td>
                    <td style={{ fontSize: '0.8125rem' }}>{item.sourcePhcName}</td>
                    <td style={{ fontSize: '0.8125rem' }}>{item.destPhcName}</td>
                    <td style={{ fontWeight: 800 }}>{item.quantity}</td>
                    <td style={{ fontSize: '0.8125rem' }}>{item.requestedBy}</td>
                    <td style={{ fontSize: '0.8125rem' }}>{item.approvedBy}</td>
                    <td style={{ fontSize: '0.78125rem' }}>{formatDateTime(item.completionDate)}</td>
                    <td>
                      <span className="badge badge-success">{item.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};
