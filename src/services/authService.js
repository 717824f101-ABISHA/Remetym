/**
 * Auth Service
 * Communicates strictly through API Gateway (http://localhost:8080/api)
 */

import { KEYS } from '../utils/storageUtils';

const API_BASE_URL = 'http://localhost:8080/api';

export const authService = {
  login: async (emailOrUsername, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrUsername, password })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Login failed.');
    }

    if (data.token && data.user) {
      localStorage.setItem(KEYS.AUTH_USER, JSON.stringify(data.user));
      localStorage.setItem(KEYS.AUTH_TOKEN, data.token);
    }

    return data;
  },

  logout: () => {
    localStorage.removeItem(KEYS.AUTH_USER);
    localStorage.removeItem(KEYS.AUTH_TOKEN);
  },

  getCurrentUser: async () => {
    const token = localStorage.getItem(KEYS.AUTH_TOKEN);
    if (!token) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const user = await response.json();
        localStorage.setItem(KEYS.AUTH_USER, JSON.stringify(user));
        return user;
      }

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem(KEYS.AUTH_TOKEN);
        localStorage.removeItem(KEYS.AUTH_USER);
        return null;
      }
    } catch (err) {
      console.warn('Failed to verify token with backend auth service:', err);
    }

    const stored = localStorage.getItem(KEYS.AUTH_USER);
    return stored ? JSON.parse(stored) : null;
  },

  register: async (registrationData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationData)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed.');
    }
    return data;
  },

  forgotPassword: async (email) => {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Forgot password failed.');
    }
    return data;
  },

  resetPassword: async (token, newPassword, confirmPassword) => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword, confirmPassword })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Reset password failed.');
    }
    return data;
  }
};
