import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { requestService } from '../../services/requestService';
import { formatDateTime } from '../../utils/dateUtils';
import { Modal } from '../../components/common/Modal';
import { Clock, AlertCircle, Check, X, Building2 } from 'lucide-react';

export const DhoTransferRequests = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null);
  const [actionType, setActionType] = useState(null); // 'APPROVE' or 'REJECT'
  const [remarks, setRemarks] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadRequests = async () => {
    if (user) {
      try {
        const res = await requestService.getRequestsForUser(user);
        const raw = Array.isArray(res) ? res : [];
        const userDistId = (user.districtId || '').trim().toLowerCase();
        const userDistName = (user.districtName || user.district || '').trim().toLowerCase();

        // Strict District Scope Filtering: DHO sees ONLY requests belonging to their district
        const districtFiltered = raw.filter((r) => {
          if (user.role !== 'DHO') return true;
          const rDistId = (r.districtId || r.sourceDistrictId || r.destDistrictId || '').trim().toLowerCase();
          const rDistName = (r.districtName || r.sourceDistrictName || r.destDistrictName || '').trim().toLowerCase();

          const matchId = userDistId && rDistId && rDistId === userDistId;
          const matchName = userDistName && rDistName && rDistName === userDistName;
          return matchId || matchName || (!rDistId && !rDistName);
        });

        setRequests(districtFiltered);
      } catch (err) {
        console.error('Failed to load DHO transfer requests:', err);
      }
    }
  };

  useEffect(() => {
    loadRequests();
  }, [user]);

  const handleOpenActionModal = (req, type) => {
    setSelectedReq(req);
    setActionType(type);
    setRemarks(type === 'APPROVE' ? 'Approved for dispatch within district.' : 'Insufficient stock at source PHC.');
    setErrorMessage('');
  };

  const handleExecuteAction = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedReq || !user) return;

    try {
      if (actionType === 'APPROVE') {
        await requestService.approveRequest(selectedReq.requestId, user, remarks);
        showToast(`✓ Transfer Request ${selectedReq.requestId} Approved successfully`, 'success');
      } else if (actionType === 'REJECT') {
        await requestService.rejectRequest(selectedReq.requestId, user, remarks);
        showToast(`Transfer Request ${selectedReq.requestId} Rejected`, 'danger');
      }

      setSelectedReq(null);
      setActionType(null);
      setRemarks('');
      await loadRequests();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to process transfer request decision.');
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'PENDING');
  const nonPendingRequests = requests.filter((r) => r.status !== 'PENDING');

  return (
    <DashboardLayout title="DHO Transfer Request Approval Console">


      {/* Section 1: Pending Requests Needing Action */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={20} color="var(--warning)" /> Pending District Transfer Requests ({pendingRequests.length})
        </h3>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Req ID</th>
                <th>Medicine Name</th>
                <th>Source PHC (Supply)</th>
                <th>Dest PHC (Receive)</th>
                <th>Requested Qty</th>
                <th>Available Stock</th>
                <th>Requested By</th>
                <th>Request Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingRequests.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-dim)' }}>
                    No pending transfer requests for {user?.districtName || 'your district'}.
                  </td>
                </tr>
              ) : (
                pendingRequests.map((req) => (
                  <tr key={req.requestId}>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{req.requestId}</td>
                    <td style={{ fontWeight: 600 }}>{req.medicineName}</td>
                    <td style={{ fontSize: '0.8125rem' }}>{req.sourcePhcName}</td>
                    <td style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{req.destPhcName}</td>
                    <td style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--warning)' }}>{req.quantity}</td>
                    <td style={{ fontWeight: 700, color: req.availableSourceStock >= req.quantity ? 'var(--success)' : 'var(--danger)' }}>
                      {req.availableSourceStock}
                    </td>
                    <td style={{ fontSize: '0.8125rem' }}>{req.requestedBy}</td>
                    <td style={{ fontSize: '0.78125rem' }}>{formatDateTime(req.requestDate)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-success"
                          style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                          onClick={() => handleOpenActionModal(req, 'APPROVE')}
                        >
                          <Check size={14} /> Approve
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                          onClick={() => handleOpenActionModal(req, 'REJECT')}
                        >
                          <X size={14} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Recent Decided Requests */}
      <div className="card">
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
          Completed District Decisions History
        </h3>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Req ID</th>
                <th>Medicine Name</th>
                <th>Source ➔ Dest PHC</th>
                <th>Qty</th>
                <th>Decision Date</th>
                <th>DHO Remarks</th>
                <th>Final Status</th>
              </tr>
            </thead>
            <tbody>
              {nonPendingRequests.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
                    No prior decisions recorded for {user?.districtName || 'this district'}.
                  </td>
                </tr>
              ) : (
                nonPendingRequests.map((req) => (
                  <tr key={req.requestId}>
                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{req.requestId}</td>
                    <td style={{ fontWeight: 600 }}>{req.medicineName}</td>
                    <td style={{ fontSize: '0.8125rem' }}>
                      {req.sourcePhcName} ➔ {req.destPhcName}
                    </td>
                    <td style={{ fontWeight: 700 }}>{req.quantity}</td>
                    <td style={{ fontSize: '0.78125rem' }}>{formatDateTime(req.decisionDate)}</td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{req.remarks || 'N/A'}</td>
                    <td>
                      <span className={`badge ${req.status === 'APPROVED' ? 'badge-success' : 'badge-danger'}`}>
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

      {/* DHO Approval / Rejection Modal */}
      <Modal
        isOpen={!!selectedReq}
        onClose={() => {
          setSelectedReq(null);
          setActionType(null);
        }}
        title={`${actionType === 'APPROVE' ? 'Approve Transfer Request' : 'Reject Transfer Request'} — ${selectedReq?.requestId}`}
      >
        {selectedReq && (
          <form onSubmit={handleExecuteAction}>
            {errorMessage && (
              <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            <div
              style={{
                backgroundColor: 'var(--bg-dark)',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1.25rem',
                border: '1px solid var(--border-color)',
                fontSize: '0.875rem'
              }}
            >
              <div style={{ marginBottom: '0.375rem' }}>
                <strong>Medicine:</strong> {selectedReq.medicineName}
              </div>
              <div style={{ marginBottom: '0.375rem' }}>
                <strong>Transfer Route:</strong> {selectedReq.sourcePhcName} ➔ {selectedReq.destPhcName}
              </div>
              <div style={{ marginBottom: '0.375rem' }}>
                <strong>Requested Quantity:</strong> <span style={{ color: 'var(--warning)', fontWeight: 700 }}>{selectedReq.quantity} units</span>
              </div>
              <div>
                <strong>Current Stock at Source:</strong> <span style={{ color: selectedReq.availableSourceStock >= selectedReq.quantity ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}>{selectedReq.availableSourceStock} units</span>
              </div>
            </div>

            {actionType === 'APPROVE' && (
              <div className="alert alert-warning" style={{ fontSize: '0.8125rem', marginBottom: '1rem' }}>
                Confirming approval will deduct {selectedReq.quantity} units from {selectedReq.sourcePhcName} stock and credit them to {selectedReq.destPhcName} inventory.
              </div>
            )}

            {actionType === 'REJECT' && (
              <div className="alert alert-info" style={{ fontSize: '0.8125rem', marginBottom: '1rem' }}>
                Rejecting will keep stock quantities unchanged at both facilities.
              </div>
            )}

            <div className="form-group">
              <label className="form-label">DHO Remarks / Official Authorization Comments</label>
              <textarea
                className="form-control"
                rows="3"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter remarks..."
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setSelectedReq(null);
                  setActionType(null);
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`btn ${actionType === 'APPROVE' ? 'btn-success' : 'btn-danger'}`}
              >
                {actionType === 'APPROVE' ? 'Confirm & Execute Approval' : 'Confirm Rejection'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </DashboardLayout>
  );
};
