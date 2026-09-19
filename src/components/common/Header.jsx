import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { UserAvatar } from './UserAvatar';
import { ThemeToggle } from './ThemeToggle';
import { Bell, User, LogOut, ShieldCheck, ChevronDown, CheckCheck, Trash2 } from 'lucide-react';

export const Header = ({ title }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
  const navigate = useNavigate();

  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDrawer(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const handleClearNotifs = async () => {
    await clearNotifications();
  };

  const handleNotifClick = async (notif) => {
    await markAsRead(notif.notificationId);
    setShowNotifDrawer(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    if (role === 'ADMIN') return { label: 'System Admin', bg: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' };
    if (role === 'DHO') return { label: 'DHO Officer', bg: 'rgba(14, 165, 233, 0.15)', color: '#0EA5E9' };
    return { label: 'PHC Staff', bg: 'rgba(16, 185, 129, 0.15)', color: '#10B981' };
  };

  const roleBadge = user ? getRoleBadge(user.role) : null;

  return (
    <header
      style={{
        height: '70px',
        backgroundColor: 'var(--bg-header)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        transition: 'background-color 0.25s ease, border-color 0.25s ease'
      }}
    >
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
          {title || 'Dashboard'}
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {roleBadge && (
          <span
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: roleBadge.bg,
              color: roleBadge.color,
              border: `1px solid ${roleBadge.color}40`,
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem'
            }}
          >
            <ShieldCheck size={14} />
            {roleBadge.label}
          </span>
        )}

        <ThemeToggle size={18} />

        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifDrawer(!showNotifDrawer)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              position: 'relative',
              padding: '0.5rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'var(--transition)'
            }}
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  backgroundColor: '#EF4444',
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  borderRadius: '9999px',
                  height: '18px',
                  minWidth: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                  boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)'
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifDrawer && (
            <div
              style={{
                position: 'absolute',
                top: '50px',
                right: 0,
                width: '380px',
                maxHeight: '480px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-lg)',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 100,
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  padding: '1rem',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'var(--bg-sidebar)'
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-main)' }}>
                  Notifications ({unreadCount} unread)
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={handleMarkAllRead}
                    title="Mark all as read"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <CheckCheck size={14} /> Read All
                  </button>
                  <button
                    onClick={handleClearNotifs}
                    title="Clear all notifications"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-dim)',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <Trash2 size={14} /> Clear
                  </button>
                </div>
              </div>

              <div style={{ overflowY: 'auto', flex: 1, padding: '0.5rem' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.875rem' }}>
                    No notifications available
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.notificationId}
                      onClick={() => handleNotifClick(notif)}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        marginBottom: '0.5rem',
                        backgroundColor: notif.read ? 'transparent' : 'var(--primary-light)',
                        borderLeft: notif.read ? '3px solid transparent' : '3px solid var(--primary)',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                        {notif.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                        {notif.message}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-dim)', marginTop: '0.375rem' }}>
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div ref={profileRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{
              background: 'transparent',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: 'pointer',
              padding: '0.25rem',
              borderRadius: '8px'
            }}
          >
            <UserAvatar name={user?.name} role={user?.role} size={36} />
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{user?.title}</div>
            </div>
            <ChevronDown size={16} color="var(--text-muted)" />
          </button>

          {showProfileMenu && (
            <div
              style={{
                position: 'absolute',
                top: '50px',
                right: 0,
                width: '220px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-lg)',
                padding: '0.5rem',
                zIndex: 100
              }}
            >
              <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.5rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>{user?.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{user?.email}</div>
              </div>

              <Link
                to={user?.role === 'ADMIN' ? '/admin/profile' : user?.role === 'DHO' ? '/dho/profile' : '/phc/profile'}
                onClick={() => setShowProfileMenu(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.625rem 0.75rem',
                  borderRadius: '6px',
                  color: 'var(--text-muted)',
                  fontSize: '0.875rem',
                  textDecoration: 'none'
                }}
              >
                <User size={16} /> My Profile
              </Link>

              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.625rem 0.75rem',
                  borderRadius: '6px',
                  color: '#EF4444',
                  background: 'none',
                  border: 'none',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  marginTop: '0.25rem'
                }}
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
