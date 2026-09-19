import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { requestService } from '../../services/requestService';
import { formatDateTime } from '../../utils/dateUtils';
import { Search, ShieldAlert } from 'lucide-react';

export const AdminTransfers = () => {
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    let isMounted = true;
    const fetchRequests = async () => {
      try {
        const data = await requestService.getRequests();
        if (isMounted) {
          setRequests(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Failed to load transfers:', err);
      }
    };
    fetchRequests();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.sourcePhcName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.destPhcName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout title="Transfer Monitoring">
      <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
        <ShieldAlert size={20} />
        <span>
          <strong>DHO Authority Notice:</strong> District Health Officers (DHO) hold operational approval authority for PHC-to-PHC stock transfers. This console provides real-time system monitoring.
        </span>
      </div>

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
            placeholder="Search request ID, medicine, source/dest PHC..."
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

        <select
          className="form-control"
          style={{ width: '200px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending DHO Approval</option>
          <option value="APPROVED">Approved & Dispatched</option>
          <option value="REJECTED">Rejected by DHO</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>District</th>
                <th>Medicine Name</th>
                <th>Source PHC (Supply)</th>
                <th>Dest PHC (Receive)</th>
                <th>Requested Qty</th>
                <th>Requested Date</th>
                <th>Approval Authority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
                    No transfer requests match selected filters.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.requestId}>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{req.requestId}</td>
                    <td>{req.districtName}</td>
                    <td style={{ fontWeight: 600 }}>{req.medicineName}</td>
                    <td style={{ fontSize: '0.8125rem' }}>{req.sourcePhcName}</td>
                    <td style={{ fontSize: '0.8125rem' }}>{req.destPhcName}</td>
                    <td style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--primary)' }}>{req.quantity}</td>
                    <td style={{ fontSize: '0.78125rem' }}>{formatDateTime(req.requestDate)}</td>
                    <td style={{ fontSize: '0.8125rem' }}>{req.approvedBy || 'Pending DHO Review'}</td>
                    <td>
                      <span
                        className={`badge ${
                          req.status === 'APPROVED'
                            ? 'badge-success'
                            : req.status === 'REJECTED'
                            ? 'badge-danger'
                            : 'badge-warning'
                        }`}
                      >
                        {req.status}
                      </span>
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
