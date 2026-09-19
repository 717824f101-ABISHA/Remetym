import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { Activity, Lock, Mail, User, Building2, Hospital, CreditCard, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('DHO'); // 'DHO' or 'PHC_STAFF' only

  // DHO Specific Fields
  const [districtName, setDistrictName] = useState('');
  const [dhoId, setDhoId] = useState('');

  // PHC Staff Specific Fields
  const [phcDistrict, setPhcDistrict] = useState('');
  const [phcName, setPhcName] = useState('');
  const [phcId, setPhcId] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validations
    const cleanUsername = username.trim();
    const cleanEmail = email.trim();

    if (!cleanUsername) {
      setError('Username is required.');
      return;
    }

    if (!cleanEmail) {
      setError('Email is required.');
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Password is required.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (role === 'ADMIN') {
      setError('Admin registration is not permitted.');
      return;
    }

    // Role-specific payload construction and validation
    let registrationPayload = {};

    if (role === 'DHO') {
      const cleanDistrict = districtName.trim();
      const cleanDhoId = dhoId.trim();

      if (!cleanDistrict) {
        setError('District Name is required for DHO registration.');
        return;
      }
      if (!cleanDhoId) {
        setError('DHO ID is required for DHO registration.');
        return;
      }

      registrationPayload = {
        username: cleanUsername,
        email: cleanEmail,
        password,
        role: 'DHO',
        districtName: cleanDistrict,
        dhoId: cleanDhoId
      };
    } else if (role === 'PHC_STAFF') {
      const cleanDistrict = phcDistrict.trim();
      const cleanPhcName = phcName.trim();
      const cleanPhcId = phcId.trim();

      if (!cleanDistrict) {
        setError('District is required for PHC Staff registration.');
        return;
      }
      if (!cleanPhcName) {
        setError('PHC Name is required for PHC Staff registration.');
        return;
      }
      if (!cleanPhcId) {
        setError('PHC ID is required for PHC Staff registration.');
        return;
      }

      registrationPayload = {
        username: cleanUsername,
        email: cleanEmail,
        password,
        role: 'PHC_STAFF',
        districtName: cleanDistrict,
        district: cleanDistrict,
        phcName: cleanPhcName,
        phcId: cleanPhcId
      };
    }

    setLoading(true);

    try {
      await register(registrationPayload);

      const messageText = 'Registration submitted successfully. Your account is pending Admin approval. You can log in only after your registration is approved.';
      setSuccessMessage(messageText);
      showToast('✓ Registration submitted for Admin approval.', 'success');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
        padding: '2rem 1.5rem',
        position: 'relative',
        transition: 'background-color 0.25s ease'
      }}
    >
      {/* Top Header Controls */}
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <ThemeToggle size={18} />
        <Link to="/" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          ← Home
        </Link>
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* Branding Logo */}
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

        {/* Section Heading */}
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.25rem', textAlign: 'center' }}>
          Official User Registration
        </h3>

        {/* Success Alert Banner */}
        {successMessage ? (
          <div
            style={{
              backgroundColor: 'var(--success-bg)',
              border: '1px solid var(--success)',
              borderRadius: '12px',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}
          >
            <CheckCircle2 size={32} color="var(--success)" style={{ margin: '0 auto 0.75rem', display: 'block' }} />
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Registration Submitted!
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              {successMessage}
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/login')}
              style={{ marginTop: '1.25rem', width: '100%', padding: '0.625rem', fontSize: '0.9375rem', fontWeight: 700 }}
            >
              Go to Login Page
            </button>
          </div>
        ) : (
          <>
            {/* Error Alert */}
            {error && (
              <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit}>
              {/* Username */}
              <div className="form-group">
                <label className="form-label" htmlFor="register-username">
                  Username <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="register-username"
                    type="text"
                    className="form-control"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                  <User
                    size={18}
                    color="var(--text-dim)"
                    style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label" htmlFor="register-email">
                  Email <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="register-email"
                    type="email"
                    className="form-control"
                    placeholder="Enter official email"
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

              {/* Password */}
              <div className="form-group">
                <label className="form-label" htmlFor="register-password">
                  Password <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="Enter password"
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

              {/* Role Selection (DHO or PHC Staff ONLY - NO ADMIN) */}
              <div className="form-group">
                <label className="form-label" htmlFor="register-role">
                  Role <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <select
                  id="register-role"
                  className="form-control"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{ fontWeight: 600 }}
                  required
                >
                  <option value="DHO">DHO (District Health Officer)</option>
                  <option value="PHC_STAFF">PHC Staff / Inventory In-charge</option>
                </select>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem', display: 'block' }}>
                  * Admin accounts cannot be created via registration.
                </span>
              </div>

              {/* DHO SPECIFIC FIELDS */}
              {role === 'DHO' && (
                <>
                  <div className="form-group">
                    <label className="form-label" htmlFor="register-district-name">
                      District Name <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="register-district-name"
                        type="text"
                        className="form-control"
                        placeholder="Enter District Name (e.g. Northern Health District)"
                        value={districtName}
                        onChange={(e) => setDistrictName(e.target.value)}
                        style={{ paddingLeft: '2.5rem' }}
                        required
                      />
                      <Building2
                        size={18}
                        color="var(--text-dim)"
                        style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="register-dho-id">
                      DHO ID <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="register-dho-id"
                        type="text"
                        className="form-control"
                        placeholder="Enter DHO ID (e.g. DHO-8821)"
                        value={dhoId}
                        onChange={(e) => setDhoId(e.target.value)}
                        style={{ paddingLeft: '2.5rem' }}
                        required
                      />
                      <CreditCard
                        size={18}
                        color="var(--text-dim)"
                        style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* PHC STAFF SPECIFIC FIELDS */}
              {role === 'PHC_STAFF' && (
                <>
                  <div className="form-group">
                    <label className="form-label" htmlFor="register-phc-district">
                      District <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="register-phc-district"
                        type="text"
                        className="form-control"
                        placeholder="Enter District Name (e.g. Northern Health District)"
                        value={phcDistrict}
                        onChange={(e) => setPhcDistrict(e.target.value)}
                        style={{ paddingLeft: '2.5rem' }}
                        required
                      />
                      <Building2
                        size={18}
                        color="var(--text-dim)"
                        style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="register-phc-name">
                      PHC Name <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="register-phc-name"
                        type="text"
                        className="form-control"
                        placeholder="Enter PHC Name (e.g. City Primary Health Centre)"
                        value={phcName}
                        onChange={(e) => setPhcName(e.target.value)}
                        style={{ paddingLeft: '2.5rem' }}
                        required
                      />
                      <Hospital
                        size={18}
                        color="var(--text-dim)"
                        style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="register-phc-id">
                      PHC ID <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="register-phc-id"
                        type="text"
                        className="form-control"
                        placeholder="Enter PHC ID (e.g. PHC-101)"
                        value={phcId}
                        onChange={(e) => setPhcId(e.target.value)}
                        style={{ paddingLeft: '2.5rem' }}
                        required
                      />
                      <CreditCard
                        size={18}
                        color="var(--text-dim)"
                        style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }}
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem', fontSize: '1rem', fontWeight: 700 }}
              >
                {loading ? 'Submitting Registration...' : 'Submit Registration Request'}
              </button>
            </form>
          </>
        )}

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};
