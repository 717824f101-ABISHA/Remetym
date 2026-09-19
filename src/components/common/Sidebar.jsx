import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { registrationService } from '../../services/registrationService';
import {
  LayoutDashboard,
  Pill,
  Package,
  Layers,
  ArrowLeftRight,
  History,
  FileBarChart,
  Bell,
  Settings,
  Activity,
  PlusCircle,
  FileCheck2,
  Building2,
  UserCheck
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchPending = async () => {
      if (user && user.role === 'ADMIN') {
        try {
          const reqs = await registrationService.getPendingRequests();
          if (isMounted) {
            setPendingRequestsCount(Array.isArray(reqs) ? reqs.length : 0);
          }
        } catch (_) {
          if (isMounted) setPendingRequestsCount(0);
        }
      }
    };
    fetchPending();
    return () => {
      isMounted = false;
    };
  }, [user, location.pathname]);

  if (!user) return null;

  const adminNav = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'User Approvals', path: '/admin/user-approvals', icon: UserCheck, badge: pendingRequestsCount },
    { label: 'Medicines', path: '/admin/medicines', icon: Pill },
    { label: 'Inventory', path: '/admin/inventory', icon: Package },
    { label: 'Batches', path: '/admin/batches', icon: Layers },
    { label: 'Transfer Monitoring', path: '/admin/transfers', icon: ArrowLeftRight },
    { label: 'Transfer History', path: '/admin/transfer-history', icon: History },
    {
      label: 'Reports',
      path: '/admin/reports',
      icon: FileBarChart,
      subItems: [{ label: 'Low Stock Report', path: '/admin/reports' }]
    },
    { label: 'Notifications', path: '/admin/notifications', icon: Bell },
    { label: 'Settings', path: '/admin/settings', icon: Settings }
  ];

  const dhoNav = [
    { label: 'Dashboard', path: '/dho/dashboard', icon: LayoutDashboard },
    { label: 'District Inventory', path: '/dho/inventory', icon: Building2 },
    { label: 'Transfer Requests', path: '/dho/transfer-requests', icon: ArrowLeftRight },
    { label: 'Transfer History', path: '/dho/transfer-history', icon: History },
    {
      label: 'Reports',
      path: '/dho/reports',
      icon: FileBarChart,
      subItems: [{ label: 'Transfer Analytics', path: '/dho/reports' }]
    },
    { label: 'Notifications', path: '/dho/notifications', icon: Bell },
    { label: 'Settings', path: '/dho/settings', icon: Settings }
  ];

  const phcNav = [
    { label: 'Dashboard', path: '/phc/dashboard', icon: LayoutDashboard },
    { label: 'My Inventory', path: '/phc/inventory', icon: Package },
    { label: 'Medicines', path: '/phc/medicines', icon: Pill },
    { label: 'Transfer Request', path: '/phc/transfer-request', icon: PlusCircle },
    { label: 'My Requests', path: '/phc/my-requests', icon: FileCheck2 },
    { label: 'Transfer History', path: '/phc/transfer-history', icon: History },
    {
      label: 'Reports',
      path: '/phc/reports/expiry-risk',
      icon: FileBarChart,
      subItems: [
        { label: 'Medicine Expiry Risk', path: '/phc/reports/expiry-risk' },
        { label: 'AI Forecast', path: '/phc/reports/ai-forecast' }
      ]
    },
    { label: 'Notifications', path: '/phc/notifications', icon: Bell },
    { label: 'Settings', path: '/phc/settings', icon: Settings }
  ];

  let navItems = phcNav;
  if (user.role === 'ADMIN') navItems = adminNav;
  if (user.role === 'DHO') navItems = dhoNav;

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 60,
        transition: 'background-color 0.25s ease, border-color 0.25s ease'
      }}
    >
      {/* Branding / Logo */}
      <div
        style={{
          padding: '1.5rem 1.25rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--primary) 0%, #0EA5E9 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          }}
        >
          <Activity size={24} />
        </div>
        <div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.02em' }}>
            Reme<span style={{ color: 'var(--primary)' }}>Tym</span>
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
            Govt Health System
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ padding: '1rem 0.75rem', flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', padding: '0 0.75rem 0.5rem', letterSpacing: '0.05em' }}>
          Main Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isParentActive =
            (location.pathname.includes('/reports') && item.label === 'Reports') ||
            location.pathname === item.path;

          return (
            <React.Fragment key={item.path}>
              <NavLink
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 0.875rem',
                  borderRadius: '8px',
                  marginBottom: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: isParentActive ? 600 : 500,
                  color: isParentActive ? '#ffffff' : 'var(--text-muted)',
                  backgroundColor: isParentActive ? 'var(--primary)' : 'transparent',
                  boxShadow: isParentActive ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <Icon size={18} color={isParentActive ? '#ffffff' : 'var(--text-dim)'} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge > 0 && (
                  <span
                    style={{
                      backgroundColor: isParentActive ? '#ffffff' : 'var(--warning)',
                      color: isParentActive ? 'var(--primary)' : '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.125rem 0.5rem',
                      borderRadius: '9999px'
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>

              {item.subItems && isParentActive && (
                <div style={{ marginLeft: '1.75rem', marginBottom: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {item.subItems.map((sub) => {
                    const isSubActive =
                      location.pathname === sub.path ||
                      (location.pathname === '/phc/reports' && sub.path === '/phc/reports/expiry-risk');
                    return (
                      <NavLink
                        key={sub.path + sub.label}
                        to={sub.path}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.375rem 0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.8125rem',
                          fontWeight: isSubActive ? 700 : 500,
                          color: isSubActive ? 'var(--primary)' : 'var(--text-muted)',
                          backgroundColor: isSubActive ? 'rgba(37, 99, 235, 0.12)' : 'transparent',
                          transition: 'all 0.2s'
                        }}
                      >
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: isSubActive ? 'var(--primary)' : 'var(--text-dim)'
                          }}
                        />
                        <span>{sub.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Footer info */}
      <div
        style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid var(--border-color)',
          fontSize: '0.75rem',
          color: 'var(--text-dim)',
          textAlign: 'center'
        }}
      >
        RemeTym v2.5 • Govt Health System
      </div>
    </aside>
  );
};
