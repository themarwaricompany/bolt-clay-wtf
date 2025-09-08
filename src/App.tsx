import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import SignUpForm from './components/auth/SignUpForm';
import SignInForm from './components/auth/SignInForm';
import ForgotPasswordForm from './components/auth/ForgotPasswordForm';
import OnboardingScreen from './components/OnboardingScreen';
import Dashboard from './components/Dashboard';
import ReportPage from './components/ReportPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/signup" element={<SignUpForm />} />
          <Route path="/login" element={<SignInForm />} />
          <Route path="/forgot-password" element={<ForgotPasswordForm />} />
          <Route path="/onboarding" element={<OnboardingScreen />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/report/:reportId"
            element={
              <ProtectedRoute>
                <ReportPage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;