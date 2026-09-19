import React from 'react';

export const UserAvatar = ({ name = 'User', role = 'PHC_STAFF', size = 36, fontSize = '0.9375rem' }) => {
  // Use ONLY the first letter of the user's name (stripping titles like Dr., Nurse, etc.)
  const getInitial = (fullName) => {
    if (!fullName) return 'U';
    const clean = fullName.replace(/^(Dr\.|Nurse|Officer|Mr\.|Mrs\.|Ms\.|Pharm\.)\s+/i, '').trim();
    return clean.charAt(0).toUpperCase();
  };

  const getRoleColors = (userRole) => {
    if (userRole === 'ADMIN') {
      return { bg: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)', border: '#F87171', color: '#FFFFFF' };
    }
    if (userRole === 'DHO') {
      return { bg: 'linear-gradient(135deg, #0EA5E9 0%, #0369A1 100%)', border: '#38BDF8', color: '#FFFFFF' };
    }
    return { bg: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)', border: '#4ADE80', color: '#FFFFFF' };
  };

  const initial = getInitial(name);
  const colors = getRoleColors(role);

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: colors.bg,
        border: `2px solid ${colors.border}`,
        color: colors.color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize,
        letterSpacing: '0.02em',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
        userSelect: 'none',
        flexShrink: 0
      }}
      title={`${name} (${role})`}
    >
      {initial}
    </div>
  );
};
