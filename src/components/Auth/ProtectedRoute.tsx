import React, { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ('admin' | 'staff' | 'member' | 'trainer')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = ['admin', 'staff', 'member', 'trainer'] 
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isRedirecting, setIsRedirecting] = React.useState(false);

  if (!isAuthenticated || !user) {
    return null;
  }

  if (!allowedRoles.includes(user.role)) {
    React.useEffect(() => {
      setIsRedirecting(true);
      
      const timer = setTimeout(() => {
        // Clear auth data and redirect to login
        localStorage.removeItem('forfit-auth');
        logout();
      }, 3000);
      
      return () => clearTimeout(timer);
    }, [logout]);

    return (
      <div className="min-h-screen bg-gradient-to-br from-dark via-secondary to-primary flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 text-center">
          <h2 className="text-xl font-semibold text-white mb-4">Access Denied</h2>
          <p className="text-white/70 mb-6">You don't have permission to access this page.</p>
          
          {isRedirecting && (
            <div className="space-y-4">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-white/80">Redirecting to login page...</p>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
              </div>
            </div>
          )}
          
          {!isRedirecting && (
            <div className="mt-6">
              <button
                onClick={() => {
                  localStorage.removeItem('forfit-auth');
                  logout();
                }}
                className="px-4 py-2 bg-primary rounded-lg text-white hover:bg-primary/80 transition-colors"
              >
                Return to Login
              </button>
            </div>
          )}
          </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;