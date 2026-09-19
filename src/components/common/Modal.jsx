import React from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = '600px' }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #334155',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#111827'
          }}
        >
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#F8FAFC', margin: 0 }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.25rem',
              borderRadius: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '1.5rem' }}>{children}</div>
      </div>
    </div>
  );
};
