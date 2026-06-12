"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import { useSelector } from "react-redux";
import { IPropertyDetails } from "../../app/(unauth)/properties/interface";
import { RootState } from "@/src/store/store";
import { formatNumber } from "../../utils/numLang";
import { useTranslation } from "react-i18next";

interface PropertyCardProps {
  property: IPropertyDetails;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const bookingContext = useSelector((state: RootState) => state.booking);

  const handleViewRooms = () => {
    const params = new URLSearchParams();
    params.set("code", property.propertyCode);

    // Preserve search criteria from bookingContext (set by SearchWidget on Properties page)
    if (bookingContext.startDate) params.set("checkin", bookingContext.startDate);
    if (bookingContext.endDate) params.set("checkout", bookingContext.endDate);
    if (bookingContext.location) params.set("location", bookingContext.location);
    if (bookingContext.promocode) params.set("promoCode", bookingContext.promocode);

    if (bookingContext.guests) {
      params.set("adults", (bookingContext.guests.adults || 1).toString());
      params.set("children", (bookingContext.guests.children || 0).toString());
      const roomsCount = Array.isArray(bookingContext.guests.rooms)
        ? bookingContext.guests.rooms.length
        : (bookingContext.guests.rooms || 1);
      params.set("rooms", roomsCount.toString());
    }

    router.push(`/Rooms?${params.toString()}`);
  };

  const getPropertyImage = () => {
    if (property.image && property.image.length > 0) return property.image[0];
    return "";
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col sm:flex-row hover:shadow-md transition-shadow duration-200">

      {/* ── LEFT: Image ── */}
      <div className="relative w-full h-48 sm:w-64 sm:min-w-[256px] sm:h-56 flex-shrink-0">
        <img
          src={getPropertyImage()}
          alt={property.propertyName}
          className="w-full h-full object-cover"
        // onError={(e) => { e.currentTarget.src = "/placeholder-property.jpg"; }}
        />
      </div>

      {/* ── MIDDLE: Details ── */}
      <div className="flex-1 px-5 py-4 flex flex-col gap-2.5 min-w-0 overflow-hidden">

        {/* Name */}
        <div>
          <h3 className="text-[17px] font-semibold text-gray-900 truncate">
            {property._translations?property._translations.propertyName:property.propertyName}
          </h3>
          {property.propertyAddress && (
            <div className="flex items-center gap-1.5 mt-0.5 text-[12px] text-[#0E5C60]">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">
                {property.propertyAddress._translations?.city || property.propertyAddress.city}
                {property.propertyAddress._translations?.state ? `, ${property.propertyAddress._translations?.state}` : ""}
                {property.propertyAddress._translations?.country ? `, ${property.propertyAddress._translations?.country}` : ""}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        {property.description && (
          <p className="text-[13px] text-gray-500 line-clamp-2 leading-relaxed">
            {property._translations?.description||property.description}
          </p>
        )}

        {/* Category + Type tags */}
        <div className="flex gap-2 mt-auto">
          {property.propertyCategory && (
            <span className="bg-gray-100 text-gray-600 text-[11px] font-medium px-2 py-0.5 rounded-full">
              {property.propertyCategory.masterCategory._translations?property.propertyCategory.masterCategory._translations.categoryName:property.propertyCategory.masterCategory.categoryName}
            </span>
          )}
          {property.propertyType && (
            <span className="bg-gray-100 text-gray-600 text-[11px] font-medium px-2 py-0.5 rounded-full">
              {property.propertyType.masterPropertyType._translations?property.propertyType.masterPropertyType._translations.propertyTypeName:property.propertyType.masterPropertyType.propertyTypeName}
            </span>
          )}
        </div>
      </div>

      {/* ── RIGHT: Price + CTA ── */}
      <div className="flex flex-col items-end justify-between p-4 sm:min-w-[175px] sm:w-44 sm:border-l border-gray-100 flex-shrink-0 w-full border-t sm:border-t-0">

        {/* Price */}
        <div className="text-right sm:text-right flex sm:flex-col justify-between sm:justify-start items-center sm:items-end w-full mb-4">
          {property.basePrice != null && (
            <>
              <p className="text-[22px] font-semibold text-gray-900 leading-none">
                <span className="text-[13px] font-normal text-gray-400 mr-0.5">
                  {property.currencyCode }
                </span>
                {formatNumber(property.basePrice)}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">{t("GroupSearch.perNight")}</p>
            </>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={handleViewRooms}
          className="w-full bg-[#0E5C60] text-white py-2.5 rounded-lg text-[13px] font-medium hover:bg-[#0a4c50] transition-colors text-center"
        >
          {t("GroupSearch.viewRoom")}
        </button>
      </div>
    </div>
  );
};

export default PropertyCard;
