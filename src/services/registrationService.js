/**
 * Registration Service
 * Admin Approval Lifecycle via API Gateway (http://localhost:8080/api/users/requests)
 */

import { KEYS } from '../utils/storageUtils';

const API_BASE_URL = 'https://remetym-1.onrender.com/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem(KEYS.AUTH_TOKEN);
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const registrationService = {
  getOracleStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/stats`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (err) {
      console.warn('getOracleStats failed:', err);
      return null;
    }
  },

  getRequests: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/requests`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data) ? data : (data?.data || data?.content || []);
    } catch (err) {
      console.warn('getRequests failed:', err);
      return [];
    }
  },

  getPendingRequests: async () => {
    const requests = await registrationService.getRequests();
    return Array.isArray(requests) ? requests.filter((r) => r.status === 'PENDING') : [];
  },

  getApprovedRequests: async () => {
    const requests = await registrationService.getRequests();
    return Array.isArray(requests) ? requests.filter((r) => r.status === 'ACTIVE' || r.status === 'APPROVED') : [];
  },

  getRejectedRequests: async () => {
    const requests = await registrationService.getRequests();
    return Array.isArray(requests) ? requests.filter((r) => r.status === 'REJECTED') : [];
  },

  getRequestById: async (id) => {
    const requests = await registrationService.getRequests();
    return Array.isArray(requests) ? (requests.find((r) => r.id === id || r.userId === id) || null) : null;
  },

  submitRegistrationRequest: async (data) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Registration submission failed.');
    }
    return result;
  },

  approveRegistration: async (requestId) => {
    const response = await fetch(`${API_BASE_URL}/users/requests/${requestId}/approve`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Approval failed.');
    }
    return result;
  },

  rejectRegistration: async (requestId, adminUser, reason = '') => {
    const response = await fetch(`${API_BASE_URL}/users/requests/${requestId}/reject`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason })
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Rejection failed.');
    }
    return result;
  },

  deactivateUser: async (userId) => {
    try {
      let response = await fetch(`${API_BASE_URL}/admin/users/${userId}/deactivate`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });

      if (!response.ok && (response.status === 404 || response.status === 405)) {
        response = await fetch(`${API_BASE_URL}/users/requests/${userId}/deactivate`, {
          method: 'PATCH',
          headers: getAuthHeaders()
        });
      }

      let result;
      try {
        result = await response.json();
      } catch (e) {
        result = null;
      }

      if (!response.ok) {
        const errorMsg = result?.message || result?.error || `Deactivation failed with status HTTP ${response.status}`;
        throw new Error(errorMsg);
      }
      return result;
    } catch (err) {
      console.error('deactivateUser error:', err);
      throw err;
    }
  },

  reactivateUser: async (userId) => {
    try {
      let response = await fetch(`${API_BASE_URL}/admin/users/${userId}/reactivate`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });

      if (!response.ok && (response.status === 404 || response.status === 405)) {
        response = await fetch(`${API_BASE_URL}/users/requests/${userId}/reactivate`, {
          method: 'PATCH',
          headers: getAuthHeaders()
        });
      }

      let result;
      try {
        result = await response.json();
      } catch (e) {
        result = null;
      }

      if (!response.ok) {
        const errorMsg = result?.message || result?.error || `Reactivation failed with status HTTP ${response.status}`;
        throw new Error(errorMsg);
      }
      return result;
    } catch (err) {
      console.error('reactivateUser error:', err);
      throw err;
    }
  }
};
