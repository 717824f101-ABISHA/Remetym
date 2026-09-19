import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { Activity, Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!usernameOrEmail.trim() || !password) {
      setError('Please enter both email/username and password.');
      return;
    }

    setLoading(true);

    try {
      const loggedUser = await login(usernameOrEmail, password);

      if (!loggedUser || loggedUser.status !== 'ACTIVE') {
        setError('Access Denied. You are not authorized to access this system.');
        return;
      }

      showToast('✓ Login successful', 'success');

      // Auto route based on authenticated role
      if (loggedUser.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (loggedUser.role === 'DHO') {
        navigate('/dho/dashboard');
      } else if (loggedUser.role === 'PHC_STAFF') {
        navigate('/phc/dashboard');
      } else {
        setError('Access Denied. You are not authorized to access this system.');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
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
      {/* Top Header Controls: Theme Toggle & Back to Home */}
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
        {/* Branding Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
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

        {/* Error Alert */}
        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form (NO ROLE SELECTION) */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email-input">
              Email / Username
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="email-input"
                type="text"
                className="form-control"
                placeholder="Enter email or username"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
              <Mail
                size={18}
                color="var(--text-dim)"
                style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" htmlFor="password-input">
                Password
              </label>
              <Link
                to="/forgot-password"
                style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 600 }}
              >
                Forgot Password?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                required
              />
              <Lock
                size={18}
                color="var(--text-dim)"
                style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
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
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem', fontSize: '1rem', fontWeight: 700 }}
          >
            {loading ? 'Logging In...' : 'Login'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Register
          </Link>
        </div>

      </div>
    </div>
  );
};
