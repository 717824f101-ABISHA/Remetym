/**
 * Date formatting & expiry check utilities
 */

export const getExpiryStatus = (expiryDateStr) => {
  if (!expiryDateStr) return { label: 'Unknown', color: 'gray', code: 'UNKNOWN', days: 999 };
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let expiry;
  if (typeof expiryDateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(expiryDateStr.trim())) {
    const [y, m, d] = expiryDateStr.trim().split('-').map(Number);
    expiry = new Date(y, m - 1, d);
  } else {
    expiry = new Date(expiryDateStr);
  }

  const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return { label: 'Expired', color: 'danger', code: 'EXPIRED', days: diffDays };
  } else if (diffDays <= 30) {
    return { label: `Expiring Soon (${diffDays}d)`, color: 'warning', code: 'EXPIRING_SOON', days: diffDays };
  } else {
    return { label: 'Safe', color: 'success', code: 'SAFE', days: diffDays };
  }
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString.trim())) {
    const [year, month, day] = dateString.trim().split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const mIdx = parseInt(month, 10) - 1;
    if (mIdx >= 0 && mIdx < 12) {
      return `${parseInt(day, 10)} ${months[mIdx]} ${year}`;
    }
  }
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
};
