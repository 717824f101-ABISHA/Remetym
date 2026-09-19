import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useToast } from '../../context/ToastContext';
import { KEYS } from '../../utils/storageUtils';
import { Bell, Check } from 'lucide-react';

const DEFAULT_DHO_SETTINGS = {
  notifyOnNewRequest: true,
  autoFlagLowStock: true
};

export const DhoSettings = () => {
  const [notifyOnNewRequest, setNotifyOnNewRequest] = useState(DEFAULT_DHO_SETTINGS.notifyOnNewRequest);
  const [autoFlagLowStock, setAutoFlagLowStock] = useState(DEFAULT_DHO_SETTINGS.autoFlagLowStock);
  const { showToast } = useToast();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEYS.SETTINGS_DHO);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.notifyOnNewRequest !== undefined) setNotifyOnNewRequest(parsed.notifyOnNewRequest);
        if (parsed.autoFlagLowStock !== undefined) setAutoFlagLowStock(parsed.autoFlagLowStock);
      }
    } catch (err) {
      console.error('Failed to load DHO settings:', err);
    }
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    try {
      const settings = { notifyOnNewRequest, autoFlagLowStock };
      localStorage.setItem(KEYS.SETTINGS_DHO, JSON.stringify(settings));
      showToast('✓ District settings updated successfully', 'success');
    } catch (err) {
      showToast('Failed to save settings', 'danger');
    }
  };

  return (
    <DashboardLayout title="Settings">
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <form onSubmit={handleSave} className="card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={18} color="var(--primary)" /> Notification & District Preferences
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Instant Transfer Request Alerts</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-dim)' }}>Receive notifications when a PHC submits a transfer request</div>
            </div>
            <input
              type="checkbox"
              checked={notifyOnNewRequest}
              onChange={(e) => setNotifyOnNewRequest(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Auto-Flag District Stockouts</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-dim)' }}>Highlight PHCs operating below minimum safety stock levels</div>
            </div>
            <input
              type="checkbox"
              checked={autoFlagLowStock}
              onChange={(e) => setAutoFlagLowStock(e.target.checked)}
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
