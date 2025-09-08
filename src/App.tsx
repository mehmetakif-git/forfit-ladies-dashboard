import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { LoadingProvider } from './context/LoadingContext';
import { ThemeProvider } from './components/theme/ThemeProvider';
import ErrorBoundary from './components/Auth/ErrorBoundary';
import PageLoader from './components/UI/PageLoader';
import ConnectionTest from './components/ConnectionTest';
import Layout from './components/Layout/Layout';
import LoginForm from './components/Auth/LoginForm';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import MemberCardView from './components/Member/MemberCardView';
import TrainerPortal from './components/Trainer/TrainerPortal';
import MemberRegistration from './pages/MemberRegistration';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Subscriptions from './pages/Subscriptions';
import Payments from './pages/Payments';
import Attendance from './pages/Attendance';
import Reports from './pages/Reports';
import CustomerPortal from './pages/CustomerPortal';
import AdminPanel from './pages/AdminPanel';
import Settings from './pages/Settings';
import MemberManagement from './pages/MemberManagement';
import AccessControl from './pages/AccessControl';
import StyleGuide from './pages/StyleGuide';
import TrainerManagement from './pages/TrainerManagement';
import SystemTesting from './pages/SystemTesting';
import SecurityCameras from './pages/SecurityCameras';
import FeatureManagement from './pages/FeatureManagement';
import './styles/theme.css';

import AppContent from './components/AppContent';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LoadingProvider>
          <AppProvider>
            <ThemeProvider>
              <Router>
                <AppContent />
              </Router>
            </ThemeProvider>
          </AppProvider>
        </LoadingProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;