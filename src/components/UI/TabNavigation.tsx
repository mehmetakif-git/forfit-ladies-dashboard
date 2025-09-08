import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  showNavButtons?: boolean;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
  showNavButtons = true,
}) => {
  const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < tabs.length - 1;

  const goToPrevious = () => {
    if (canGoPrevious) {
      onTabChange(tabs[currentIndex - 1].id);
    }
  };

  const goToNext = () => {
    if (canGoNext) {
      onTabChange(tabs[currentIndex + 1].id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Headers */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-1 bg-white/10 backdrop-blur-xl rounded-lg p-1 border border-white/20">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Navigation Buttons */}
        {showNavButtons && (
          <div className="flex gap-2">
            <Button
              variant="glass"
              size="sm"
              onClick={goToPrevious}
              disabled={!canGoPrevious}
              icon={ChevronLeft}
            >
              Previous
            </Button>
            <Button
              variant="glass"
              size="sm"
              onClick={goToNext}
              disabled={!canGoNext}
              icon={ChevronRight}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {tabs.find(tab => tab.id === activeTab)?.content}
      </div>

      {/* Progress Indicator */}
      <div className="flex justify-center">
        <div className="flex space-x-2">
          {tabs.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-primary' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TabNavigation;