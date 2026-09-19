import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { Activity, Lock, Eye, EyeOff, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token.');
      setTokenValid(false);
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!newPassword) {
      setError('New password is required.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (!confirmPassword) {
      setError('Confirm password is required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(token, newPassword, confirmPassword);
      setSuccess(true);
      if (showToast) showToast('✓ Password reset successful', 'success');
    } catch (err) {
      setError(err.message || 'Invalid or expired reset token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-dark)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        position: 'relative',
        transition: 'background-color 0.25s ease'
      }}
    >
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <ThemeToggle size={18} />
        <Link to="/" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          ← Home
        </Link>
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, var(--primary) 0%, #0EA5E9 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              margin: '0 auto 1rem',
              boxShadow: '0 4px 16px rgba(22, 163, 74, 0.3)'
            }}
          >
            <Activity size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.375rem' }}>
            Reme<span style={{ color: 'var(--primary)' }}>Tym</span>
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-dim)', margin: 0 }}>
            Intelligent Medicine Stock & Expiry Management System
          </p>
        </div>

        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.25rem', textAlign: 'center' }}>
          Reset Password
        </h3>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div className="alert alert-success" style={{ marginBottom: '1.5rem', justifyContent: 'center' }}>
              <CheckCircle size={20} />
              <span>Your password has been reset successfully.</span>
            </div>

            <Link
              to="/login"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', fontWeight: 700, display: 'inline-flex', justifyContent: 'center' }}
            >
              Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="new-password-input">
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="new-password-input"
                  type={showNewPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  disabled={!tokenValid}
                  required
                />
                <Lock
                  size={18}
                  color="var(--text-dim)"
                  style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.875rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-dim)',
                    cursor: 'pointer',
                    padding: 0
                  }}
                  aria-label="Toggle password visibility"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirm-password-input">
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="confirm-password-input"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  disabled={!tokenValid}
                  required
                />
                <Lock
                  size={18}
                  color="var(--text-dim)"
                  style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.875rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-dim)',
                    cursor: 'pointer',
                    padding: 0
                  }}
                  aria-label="Toggle password visibility"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={!tokenValid || loading}
              style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem', fontSize: '1rem', fontWeight: 700 }}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <Link
            to="/login"
            style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
          >
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};
