import React from 'react';
import { useLoading } from '../../context/LoadingContext';

const PageLoader: React.FC = () => {
  const { isLoading, loadingText } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-dark via-secondary to-primary">
      <div className="text-center">
        <div className="space-y-2">
          <div className="loading-text">
            {loadingText.replace(/\.\.\.$/, '')}<span className="loading-dots"></span>
          </div>
          <div className="loading-progress">
            <div className="progress-fill"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageLoader;