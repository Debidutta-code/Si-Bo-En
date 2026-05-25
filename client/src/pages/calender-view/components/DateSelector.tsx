import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DateSelectorProps {
  currentView: 'day' | 'week' | 'month' | 'year';
  currentDate: string;
  onViewChange: (view: 'day' | 'week' | 'month' | 'year') => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday?: () => void;
  showAdminButton?: boolean;
  onAdminClick?: () => void;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  currentView,
  currentDate,
  onViewChange,
  onPrevious,
  onNext,
  onToday,
  showAdminButton = false,
  onAdminClick
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-3 mb-4">
      {/* View Type Selector - Responsive grid on mobile */}
      <div className="grid grid-cols-2 sm:flex sm:flex-row gap-1">
        {(['day', 'week', 'month', 'year'] as const).map((view) => (
          <button
            key={view}
            onClick={() => onViewChange(view)}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              currentView === view
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
          {t(`Common.${view}`)}
          </button>
        ))}
      </div>

      {/* Date Navigation - Stacked layout on mobile */}
      <div className="flex flex-col sm:flex-row items-center gap-2 justify-between">
        <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-center">
          <button
            onClick={onPrevious}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="text-sm font-semibold text-gray-800 min-w-[120px] sm:min-w-[150px] text-center">
            {currentDate}
          </div>
          
          <button
            onClick={onNext}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Buttons Container */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Today Button */}
          {onToday && (
            <button 
              onClick={onToday}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200 transition-colors flex-1 sm:flex-initial"
            >
              {t('CalendarView.dateSelector.today')}
            </button>
          )}

          {/* Super Admin Button - UPDATED TEXT */}
          {showAdminButton && onAdminClick && (
            <button
              onClick={onAdminClick}
              className="px-3 py-1.5 bg-purple-600 text-white rounded text-xs font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
            >
              <svg 
                className="w-3.5 h-3.5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="hidden sm:inline">{t('CalendarView.dateSelector.propertyCommission')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};