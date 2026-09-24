/**
 * Inventory Management Service
 * Physical stock per PHC/District via API Gateway (http://localhost:8080/api/inventory)
 * Includes TTL caching with mutation invalidation.
 */

import { KEYS } from '../utils/storageUtils';
import { matchesDistrict } from '../utils/districtUtils';

const API_BASE_URL = 'https://remetym-1.onrender.com/api';

let inventoryCache = null;
let lastInvFetch = 0;
const CACHE_TTL_MS = 3000;

const getAuthHeaders = () => {
  const token = localStorage.getItem(KEYS.AUTH_TOKEN);
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const inventoryService = {
  getInventory: async (forceRefresh = false) => {
    const now = Date.now();
    if (!forceRefresh && inventoryCache && (now - lastInvFetch < CACHE_TTL_MS)) {
      return inventoryCache;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/inventory`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        return inventoryCache || [];
      }
      const data = await response.json();
      const list = Array.isArray(data) ? data : (data?.data || data?.content || []);
      inventoryCache = list;
      lastInvFetch = now;
      return list;
    } catch (err) {
      console.warn('getInventory failed:', err);
      return inventoryCache || [];
    }
  },

  getInventoryByDistrict: async (districtId, districtName) => {
    const queryDist = (districtId || districtName || '').trim();
    if (!queryDist || queryDist === 'DIST-ALL') {
      return [];
    }

    try {
      // 1. Fetch active PHCs for this district dynamically from Oracle USERS API
      let activePhcs = [];
      try {
        const phcRes = await fetch(`${API_BASE_URL}/users/active-phcs?districtId=${encodeURIComponent(queryDist)}`, {
          headers: getAuthHeaders()
        });
        if (phcRes.ok) {
          const phcData = await phcRes.json();
          activePhcs = Array.isArray(phcData) ? phcData : [];
        }
      } catch (err) {
        console.warn('Failed to fetch active PHCs for district:', err);
      }

      const validPhcIds = new Set(activePhcs.map((p) => (p.phcId || p.id || '').trim().toLowerCase()).filter(Boolean));
      const validPhcNames = new Set(activePhcs.map((p) => (p.phcName || p.name || '').trim().toLowerCase()).filter(Boolean));

      // 2. Fetch inventory items from backend district endpoint
      let rawItems = [];
      const response = await fetch(`${API_BASE_URL}/inventory/district/${encodeURIComponent(queryDist)}`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        rawItems = Array.isArray(data) ? data : [];
      } else {
        rawItems = [];
      }

      // 3. Strict dynamic filtering: item MUST belong to an active PHC in that district
      if (validPhcNames.size > 0 || validPhcIds.size > 0) {
        const filtered = rawItems.filter((item) => {
          if (!item) return false;
          const pId = (item.phcId || '').trim().toLowerCase();
          const pName = (item.phcName || '').trim().toLowerCase();
          return validPhcIds.has(pId) || validPhcNames.has(pName);
        });
        return filtered;
      }

      const userObj = { districtId, districtName };
      return rawItems.filter((item) => matchesDistrict(item, userObj));
    } catch (err) {
      console.warn('getInventoryByDistrict failed:', err);
      return [];
    }
  },

  getDistrictSummary: async (districtId, districtName) => {
    const targetDist = (districtId || districtName || '').trim();
    if (!targetDist) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/inventory/summary/district/${encodeURIComponent(targetDist)}`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.warn('getDistrictSummary failed:', err);
    }
    return null;
  },

  getDistrictAlerts: async (districtId, districtName) => {
    const targetDist = (districtId || districtName || '').trim();
    if (!targetDist) return [];

    try {
      const response = await fetch(`${API_BASE_URL}/inventory/alerts/district/${encodeURIComponent(targetDist)}`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      }
    } catch (err) {
      console.warn('getDistrictAlerts failed:', err);
    }
    return [];
  },

  getDistrictProcurement: async (districtId, districtName) => {
    const targetDist = (districtId || districtName || '').trim();
    if (!targetDist) return [];

    try {
      const response = await fetch(`${API_BASE_URL}/inventory/procurement/district/${encodeURIComponent(targetDist)}`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      }
    } catch (err) {
      console.warn('getDistrictProcurement failed:', err);
    }
    return [];
  },

  getInventoryByPhc: async (phcId, phcName) => {
    const queryPId = (phcId || '').trim().toLowerCase();
    const queryPName = (phcName || '').trim().toLowerCase();

    try {
      const allItems = await inventoryService.getInventory(true);
      if (!Array.isArray(allItems)) return [];

      return allItems.filter((item) => {
        if (!item) return false;
        const itemPId = (item.phcId || '').trim().toLowerCase();
        const itemPName = (item.phcName || '').trim().toLowerCase();

        return (
          (queryPId && itemPId === queryPId) ||
          (queryPName && itemPName === queryPName)
        );
      });
    } catch (err) {
      console.warn('getInventoryByPhc failed:', err);
      return [];
    }
  },

  addStock: async (item) => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(item)
      });
      if (!response.ok) throw new Error('Failed to add stock');
      inventoryCache = null;
      return await response.json();
    } catch (err) {
      console.error('addStock error:', err);
      throw err;
    }
  },

  updateStock: async (inventoryId, quantity) => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/item/${encodeURIComponent(inventoryId)}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ quantity })
      });
      if (!response.ok) throw new Error('Failed to update stock');
      inventoryCache = null;
      return await response.json();
    } catch (err) {
      console.error('updateStock error:', err);
      throw err;
    }
  },

  deleteStock: async (inventoryId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/item/${encodeURIComponent(inventoryId)}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to delete stock');
      inventoryCache = null;
      return await response.json();
    } catch (err) {
      console.error('deleteStock error:', err);
      throw err;
    }
  },

  executeStockTransfer: async (transferRequest) => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/transfer`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(transferRequest)
      });
      if (!response.ok) throw new Error('Stock transfer failed');
      inventoryCache = null;
      return await response.json();
    } catch (err) {
      console.error('executeStockTransfer error:', err);
      throw err;
    }
  }
};
