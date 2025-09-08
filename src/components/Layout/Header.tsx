import React from 'react';
import { Bell, Globe, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import QuickNav from '../UI/QuickNav';
import Logo from '../UI/Logo';
import toast from 'react-hot-toast';

const Header: React.FC = () => {
  const { settings, updateSettings, t } = useApp();
  const { user, logout } = useAuth();

  const toggleLanguage = () => {
    updateSettings({ 
      language: settings.language === 'en' ? 'ar' : 'en' 
    });
    // Update document direction
    document.documentElement.dir = settings.language === 'en' ? 'rtl' : 'ltr';
  };

  const handleLogout = () => {
    logout();
    toast.success(t('auth.signOut'));
  };

  return (
    <header className="bg-white/10 backdrop-blur-xl border-b border-white/10 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Logo size="sm" showText={false} className="lg:hidden" />
          <QuickNav />
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleLanguage}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <Globe className="w-5 h-5 text-white" />
          </button>
          
          <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors relative">
            <Bell className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"></span>
          </button>

          <div className="flex items-center gap-3 relative group">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent-orange rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-white">
                {user?.name.split(' ').map(n => n[0]).join('') || 'U'}
              </span>
            </div>
            <div className="text-white">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-white/70 capitalize">{user?.role}</p>
            </div>
            
            {/* User Dropdown */}
            <div className="absolute top-full right-0 mt-2 w-48 bg-secondary/90 backdrop-blur-xl rounded-lg border border-white/20 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="p-3 border-b border-white/10">
                <p className="text-white font-medium">{user?.name}</p>
                <p className="text-white/60 text-sm">{user?.email}</p>
              </div>
              <div className="p-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;