import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/common/StatCard';
import { AIInsightBanner } from '../../components/common/AIInsightBanner';

import { inventoryService } from '../../services/inventoryService';
import { requestService } from '../../services/requestService';
import { getExpiryStatus } from '../../utils/dateUtils';
import { Link } from 'react-router-dom';
import {
  Hospital,
  Package,
  Pill,
  AlertTriangle,
  Clock,
  ArrowLeftRight,
  PlusCircle,
  FileCheck2,
  XCircle
} from 'lucide-react';

const getShortPhcName = (name) => {
  if (!name || typeof name !== 'string') return 'PHC';
  const clean = name.trim();
  if (!clean) return 'PHC';
  return clean;
};

export const PhcDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    phcName: '',
    totalMedicines: 0,
    totalStock: 0,
    lowStockCount: 0,
    expiringCount: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0
  });

  const [myInventory, setMyInventory] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    const fetchPhcData = async () => {
      setLoading(true);
      try {
        const phcId = user.phcId || user.id || '';
        const phcName = user.phcName || user.name || user.phc || '';

        const [inventoryRes, requestsRes, historyRes] = await Promise.all([
          inventoryService.getInventoryByPhc(phcId, phcName).catch(() => []),
          requestService.getRequestsForUser(user).catch(() => []),
          requestService.getTransferHistory(user).catch(() => [])
        ]);

        if (!isMounted) return;

        const inventory = Array.isArray(inventoryRes) ? inventoryRes : [];
        const requests = Array.isArray(requestsRes) ? requestsRes : [];
        const history = Array.isArray(historyRes) ? historyRes : [];

        // Calculate real-time dynamic inventory metrics
        const totalStock = inventory.reduce((acc, curr) => acc + (Number(curr?.quantity) || 0), 0);
        const uniqueMeds = new Set(inventory.map((i) => i?.medicineId || i?.medicineName).filter(Boolean)).size;

        const lowStock = inventory.filter((inv) => inv && (Number(inv.quantity) || 0) <= (Number(inv.minimumStockLevel) || 0));
        const expiring = inventory.filter((inv) => {
          if (!inv || !inv.expiryDate) return false;
          const status = getExpiryStatus(inv.expiryDate);
          return status && (status.code === 'EXPIRING_SOON' || status.code === 'EXPIRED' || (status.days !== undefined && status.days <= 30));
        });

        // Filter destination-bound requests for this PHC
        const targetPId = (phcId || '').trim().toLowerCase();
        const targetPName = (phcName || '').trim().toLowerCase();

        const matchDestination = (item) => {
          if (!item) return false;
          const dId = (item.destPhcId || '').trim().toLowerCase();
          const dName = (item.destPhcName || '').trim().toLowerCase();
          const matchId = targetPId && (dId === targetPId || dName === targetPId);
          const matchName = targetPName && (dId === targetPName || dName === targetPName);
          return matchId || matchName || (!dId && !dName);
        };

        const destRequests = requests.filter(matchDestination);
        const destHistory = history.filter(matchDestination);

        const pending = destRequests.filter((r) => r && r.status === 'PENDING').length;
        const rejected = destRequests.filter((r) => r && r.status === 'REJECTED').length;

        // Approved & Completed inbound transfers count (deduplicated by requestId)
        const approvedSet = new Set();
        destRequests.forEach((r) => {
          if (r && (r.status === 'APPROVED' || r.status === 'COMPLETED')) {
            approvedSet.add(r.requestId || r.id);
          }
        });
        destHistory.forEach((h) => {
          if (h && (h.status === 'APPROVED' || h.status === 'COMPLETED')) {
            approvedSet.add(h.requestId || h.transferId || h.id);
          }
        });

        const approvedCount = approvedSet.size;

        setStats({
          phcName: user.phcName || user.name || user.phc || 'PHC Facility',
          totalMedicines: uniqueMeds,
          totalStock,
          lowStockCount: lowStock.length,
          expiringCount: expiring.length,
          pendingRequests: pending,
          approvedRequests: approvedCount,
          rejectedRequests: rejected
        });

        setMyInventory(inventory);
        setMyRequests(destRequests.slice(0, 5));
      } catch (err) {
        console.error('Failed to load PhcDashboard data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPhcData();
    return () => {
      isMounted = false;
    };
  }, [user]);

  return (
    <DashboardLayout title="PHC Staff Dashboard">
      <AIInsightBanner />

      {/* Top Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.5rem'
        }}
      >
        <StatCard title="Facility Stock Units" value={loading ? '...' : stats.totalStock.toLocaleString()} icon={Package} color="emerald" subtext="Physical Stock On-hand" />
        <StatCard title="Medicine Formulations" value={loading ? '...' : stats.totalMedicines} icon={Pill} color="purple" subtext="In Pharmacy" />
        <StatCard title="Low Stock Items" value={loading ? '...' : stats.lowStockCount} icon={AlertTriangle} color="amber" subtext="Below Minimum Level" />
        <StatCard title="Expiring Batches" value={loading ? '...' : stats.expiringCount} icon={Clock} color="rose" subtext="Expires in <= 30 Days" />
      </div>

      {/* Transfer Request Status Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem'
        }}
      >
        <StatCard title="Pending Requests" value={loading ? '...' : stats.pendingRequests} icon={ArrowLeftRight} color="amber" subtext="Awaiting DHO Decision" />
        <StatCard title="Approved Transfers Received" value={loading ? '...' : stats.approvedRequests} icon={FileCheck2} color="emerald" subtext="Stock Received" />
        <StatCard title="Rejected Requests" value={loading ? '...' : stats.rejectedRequests} icon={XCircle} color="rose" subtext="Declined by DHO" />
        <StatCard title="Active Facility" value={getShortPhcName(stats.phcName)} icon={Hospital} color="emerald" subtext={stats.phcName || 'Facility'} />
      </div>

      {/* Quick Action Button & My Requests Section */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}
      >
        {/* Low Stock Warning & Transfer Request Action */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Low Stock & Supply Action
            </h3>
            <Link to="/phc/transfer-request" className="btn btn-primary" style={{ padding: '0.5rem 0.875rem', fontSize: '0.8125rem' }}>
              <PlusCircle size={16} /> Create Transfer Request
            </Link>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Batch</th>
                  <th>Current Stock</th>
                  <th>Min Level</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {myInventory.filter((i) => i && (Number(i.quantity) || 0) <= (Number(i.minimumStockLevel) || 0)).length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '1.5rem' }}>
                      {loading ? 'Checking stock levels...' : 'All medicines are at optimal stock levels.'}
                    </td>
                  </tr>
                ) : (
                  myInventory
                    .filter((i) => i && (Number(i.quantity) || 0) <= (Number(i.minimumStockLevel) || 0))
                    .map((item, idx) => (
                      <tr key={item?.inventoryId || item?.id || idx}>
                        <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item?.medicineName || 'Medicine'}</td>
                        <td><code>{item?.batchNumber || 'N/A'}</code></td>
                        <td style={{ color: 'var(--danger)', fontWeight: 800 }}>{item?.quantity || 0}</td>
                        <td>{item?.minimumStockLevel || 0}</td>
                        <td>
                          <span className="badge badge-danger">Low Stock</span>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* My Requests Track */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Recent Transfer Requests
            </h3>
            <Link to="/phc/my-requests" style={{ fontSize: '0.8125rem', color: 'var(--primary)' }}>
              View All
            </Link>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Req ID</th>
                  <th>Medicine</th>
                  <th>Qty</th>
                  <th>Source PHC</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {myRequests.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '1.5rem' }}>
                      {loading ? 'Loading transfer requests...' : 'No recent transfer requests submitted.'}
                    </td>
                  </tr>
                ) : (
                  myRequests.map((req, idx) => {
                    const reqId = req?.requestId || req?.id || `req-${idx}`;
                    const status = req?.status || 'PENDING';
                    const srcPhc = getShortPhcName(req?.sourcePhcName);

                    return (
                      <tr key={reqId}>
                        <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{reqId}</td>
                        <td>{req?.medicineName || 'Medicine'}</td>
                        <td style={{ fontWeight: 700 }}>{req?.quantity || 0}</td>
                        <td style={{ fontSize: '0.8125rem' }}>{srcPhc}</td>
                        <td>
                          <span
                            className={`badge ${
                              status === 'APPROVED' || status === 'COMPLETED'
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
      </div>
    </DashboardLayout>
  );
};
