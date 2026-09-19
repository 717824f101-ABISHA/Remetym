import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatCard } from '../../components/common/StatCard';
import { Modal } from '../../components/common/Modal';
import { DataTable } from '../../components/common/DataTable';
import { registrationService } from '../../services/registrationService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Building2,
  Mail,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  PowerOff,
  Loader2
} from 'lucide-react';

export const AdminUserApprovals = () => {
  const { user: currentAdmin } = useAuth();
  const { showToast } = useToast();

  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('PENDING'); // PENDING | ACTIVE | DEACTIVATED | REJECTED | ALL
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState(null);

  const [showReactivateModal, setShowReactivateModal] = useState(false);
  const [reactivateTarget, setReactivateTarget] = useState(null);

  // Tracking instant button loading state
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadRequests = async () => {
    try {
      const all = await registrationService.getRequests();
      setRequests(Array.isArray(all) ? all : []);
    } catch (err) {
      console.error('Failed to load registration requests:', err);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;
  const pendingDhoCount = requests.filter((r) => r.status === 'PENDING' && r.role === 'DHO').length;

  const approvedCount = requests.filter((r) => r.status === 'ACTIVE' || r.status === 'APPROVED').length;
  const deactivatedCount = requests.filter((r) => r.status === 'DEACTIVATED').length;
  const rejectedCount = requests.filter((r) => r.status === 'REJECTED').length;

  const filteredRequests = requests.filter((r) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'ACTIVE') return r.status === 'ACTIVE' || r.status === 'APPROVED';
    return r.status === activeTab;
  });

  const handleApprove = async (req) => {
    const actionKey = `approve-${req.id}`;
    if (actionLoadingId) return;
    setActionLoadingId(actionKey);

    try {
      await registrationService.approveRegistration(req.id, currentAdmin);
      showToast(`User approved successfully. Approval email dispatched to ${req.email}.`, 'success');
      await loadRequests();
      if (showDetailModal) setShowDetailModal(false);
    } catch (err) {
      showToast(err.message || 'Failed to approve user registration.', 'danger');
    } finally {
      setActionLoadingId(null);
    }
  };

  const openRejectModal = (req) => {
    setRejectTarget(req);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectTarget) return;
    const actionKey = `reject-${rejectTarget.id}`;
    if (actionLoadingId) return;
    setActionLoadingId(actionKey);

    try {
      await registrationService.rejectRegistration(rejectTarget.id, currentAdmin, rejectionReason);
      showToast(`Rejection email sent successfully to ${rejectTarget.email}.`, 'success');
      setShowRejectModal(false);
      setRejectTarget(null);
      setRejectionReason('');
      await loadRequests();
      if (showDetailModal) setShowDetailModal(false);
    } catch (err) {
      showToast(err.message || 'Failed to reject registration.', 'danger');
    } finally {
      setActionLoadingId(null);
    }
  };

  const openDeactivateModal = (req) => {
    setDeactivateTarget(req);
    setShowDeactivateModal(true);
  };

  const handleConfirmDeactivate = async () => {
    if (!deactivateTarget) return;
    const actionKey = `deactivate-${deactivateTarget.id}`;
    if (actionLoadingId) return;
    setActionLoadingId(actionKey);

    try {
      await registrationService.deactivateUser(deactivateTarget.id || deactivateTarget.userId || deactivateTarget.email);
      showToast(`Account deactivated successfully. User access disabled.`, 'warning');
      setShowDeactivateModal(false);
      setDeactivateTarget(null);
      await loadRequests();
      if (showDetailModal) setShowDetailModal(false);
    } catch (err) {
      showToast(err.message || 'Failed to deactivate user.', 'danger');
    } finally {
      setActionLoadingId(null);
    }
  };

  const openReactivateModal = (req) => {
    setReactivateTarget(req);
    setShowReactivateModal(true);
  };

  const handleConfirmReactivate = async () => {
    if (!reactivateTarget) return;
    const actionKey = `reactivate-${reactivateTarget.id}`;
    if (actionLoadingId) return;
    setActionLoadingId(actionKey);

    try {
      await registrationService.reactivateUser(reactivateTarget.id || reactivateTarget.userId || reactivateTarget.email);
      showToast(`Account reactivated successfully. Access restored for ${reactivateTarget.email}.`, 'success');
      setShowReactivateModal(false);
      setReactivateTarget(null);
      await loadRequests();
      if (showDetailModal) setShowDetailModal(false);
    } catch (err) {
      showToast(err.message || 'Failed to reactivate user.', 'danger');
    } finally {
      setActionLoadingId(null);
    }
  };

  const openDetailModal = (req) => {
    setSelectedRequest(req);
    setShowDetailModal(true);
  };

  const columns = [
    {
      header: 'Username',
      key: 'username',
      render: (_, req) => <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{req.username || req.fullName || req.name}</span>
    },
    {
      header: 'Email',
      key: 'email'
    },
    {
      header: 'Requested Role',
      key: 'role',
      render: (val) => (
        <span className={`badge ${val === 'DHO' ? 'badge-info' : 'badge-purple'}`}>
          {val === 'DHO' ? 'DHO' : 'PHC Staff'}
        </span>
      )
    },
    {
      header: 'District / PHC',
      key: 'districtName',
      render: (_, req) => (
        <div style={{ fontSize: '0.8125rem' }}>
          <div style={{ fontWeight: 600 }}>{req.districtName || req.district || '-'}</div>
          {req.phcName && <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>{req.phcName}</div>}
        </div>
      )
    },
    {
      header: 'DHO / PHC ID',
      key: 'dhoId',
      render: (_, req) => req.role === 'DHO' ? (req.dhoId || req.employeeId || 'N/A') : (req.phcId || req.employeeId || 'N/A')
    },
    {
      header: 'Submitted On',
      key: 'registeredAt',
      render: (val) => <span style={{ fontSize: '0.8125rem', color: 'var(--text-dim)' }}>{val ? new Date(val).toLocaleDateString() : 'Recent'}</span>
    },
    {
      header: 'Status',
      key: 'status',
      render: (val) => (
        <span
          className={`badge ${
            val === 'ACTIVE' || val === 'APPROVED'
              ? 'badge-success'
              : val === 'DEACTIVATED'
              ? 'badge-warning'
              : val === 'REJECTED'
              ? 'badge-danger'
              : 'badge-neutral'
          }`}
        >
          {val === 'ACTIVE' ? 'APPROVED' : val}
        </span>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, req) => {
        const isApproving = actionLoadingId === `approve-${req.id}`;
        const isDeactivating = actionLoadingId === `deactivate-${req.id}`;
        const isReactivating = actionLoadingId === `reactivate-${req.id}`;
        const isDisabled = !!actionLoadingId;

        return (
          <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => openDetailModal(req)}
              className="btn btn-sm btn-secondary"
              title="View Details"
              disabled={isDisabled}
              style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem' }}
            >
              <Eye size={14} style={{ marginRight: '0.25rem' }} /> Details
            </button>

            {req.status === 'PENDING' && (
              <>
                <button
                  type="button"
                  onClick={() => handleApprove(req)}
                  className="btn btn-sm btn-success"
                  disabled={isDisabled}
                  style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem', backgroundColor: 'var(--success)', color: '#fff' }}
                >
                  {isApproving ? (
                    <>
                      <Loader2 size={14} className="spin" style={{ marginRight: '0.25rem' }} /> Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} style={{ marginRight: '0.25rem' }} /> Approve
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => openRejectModal(req)}
                  className="btn btn-sm btn-danger"
                  disabled={isDisabled}
                  style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem', backgroundColor: 'var(--danger)', color: '#fff' }}
                >
                  <XCircle size={14} style={{ marginRight: '0.25rem' }} /> Reject
                </button>
              </>
            )}

            {(req.status === 'ACTIVE' || req.status === 'APPROVED') && (
              <button
                type="button"
                onClick={() => openDeactivateModal(req)}
                className="btn btn-sm btn-warning"
                disabled={isDisabled}
                style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem', backgroundColor: 'var(--warning)', color: '#fff' }}
                title="Deactivate Approved Account"
              >
                {isDeactivating ? (
                  <>
                    <Loader2 size={14} className="spin" style={{ marginRight: '0.25rem' }} /> Deactivating...
                  </>
                ) : (
                  <>
                    <PowerOff size={14} style={{ marginRight: '0.25rem' }} /> Deactivate
                  </>
                )}
              </button>
            )}

            {req.status === 'DEACTIVATED' && (
              <button
                type="button"
                onClick={() => openReactivateModal(req)}
                className="btn btn-sm btn-success"
                disabled={isDisabled}
                style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem', backgroundColor: 'var(--success)', color: '#fff' }}
                title="Reactivate Account"
              >
                {isReactivating ? (
                  <>
                    <Loader2 size={14} className="spin" style={{ marginRight: '0.25rem' }} /> Reactivating...
                  </>
                ) : (
                  <>
                    <RefreshCw size={14} style={{ marginRight: '0.25rem' }} /> Reactivate
                  </>
                )}
              </button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <DashboardLayout title="User Registration & Account Management">
      {/* Top Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.75rem'
        }}
      >
        <StatCard title="Pending Requests" value={pendingCount} icon={Clock} color="amber" subtext="Action Required" />
        <StatCard title="Pending DHO" value={pendingDhoCount} icon={Building2} color="emerald" subtext="District Officers" />
        <StatCard title="Approved (Active)" value={approvedCount} icon={UserCheck} color="emerald" subtext="Active Accounts" />
        <StatCard title="Deactivated Users" value={deactivatedCount} icon={PowerOff} color="amber" subtext="Disabled Access" />
        <StatCard title="Rejected Requests" value={rejectedCount} icon={UserX} color="rose" subtext="Denied Accounts" />
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--bg-card)', padding: '0.375rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setActiveTab('PENDING')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
              backgroundColor: activeTab === 'PENDING' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'PENDING' ? '#ffffff' : 'var(--text-muted)'
            }}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setActiveTab('ACTIVE')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
              backgroundColor: activeTab === 'ACTIVE' ? 'var(--success)' : 'transparent',
              color: activeTab === 'ACTIVE' ? '#ffffff' : 'var(--text-muted)'
            }}
          >
            Approved ({approvedCount})
          </button>
          <button
            onClick={() => setActiveTab('DEACTIVATED')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
              backgroundColor: activeTab === 'DEACTIVATED' ? 'var(--warning)' : 'transparent',
              color: activeTab === 'DEACTIVATED' ? '#ffffff' : 'var(--text-muted)'
            }}
          >
            Deactivated ({deactivatedCount})
          </button>
          <button
            onClick={() => setActiveTab('REJECTED')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
              backgroundColor: activeTab === 'REJECTED' ? 'var(--danger)' : 'transparent',
              color: activeTab === 'REJECTED' ? '#ffffff' : 'var(--text-muted)'
            }}
          >
            Rejected ({rejectedCount})
          </button>
          <button
            onClick={() => setActiveTab('ALL')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
              backgroundColor: activeTab === 'ALL' ? 'var(--bg-card-hover)' : 'transparent',
              color: activeTab === 'ALL' ? 'var(--text-main)' : 'var(--text-muted)'
            }}
          >
            All Accounts ({requests.length})
          </button>
        </div>
      </div>

      {/* Requests Table */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} color="var(--primary)" />
            <span>User Accounts & Registration Log</span>
          </h3>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-dim)' }}>
            Showing {filteredRequests.length} records
          </span>
        </div>

        <DataTable
          columns={columns}
          data={filteredRequests}
          emptyMessage={`No ${activeTab.toLowerCase()} user accounts found.`}
          keyField="id"
        />
      </div>

      {/* View Details Modal */}
      {showDetailModal && selectedRequest && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="User Account & Registration Details"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>USERNAME</label>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>
                  {selectedRequest.username || selectedRequest.fullName || selectedRequest.name}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>EMAIL ADDRESS</label>
                <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{selectedRequest.email}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>USER ROLE</label>
                <div>
                  <span className={`badge ${selectedRequest.role === 'DHO' ? 'badge-info' : 'badge-purple'}`}>
                    {selectedRequest.role === 'DHO' ? 'District Health Officer (DHO)' : 'PHC Staff'}
                  </span>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>DISTRICT</label>
                <div>{selectedRequest.districtName || selectedRequest.district || '-'}</div>
              </div>
            </div>

            {selectedRequest.role === 'DHO' ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>DHO ID</label>
                  <div style={{ fontWeight: 600 }}>{selectedRequest.dhoId || selectedRequest.employeeId || 'N/A'}</div>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>SUBMITTED ON</label>
                  <div>{selectedRequest.registeredAt ? new Date(selectedRequest.registeredAt).toLocaleDateString() : 'Recent'}</div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>PHC NAME</label>
                  <div>{selectedRequest.phcName || 'N/A'}</div>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>PHC ID</label>
                  <div style={{ fontWeight: 600 }}>{selectedRequest.phcId || selectedRequest.employeeId || 'N/A'}</div>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>OFFICER / EMPLOYEE ID</label>
                <div style={{ fontWeight: 600 }}>{selectedRequest.employeeId || 'N/A'}</div>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>CURRENT STATUS</label>
                <div>
                  <span
                    className={`badge ${
                      selectedRequest.status === 'ACTIVE' || selectedRequest.status === 'APPROVED'
                        ? 'badge-success'
                        : selectedRequest.status === 'DEACTIVATED'
                        ? 'badge-warning'
                        : selectedRequest.status === 'REJECTED'
                        ? 'badge-danger'
                        : 'badge-neutral'
                    }`}
                  >
                    {selectedRequest.status === 'ACTIVE' ? 'APPROVED' : selectedRequest.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Email Notice State */}
            <div style={{ backgroundColor: 'var(--bg-card-hover)', padding: '0.875rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.8125rem' }}>
                <Mail size={16} /> AUTOMATED EMAIL DISPATCH NOTIFICATION
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                Subject: Remetyme Account {selectedRequest.status === 'DEACTIVATED' ? 'Deactivated' : selectedRequest.status === 'ACTIVE' ? 'Approved' : 'Notification'}{'\n'}
                Recipient: {selectedRequest.email}{'\n'}
                Status: {selectedRequest.status}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              {(selectedRequest.status === 'ACTIVE' || selectedRequest.status === 'APPROVED') && (
                <button
                  type="button"
                  className="btn btn-warning"
                  disabled={!!actionLoadingId}
                  onClick={() => {
                    setShowDetailModal(false);
                    openDeactivateModal(selectedRequest);
                  }}
                  style={{ backgroundColor: 'var(--warning)', color: '#fff' }}
                >
                  Deactivate Account
                </button>
              )}
              {selectedRequest.status === 'DEACTIVATED' && (
                <button
                  type="button"
                  className="btn btn-success"
                  disabled={!!actionLoadingId}
                  onClick={() => {
                    setShowDetailModal(false);
                    openReactivateModal(selectedRequest);
                  }}
                  style={{ backgroundColor: 'var(--success)', color: '#fff' }}
                >
                  Reactivate Account
                </button>
              )}
              <button type="button" className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Deactivate Confirmation Modal */}
      {showDeactivateModal && (
        <Modal
          isOpen={showDeactivateModal}
          onClose={() => setShowDeactivateModal(false)}
          title="Confirm Account Deactivation"
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--warning)', marginBottom: '1rem' }}>
              <AlertTriangle size={24} />
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                Deactivate user account for {deactivateTarget?.fullName || deactivateTarget?.name || deactivateTarget?.username}?
              </div>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
              This user will <strong>immediately lose access to the system</strong>. They will not be able to log in, access APIs, or perform inventory/transfer operations. All historical data, audit logs, and inventory records will remain intact.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" disabled={!!actionLoadingId} onClick={() => setShowDeactivateModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-warning" disabled={!!actionLoadingId} onClick={handleConfirmDeactivate} style={{ backgroundColor: 'var(--warning)', color: '#fff' }}>
                {actionLoadingId ? (
                  <>
                    <Loader2 size={16} className="spin" style={{ marginRight: '0.25rem' }} /> Deactivating...
                  </>
                ) : (
                  'Deactivate Account'
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reactivate Confirmation Modal */}
      {showReactivateModal && (
        <Modal
          isOpen={showReactivateModal}
          onClose={() => setShowReactivateModal(false)}
          title="Confirm Account Reactivation"
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--success)', marginBottom: '1rem' }}>
              <CheckCircle2 size={24} />
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                Reactivate user account for {reactivateTarget?.fullName || reactivateTarget?.name || reactivateTarget?.username}?
              </div>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
              This user will <strong>regain access</strong> to log in and perform inventory/transfer operations in Remetyme. An automated reactivation notification email will be dispatched.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" disabled={!!actionLoadingId} onClick={() => setShowReactivateModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-success" disabled={!!actionLoadingId} onClick={handleConfirmReactivate} style={{ backgroundColor: 'var(--success)', color: '#fff' }}>
                {actionLoadingId ? (
                  <>
                    <Loader2 size={16} className="spin" style={{ marginRight: '0.25rem' }} /> Reactivating...
                  </>
                ) : (
                  'Reactivate Account'
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectModal && (
        <Modal
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          title="Confirm Registration Rejection"
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--danger)', marginBottom: '1rem' }}>
              <AlertTriangle size={24} />
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                Reject Registration for {rejectTarget?.fullName || rejectTarget?.name || rejectTarget?.username}?
              </div>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Are you sure you want to reject this registration request? The user will be blocked from logging in to RemeTym and will receive a rejection notification.
            </p>

            <div className="form-group">
              <label className="form-label" htmlFor="reject-reason">
                Rejection Reason (Optional)
              </label>
              <textarea
                id="reject-reason"
                className="form-control"
                rows="3"
                placeholder="Specify reason for rejection (e.g. Invalid Employee ID or Unauthorized Facility)"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                disabled={!!actionLoadingId}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" disabled={!!actionLoadingId} onClick={() => setShowRejectModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" disabled={!!actionLoadingId} onClick={handleConfirmReject}>
                {actionLoadingId ? (
                  <>
                    <Loader2 size={16} className="spin" style={{ marginRight: '0.25rem' }} /> Rejecting...
                  </>
                ) : (
                  'Reject Registration'
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
};
