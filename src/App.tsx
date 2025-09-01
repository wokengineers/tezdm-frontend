import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { Analytics } from "@vercel/analytics/react"

// Import pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import OnboardingPage from './pages/OnboardingPage';
import ConnectAccountsPage from './pages/ConnectAccountsPage';
import OAuthRedirectPage from './pages/OAuthRedirectPage';
import DashboardPage from './pages/DashboardPage';
import AutomationBuilderPage from './pages/AutomationBuilderPage';
import AutomationListPage from './pages/AutomationListPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import AdminPanelPage from './pages/AdminPanelPage';
import HelpSupportPage from './pages/HelpSupportPage';
import PlanBillingPage from './pages/PlanBillingPage';
import ActivityLogPage from './pages/ActivityLogPage';

// Import components
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Layout from './components/Layout';

/**
 * Main App component that sets up routing and providers
 * @returns App component with routing configuration
 */
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Routes>
              {/* Public routes - redirect authenticated users to dashboard */}
              <Route path="/login" element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } />
              <Route path="/signup" element={
                <PublicRoute>
                  <SignupPage />
                </PublicRoute>
              } />
              <Route path="/forgot-password" element={
                <PublicRoute>
                  <ForgotPasswordPage />
                </PublicRoute>
              } />
              <Route path="/forgot-password/:otpToken/:email/:hmacSignature" element={
                <PublicRoute>
                  <ResetPasswordPage />
                </PublicRoute>
              } />
              <Route path="/oauth-redirect" element={<OAuthRedirectPage />} />
              
              {/* Protected routes with layout */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="onboarding" element={<OnboardingPage />} />
                <Route path="connect-accounts" element={<ConnectAccountsPage />} />
                <Route path="automations" element={<AutomationListPage />} />
                <Route path="automations/new" element={<AutomationBuilderPage />} />
                <Route path="automations/:id/edit" element={<AutomationBuilderPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="admin" element={<AdminPanelPage />} />
                <Route path="help" element={<HelpSupportPage />} />
                <Route path="billing" element={<PlanBillingPage />} />
                <Route path="activity" element={<ActivityLogPage />} />
              </Route>
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App; 