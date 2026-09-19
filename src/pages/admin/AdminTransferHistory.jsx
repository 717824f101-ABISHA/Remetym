import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { requestService } from '../../services/requestService';
import { formatDateTime } from '../../utils/dateUtils';
import { exportTransferAuditPDF } from '../../utils/exportUtils';
import { Search, Download, FileText } from 'lucide-react';

export const AdminTransferHistory = () => {
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
          console.error('Failed to load transfer history:', err);
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
      item.transferId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sourcePhcName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.destPhcName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadPDF = () => {
    if (filteredHistory.length === 0) {
      showToast('No transfer records available to generate audit PDF.', 'danger');
      return;
    }
    exportTransferAuditPDF(user, filteredHistory);
    showToast('✓ Transfer Audit PDF generated successfully', 'success');
  };

  return (
    <DashboardLayout title="Transfer History">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <div style={{ position: 'relative', width: '380px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search transfer ID, req ID, medicine, PHC..."
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

        <button className="btn btn-primary" onClick={handleDownloadPDF}>
          <Download size={18} /> Download Audit PDF
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-responsive">
          <table className="data-table">
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
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
                    No completed transfer history records found.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => (
                  <tr key={item.transferId}>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{item.transferId}</td>
                    <td style={{ color: 'var(--info)' }}>{item.requestId}</td>
                    <td style={{ fontWeight: 600 }}>{item.medicineName}</td>
                    <td>
                      <code style={{ background: 'var(--bg-dark)', padding: '2px 6px', borderRadius: '4px' }}>
                        {item.batchNumber}
                      </code>
                    </td>
                    <td style={{ fontSize: '0.8125rem' }}>{item.sourcePhcName}</td>
                    <td style={{ fontSize: '0.8125rem' }}>{item.destPhcName}</td>
                    <td style={{ fontWeight: 800 }}>{item.quantity}</td>
                    <td style={{ fontSize: '0.8125rem' }}>{item.requestedBy}</td>
                    <td style={{ fontSize: '0.8125rem' }}>{item.approvedBy}</td>
                    <td style={{ fontSize: '0.78125rem' }}>{formatDateTime(item.approvalDate)}</td>
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
