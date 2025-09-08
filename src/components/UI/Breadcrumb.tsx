import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  const location = useLocation();
  
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (items) return items;
    
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [{ label: 'Dashboard', path: '/' }];
    
    const pathMap: Record<string, string> = {
      members: 'Members',
      subscriptions: 'Subscriptions',
      payments: 'Payments',
      attendance: 'Attendance',
      reports: 'Reports',
      portal: 'Customer Portal',
      admin: 'Admin Panel',
      settings: 'Settings',
    };
    
    pathSegments.forEach((segment, index) => {
      const path = '/' + pathSegments.slice(0, index + 1).join('/');
      const label = pathMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      breadcrumbs.push({ label, path });
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <nav className="flex items-center space-x-2 text-sm text-white/70 mb-6">
      <Home className="w-4 h-4" />
      {breadcrumbs.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight className="w-4 h-4" />}
          {item.path && index < breadcrumbs.length - 1 ? (
            <Link
              to={item.path}
              className="hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className={index === breadcrumbs.length - 1 ? 'text-white font-medium' : ''}>
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;