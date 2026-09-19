import React from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useNotifications } from '../../context/NotificationContext';
import { formatDateTime } from '../../utils/dateUtils';
import { CheckCheck, Trash2 } from 'lucide-react';

export const AdminNotifications = () => {
  const { notifications, unreadCount, markAllAsRead, clearNotifications } = useNotifications();

  const handleMarkAll = async () => {
    await markAllAsRead();
  };

  const handleClear = async () => {
    await clearNotifications();
  };

  return (
    <DashboardLayout title="Notifications">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}
      >
        <div style={{ fontSize: '0.875rem', color: 'var(--text-dim)' }}>
          {unreadCount} Unread System Notifications
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-outline" onClick={handleMarkAll}>
            <CheckCheck size={16} /> Mark All Read
          </button>
          <button className="btn btn-secondary" onClick={handleClear}>
            <Trash2 size={16} /> Clear Read
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {notifications.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
            No notifications available
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.notificationId}
              className="card"
              style={{
                borderLeft: n.read ? '4px solid var(--border-color)' : '4px solid var(--primary)',
                backgroundColor: n.read ? 'var(--bg-card)' : 'var(--primary-light)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                    {n.title}
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>{n.message}</p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.5rem', display: 'inline-block' }}>
                    {formatDateTime(n.timestamp)}
                  </span>
                </div>
                {!n.read && <span className="badge badge-info">New</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
};
