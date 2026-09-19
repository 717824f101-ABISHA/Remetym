/**
 * Request Service
 * Core business workflow for PHC-to-PHC medicine transfers & DHO approvals via API Gateway
 */

import { KEYS } from '../utils/storageUtils';
import { inventoryService } from './inventoryService';
import { matchesDistrict } from '../utils/districtUtils';

const API_BASE_URL = 'http://localhost:8080/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem(KEYS.AUTH_TOKEN);
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const requestService = {
  getRequests: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/transfers/requests`, {
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

  getRequestsForDho: async (userOrDistrictId) => {
    const districtId = typeof userOrDistrictId === 'string' ? userOrDistrictId : (userOrDistrictId?.districtId || userOrDistrictId?.districtName);
    const url = districtId && districtId !== 'DIST-ALL'
      ? `${API_BASE_URL}/transfers/requests?districtId=${encodeURIComponent(districtId)}`
      : `${API_BASE_URL}/transfers/requests`;

    try {
      const response = await fetch(url, { headers: getAuthHeaders() });
      if (!response.ok) return [];
      const data = await response.json();
      const list = Array.isArray(data) ? data : (data?.data || data?.content || []);

      if (userOrDistrictId && typeof userOrDistrictId === 'object') {
        return list.filter((r) => matchesDistrict(r, userOrDistrictId) || (!r?.districtId && !r?.districtName));
      }

      return list;
    } catch (err) {
      console.warn('getRequestsForDho failed:', err);
      return [];
    }
  },

  getDistrictTransferSummary: async (districtId, districtName) => {
    const targetDist = (districtId || districtName || '').trim();
    if (!targetDist) return [];

    try {
      const response = await fetch(`${API_BASE_URL}/transfers/district/${encodeURIComponent(targetDist)}/summary`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      }
    } catch (err) {
      console.warn('getDistrictTransferSummary failed:', err);
    }
    return [];
  },

  getRequestsForUser: async (user) => {
    if (!user) return [];
    let url = `${API_BASE_URL}/transfers/requests`;

    if (user.role === 'DHO' && (user.districtId || user.districtName)) {
      url += `?districtId=${encodeURIComponent(user.districtId || user.districtName)}`;
    } else if (user.role === 'PHC_STAFF' && (user.phcId || user.phcName)) {
      url += `?phcId=${encodeURIComponent(user.phcId || user.phcName)}`;
    }

    try {
      const response = await fetch(url, { headers: getAuthHeaders() });
      if (!response.ok) return [];
      const data = await response.json();
      const list = Array.isArray(data) ? data : (data?.data || data?.content || []);

      if (user.role === 'PHC_STAFF') {
        const targetPId = (user.phcId || '').trim().toLowerCase();
        const targetPName = (user.phcName || user.name || user.phc || '').trim().toLowerCase();

        return list.filter((r) => {
          if (!r) return false;
          const dId = (r.destPhcId || '').trim().toLowerCase();
          const dName = (r.destPhcName || '').trim().toLowerCase();
          const matchId = targetPId && (dId === targetPId || dName === targetPId);
          const matchName = targetPName && (dId === targetPName || dName === targetPName);
          return matchId || matchName;
        });
      }

      if (user.role === 'DHO') {
        const targetDId = (user.districtId || '').trim().toLowerCase();
        const targetDName = (user.districtName || user.district || '').trim().toLowerCase();

        return list.filter((r) => {
          if (!r) return false;
          const distId = (r.districtId || r.sourceDistrictId || r.destDistrictId || '').trim().toLowerCase();
          const distName = (r.districtName || r.sourceDistrictName || r.destDistrictName || '').trim().toLowerCase();
          const matchId = targetDId && (distId === targetDId || distName === targetDId);
          const matchName = targetDName && (distId === targetDName || distName === targetDName);
          return matchId || matchName;
        });
      }

      return list;
    } catch (err) {
      console.warn('getRequestsForUser failed:', err);
      return [];
    }
  },

  getPendingRequestsForDho: async (districtId) => {
    const requests = await requestService.getRequestsForDho(districtId);
    return Array.isArray(requests) ? requests.filter((r) => r.status === 'PENDING') : [];
  },

  createRequest: async (formData, currentUser) => {
    const payload = {
      medicineId: formData.medicineId,
      medicineName: formData.medicineName,
      sourcePhcId: formData.sourcePhcId,
      sourcePhcName: formData.sourcePhcName,
      destPhcId: currentUser.phcId || formData.destPhcId,
      destPhcName: currentUser.phcName || formData.destPhcName,
      districtId: currentUser.districtId || formData.districtId,
      districtName: currentUser.districtName || formData.districtName,
      quantity: Number(formData.quantity),
      reason: formData.reason || 'Replenishment stock transfer',
      requestedBy: currentUser.name,
      requestedByUserId: currentUser.userId || currentUser.id
    };

    const response = await fetch(`${API_BASE_URL}/transfers/requests`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to submit transfer request.');
    }
    return result;
  },

  approveRequest: async (requestId, dhoUser, remarks = '') => {
    const response = await fetch(`${API_BASE_URL}/transfers/requests/${requestId}/approve`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ remarks })
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to approve transfer request.');
    }
    try {
      await inventoryService.getInventory(true);
    } catch (_) {}
    return result;
  },

  rejectRequest: async (requestId, dhoUser, remarks = '') => {
    const response = await fetch(`${API_BASE_URL}/transfers/requests/${requestId}/reject`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ remarks })
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to reject transfer request.');
    }
    try {
      await inventoryService.getInventory(true);
    } catch (_) {}
    return result;
  },

  getTransferHistory: async (user) => {
    let url = `${API_BASE_URL}/transfers/history`;
    if (user && user.role === 'DHO' && (user.districtId || user.districtName)) {
      url += `?districtId=${encodeURIComponent(user.districtId || user.districtName)}`;
    } else if (user && user.role === 'PHC_STAFF' && (user.phcId || user.phcName)) {
      url += `?phcId=${encodeURIComponent(user.phcId || user.phcName)}`;
    }

    try {
      const response = await fetch(url, { headers: getAuthHeaders() });
      if (!response.ok) return [];
      const data = await response.json();
      const list = Array.isArray(data) ? data : (data?.data || data?.content || []);

      if (user && user.role === 'PHC_STAFF') {
        const targetPId = (user.phcId || '').trim().toLowerCase();
        const targetPName = (user.phcName || user.name || user.phc || '').trim().toLowerCase();

        return list.filter((r) => {
          if (!r) return false;
          const dId = (r.destPhcId || '').trim().toLowerCase();
          const dName = (r.destPhcName || '').trim().toLowerCase();
          const matchId = targetPId && (dId === targetPId || dName === targetPId);
          const matchName = targetPName && (dId === targetPName || dName === targetPName);
          return matchId || matchName;
        });
      }

      if (user && user.role === 'DHO') {
        const targetDId = (user.districtId || '').trim().toLowerCase();
        const targetDName = (user.districtName || user.district || '').trim().toLowerCase();

        return list.filter((r) => {
          if (!r) return false;
          const distId = (r.districtId || r.sourceDistrictId || r.destDistrictId || '').trim().toLowerCase();
          const distName = (r.districtName || r.sourceDistrictName || r.destDistrictName || '').trim().toLowerCase();
          const matchId = targetDId && (distId === targetDId || distName === targetDId);
          const matchName = targetDName && (distId === targetDName || distName === targetDName);
          return matchId || matchName || (!distId && !distName);
        });
      }

      return list;
    } catch (err) {
      console.warn('getTransferHistory failed:', err);
      return [];
    }
  }
};
