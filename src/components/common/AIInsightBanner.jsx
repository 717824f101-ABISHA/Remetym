import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ShieldAlert, ArrowRight, PackageCheck, AlertCircle } from 'lucide-react';
import { inventoryService } from '../../services/inventoryService';
import { useAuth } from '../../context/AuthContext';

export const AIInsightBanner = ({ insights: passedInsights }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const generateLiveAlerts = async () => {
      setLoading(true);
      try {
        let invItems = [];
        const phcId = user?.phcId || user?.id || '';
        const phcName = user?.phcName || user?.name || user?.phc || '';

        if (user?.role === 'PHC_STAFF' && (phcId || phcName)) {
          invItems = await inventoryService.getInventoryByPhc(phcId, phcName);
        } else if (user?.role === 'DHO' && (user?.districtId || user?.districtName)) {
          invItems = await inventoryService.getInventoryByDistrict(user.districtId, user.districtName);
        } else {
          invItems = await inventoryService.getInventory(true);
        }

        if (!Array.isArray(invItems)) invItems = [];

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const liveAlerts = [];

        invItems.forEach((item) => {
          if (!item) return;
          const qty = Number(item.quantity) || 0;
          const minLevel = Number(item.minimumStockLevel) || 50;
          const medName = item.medicineName || 'Essential Medicine';
          const pName = item.phcName || 'PHC Center';
          const batchNo = item.batchNumber || 'N/A';

          let expDate = null;
          if (item.expiryDate) {
            if (typeof item.expiryDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(item.expiryDate.trim())) {
              const [y, m, d] = item.expiryDate.trim().split('-').map(Number);
              expDate = new Date(y, m - 1, d);
            } else {
              expDate = new Date(item.expiryDate);
            }
          }

          let daysLeft = 365;
          if (expDate && !isNaN(expDate.getTime())) {
            const diffTime = expDate.getTime() - now.getTime();
            daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          }

          // 1. Critical Stockout
          if (qty === 0) {
            liveAlerts.push({
              type: 'CRITICAL_STOCKOUT',
              severity: 'high',
              title: 'Critical Stockout',
              message: `${medName} is out of stock at ${pName}. Urgent stock rebalance required.`,
              badgeText: 'Critical',
              badgeClass: 'badge-danger',
              order: 1
            });
          }
          // 2. Expiry Risk Alert (<= 60 days)
          else if (daysLeft <= 60) {
            liveAlerts.push({
              type: 'EXPIRY_RISK',
              severity: 'medium',
              title: 'Expiry Risk Alert',
              message: `${medName} (Batch ${batchNo}) expires in ${daysLeft} days at ${pName}. Priority dispensing recommended.`,
              badgeText: 'Expiry Risk',
              badgeClass: 'badge-warning',
              order: 2
            });
          }
          // 3. Low Stock Alert
          else if (qty <= minLevel) {
            liveAlerts.push({
              type: 'LOW_STOCK',
              severity: 'medium',
              title: 'Low Stock Alert',
              message: `${medName} has fallen below minimum threshold (${qty} units remaining at ${pName}).`,
              badgeText: 'Low Stock',
              badgeClass: 'badge-info',
              order: 3
            });
          }
        });

        liveAlerts.sort((a, b) => a.order - b.order);

        if (isMounted) {
          setAlerts(liveAlerts);
        }
      } catch (err) {
        console.warn('Failed to generate inventory alerts:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    generateLiveAlerts();
    return () => {
      isMounted = false;
    };
  }, [user, passedInsights]);

  const getReportPath = () => {
    if (user?.role === 'ADMIN') return '/admin/reports';
    if (user?.role === 'DHO') return '/dho/reports';
    return '/phc/reports/expiry-risk';
  };

  const criticalCount = alerts.filter((a) => a.type === 'CRITICAL_STOCKOUT').length;
  const expiryCount = alerts.filter((a) => a.type === 'EXPIRY_RISK').length;
  const lowStockCount = alerts.filter((a) => a.type === 'LOW_STOCK').length;

  return (
    <div
      style={{
        background: 'var(--primary-light, rgba(22, 163, 74, 0.08))',
        border: '1px solid var(--primary, #16A34A)',
        borderRadius: '16px',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        boxShadow: 'var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))',
        transition: 'var(--transition)'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          borderBottom: '1px solid var(--border-color, #E2E8F0)',
          paddingBottom: '0.75rem',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              padding: '0.375rem',
              borderRadius: '8px',
              backgroundColor: 'var(--primary, #16A34A)',
              color: '#ffffff',
              display: 'flex'
            }}
          >
            <AlertTriangle size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-main, #0F172A)', margin: 0 }}>
                Intelligent Inventory & Stock Alerts{user?.role === 'DHO' && user?.districtName ? ` (${user.districtName})` : ''}
              </h3>
              {alerts.length > 0 && (
                <div style={{ display: 'flex', gap: '0.375rem' }}>
                  {criticalCount > 0 && <span className="badge badge-danger" style={{ fontSize: '0.75rem', fontWeight: 700 }}>{criticalCount} Critical</span>}
                  {expiryCount > 0 && <span className="badge badge-warning" style={{ fontSize: '0.75rem', fontWeight: 700 }}>{expiryCount} Expiry Risk</span>}
                  {lowStockCount > 0 && <span className="badge badge-info" style={{ fontSize: '0.75rem', fontWeight: 700 }}>{lowStockCount} Low Stock</span>}
                </div>
              )}
            </div>
            <p style={{ fontSize: '0.78125rem', color: 'var(--text-muted, #64748B)', margin: '0.125rem 0 0 0' }}>
              Automated stock health, procurement requirements & expiry risk alerts
            </p>
          </div>
        </div>

        <button
          className="btn btn-primary btn-sm"
          onClick={() => navigate(getReportPath())}
          style={{ fontSize: '0.78125rem', padding: '0.4rem 0.9rem', backgroundColor: '#16A34A', border: 'none', color: '#FFFFFF', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
        >
          View Detailed Reports <ArrowRight size={14} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        {alerts.length === 0 ? (
          <div
            style={{
              backgroundColor: 'var(--bg-card, #FFFFFF)',
              border: '1px solid var(--border-color, #E2E8F0)',
              borderRadius: '10px',
              padding: '1rem',
              color: 'var(--text-muted, #475569)',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem'
            }}
          >
            <PackageCheck size={18} color="#16A34A" />
            <span>
              {loading ? 'Analyzing live database inventory stock levels...' : 'All monitored inventory is currently within safe stock and expiry thresholds.'}
            </span>
          </div>
        ) : (
          alerts.map((item, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: 'var(--bg-card, #FFFFFF)',
                border: item.severity === 'high' ? '1px solid #EF4444' : '1px solid #F59E0B',
                borderRadius: '10px',
                padding: '1rem',
                display: 'flex',
                gap: '0.875rem',
                alignItems: 'flex-start'
              }}
            >
              <div style={{ color: item.severity === 'high' ? '#EF4444' : '#F59E0B', marginTop: '2px', flexShrink: 0 }}>
                {item.type === 'CRITICAL_STOCKOUT' ? <AlertCircle size={20} /> : <ShieldAlert size={20} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main, #0F172A)' }}>
                    {item.title}
                  </span>
                  <span className={`badge ${item.badgeClass}`} style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', fontWeight: 700 }}>
                    {item.badgeText}
                  </span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #334155)', lineHeight: '1.45' }}>
                  {item.message}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
