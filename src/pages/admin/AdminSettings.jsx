import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useToast } from '../../context/ToastContext';
import { KEYS } from '../../utils/storageUtils';
import { Bell, Check } from 'lucide-react';

const DEFAULT_ADMIN_SETTINGS = {
  expiryAlertThreshold: '30',
  emailNotifs: true,
  autoRebalanceSuggest: true
};

export const AdminSettings = () => {
  const [expiryAlertThreshold, setExpiryAlertThreshold] = useState(DEFAULT_ADMIN_SETTINGS.expiryAlertThreshold);
  const [emailNotifs, setEmailNotifs] = useState(DEFAULT_ADMIN_SETTINGS.emailNotifs);
  const [autoRebalanceSuggest, setAutoRebalanceSuggest] = useState(DEFAULT_ADMIN_SETTINGS.autoRebalanceSuggest);
  const { showToast } = useToast();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEYS.SETTINGS_ADMIN);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.expiryAlertThreshold !== undefined) setExpiryAlertThreshold(parsed.expiryAlertThreshold);
        if (parsed.emailNotifs !== undefined) setEmailNotifs(parsed.emailNotifs);
        if (parsed.autoRebalanceSuggest !== undefined) setAutoRebalanceSuggest(parsed.autoRebalanceSuggest);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    try {
      const settings = { expiryAlertThreshold, emailNotifs, autoRebalanceSuggest };
      localStorage.setItem(KEYS.SETTINGS_ADMIN, JSON.stringify(settings));
      showToast('✓ Preferences saved successfully', 'success');
    } catch (err) {
      showToast('Failed to save preferences', 'danger');
    }
  };

  return (
    <DashboardLayout title="Settings">
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <form onSubmit={handleSave}>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={18} color="var(--primary)" /> Notification & Alert Thresholds
            </h3>

            <div className="form-group">
              <label className="form-label">Expiry Warning Alert Window (Days)</label>
              <select
                className="form-control"
                value={expiryAlertThreshold}
                onChange={(e) => setExpiryAlertThreshold(e.target.value)}
              >
                <option value="15">15 Days Before Expiry</option>
                <option value="30">30 Days Before Expiry (Recommended)</option>
                <option value="60">60 Days Before Expiry</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Email Notification Broadcasts</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-dim)' }}>Simulate email alerts for high severity stockouts</div>
              </div>
              <input
                type="checkbox"
                checked={emailNotifs}
                onChange={(e) => setEmailNotifs(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>AI Stock Rebalance Insights</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-dim)' }}>Display predictive inter-PHC transfer suggestions</div>
              </div>
              <input
                type="checkbox"
                checked={autoRebalanceSuggest}
                onChange={(e) => setAutoRebalanceSuggest(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary">
              <Check size={16} style={{ marginRight: '0.25rem' }} /> Save Preferences
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};
