// components/LivePreview.tsx
'use client'
import type { BookingEngineConfig } from '../interface';

interface LivePreviewProps {
  config: BookingEngineConfig;
}

export default function LivePreview({ config }: LivePreviewProps) {
  const { primaryColor, secondaryColor, tertiaryColor, buttonTextColor, bannerImage, logo } = config;

  return (
    <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
      <div className="p-4 bg-gray-50 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Live Preview</h3>
        <p className="text-sm text-gray-600">See how your booking engine will look</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Banner Section */}
        <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
          {bannerImage ? (
            <img src={bannerImage} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Banner Image
            </div>
          )}
          
          {/* Logo Overlay */}
          <div className="absolute top-4 left-4 w-20 h-20 bg-white rounded-lg shadow-md flex items-center justify-center p-2">
            {logo ? (
              <img src={logo} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <div className="text-xs text-gray-400 text-center">Logo</div>
            )}
          </div>
        </div>

        {/* Booking Form Preview */}
        <div className="space-y-4">
          <h4 className="text-xl font-bold" style={{ color: primaryColor }}>
            Book Your Stay
          </h4>

          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block" style={{ color: secondaryColor }}>
                Check-in
              </label>
              <div className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50" style={{ borderColor: tertiaryColor }}>
                Select date
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block" style={{ color: secondaryColor }}>
                Check-out
              </label>
              <div className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50" style={{ borderColor: tertiaryColor }}>
                Select date
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block" style={{ color: secondaryColor }}>
              Guests
            </label>
            <div className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50" style={{ borderColor: tertiaryColor }}>
              2 Adults
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
            Search Availability
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
              View Rooms
            </button>
            <button
              className="flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-all hover:opacity-80"
              style={{ 
                borderColor: tertiaryColor, 
                color: tertiaryColor 
              }}
            >
              Special Offers
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
                Feature {i}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}