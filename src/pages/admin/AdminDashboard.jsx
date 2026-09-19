import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatCard } from '../../components/common/StatCard';
import { AIInsightBanner } from '../../components/common/AIInsightBanner';

import { registrationService } from '../../services/registrationService';
import { inventoryService } from '../../services/inventoryService';
import { medicineService } from '../../services/medicineService';
import { requestService } from '../../services/requestService';
import { getExpiryStatus } from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';
import { UserAvatar } from '../../components/common/UserAvatar';
import {
  Building2,
  Hospital,
  Pill,
  Package,
  AlertTriangle,
  Clock,
  ArrowLeftRight,
  CheckCircle2,
  UserCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const getShortPhcName = (name) => {
  if (!name || typeof name !== 'string') return 'PHC';
  const clean = name.trim();
  if (!clean) return 'PHC';
  return clean;
};

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user: adminUser } = useAuth();
  const [stats, setStats] = useState({
    totalDistricts: 0,
    totalPhcs: 0,
    totalMedicines: 0,
    totalStock: 0,
    lowStockCount: 0,
    expiringCount: 0,
    pendingTransfers: 0,
    approvedTransfers: 0,
    pendingRegistrations: 0
  });

  const [recentTransfers, setRecentTransfers] = useState([]);
  const [criticalInventory, setCriticalInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [medicinesRes, inventoryRes, requestsRes, pendingRegsRes, oracleStatsRes] = await Promise.all([
          medicineService.getMedicines().catch(() => []),
          inventoryService.getInventory().catch(() => []),
          requestService.getRequests().catch(() => []),
          registrationService.getPendingRequests().catch(() => []),
          registrationService.getOracleStats().catch(() => null)
        ]);

        if (!isMounted) return;

        const medicines = Array.isArray(medicinesRes) ? medicinesRes : [];
        const inventory = Array.isArray(inventoryRes) ? inventoryRes : [];
        const requests = Array.isArray(requestsRes) ? requestsRes : [];
        const pendingRegs = Array.isArray(pendingRegsRes) ? pendingRegsRes.length : 0;
        const oracleStats = oracleStatsRes || {};

        const totalStock = inventory.reduce((acc, curr) => acc + (Number(curr?.quantity) || 0), 0);
        const lowStock = inventory.filter((inv) => inv && (Number(inv.quantity) || 0) <= (Number(inv.minimumStockLevel) || 0));

        const expiring = inventory.filter((inv) => {
          if (!inv || !inv.expiryDate) return false;
          const status = getExpiryStatus(inv.expiryDate);
          return status && (status.code === 'EXPIRING_SOON' || status.code === 'EXPIRED');
        });

        const pending = requests.filter((r) => r && r.status === 'PENDING').length;
        const approved = requests.filter((r) => r && r.status === 'APPROVED').length;

        const fallbackDistricts = new Set(inventory.map((i) => i?.districtId || i?.districtName).filter(Boolean)).size;
        const fallbackPhcs = new Set(inventory.map((i) => i?.phcId || i?.phcName).filter(Boolean)).size;

        setStats({
          totalDistricts: oracleStats.totalDistricts !== undefined && oracleStats.totalDistricts !== null ? oracleStats.totalDistricts : fallbackDistricts,
          totalPhcs: oracleStats.totalPhcs !== undefined && oracleStats.totalPhcs !== null ? oracleStats.totalPhcs : fallbackPhcs,
          totalMedicines: medicines.length,
          totalStock,
          lowStockCount: lowStock.length,
          expiringCount: expiring.length,
          pendingTransfers: pending,
          approvedTransfers: approved,
          pendingRegistrations: oracleStats.pendingRegistrations !== undefined && oracleStats.pendingRegistrations !== null ? oracleStats.pendingRegistrations : pendingRegs
        });

        setRecentTransfers(requests.slice(0, 5));
        setCriticalInventory(lowStock.slice(0, 5));
      } catch (err) {
        console.error('Error loading Admin Dashboard data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <DashboardLayout title="Admin Dashboard">
      {/* Admin Profile Overview Banner */}
      <div
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          padding: '1.25rem 1.5rem',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <UserAvatar name={adminUser?.name || 'System Administrator'} role="ADMIN" size={48} fontSize="1.25rem" />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                {adminUser?.name || 'System Administrator'}
              </h2>
              <span className="badge badge-danger" style={{ fontSize: '0.7rem' }}>
                Administrator
              </span>
              <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                Status: ACTIVE
              </span>
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
              Email: <strong style={{ color: 'var(--text-muted)' }}>{adminUser?.email || 'admin@health.gov.in'}</strong> • Scope: National System Administrator
            </div>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => navigate('/admin/user-approvals')}
          style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
        >
          <UserCheck size={16} /> Manage User Approvals ({stats.pendingRegistrations})
        </button>
      </div>

      <AIInsightBanner />

      {/* Top Level Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.5rem'
        }}
      >
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/user-approvals')}>
          <StatCard title="Pending Registrations" value={loading ? '...' : stats.pendingRegistrations} icon={UserCheck} color="amber" subtext="Approval Required" />
        </div>
        <StatCard title="Total Districts" value={loading ? '...' : stats.totalDistricts} icon={Building2} color="emerald" subtext="National Circles" />
        <StatCard title="Total PHCs" value={loading ? '...' : stats.totalPhcs} icon={Hospital} color="emerald" subtext="Healthcare Facilities" />
        <StatCard title="Total Medicines" value={loading ? '...' : stats.totalMedicines} icon={Pill} color="purple" subtext="Cataloged Formulations" />
      </div>

      {/* Operational Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem'
        }}
      >
        <StatCard title="Low Stock Items" value={loading ? '...' : stats.lowStockCount} icon={AlertTriangle} color="amber" subtext="Below Min Threshold" />
        <StatCard title="Expiring Batches" value={loading ? '...' : stats.expiringCount} icon={Clock} color="rose" subtext="Expire within 30 days" />
        <StatCard title="Pending Transfers" value={loading ? '...' : stats.pendingTransfers} icon={ArrowLeftRight} color="amber" subtext="Awaiting DHO Action" />
        <StatCard title="Approved Transfers" value={loading ? '...' : stats.approvedTransfers} icon={CheckCircle2} color="emerald" subtext="Completed Redistribution" />
      </div>

      {/* Recent System Activity Tables */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
          gap: '1.5rem'
        }}
      >
        {/* Recent Transfer Requests */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Recent Inter-PHC Transfers
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Audit Log</span>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Req ID</th>
                  <th>Medicine</th>
                  <th>Source ➔ Dest</th>
                  <th>Qty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransfers.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '1.5rem' }}>
                      {loading ? 'Loading recent transfers...' : 'No recent transfers.'}
                    </td>
                  </tr>
                ) : (
                  recentTransfers.map((req, idx) => {
                    const srcName = getShortPhcName(req?.sourcePhcName);
                    const destName = getShortPhcName(req?.destPhcName);
                    const reqId = req?.requestId || req?.id || `req-${idx}`;
                    const status = req?.status || 'PENDING';

                    return (
                      <tr key={reqId}>
                        <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{reqId}</td>
                        <td>{req?.medicineName || 'Medicine'}</td>
                        <td style={{ fontSize: '0.8125rem' }}>
                          {srcName} ➔ {destName}
                        </td>
                        <td style={{ fontWeight: 700 }}>{req?.quantity || 0}</td>
                        <td>
                          <span
                            className={`badge ${
                              status === 'APPROVED'
                                ? 'badge-success'
                                : status === 'REJECTED'
                                ? 'badge-danger'
                                : 'badge-warning'
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Critical Low-Stock Inventory
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--warning)' }}>Action Required</span>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Facility</th>
                  <th>Medicine</th>
                  <th>Available</th>
                  <th>Min Level</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {criticalInventory.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '1.5rem' }}>
                      {loading ? 'Analyzing inventory stock levels...' : 'All medicine stock levels optimal.'}
                    </td>
                  </tr>
                ) : (
                  criticalInventory.map((item, idx) => {
                    const invId = item?.inventoryId || item?.id || `inv-${idx}`;
                    return (
                      <tr key={invId}>
                        <td style={{ fontSize: '0.8125rem' }}>{item?.phcName || 'PHC'}</td>
                        <td style={{ fontWeight: 600 }}>{item?.medicineName || 'Medicine'}</td>
                        <td style={{ color: 'var(--danger)', fontWeight: 700 }}>{item?.quantity || 0}</td>
                        <td>{item?.minimumStockLevel || 0}</td>
                        <td>
                          <span className="badge badge-danger">Low Stock</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
