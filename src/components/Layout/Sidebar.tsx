import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Calendar,
  BarChart3,
  Settings,
  UserPlus,
  Palette,
  TestTube,
  ChevronRight,
  UserCog,
  Shield,
  Camera,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import Logo from '../UI/Logo';

const adminNavigation = [
  { nameKey: 'nav.dashboard', href: '/', icon: LayoutDashboard },
  { nameKey: 'nav.members', href: '/members', icon: Users },
  { nameKey: 'nav.management', href: '/member-management', icon: UserCog },
  { nameKey: 'nav.trainerManagement', href: '/trainer-management', icon: Users },
  { nameKey: 'nav.accessControl', href: '/access-control', icon: Shield },
  { nameKey: 'nav.security', href: '/security', icon: Camera },
  { nameKey: 'nav.subscriptions', href: '/subscriptions', icon: CreditCard },
  { nameKey: 'nav.payments', href: '/payments', icon: CreditCard },
  { nameKey: 'nav.attendance', href: '/attendance', icon: Calendar },
  { nameKey: 'nav.reports', href: '/reports', icon: BarChart3 },
  { nameKey: 'nav.customerPortal', href: '/portal', icon: UserPlus },
  { nameKey: 'nav.adminPanel', href: '/admin', icon: Palette },
  { nameKey: 'nav.systemTesting', href: '/admin/system-test', icon: TestTube },
  { nameKey: 'nav.featureManagement', href: '/feature-management', icon: Settings },
  { nameKey: 'nav.settings', href: '/settings', icon: Settings },
];

const staffNavigation = [
  { nameKey: 'nav.dashboard', href: '/', icon: LayoutDashboard },
  { nameKey: 'nav.members', href: '/members', icon: Users },
  { nameKey: 'nav.subscriptions', href: '/subscriptions', icon: CreditCard },
  { nameKey: 'nav.attendance', href: '/attendance', icon: Calendar },
  { nameKey: 'nav.customerPortal', href: '/portal', icon: UserPlus },
  { nameKey: 'nav.settings', href: '/settings', icon: Settings },
];

const memberNavigation = [
  { nameKey: 'nav.dashboard', href: '/', icon: LayoutDashboard },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { settings, t } = useApp();
  const { user } = useAuth();

  const getNavigation = () => {
    switch (user?.role) {
      case 'admin':
        return adminNavigation;
      case 'staff':
        return staffNavigation;
      case 'member':
        return memberNavigation;
      default:
        return [];
    }
  };

  const navigation = getNavigation();

  const handleNavigation = (href: string) => {
    // Add fade-out transition before navigation
    document.body.classList.add('transitioning');
    setTimeout(() => {
      navigate(href);
    }, 300);
  };

  return (
    <div className="w-64 min-h-screen bg-gradient-to-b from-secondary to-primary/80 backdrop-blur-xl border-r border-white/10">
      <div className="p-6">
        <div className="mb-8">
          <Logo size="md" showText={true} />
          <p className="text-sm text-white/70 capitalize mt-2">{user?.role} Portal</p>
        </div>

        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            const name = t(item.nameKey);
            
            return (
              <button
                key={item.nameKey}
                onClick={() => handleNavigation(item.href)}
                className={`nav-item ${isActive ? 'active' : ''} w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-white/20 text-white shadow-lg transform scale-105'
                    : 'text-white/80 hover:bg-white/10 hover:text-white hover:transform hover:scale-102'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span className="font-medium truncate">{name}</span>
                </div>
                {isActive && (
                  <ChevronRight className="w-4 h-4 text-white/60 flex-shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Actions - Only for Admin and Staff */}
        {(user?.role === 'admin' || user?.role === 'staff') && (
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-white/60 text-sm font-medium mb-3 px-4">{t('.quickActions') || 'Quick Actions'}</p>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/members?action=add')}
                className="w-full flex items-center gap-3 px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all text-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span>{t('members.addMember')}</span>
              </button>
              <button
                onClick={() => navigate('/attendance?action=checkin')}
                className="w-full flex items-center gap-3 px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all text-sm"
              >
                <Calendar className="w-4 h-4" />
                <span>{t('.checkIn') || 'Check In'}</span>
              </button>
              {user?.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin')}
                  className="w-full flex items-center gap-3 px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all text-sm"
                >
                  <Palette className="w-4 h-4" />
                  <span>{t('nav.adminPanel')}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;