import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { Activity, Mail, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email.trim()) {
      setError('Please enter your registered email address.');
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      await authService.forgotPassword(email.trim());
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to request password reset.');
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

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.375rem' }}>
            Forgot Password?
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
            Enter your registered email address and we will send a password reset link to your email.
          </p>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div>
            <div className="alert alert-success" style={{ marginBottom: '1.5rem', alignItems: 'flex-start' }}>
              <CheckCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>If an account exists for this email, a password reset link has been sent to your inbox. Please check your email.</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="recovery-email">
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="recovery-email"
                  type="email"
                  className="form-control"
                  placeholder="Enter registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', fontSize: '1rem', fontWeight: 700 }}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
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
