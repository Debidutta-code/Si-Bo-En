import { useBooking } from "@/contexts/BookingContext";
import { MapPin } from "lucide-react";

export function PropertyFooter() {
  const { state } = useBooking();
  const { propertyDetails } = state;

  if (!propertyDetails) return null;

  const { address, bookingEngineConfig } = propertyDetails;
  const logo = bookingEngineConfig?.logo;

  // Build address string from available fields
  const addressParts = [
    address?.addressLine1,
    address?.addressLine2,
    address?.landmark,
    address?.city,
    address?.state,
    address?.country,
    address?.zipCode,
  ].filter(Boolean);

  const fullAddress = addressParts.join(", ");

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-12">
      <div className="container px-4 py-8 sm:py-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
          {/* Logo */}
          {logo && (
            <div className="flex-shrink-0">
              <img
                src={logo}
                alt={`${propertyDetails.propertyName} logo`}
                className="h-12 sm:h-14 md:h-16 w-auto object-contain rounded"
              />
            </div>
          )}

          {/* Property Info */}
          <div className="flex flex-col items-center sm:items-start gap-2 text-center sm:text-left">
            <h4 className="text-base sm:text-lg font-semibold text-gray-900">
              {propertyDetails.propertyName}
            </h4>

            {fullAddress && (
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-gray-400" />
                <p className="leading-relaxed">{fullAddress}</p>
              </div>
            )}

            {/* Google Maps link */}
            {address?.latitude && address?.longitude && (
              <a
                href={`https://www.google.com/maps?q=${address.latitude},${address.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors mt-1"
              >
                View on Google Maps →
              </a>
            )}
          </div>
        </div>

        {/* Bottom line */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400 text-center sm:text-left">
            © {new Date().getFullYear()} {propertyDetails.propertyName}. Powered
            by RevChill.
          </p>
        </div>
      </div>
    </footer>
  );
}
