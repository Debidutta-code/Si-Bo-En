// components/LivePreview.tsx
'use client'
import type { BookingEngineConfig } from '../interface';
import { useTranslation } from 'react-i18next';

interface LivePreviewProps {
  config: BookingEngineConfig;
}

export default function LivePreview({ config }: LivePreviewProps) {
  const { primaryColor, secondaryColor, tertiaryColor, buttonTextColor, logo } = config;
  const { t } = useTranslation();

  return (
    <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
      <div className="p-4 bg-gray-50 border-b">
        <h3 className="text-lg font-semibold text-gray-900">{t('BookingEngine.livePreview')}</h3>
        <p className="text-sm text-gray-600">{t('BookingEngine.livePreviewSubtitle')}</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Banner Section */}
        <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
       
          
          {/* Logo Overlay */}
          <div className="absolute top-4 left-4 w-20 h-20 bg-white rounded-lg shadow-md flex items-center justify-center p-2">
            {logo ? (
              <img src={logo} alt={t('BookingEngine.logo')} className="w-full h-full object-contain" />
            ) : (
              <div className="text-xs text-gray-400 text-center">{t('BookingEngine.logo')}</div>
            )}
          </div>
        </div>

        {/* Booking Form Preview */}
        <div className="space-y-4">
          <h4 className="text-xl font-bold" style={{ color: primaryColor }}>
            {t('BookingEngine.bookYourStay')}
          </h4>

          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block" style={{ color: secondaryColor }}>
                {t('BookingEngine.checkIn')}
              </label>
              <div className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50" style={{ borderColor: tertiaryColor }}>
                {t('BookingEngine.selectDate')}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block" style={{ color: secondaryColor }}>
                {t('BookingEngine.checkOut')}
              </label>
              <div className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50" style={{ borderColor: tertiaryColor }}>
                {t('BookingEngine.selectDate')}
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block" style={{ color: secondaryColor }}>
              {t('BookingEngine.guests')}
            </label>
            <div className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50" style={{ borderColor: tertiaryColor }}>
              {t('BookingEngine.twoAdults')}
            </div>
          </div>

          {/* Search Button */}
          <button
            className="w-full py-3 px-6 rounded-lg font-semibold text-center transition-all hover:opacity-90"
            style={{ 
              backgroundColor: primaryColor, 
              color: buttonTextColor 
            }}
          >
            {t('BookingEngine.searchAvailability')}
          </button>

          {/* Secondary Actions */}
          <div className="flex gap-2">
            <button
              className="flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-all hover:opacity-80"
              style={{ 
                borderColor: secondaryColor, 
                color: secondaryColor 
              }}
            >
              {t('BookingEngine.viewRooms')}
            </button>
            <button
              className="flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-all hover:opacity-80"
              style={{ 
                borderColor: tertiaryColor, 
                color: tertiaryColor 
              }}
            >
              {t('BookingEngine.specialOffers')}
            </button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-3 rounded-lg text-center"
              style={{ backgroundColor: `${tertiaryColor}15` }}
            >
              <div className="text-2xl mb-1">★</div>
              <div className="text-xs font-medium" style={{ color: secondaryColor }}>
                {t('BookingEngine.feature', { number: i })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}