import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { requestService } from '../../services/requestService';
import { formatDateTime } from '../../utils/dateUtils';
import { Search } from 'lucide-react';

export const PhcTransferHistory = () => {
  const { user } = useAuth();
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
          console.error('Failed to load PHC transfer history:', err);
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
      item.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sourcePhcName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.destPhcName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="Transfer History">
      <div style={{ marginBottom: '1.5rem', width: '380px', position: 'relative' }}>
        <input
          type="text"
          className="form-control"
          placeholder="Search transfer ID, medicine, PHC..."
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
                <th>Destination PHC</th>
                <th>Qty</th>
                <th>Approved By</th>
                <th>Completion Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
                    No completed transfer history for this facility.
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
