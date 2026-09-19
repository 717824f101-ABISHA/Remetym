import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleBasedRoute } from './RoleBasedRoute';

// Public Pages
import { LandingPage } from '../pages/public/LandingPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminUserApprovals } from '../pages/admin/AdminUserApprovals';
import { AdminMedicines } from '../pages/admin/AdminMedicines';
import { AdminInventory } from '../pages/admin/AdminInventory';
import { AdminBatches } from '../pages/admin/AdminBatches';
import { AdminTransfers } from '../pages/admin/AdminTransfers';
import { AdminTransferHistory } from '../pages/admin/AdminTransferHistory';
import { AdminReports } from '../pages/admin/AdminReports';
import { AdminNotifications } from '../pages/admin/AdminNotifications';
import { AdminProfile } from '../pages/admin/AdminProfile';
import { AdminSettings } from '../pages/admin/AdminSettings';

// DHO Pages
import { DhoDashboard } from '../pages/dho/DhoDashboard';
import { DhoInventory } from '../pages/dho/DhoInventory';
import { DhoTransferRequests } from '../pages/dho/DhoTransferRequests';
import { DhoTransferHistory } from '../pages/dho/DhoTransferHistory';
import { DhoReports } from '../pages/dho/DhoReports';
import { DhoNotifications } from '../pages/dho/DhoNotifications';
import { DhoProfile } from '../pages/dho/DhoProfile';
import { DhoSettings } from '../pages/dho/DhoSettings';

// PHC Pages
import { PhcDashboard } from '../pages/phc/PhcDashboard';
import { PhcInventory } from '../pages/phc/PhcInventory';
import { PhcMedicines } from '../pages/phc/PhcMedicines';
import { PhcTransferRequest } from '../pages/phc/PhcTransferRequest';
import { PhcMyRequests } from '../pages/phc/PhcMyRequests';
import { PhcTransferHistory } from '../pages/phc/PhcTransferHistory';
import { PhcReports } from '../pages/phc/PhcReports';
import { PhcNotifications } from '../pages/phc/PhcNotifications';
import { PhcProfile } from '../pages/phc/PhcProfile';
import { PhcSettings } from '../pages/phc/PhcSettings';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* ADMIN Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/user-approvals"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['ADMIN']}>
              <AdminUserApprovals />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/medicines"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['ADMIN']}>
              <AdminMedicines />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/inventory"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['ADMIN']}>
              <AdminInventory />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/batches"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['ADMIN']}>
              <AdminBatches />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/transfers"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['ADMIN']}>
              <AdminTransfers />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/transfer-history"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['ADMIN']}>
              <AdminTransferHistory />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['ADMIN']}>
              <AdminReports />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/notifications"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['ADMIN']}>
              <AdminNotifications />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/profile"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['ADMIN']}>
              <AdminProfile />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['ADMIN']}>
              <AdminSettings />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      {/* DHO Routes */}
      <Route
        path="/dho/dashboard"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['DHO']}>
              <DhoDashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dho/inventory"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['DHO']}>
              <DhoInventory />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dho/transfer-requests"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['DHO']}>
              <DhoTransferRequests />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dho/transfer-history"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['DHO']}>
              <DhoTransferHistory />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dho/reports"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['DHO']}>
              <DhoReports />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dho/notifications"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['DHO']}>
              <DhoNotifications />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dho/profile"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['DHO']}>
              <DhoProfile />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dho/settings"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['DHO']}>
              <DhoSettings />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      {/* PHC STAFF Routes */}
      <Route
        path="/phc/dashboard"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['PHC_STAFF']}>
              <PhcDashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/phc/inventory"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['PHC_STAFF']}>
              <PhcInventory />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/phc/medicines"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['PHC_STAFF']}>
              <PhcMedicines />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/phc/transfer-request"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['PHC_STAFF']}>
              <PhcTransferRequest />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/phc/my-requests"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['PHC_STAFF']}>
              <PhcMyRequests />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/phc/transfer-history"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['PHC_STAFF']}>
              <PhcTransferHistory />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/phc/reports"
        element={<Navigate to="/phc/reports/expiry-risk" replace />}
      />
      <Route
        path="/phc/reports/expiry-risk"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['PHC_STAFF']}>
              <PhcReports defaultTab="EXPIRY_RISK" />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/phc/reports/ai-forecast"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['PHC_STAFF']}>
              <PhcReports defaultTab="AI_FORECAST" />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/phc/notifications"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['PHC_STAFF']}>
              <PhcNotifications />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/phc/profile"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['PHC_STAFF']}>
              <PhcProfile />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/phc/settings"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['PHC_STAFF']}>
              <PhcSettings />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
