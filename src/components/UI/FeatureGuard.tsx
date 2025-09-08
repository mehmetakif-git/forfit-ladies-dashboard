import React, { ReactNode } from 'react';
import { useFeatureToggle } from '../../hooks/useFeatureToggle';
import { Shield, Settings } from 'lucide-react';
import Button from './Button';

interface FeatureGuardProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
  showFallback?: boolean;
}

const FeatureGuard: React.FC<FeatureGuardProps> = ({ 
  feature, 
  children, 
  fallback,
  showFallback = true 
}) => {
  const isEnabled = useFeatureToggle(feature);

  if (!isEnabled) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (!showFallback) {
      return null;
    }

    return (
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 text-center">
        <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Feature Disabled</h2>
        <p className="text-white/70 mb-6">
          This feature has been temporarily disabled by the administrator.
        </p>
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          icon={Settings}
        >
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return <>{children}</>;
};

export default FeatureGuard;