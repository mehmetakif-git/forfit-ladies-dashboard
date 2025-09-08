import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoadingProvider } from './context/LoadingContext';
import { ThemeProvider } from './components/theme/ThemeProvider';
import ErrorBoundary from './components/Auth/ErrorBoundary';
import PageLoader from './components/UI/PageLoader';
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
import { useLocation } from 'react-router-dom';
import { useLoading } from './context/LoadingContext';
import { useEffect } from 'react';
import './styles/theme.css';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { setIsLoading, setLoadingText } = useLoading();
  const location = useLocation();

  useEffect(() => {
    // Remove transitioning class when route changes
    document.body.classList.remove('transitioning');
    
    setIsLoading(true);
    
    // Set loading text based on route
    const routeTexts: Record<string, string> = {
      '/': 'Loading dashboard...',
      '/members': 'Loading members...',
      '/member-management': 'Loading member management...',
      '/subscriptions': 'Loading subscription plans...',
      '/payments': 'Loading payment records...',
      '/attendance': 'Loading attendance data...',
      '/reports': 'Generating reports...',
      '/portal': 'Loading customer portal...',
      '/admin': 'Loading admin panel...',
      '/settings': 'Loading settings...',
      '/member-portal': 'Loading member portal...',
      '/trainer-management': 'Loading trainer management...',
      '/security': 'Loading security cameras...',
      '/access-control': 'Loading access controls...',
      '/feature-management': 'Loading feature management...'
    };
    
    setLoadingText(routeTexts[location.pathname] || 'Your Dashboard getting better...');
    
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Add fade-in effect after loading
      setTimeout(() => {
        document.body.classList.add('loaded');
      }, 50);
    }, 1200); // Minimum display time
    
    return () => {
      clearTimeout(timer);
      document.body.classList.remove('loaded');
    };
  }, [location.pathname, setIsLoading, setLoadingText]);

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <Routes>
      <Route path="/" element={
        <ProtectedRoute allowedRoles={['admin', 'staff']}>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/member-portal" element={
        <ProtectedRoute allowedRoles={['member']}>
          <div className="min-h-screen bg-gradient-to-br from-dark via-secondary to-primary">
            <MemberCardView />
          </div>
        </ProtectedRoute>
      } />
      <Route path="/trainer-portal" element={
        <ProtectedRoute allowedRoles={['trainer']}>
          <div className="min-h-screen bg-gradient-to-br from-dark via-secondary to-primary">
            <TrainerPortal />
          </div>
        </ProtectedRoute>
      } />
      <Route path="/members" element={
        <ProtectedRoute allowedRoles={['admin', 'staff']}>
          <Layout>
            <Members />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/member-management" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout>
            <MemberManagement />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/trainer-management" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout>
            <TrainerManagement />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/access-control" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout>
            <AccessControl />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/subscriptions" element={
        <ProtectedRoute allowedRoles={['admin', 'staff']}>
          <Layout>
            <Subscriptions />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/payments" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout>
            <Payments />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/attendance" element={
        <ProtectedRoute allowedRoles={['admin', 'staff']}>
          <Layout>
            <Attendance />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout>
            <Reports />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/portal" element={
        <CustomerPortal />
      } />
      <Route path="/register" element={
        <MemberRegistration />
      } />
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout>
            <AdminPanel />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute allowedRoles={['admin', 'staff']}>
          <Layout>
            <Settings />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/styleguide/menus" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout>
            <StyleGuide />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/system-test" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout>
            <SystemTesting />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/security" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout>
            <SecurityCameras />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/feature-management" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout>
            <FeatureManagement />
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LoadingProvider>
          <AppProvider>
            <ThemeProvider>
              <Router>
                <div className="min-h-screen bg-gradient-to-br from-dark via-secondary to-primary font-inter page-fade-out">
                  {/* Floating background particles */}
                  <div className="floating-shape shape-4"></div>
                  <div className="floating-shape shape-5"></div>
                  <div className="floating-shape shape-6"></div>
                  <div className="floating-shape shape-7 heart-particle"></div>
                  
                  <PageLoader />
                  <AppContent />
                  
                  <Toaster
                    position="top-right"
                    toastOptions={{
                      style: {
                        background: 'rgba(82, 58, 122, 0.9)',
                        color: '#fff',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        backdropFilter: 'blur(10px)',
                      },
                      success: {
                        iconTheme: {
                          primary: '#10B981',
                          secondary: '#fff',
                        },
                      },
                    }}
                  />
                </div>
              </Router>
            </ThemeProvider>
          </AppProvider>
        </LoadingProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;