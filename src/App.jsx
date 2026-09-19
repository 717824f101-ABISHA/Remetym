import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { AppRoutes } from './routes/AppRoutes';
import { initializeStorage } from './utils/storageUtils';
import './styles/index.css';

export default function App() {
  useEffect(() => {
    // Initialize LocalStorage with default dummy data if not already populated
    initializeStorage();
  }, []);

  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <AuthProvider>
            <NotificationProvider>
              <AppRoutes />
            </NotificationProvider>
          </AuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}
