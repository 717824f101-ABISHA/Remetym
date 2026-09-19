import React from 'react';

export const StatCard = ({ title, value, subtext, icon: Icon, color = 'emerald' }) => {
  const colorMap = {
    blue: { bg: 'var(--primary-light)', text: 'var(--primary)', border: 'var(--border-color)' },
    emerald: { bg: 'var(--primary-light)', text: 'var(--primary)', border: 'var(--primary)' },
    amber: { bg: 'var(--warning-bg)', text: 'var(--warning)', border: 'var(--warning)' },
    rose: { bg: 'var(--danger-bg)', text: 'var(--danger)', border: 'var(--danger)' },
    purple: { bg: 'rgba(168, 85, 247, 0.15)', text: '#A855F7', border: 'rgba(168, 85, 247, 0.3)' }
  };

  const scheme = colorMap[color] || colorMap.emerald;
  const isIconValid = typeof Icon === 'function' || (typeof Icon === 'object' && Icon !== null);

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div>
        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.375rem' }}>
          {title}
        </div>
        <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
          {value !== undefined && value !== null ? value : 0}
        </div>
        {subtext && (
          <div style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginTop: '0.375rem' }}>
            {subtext}
          </div>
        )}
      </div>

      {isIconValid && (
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: scheme.bg,
            border: `1px solid ${scheme.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: scheme.text
          }}
        >
          <Icon size={24} />
        </div>
      )}
    </div>
  );
};
