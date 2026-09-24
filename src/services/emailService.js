/**
 * Email Service
 * Dispatches email notifications via API Gateway (http://localhost:8080/api/email)
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

export const emailService = {
  getSentEmails: async () => {
    const response = await fetch(`${API_BASE_URL}/email/history`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) return [];
    return await response.json();
  },

  sendApprovalEmail: async ({ recipientEmail, recipientName, role }) => {
    const formattedRole = role === 'DHO' ? 'District Health Officer (DHO)' : 'PHC Staff';

    const payload = {
      to: recipientEmail,
      recipientName,
      subject: 'RemeTym Account Approved',
      body: `Hello ${recipientName},\n\nYour registration for the RemeTym system has been approved by the Administrator.\n\nRole: ${formattedRole}\nStatus: Approved\n\nYou can now log in to RemeTym using your registered email address and password.\n\nThank you,\nRemeTym Administration`,
      type: 'ACCOUNT_APPROVED'
    };

    const response = await fetch(`${API_BASE_URL}/email/send`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (!response.ok) return null;
    return await response.json();
  },

  sendRejectionEmail: async ({ recipientEmail, recipientName, role, reason }) => {
    const formattedRole = role === 'DHO' ? 'District Health Officer (DHO)' : 'PHC Staff';
    const reasonText = reason ? `\nReason: ${reason}\n` : '';

    const payload = {
      to: recipientEmail,
      recipientName,
      subject: 'RemeTym Registration Status',
      body: `Hello ${recipientName},\n\nYour registration request for the RemeTym system has been rejected by the Administrator.\n\nRole: ${formattedRole}\nStatus: Rejected${reasonText}\n\nPlease contact the RemeTym Administrator if you require further information.\n\nThank you,\nRemeTym Administration`,
      type: 'ACCOUNT_REJECTED'
    };

    const response = await fetch(`${API_BASE_URL}/email/send`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (!response.ok) return null;
    return await response.json();
  }
};
