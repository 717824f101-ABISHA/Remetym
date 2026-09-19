/**
 * PHC (Primary Health Center) Service
 * Interacts with backend API Gateway (http://localhost:8080/api)
 * Oracle USERS table = Source of truth for registered active PHCs.
 * MongoDB inventory = Source of truth for physical stock levels.
 */

import { KEYS } from '../utils/storageUtils';

const API_BASE_URL = 'http://localhost:8080/api';

let phcCache = null;
let lastPhcFetch = 0;
const CACHE_TTL_MS = 5000;

const getAuthHeaders = () => {
  const token = localStorage.getItem(KEYS.AUTH_TOKEN);
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const phcService = {
  getPhcs: async (forceRefresh = false) => {
    const now = Date.now();
    if (!forceRefresh && phcCache !== null && (now - lastPhcFetch < CACHE_TTL_MS)) {
      console.log('[phcService] Returning cached PHCs:', phcCache.length);
      return phcCache;
    }
    try {
      console.log('[phcService] Fetching active PHCs from API Gateway:', `${API_BASE_URL}/users/active-phcs`);
      let response = await fetch(`${API_BASE_URL}/users/active-phcs`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        console.warn(`[phcService] /users/active-phcs returned status HTTP ${response.status}. Attempting /phcs...`);
        response = await fetch(`${API_BASE_URL}/phcs`, {
          headers: getAuthHeaders()
        });
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch PHCs from backend API (HTTP ${response.status})`);
      }

      const data = await response.json();
      console.log('[phcService] active-phcs HTTP status 200, response payload:', data);

      let list = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data?.data)) {
        list = data.data;
      } else if (Array.isArray(data?.phcs)) {
        list = data.phcs;
      } else if (Array.isArray(data?.content)) {
        list = data.content;
      }

      console.log('[phcService] Normalized active PHCs count:', list.length, list);
      phcCache = list;
      lastPhcFetch = now;
      return list;
    } catch (err) {
      console.error('[phcService ERROR] getPhcs failed:', err.message || err);
      throw err;
    }
  },

  getPhcsByDistrict: async (districtId, districtName) => {
    const queryDist = (districtId || districtName || '').trim();
    if (!queryDist || queryDist === 'DIST-ALL') {
      return phcService.getPhcs();
    }
    try {
      const response = await fetch(`${API_BASE_URL}/users/active-phcs?districtId=${encodeURIComponent(queryDist)}`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      }
    } catch (err) {
      console.warn('getPhcsByDistrict failed:', err);
    }
    return [];
  },

  getSupplyingPhcs: async ({ destPhcId, destPhcName, medicineId, medicineName }) => {
    try {
      // 1. Fetch registered active PHCs from Oracle USERS API
      const phcList = await phcService.getPhcs(true);
      
      // 2. Fetch MongoDB inventory
      const invResponse = await fetch(`${API_BASE_URL}/inventory`, {
        headers: getAuthHeaders()
      });
      const invData = invResponse.ok ? await invResponse.json() : [];
      const inventoryItems = Array.isArray(invData) ? invData : (invData?.data || invData?.content || []);

      const currId = (destPhcId || '').trim().toLowerCase();
      const currName = (destPhcName || '').trim().toLowerCase();

      // Filter out current destination PHC
      const candidatePhcs = phcList.filter((p) => {
        const pId = (p.phcId || p.id || '').trim().toLowerCase();
        const pName = (p.phcName || p.name || '').trim().toLowerCase();
        const isIdMatch = currId && pId && pId === currId;
        const isNameMatch = currName && pName && pName === currName;
        return !isIdMatch && !isNameMatch;
      });

      const targetMedId = (medicineId || '').trim().toLowerCase();
      const targetMedName = (medicineName || '').trim().toLowerCase();

      const finalSupplyingPhcs = [];

      candidatePhcs.forEach((phc) => {
        const pId = phc.phcId || phc.id;
        const pName = phc.phcName || phc.name;
        const pIdLower = (pId || '').trim().toLowerCase();
        const pNameLower = (pName || '').trim().toLowerCase();

        // Match inventory using phcId as primary identifier, falling back to phcName
        const matchingStockItems = inventoryItems.filter((inv) => {
          const invPId = (inv.phcId || '').trim().toLowerCase();
          const invPName = (inv.phcName || '').trim().toLowerCase();
          const isPhcMatch = (pIdLower && invPId === pIdLower) || (pNameLower && invPName === pNameLower);

          if (!isPhcMatch) return false;

          if (targetMedId || targetMedName) {
            const invMedId = (inv.medicineId || '').trim().toLowerCase();
            const invMedName = (inv.medicineName || '').trim().toLowerCase();
            const medIdMatches = targetMedId && invMedId === targetMedId;
            const medNameMatches = targetMedName && invMedName === targetMedName;
            return medIdMatches || medNameMatches;
          }
          return true;
        });

        const totalStock = matchingStockItems.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);

        if (totalStock > 0) {
          finalSupplyingPhcs.push({
            ...phc,
            phcId: pId,
            phcName: pName,
            districtName: phc.districtName || phc.district || '',
            availableStock: totalStock
          });
        }
      });

      console.log('===== FINAL SUPPLYING PHCs =====', finalSupplyingPhcs.length, finalSupplyingPhcs);
      return finalSupplyingPhcs;
    } catch (err) {
      console.error('[phcService ERROR] getSupplyingPhcs failed:', err);
      throw err;
    }
  },

  addPhc: async (phcData) => {
    phcCache = null;
    const response = await fetch(`${API_BASE_URL}/phcs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(typeof phcData === 'string' ? { phcName: phcData } : phcData)
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to add PHC.');
    }
    phcCache = null;
    return result;
  }
};


