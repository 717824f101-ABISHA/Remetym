import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { UserAvatar } from '../../components/common/UserAvatar';
import { ShieldCheck, Save } from 'lucide-react';

export const AdminProfile = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [title, setTitle] = useState(user?.title || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUser({ name, title });
    showToast('✓ Profile updated successfully', 'success');
  };

  return (
    <DashboardLayout title="My Profile">
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div className="card" style={{ marginBottom: '1.5rem', textAlign: 'center', padding: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <UserAvatar name={user?.name} role={user?.role} size={96} fontSize="2.25rem" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{user?.name}</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600, marginTop: '0.25rem' }}>
            {user?.title}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.375rem 0.875rem',
                borderRadius: '9999px',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#EF4444',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: '1px solid rgba(239, 68, 68, 0.3)'
              }}
            >
              <ShieldCheck size={14} /> SYSTEM ADMINISTRATOR
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.375rem 0.875rem',
                borderRadius: '9999px',
                backgroundColor: 'var(--success-bg)',
                color: 'var(--success)',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: '1px solid rgba(34, 197, 94, 0.3)'
              }}
            >
              STATUS: ACTIVE
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-main)' }}>
            Account Details
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Official Designation Title</label>
              <input
                type="text"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input type="text" className="form-control" value={user?.username} disabled />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-control" value={user?.email} disabled />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">District Scope</label>
                <input type="text" className="form-control" value={user?.districtName || 'All Districts'} disabled />
              </div>

              <div className="form-group">
                <label className="form-label">Facility Scope</label>
                <input type="text" className="form-control" value={user?.phcName || 'All PHCs'} disabled />
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button type="submit" className="btn btn-primary">
                <Save size={16} /> Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};
