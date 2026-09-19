import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { DhoTransferBarChart } from '../../components/charts/DhoTransferBarChart';
import { requestService } from '../../services/requestService';
import { inventoryService } from '../../services/inventoryService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Download, ArrowLeftRight, Clock, CheckCircle2, PackageCheck, ShoppingBag, BarChart2, AlertTriangle } from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { DataTable } from '../../components/common/DataTable';
import { exportDhoReportPDF } from '../../utils/exportUtils';

export const DhoReports = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [procurementList, setProcurementList] = useState([]);
  const [transferChartData, setTransferChartData] = useState([]);
  const [districtAlerts, setDistrictAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    completed: 0,
    totalMedicinesTransferred: 0
  });

  useEffect(() => {
    if (!user || !user.districtId) return;
    let isMounted = true;

    const loadData = async (districtId, districtName) => {
      console.log('Authenticated DHO (Reports):', user);
      console.log('District ID:', districtId);
      console.log('District Name:', districtName);

      setLoading(true);

      try {
        const districtRequestsRes = await requestService.getRequestsForDho(user).catch(() => []);
        const districtRequests = Array.isArray(districtRequestsRes) ? districtRequestsRes : [];

        const pending = districtRequests.filter((r) => r && r.status === 'PENDING').length;
        const approved = districtRequests.filter((r) => r && (r.status === 'APPROVED' || r.status === 'COMPLETED')).length;
        const rejected = districtRequests.filter((r) => r && r.status === 'REJECTED').length;

        const totalMedicinesTransferred = districtRequests
          .filter((r) => r && (r.status === 'APPROVED' || r.status === 'COMPLETED'))
          .reduce((sum, r) => sum + (Number(r.quantity) || 0), 0);

        if (!isMounted) return;

        setStats({
          total: districtRequests.length,
          pending,
          approved,
          rejected,
          completed: approved,
          totalMedicinesTransferred
        });

        const transferSummary = await requestService.getDistrictTransferSummary(districtId, districtName).catch(() => []);
        const procList = await inventoryService.getDistrictProcurement(districtId, districtName).catch(() => []);
        const alertsList = await inventoryService.getDistrictAlerts(districtId, districtName).catch(() => []);

        if (isMounted) {
          setTransferChartData(Array.isArray(transferSummary) ? transferSummary : []);
          setProcurementList(Array.isArray(procList) ? procList : []);
          setDistrictAlerts(Array.isArray(alertsList) ? alertsList : []);
        }
      } catch (err) {
        console.error('Failed to load DHO reports data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData(user.districtId, user.districtName);
    return () => {
      isMounted = false;
    };
  }, [user?.districtId, user?.districtName]);

  const districtLabel = user?.districtName || user?.districtId || 'District';

  const procurementColumns = [
    {
      header: 'Medicine Name',
      key: 'medicineName',
      render: (val) => <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{val || '-'}</span>
    },
    {
      header: 'PHC Facility',
      key: 'phcName',
      render: (val) => <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{val || '-'}</span>
    },
    {
      header: 'Current Stock',
      key: 'currentStock',
      align: 'right',
      render: (val, item) => (
        <span style={{ fontWeight: 700, color: (Number(val) || 0) < (Number(item.minimumStockLevel) || 50) ? 'var(--danger)' : 'var(--text-main)' }}>
          {val ?? 0}
        </span>
      )
    },
    {
      header: 'Min Level',
      key: 'minimumStockLevel',
      align: 'right',
      render: (val) => <span style={{ color: 'var(--text-muted)' }}>{val || 50}</span>
    },
    {
      header: 'Predicted Demand',
      key: 'predictedDemand',
      align: 'right',
      render: (val) => <span style={{ fontWeight: 600, color: 'var(--info)' }}>{val || 100}</span>
    },
    {
      header: 'Recommended Reorder',
      key: 'recommendedReorder',
      align: 'right',
      render: (val, item) => {
        const currentQty = Number(item.currentStock) || 0;
        const predicted = Number(item.predictedDemand) || 100;
        const safety = Number(item.safetyStock) || 50;
        const reorderQty = val ?? Math.max(0, predicted + safety - currentQty);

        return (
          <span style={{ fontWeight: 700, color: reorderQty > 0 ? 'var(--primary)' : 'var(--text-muted)' }}>
            {reorderQty} units
          </span>
        );
      }
    },
    {
      header: 'AI Recommendation',
      key: 'status',
      align: 'center',
      render: (val, item) => {
        const currentQty = Number(item.currentStock) || 0;
        const minLevel = Number(item.minimumStockLevel) || 50;
        const predicted = Number(item.predictedDemand) || 100;

        const statusText = val || (currentQty === 0 ? 'CRITICAL' : currentQty < minLevel ? 'URGENT' : currentQty < predicted ? 'PROCUREMENT REQUIRED' : 'STOCK SUFFICIENT');
        const badgeClass = item.urgencyBadge || (statusText === 'CRITICAL' ? 'badge-danger' : statusText === 'URGENT' ? 'badge-warning' : statusText === 'PROCUREMENT REQUIRED' ? 'badge-info' : 'badge-success');

        return (
          <span className={`badge ${badgeClass}`} style={{ fontSize: '0.75rem', padding: '0.25rem 0.625rem', whiteSpace: 'nowrap' }}>
            {statusText}
          </span>
        );
      }
    }
  ];

  const handleExportPDF = () => {
    const headers = ['PHC Facility', 'Pending Transfers', 'Approved Transfers', 'Rejected Transfers'];
    const rows = transferChartData.map((item) => ({
      'PHC Facility': item.phcName || item.phcId || 'PHC',
      'Pending Transfers': item.pending || 0,
      'Approved Transfers': item.approved || 0,
      'Rejected Transfers': item.rejected || 0
    }));

    exportDhoReportPDF('DHO_District_Transfer_Report', `District Stock Transfer & Demand Report`, `District ${districtLabel} Health Facilities`, headers, rows);
    showToast('✓ DHO District Report exported successfully', 'success');
  };

  return (
    <DashboardLayout title="District Reports & Analytics">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            {districtLabel} District Overview
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
            Real-time inter-PHC medicine transfer activity, procurement forecast, and alert logs.
          </p>
        </div>

        <button onClick={handleExportPDF} className="btn btn-primary" disabled={transferChartData.length === 0}>
          <Download size={16} /> Export District PDF Report
        </button>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <StatCard title="Total Transfer Requests" value={stats.total} icon={ArrowLeftRight} color="blue" subtext="District Movements" />
        <StatCard title="Pending Decision" value={stats.pending} icon={Clock} color="amber" subtext="Action Required" />
        <StatCard title="Approved Transfers" value={stats.approved} icon={CheckCircle2} color="emerald" subtext="Successfully Executed" />
        <StatCard title="Units Transferred" value={stats.totalMedicinesTransferred.toLocaleString()} icon={PackageCheck} color="indigo" subtext="Medicines Balanced" />
      </div>

      {/* Dynamic PHC-wise Transfer Activity Bar Chart */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <BarChart2 size={20} color="var(--primary)" />
            <span>PHC-wise Transfer Activity Comparison ({districtLabel})</span>
          </h3>
          <span className="badge badge-neutral">{transferChartData.length} District PHCs</span>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)' }}>
            Loading district transfer summary...
          </div>
        ) : (
          <DhoTransferBarChart data={transferChartData} />
        )}
      </div>

      {/* District Procurement Recommendations */}
      <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <ShoppingBag size={20} color="var(--info)" />
          <span>Procurement Recommendations ({districtLabel})</span>
        </h3>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)' }}>
            Loading procurement recommendations...
          </div>
        ) : (
          <DataTable
            columns={procurementColumns}
            data={procurementList}
            keyField="medicineId"
            emptyMessage="No immediate procurement reorders required for your district."
          />
        )}
      </div>

      {/* District-Scoped Inventory & Stock Alerts */}
      <div className="card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--warning)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={20} color="var(--warning)" />
            <span>Intelligent Inventory & Stock Alerts ({districtLabel})</span>
          </h3>
          <span className="badge badge-warning">{districtAlerts.length} District Alerts</span>
        </div>

        {districtAlerts.length === 0 ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.875rem' }}>
            No inventory alerts detected for your district.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {districtAlerts.map((alert, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  background: alert.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                  border: alert.severity === 'CRITICAL' ? '1px solid var(--danger)' : '1px solid var(--warning)'
                }}
              >
                <AlertTriangle size={18} color={alert.severity === 'CRITICAL' ? 'var(--danger)' : 'var(--warning)'} />
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {alert.message || alert.title}
                </span>
                <span className={`badge ${alert.severity === 'CRITICAL' ? 'badge-danger' : 'badge-warning'}`} style={{ marginLeft: 'auto' }}>
                  {alert.type || 'Alert'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
