/**
 * Medicine Master & Batch Service
 * Connects through API Gateway (http://localhost:8080/api)
 * Includes in-memory caching for sub-500ms response performance with immediate mutation invalidation.
 */

import { KEYS } from '../utils/storageUtils';

const API_BASE_URL = 'http://localhost:8080/api';

let medicinesCache = null;
let batchesCache = null;
let lastMedsFetch = 0;
let lastBatchesFetch = 0;
const CACHE_TTL_MS = 10000; // 10s short cache for lightning fast queries

const getAuthHeaders = () => {
  const token = localStorage.getItem(KEYS.AUTH_TOKEN);
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const medicineService = {
  getMedicines: async (forceRefresh = false) => {
    const now = Date.now();
    if (!forceRefresh && medicinesCache && (now - lastMedsFetch < CACHE_TTL_MS)) {
      return medicinesCache;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/medicines`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        return medicinesCache || [];
      }
      const data = await response.json();
      const list = Array.isArray(data) ? data : (data?.data || data?.content || []);
      medicinesCache = list;
      lastMedsFetch = now;
      return list;
    } catch (err) {
      console.warn('getMedicines failed:', err);
      return medicinesCache || [];
    }
  },

  getMedicineById: async (medicineId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/medicines/${medicineId}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        return null;
      }
      return await response.json();
    } catch (err) {
      return null;
    }
  },

  addMedicine: async (medicineData) => {
    medicinesCache = null; // Invalidate cache immediately
    const response = await fetch(`${API_BASE_URL}/medicines`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(typeof medicineData === 'string' ? { medicineName: medicineData } : medicineData)
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to add medicine.');
    }
    medicinesCache = null;
    return result;
  },

  updateMedicine: async (medicineId, updatedData) => {
    medicinesCache = null; // Invalidate cache immediately
    const response = await fetch(`${API_BASE_URL}/medicines/${medicineId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updatedData)
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to update medicine.');
    }
    medicinesCache = null;
    return result;
  },

  deleteMedicine: async (medicineId) => {
    medicinesCache = null; // Invalidate cache immediately
    const response = await fetch(`${API_BASE_URL}/medicines/${medicineId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to delete medicine.');
    }
    medicinesCache = null;
    return true;
  },

  getBatches: async (forceRefresh = false) => {
    const now = Date.now();
    if (!forceRefresh && batchesCache && (now - lastBatchesFetch < CACHE_TTL_MS)) {
      return batchesCache;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/batches`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        return batchesCache || [];
      }
      const data = await response.json();
      const list = Array.isArray(data) ? data : (data?.data || data?.content || []);
      batchesCache = list;
      lastBatchesFetch = now;
      return list;
    } catch (err) {
      console.warn('getBatches failed:', err);
      return batchesCache || [];
    }
  },

  addBatch: async (batchData) => {
    batchesCache = null; // Invalidate cache
    const response = await fetch(`${API_BASE_URL}/batches`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(batchData)
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to add batch.');
    }
    batchesCache = null;
    return result;
  },

  approveBatch: async (batchId, reason = 'Approved by admin') => {
    batchesCache = null;
    const response = await fetch(`${API_BASE_URL}/batches/${batchId}/approve`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason })
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to approve batch.');
    }
    batchesCache = null;
    return result;
  },

  rejectBatch: async (batchId, reason = 'Rejected by admin') => {
    batchesCache = null;
    const response = await fetch(`${API_BASE_URL}/batches/${batchId}/reject`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason })
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to reject batch.');
    }
    batchesCache = null;
    return result;
  }
};
