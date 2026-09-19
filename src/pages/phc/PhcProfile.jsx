import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { UserAvatar } from '../../components/common/UserAvatar';
import { ShieldCheck, Save } from 'lucide-react';

export const PhcProfile = () => {
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
    <DashboardLayout title="Profile">
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div className="card" style={{ marginBottom: '1.5rem', textAlign: 'center', padding: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <UserAvatar name={user?.name} role={user?.role} size={96} fontSize="2.25rem" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{user?.name}</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600, marginTop: '0.25rem' }}>
            {user?.title}
          </p>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.375rem 0.875rem',
              borderRadius: '9999px',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              fontSize: '0.75rem',
              fontWeight: 700,
              marginTop: '0.75rem',
              border: '1px solid var(--primary)'
            }}
          >
            <ShieldCheck size={14} /> PHC STAFF / PHARMACIST IN-CHARGE
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-main)' }}>
            Facility Personnel Record
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
              <label className="form-label">Title / Role</label>
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
                <label className="form-label">Official Email</label>
                <input type="email" className="form-control" value={user?.email} disabled />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Assigned District</label>
                <input type="text" className="form-control" value={user?.districtName || user?.district || '-'} disabled />
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Facility (PHC)</label>
                <input type="text" className="form-control" value={user?.phcName || user?.phc || '-'} disabled />
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button type="submit" className="btn btn-primary">
                <Save size={16} /> Save Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};
