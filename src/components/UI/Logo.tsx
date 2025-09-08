import React from 'react';
import { Dumbbell } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, className = '' }) => {
  const { settings } = useApp();

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
  };

  if (settings.logo) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <img
          src={settings.logo}
          alt={settings.studioName}
          className={`object-contain ${
            size === 'sm' ? 'max-h-8 max-w-24' : 
            size === 'md' ? 'max-h-10 max-w-32' : 
            'max-h-16 max-w-48'
          }`}
        />
        {showText && (
          <div>
            <h1 className={`font-bold text-white ${textSizeClasses[size]}`}>
              {settings.studioName}
            </h1>
            {size !== 'sm' && (
              <p className="text-sm text-white/70">Premium Admin Dashboard</p>
            )}
          </div>
        )}
      </div>
    );
  }

  // Default logo fallback
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`bg-gradient-to-br from-accent-gold to-accent-orange rounded-lg flex items-center justify-center ${sizeClasses[size]}`}>
        <Dumbbell className={`text-dark ${
          size === 'sm' ? 'w-4 h-4' : 
          size === 'md' ? 'w-6 h-6' : 
          'w-8 h-8'
        }`} />
      </div>
      {showText && (
        <div>
          <h1 className={`font-bold text-white ${textSizeClasses[size]}`}>
            {settings.studioName}
          </h1>
          {size !== 'sm' && (
            <p className="text-sm text-white/70">Premium Admin Dashboard</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;