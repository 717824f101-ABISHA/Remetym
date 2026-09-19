import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getToastIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} color="var(--success)" />;
      case 'danger':
        return <AlertCircle size={18} color="var(--danger)" />;
      case 'warning':
        return <AlertTriangle size={18} color="var(--warning)" />;
      default:
        return <Info size={18} color="var(--info)" />;
    }
  };

  const getToastBorder = (type) => {
    switch (type) {
      case 'success':
        return '1px solid var(--success)';
      case 'danger':
        return '1px solid var(--danger)';
      case 'warning':
        return '1px solid var(--warning)';
      default:
        return '1px solid var(--info)';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Floating Toast Container */}
      <div
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.625rem',
          maxWidth: '380px',
          width: 'calc(100vw - 3rem)',
          pointerEvents: 'none'
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              pointerEvents: 'auto',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-main)',
              border: getToastBorder(toast.type),
              borderRadius: '10px',
              padding: '0.875rem 1.125rem',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              animation: 'toastSlideIn 0.25s ease-out'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flex: 1 }}>
              {getToastIcon(toast.type)}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                padding: '0.125rem',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
