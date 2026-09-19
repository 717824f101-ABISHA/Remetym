/**
 * Auth Context
 * Provides global state for authenticated user, login, logout, and user profile updates.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { KEYS, getItem, setItem } from '../utils/storageUtils';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session on app launch/refresh
    const initAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.warn('Failed to restore user session:', err);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (emailOrUsername, password) => {
    const res = await authService.login(emailOrUsername, password);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUser = (updatedFields) => {
    if (!user) return;
    const updated = { ...user, ...updatedFields };
    setUser(updated);
    
    // Save to storage
    setItem(KEYS.AUTH_USER, updated);
    
    // Also update in users list
    const users = getItem(KEYS.USERS, []);
    const idx = users.findIndex((u) => u.userId === user.userId);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updatedFields };
      setItem(KEYS.USERS, users);
    }
  };

  const register = async (registrationData) => {
    return authService.register(registrationData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
