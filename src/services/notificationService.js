/**
 * Notification Service
 * Targeted notification management via API Gateway (http://localhost:8080/api/notifications)
 */

import { KEYS } from '../utils/storageUtils';

const API_BASE_URL = 'http://localhost:8080/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem(KEYS.AUTH_TOKEN);
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const notificationService = {
  getNotifications: async (user) => {
    if (!user) return [];
    let url = `${API_BASE_URL}/notifications`;
    const params = [];
    if (user.districtId) params.push(`districtId=${encodeURIComponent(user.districtId)}`);
    if (user.phcId) params.push(`phcId=${encodeURIComponent(user.phcId)}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    const headers = getAuthHeaders();
    if (user.role) headers['X-User-Role'] = user.role;
    if (user.userId || user.id) headers['X-User-Id'] = user.userId || user.id;

    try {
      const response = await fetch(url, { headers });
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data) ? data : (data?.data || data?.content || []);
    } catch (err) {
      console.warn('getNotifications failed:', err);
      return [];
    }
  },

  createNotification: async (notifData) => {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(notifData)
    });
    if (!response.ok) return null;
    return await response.json();
  },

  markAsRead: async (notificationId) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    if (!response.ok) return [];
    return await response.json();
  },

  markAllAsRead: async (user) => {
    let url = `${API_BASE_URL}/notifications/read-all`;
    const params = [];
    if (user.districtId) params.push(`districtId=${encodeURIComponent(user.districtId)}`);
    if (user.phcId) params.push(`phcId=${encodeURIComponent(user.phcId)}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    const headers = getAuthHeaders();
    if (user.role) headers['X-User-Role'] = user.role;

    await fetch(url, { method: 'PUT', headers });
    return await notificationService.getNotifications(user);
  },

  clearNotifications: async (user) => {
    if (!user) return [];
    let url = `${API_BASE_URL}/notifications`;
    const params = [];
    if (user.districtId) params.push(`districtId=${encodeURIComponent(user.districtId)}`);
    if (user.phcId) params.push(`phcId=${encodeURIComponent(user.phcId)}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    const headers = getAuthHeaders();
    if (user.role) headers['X-User-Role'] = user.role;
    if (user.userId || user.id) headers['X-User-Id'] = user.userId || user.id;

    try {
      let response = await fetch(url, { method: 'DELETE', headers });
      if (!response.ok && (response.status === 405 || response.status === 404)) {
        let clearUrl = `${API_BASE_URL}/notifications/clear`;
        if (params.length > 0) clearUrl += `?${params.join('&')}`;
        response = await fetch(clearUrl, { method: 'DELETE', headers });
        if (!response.ok && response.status === 405) {
          response = await fetch(clearUrl, { method: 'POST', headers });
        }
      }

      if (!response.ok) {
        let result;
        try {
          result = await response.json();
        } catch (e) {
          result = null;
        }
        const errorMsg = result?.message || result?.error || `Failed to clear notifications (HTTP ${response.status})`;
        console.warn('clearNotifications error:', errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.warn('clearNotifications fetch failed:', err);
    }
    return [];
  }
};
