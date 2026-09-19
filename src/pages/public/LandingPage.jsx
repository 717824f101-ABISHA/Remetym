import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import {
  Activity,
  ShieldCheck,
  ArrowRightLeft,
  Clock,
  Lock,
  Building2,
  Package,
  CheckCircle2,
  Check,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  LayoutDashboard,
  FileCheck2,
  UserPlus
} from 'lucide-react';

export const LandingPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'DHO') return '/dho/dashboard';
    return '/phc/dashboard';
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-dark)',
        color: 'var(--text-main)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        transition: 'background-color 0.25s ease, color 0.25s ease'
      }}
    >
      {/* ------------------------------------------------------------ */}
      {/* HEADER                                                      */}
      {/* ------------------------------------------------------------ */}
      <header
        style={{
          height: '76px',
          borderBottom: '1px solid var(--border-color)',
          padding: '0 2.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-sidebar)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: 'var(--shadow-sm)',
          transition: 'background-color 0.25s ease, border-color 0.25s ease'
        }}
      >
        {/* Left Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--primary) 0%, #0EA5E9 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}
          >
            <Activity size={26} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.02em', lineHeight: 1.1 }}>
              Reme<span style={{ color: 'var(--primary)' }}>Tym</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              Govt Healthcare Medical Supply System
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <button
            onClick={() => scrollToSection('home')}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer', transition: 'var(--transition)' }}
            onMouseOver={(e) => (e.target.style.color = 'var(--primary)')}
            onMouseOut={(e) => (e.target.style.color = 'var(--text-muted)')}
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection('about')}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer', transition: 'var(--transition)' }}
            onMouseOver={(e) => (e.target.style.color = 'var(--primary)')}
            onMouseOut={(e) => (e.target.style.color = 'var(--text-muted)')}
          >
            About
          </button>
          <button
            onClick={() => scrollToSection('features')}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer', transition: 'var(--transition)' }}
            onMouseOver={(e) => (e.target.style.color = 'var(--primary)')}
            onMouseOut={(e) => (e.target.style.color = 'var(--text-muted)')}
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection('why-remetym')}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer', transition: 'var(--transition)' }}
            onMouseOver={(e) => (e.target.style.color = 'var(--primary)')}
            onMouseOut={(e) => (e.target.style.color = 'var(--text-muted)')}
          >
            Why RemeTym
          </button>
          <button
            onClick={() => scrollToSection('contact')}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer', transition: 'var(--transition)' }}
            onMouseOver={(e) => (e.target.style.color = 'var(--primary)')}
            onMouseOut={(e) => (e.target.style.color = 'var(--text-muted)')}
          >
            Contact
          </button>
        </nav>

        {/* Right Action: Theme Toggle + Auth Buttons: "Register" & "Login" */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ThemeToggle size={18} />

          {isAuthenticated ? (
            <Link
              to={getDashboardPath()}
              className="btn btn-primary"
              style={{
                padding: '0.65rem 1.5rem',
                borderRadius: '8px',
                fontSize: '0.9375rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <LayoutDashboard size={16} /> Go to Dashboard
            </Link>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link
                to="/register"
                className="btn btn-outline"
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <UserPlus size={16} /> Register
              </Link>
              <Link
                to="/login"
                className="btn btn-primary"
                style={{
                  padding: '0.65rem 1.5rem',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Lock size={16} /> Login
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* ------------------------------------------------------------ */}
      {/* HERO SECTION                                                */}
      {/* ------------------------------------------------------------ */}
      <section
        id="home"
        style={{
          padding: '5rem 2rem 4rem',
          maxWidth: '1280px',
          margin: '0 auto',
          position: 'relative',
          width: '100%'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          {/* Tag badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1.25rem',
              borderRadius: '9999px',
              backgroundColor: 'var(--primary-light)',
              border: '1px solid var(--primary)',
              color: 'var(--primary)',
              fontSize: '0.875rem',
              fontWeight: 600,
              marginBottom: '1.75rem'
            }}
          >
            <ShieldCheck size={16} /> National Health Mission • Public Health Logistics Infrastructure
          </div>

          {/* Heading */}
          <h1
            style={{
              fontSize: '3.25rem',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              marginBottom: '1.5rem',
              color: 'var(--text-main)',
              maxWidth: '920px',
              margin: '0 auto 1.5rem'
            }}
          >
            Intelligent Medicine Stock & Expiry Management System
          </h1>

          {/* Short professional description */}
          <p
            style={{
              fontSize: '1.2rem',
              color: 'var(--text-muted)',
              maxWidth: '820px',
              margin: '0 auto 2.5rem',
              lineHeight: 1.6
            }}
          >
            RemeTym enables authorized Primary Health Centre (PHC) staff and District Health Officers to eliminate medicine wastage, prevent critical stockouts, track batch expiry dates, and streamline inter-facility stock redistribution.
          </p>

          {/* Primary Action */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.25rem', marginBottom: '3.5rem' }}>
            <button
              onClick={() => scrollToSection('features')}
              className="btn btn-outline"
              style={{
                padding: '0.875rem 2.25rem',
                borderRadius: '10px',
                fontSize: '1.0625rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              Explore Platform Features <ChevronRight size={18} />
            </button>
          </div>

          {/* Clean Healthcare Banner Graphic (No public live stock internal data) */}
          <div
            style={{
              maxWidth: '960px',
              margin: '0 auto',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '2.5rem 2rem',
              boxShadow: 'var(--shadow-lg)',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
              <div style={{ background: 'var(--bg-dark)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <Building2 size={28} color="var(--primary)" style={{ marginBottom: '0.75rem' }} />
                <h4 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.375rem' }}>
                  District Health Network
                </h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                  Unified governance across Primary Health Centres and District Health Offices.
                </p>
              </div>

              <div style={{ background: 'var(--bg-dark)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <ArrowRightLeft size={28} color="var(--primary)" style={{ marginBottom: '0.75rem' }} />
                <h4 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.375rem' }}>
                  PHC-to-PHC Redistribution
                </h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                  Rapid inter-facility stock transfers to balance medicine availability.
                </p>
              </div>

              <div style={{ background: 'var(--bg-dark)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <Clock size={28} color="var(--primary)" style={{ marginBottom: '0.75rem' }} />
                <h4 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.375rem' }}>
                  Early Expiry Risk Prevention
                </h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                  Batch-level tracking prevents pharmaceutical expiration and wastage.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* ABOUT REMETYM                                               */}
      {/* ------------------------------------------------------------ */}
      <section
        id="about"
        style={{
          padding: '5rem 2rem',
          backgroundColor: 'var(--bg-sidebar)',
          borderTop: '1px solid var(--border-color)',
          borderBottom: '1px solid var(--border-color)',
          transition: 'background-color 0.25s ease, border-color 0.25s ease'
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Healthcare System Purpose
            </span>
            <h2 style={{ fontSize: '2.375rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.5rem' }}>
              About RemeTym
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: '780px', margin: '0.75rem auto 0', lineHeight: 1.6 }}>
              RemeTym is an intelligent medicine stock and expiry management system engineered specifically for Government Primary Health Centres (PHC) and District Health Offices (DHO).
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '14px',
                padding: '2rem'
              }}
            >
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <Building2 size={24} color="var(--primary)" /> Public Healthcare Mission
              </h3>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                Primary health facilities frequently experience stock imbalances where one health center faces stockouts of vital medicines while another center holds surplus stock near expiration. RemeTym solves this problem through intelligent inter-facility inventory redistribution.
              </p>
            </div>

            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '14px',
                padding: '2rem'
              }}
            >
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <CheckCircle2 size={24} color="var(--success)" /> Core Objectives
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.9375rem', color: 'var(--text-muted)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={16} color="var(--success)" /> Continuous medicine availability at all PHCs
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={16} color="var(--success)" /> Zero pharmaceutical disposal wastage
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={16} color="var(--success)" /> Automated low-stock and expiry alerts
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={16} color="var(--success)" /> 1-Click PHC-to-PHC transfer requests
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={16} color="var(--success)" /> District Health Officer governance and audit logs
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* KEY PLATFORM FEATURES (EXACTLY 4 FEATURES PER SECTION 31)     */}
      {/* ------------------------------------------------------------ */}
      <section id="features" style={{ padding: '5rem 2rem', maxWidth: '1240px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span style={{ color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            System Capabilities
          </span>
          <h2 style={{ fontSize: '2.375rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.5rem' }}>
            Key Platform Features
          </h2>
          <p style={{ fontSize: '1.0625rem', color: 'var(--text-dim)', maxWidth: '700px', margin: '0.5rem auto 0' }}>
            Designed for accuracy, transparency, and high performance in healthcare supply chain management.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.75rem' }}>
          {/* Feature 1 */}
          <div className="card feature-card-hover" style={{ borderLeft: '4px solid var(--primary)', transition: 'var(--transition)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Package size={24} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              1. Medicine Inventory Management
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Maintain physical inventory counts, dosage forms, manufacturer records, and unit costs per health facility.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="card feature-card-hover" style={{ borderLeft: '4px solid #0EA5E9', transition: 'var(--transition)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: 'rgba(14, 165, 233, 0.15)', color: '#0EA5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Clock size={24} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              2. Expiry & Batch Monitoring
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Monitor batch-level expiration dates with color-coded risk indicators for safe, near-expiry, and expired stocks.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="card feature-card-hover" style={{ borderLeft: '4px solid #10B981', transition: 'var(--transition)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <ArrowRightLeft size={24} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              3. PHC-to-PHC Redistribution
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              PHCs facing medicine shortages request surplus stock directly from neighboring facilities within the district.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="card feature-card-hover" style={{ borderLeft: '4px solid #F59E0B', transition: 'var(--transition)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <FileCheck2 size={24} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              4. Transfer Tracking
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Transparent audit trails tracking every requested, approved, or completed inter-facility medicine transfer.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* WHY REMETYM / BENEFITS SECTION                               */}
      {/* ------------------------------------------------------------ */}
      <section
        id="why-remetym"
        style={{
          padding: '5rem 2rem',
          backgroundColor: 'var(--bg-sidebar)',
          borderTop: '1px solid var(--border-color)',
          borderBottom: '1px solid var(--border-color)',
          transition: 'background-color 0.25s ease, border-color 0.25s ease'
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Key Advantages
            </span>
            <h2 style={{ fontSize: '2.375rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.5rem' }}>
              Why RemeTym?
            </h2>
            <p style={{ fontSize: '1.0625rem', color: 'var(--text-dim)', maxWidth: '680px', margin: '0.5rem auto 0' }}>
              Transforming public healthcare pharmaceutical supply management across all district levels.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ color: 'var(--success)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={20} /> Better Medicine Availability
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                Prevents stockouts at health centers through timely inter-facility stock redistribution.
              </p>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ color: 'var(--success)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={20} /> Reduced Medicine Wastage
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                Identifies near-expiry batches early and transfers surplus stock before expiration.
              </p>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ color: 'var(--success)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={20} /> Early Expiry Awareness
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                Automated alerts notify pharmacists and DHOs 30 to 60 days before batch expiration dates.
              </p>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ color: 'var(--success)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={20} /> Faster PHC Redistribution
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                Eliminates paper delays through digital transfer requests and rapid DHO approval.
              </p>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ color: 'var(--success)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={20} /> District-Level Monitoring
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                Provides District Health Officers with visibility over district pharmaceutical reserves.
              </p>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ color: 'var(--success)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={20} /> Centralized Transfer Tracking
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                Maintains transparent, verifiable audit logs for every stock movement and decision.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* CONTACT / FOOTER SECTION                                    */}
      {/* ------------------------------------------------------------ */}
      <footer
        id="contact"
        style={{
          marginTop: 'auto',
          backgroundColor: 'var(--bg-sidebar)',
          borderTop: '1px solid var(--border-color)',
          padding: '4rem 2.5rem 2rem',
          color: 'var(--text-dim)',
          fontSize: '0.875rem',
          transition: 'background-color 0.25s ease, border-color 0.25s ease'
        }}
      >
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
            {/* Branding Column */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, var(--primary) 0%, #0EA5E9 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff'
                  }}
                >
                  <Activity size={22} />
                </div>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Reme<span style={{ color: 'var(--primary)' }}>Tym</span>
                </span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>
                Intelligent Medicine Stock & Expiry Management System. Engineered for Government Healthcare facilities to prevent medicine shortages and eliminate disposal wastage.
              </p>
            </div>

            {/* Quick Links Column */}
            <div>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Quick Links
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li>
                  <button onClick={() => scrollToSection('home')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, fontSize: '0.875rem' }}>
                    Home
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('about')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, fontSize: '0.875rem' }}>
                    About RemeTym
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('features')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, fontSize: '0.875rem' }}>
                    Platform Features
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('why-remetym')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, fontSize: '0.875rem' }}>
                    Why RemeTym
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact & Support Info */}
            <div>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Official Healthcare Support
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <Mail size={16} color="var(--primary)" /> support@remetym.health.gov.in
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <Phone size={16} color="var(--primary)" /> 1800-11-HEALTH (Toll-Free Helpline)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <MapPin size={16} color="var(--primary)" /> District Health Headquarters & Circle Medical Wing
                </div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-dim)' }}>
            RemeTym — Intelligent Medicine Stock & Expiry Management System • Authorized Government Use Only
          </div>
        </div>
      </footer>
    </div>
  );
};
