/**
 * Consumption Management Service
 * Dispensing logs via API Gateway (http://localhost:8080/api/inventory/consumption)
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

export const consumptionService = {
  recordConsumption: async (consumptionData) => {
    const payload = {
      medicineId: consumptionData.medicineId,
      medicineName: consumptionData.medicineName,
      phcId: consumptionData.phcId,
      phcName: consumptionData.phcName,
      date: consumptionData.date || new Date().toISOString().split('T')[0],
      quantityConsumed: Number(consumptionData.quantityConsumed),
      batchNumber: consumptionData.batchNumber || ''
    };

    const response = await fetch(`${API_BASE_URL}/inventory/consumption`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to record consumption.');
    }
    return result;
  },

  getConsumptionHistory: async (phcId, medicineId = null) => {
    if (!phcId) return [];
    const endpoint = medicineId
      ? `${API_BASE_URL}/inventory/consumption/${phcId}/${medicineId}`
      : `${API_BASE_URL}/inventory/consumption/${phcId}`;

    const response = await fetch(endpoint, { headers: getAuthHeaders() });
    if (!response.ok) return [];
    return await response.json();
  }
};
