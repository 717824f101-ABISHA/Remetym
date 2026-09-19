import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary Caught Error]:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '2.5rem',
            textAlign: 'center',
            backgroundColor: 'var(--bg-card)',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            margin: '1.5rem',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <AlertTriangle size={42} color="var(--warning)" style={{ margin: '0 auto 1rem', display: 'block' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            Unable to load PHC Reports Component
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-dim)', marginBottom: '1.5rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
            A temporary component initialization error occurred. Click below to reload reports data.
          </p>
          <button className="btn btn-primary" onClick={this.handleReset} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <RefreshCw size={16} /> Refresh Reports
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
