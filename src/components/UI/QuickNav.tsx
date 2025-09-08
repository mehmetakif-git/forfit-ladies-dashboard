import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Command } from 'lucide-react';

interface QuickNavItem {
  label: string;
  path: string;
  keywords: string[];
}

const QuickNav: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const navItems: QuickNavItem[] = [
    { label: 'Dashboard', path: '/', keywords: ['home', 'overview', 'stats'] },
    { label: 'Members', path: '/members', keywords: ['users', 'clients', 'people'] },
    { label: 'Add Member', path: '/members?action=add', keywords: ['new', 'create', 'register'] },
    { label: 'Subscriptions', path: '/subscriptions', keywords: ['plans', 'pricing', 'membership'] },
    { label: 'Payments', path: '/payments', keywords: ['billing', 'transactions', 'money'] },
    { label: 'Attendance', path: '/attendance', keywords: ['checkin', 'visits', 'tracking'] },
    { label: 'Reports', path: '/reports', keywords: ['analytics', 'charts', 'data'] },
    { label: 'Customer Portal', path: '/portal', keywords: ['registration', 'signup', 'join'] },
    { label: 'Admin Panel', path: '/admin', keywords: ['customize', 'branding', 'theme'] },
    { label: 'Settings', path: '/settings', keywords: ['config', 'preferences', 'options'] },
  ];

  const filteredItems = navItems.filter(item =>
    item.label.toLowerCase().includes(search.toLowerCase()) ||
    item.keywords.some(keyword => keyword.includes(search.toLowerCase()))
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearch('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelect = (path: string) => {
    navigate(path);
    setIsOpen(false);
    setSearch('');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white/70 hover:text-white text-sm"
      >
        <Search className="w-4 h-4" />
        <span>Quick nav</span>
        <div className="flex items-center gap-1 ml-2">
          <kbd className="px-1.5 py-0.5 bg-white/20 rounded text-xs">⌘</kbd>
          <kbd className="px-1.5 py-0.5 bg-white/20 rounded text-xs">K</kbd>
        </div>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />
      
      <div className="relative w-full max-w-lg mx-4">
        <div className="bg-secondary/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-white/10">
            <Search className="w-5 h-5 text-white/50" />
            <input
              type="text"
              placeholder="Search pages and actions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-white/50 focus:outline-none"
              autoFocus
            />
            <div className="flex items-center gap-1">
              <Command className="w-4 h-4 text-white/50" />
              <span className="text-white/50 text-sm">ESC</span>
            </div>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleSelect(item.path)}
                  className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors text-white border-b border-white/5 last:border-b-0"
                >
                  <div className="font-medium">{item.label}</div>
                  <div className="text-sm text-white/60">{item.path}</div>
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-white/60">
                No results found for "{search}"
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickNav;