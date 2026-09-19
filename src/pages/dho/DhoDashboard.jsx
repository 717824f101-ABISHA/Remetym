import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/common/StatCard';
import { AIInsightBanner } from '../../components/common/AIInsightBanner';

import { inventoryService } from '../../services/inventoryService';
import { requestService } from '../../services/requestService';
import { Link } from 'react-router-dom';
import {
  Building2,
  Hospital,
  Package,
  AlertTriangle,
  Clock,
  ArrowLeftRight,
  CheckCircle2,
  XCircle,
  Eye
} from 'lucide-react';

export const DhoDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    districtName: '',
    phcCount: 0,
    totalStock: 0,
    lowStockCount: 0,
    expiringCount: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0
  });

  const [pendingList, setPendingList] = useState([]);

  useEffect(() => {
    if (!user || !user.districtId) return;
    let isMounted = true;

    const loadDashboard = async (districtId, districtName) => {
      console.log('Authenticated DHO:', user);
      console.log('District ID:', districtId);
      console.log('District Name:', districtName);

      try {
        const [summaryRes, requestsRes] = await Promise.all([
          inventoryService.getDistrictSummary(districtId, districtName),
          requestService.getRequestsForUser(user)
        ]);

        if (!isMounted) return;

        const summary = summaryRes || {};
        const requests = Array.isArray(requestsRes) ? requestsRes : [];
        const pending = requests.filter((r) => r && r.status === 'PENDING');

        setStats({
          districtName: districtName || summary.districtName || 'District',
          phcCount: Number(summary.districtPhcs ?? summary.phcCount ?? 0),
          totalStock: Number(summary.districtStockUnits ?? summary.stockUnits ?? 0),
          lowStockCount: Number(summary.lowStockItems ?? 0),
          expiringCount: Number(summary.expiringBatches ?? 0),
          pendingRequests: summary.pendingTransfers ?? summary.pendingRequests ?? pending.length,
          approvedRequests: summary.approvedTransfers ?? 0,
          rejectedRequests: summary.rejectedTransfers ?? 0
        });

        setPendingList(pending);
      } catch (err) {
        console.error('Failed to load DhoDashboard data:', err);
      }
    };

    loadDashboard(user.districtId, user.districtName);
    return () => {
      isMounted = false;
    };
  }, [user?.districtId, user?.districtName]);

  return (
    <DashboardLayout title="DHO Dashboard">
      <AIInsightBanner />

      {/* Top Level Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.5rem'
        }}
      >
        <StatCard title="Assigned District" value={stats.districtName} icon={Building2} color="emerald"  />
        <StatCard title="Pending Requests" value={stats.pendingRequests} icon={ArrowLeftRight} color="amber" subtext="Requires Action" />
        <StatCard title="Approved Transfers" value={stats.approvedRequests} icon={CheckCircle2} color="emerald" subtext="Successfully Transferred" />
        <StatCard title="Rejected Transfers" value={stats.rejectedRequests} icon={XCircle} color="rose" subtext="Declined Requests" />
      </div>

      {/* Secondary Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem'
        }}
      >
        <StatCard title="District PHCs" value={stats.phcCount} icon={Hospital} color="emerald" subtext="Health Facilities" />
        <StatCard title="District Stock Units" value={stats.totalStock.toLocaleString()} icon={Package} color="blue" subtext="Physical Stock On-hand" />
        <StatCard title="Low Stock Items" value={stats.lowStockCount} icon={AlertTriangle} color="amber" subtext="Below Safety Level" />
        <StatCard title="Expiring Batches" value={stats.expiringCount} icon={Clock} color="rose" />
      </div>

      {/* Pending Transfers Banner Notice */}
      {pendingList.length > 0 && (
        <div
          className="card"
          style={{
            marginBottom: '2rem',
            border: '2px solid var(--warning)',
            background: 'var(--primary-light)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <div style={{ padding: '0.625rem', borderRadius: '10px', backgroundColor: 'var(--warning)', color: '#ffffff' }}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                  {pendingList.length} Pending Transfer Request(s) Awaiting Decision
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
                  Review requested inter-PHC stock movements to balance medicine availability.
                </p>
              </div>
            </div>
            <Link to="/dho/transfer-requests" className="btn btn-primary" style={{ backgroundColor: 'var(--warning)', borderColor: 'var(--warning)', color: '#ffffff' }}>
              <Eye size={16} /> Review & Decision
            </Link>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
