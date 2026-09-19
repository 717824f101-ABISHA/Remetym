import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { requestService } from '../../services/requestService';
import { formatDateTime } from '../../utils/dateUtils';
import { PlusCircle, Search } from 'lucide-react';

export const PhcMyRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchRequests = async () => {
      if (user) {
        try {
          const res = await requestService.getRequestsForUser(user);
          if (isMounted) {
            setRequests(Array.isArray(res) ? res : []);
          }
        } catch (err) {
          console.error('Failed to load my transfer requests:', err);
        }
      }
    };
    fetchRequests();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const filteredRequests = requests.filter(
    (r) =>
      r.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.sourcePhcName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="My Requests">
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
            placeholder="Search req ID, medicine, supplying PHC..."
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

        <Link to="/phc/transfer-request" className="btn btn-primary">
          <PlusCircle size={18} /> Create Transfer Request
        </Link>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Req ID</th>
                <th>Medicine Name</th>
                <th>Source PHC (Supplying)</th>
                <th>Dest PHC (Receiving)</th>
                <th>Requested Qty</th>
                <th>Request Date</th>
                <th>Status</th>
                <th>DHO Decision Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
                    No transfer requests submitted yet.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.requestId}>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{req.requestId}</td>
                    <td style={{ fontWeight: 600 }}>{req.medicineName}</td>
                    <td style={{ fontSize: '0.8125rem' }}>{req.sourcePhcName}</td>
                    <td style={{ fontSize: '0.8125rem' }}>{req.destPhcName}</td>
                    <td style={{ fontWeight: 800, fontSize: '1rem' }}>{req.quantity}</td>
                    <td style={{ fontSize: '0.78125rem' }}>{formatDateTime(req.requestDate)}</td>
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
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {req.status === 'PENDING' ? (
                        <span style={{ color: 'var(--warning)' }}>Awaiting DHO Review</span>
                      ) : (
                        <div>
                          <div><strong>By:</strong> {req.approvedBy}</div>
                          <div><strong>Remarks:</strong> {req.remarks || 'None'}</div>
                        </div>
                      )}
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
