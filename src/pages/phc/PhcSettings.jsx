import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useToast } from '../../context/ToastContext';
import { KEYS } from '../../utils/storageUtils';
import { Bell, Check } from 'lucide-react';

const DEFAULT_PHC_SETTINGS = {
  notifyOnApproval: true,
  lowStockAlerts: true
};

export const PhcSettings = () => {
  const [notifyOnApproval, setNotifyOnApproval] = useState(DEFAULT_PHC_SETTINGS.notifyOnApproval);
  const [lowStockAlerts, setLowStockAlerts] = useState(DEFAULT_PHC_SETTINGS.lowStockAlerts);
  const { showToast } = useToast();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEYS.SETTINGS_PHC);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.notifyOnApproval !== undefined) setNotifyOnApproval(parsed.notifyOnApproval);
        if (parsed.lowStockAlerts !== undefined) setLowStockAlerts(parsed.lowStockAlerts);
      }
    } catch (err) {
      console.error('Failed to load PHC settings:', err);
    }
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    try {
      const settings = { notifyOnApproval, lowStockAlerts };
      localStorage.setItem(KEYS.SETTINGS_PHC, JSON.stringify(settings));
      showToast('✓ Notification preferences saved', 'success');
    } catch (err) {
      showToast('Failed to save preferences', 'danger');
    }
  };

  return (
    <DashboardLayout title="Settings">
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <form onSubmit={handleSave} className="card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={18} color="var(--primary)" /> Notification Preferences
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Transfer Approval Notifications</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-dim)' }}>Alert when DHO approves or rejects requested stock transfers</div>
            </div>
            <input
              type="checkbox"
              checked={notifyOnApproval}
              onChange={(e) => setNotifyOnApproval(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Pharmacy Low Stock Warning</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-dim)' }}>Display dashboard alerts when inventory falls below minimum threshold</div>
            </div>
            <input
              type="checkbox"
              checked={lowStockAlerts}
              onChange={(e) => setLowStockAlerts(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary">
              <Check size={16} style={{ marginRight: '0.25rem' }} /> Save Preferences
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};
