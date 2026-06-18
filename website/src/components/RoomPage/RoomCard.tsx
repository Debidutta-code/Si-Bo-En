// src/components/RoomPage/RoomCard.tsx
"use client";

import React, { useState } from "react";
import {
  Users, Ruler, Eye, Wifi, Coffee, Tv, Wind,
  Phone, Utensils, ChevronRight, ChevronDown,
  ChevronUp, ChevronLeft, Lock,
} from "lucide-react";
import RoomDetails from "./RoomDetails";
import { IRoom } from "@/src/app/(unauth)/Rooms/types";
import { useBookingStorage } from "../../hooks/useBookingStorage";
import { IPropertyLoyalityWithLoyality, IRoomDetails } from "@/src/app/(unauth)/Rooms/interface";
import { useTranslation } from "react-i18next";
import { formatNumber } from "@/src/utils/numLang";
import {
  IRoomGuestDetail,
  IRoomPrice,
  ISelectedPromotion,
  IPromotionType,
} from "@/src/app/(unauth)/Rooms/types";
import { currencies } from "../currencyCode/cuurency";
import { Currency } from "../currencyCode/currency-code.type";

/**
 * RoomCard is now a pure display component. It owns only UI-local state
 * (image carousel, expand/collapse, promotion picking) and fires a single
 * outward callback — onSelectRatePlan — when the user clicks "Add".
 *
 * Everything booking-in-progress related (selected room/rate plan, addon
 * fetch + selection, price fetch, the AddonSelectionModal itself) now lives
 * in Rooms.tsx. This eliminates the old ref-based wiring
 * (onRegisterReproceed / pendingAddonsRef) that caused one RoomCard
 * instance's loading/selection state to bleed into another's.
 */

interface RoomCardProps {
  room: IRoomDetails;
  propertyDetails: unknown;
  bookingContext: IBookingContext;
  onSelectRatePlan: (
    room: IRoom,
    ratePlan: IRoomPrice,
    selectedPromotions: ISelectedPromotion[],
    ratePlanKey: string
  ) => void;
  selectedBoardType?: string;
  loyalty: IPropertyLoyalityWithLoyality | null;
  loyaltyDiscountInfo?: ILoyaltyDiscountInfo | null;
  loyaltyToggleOn: boolean;
  setLoyaltyToggle: (value: boolean) => void;
  /** Set by the parent while it is fetching for the exact rate plan being processed, so only that Add button shows a spinner. */
  loadingRatePlanKey: string | null;
}

interface IBookingContext {
  PropertyCode: string;
  startDate: string;
  endDate: string;
  promocode?: string;
  location?: string;
  guests: {
    adults?: number;
    children?: number;
    rooms?: number | IRoomGuestDetail[];
    roomsArray?: IRoomGuestDetail[];
  };
}

interface ILoyaltyDiscountInfo {
  type: string;
  value: number;
  currencyCode: string;
}

const AmenityIcon = ({ amenityKey }: { amenityKey: string }) => {
  const icons: Record<string, React.ReactNode> = {
    wifiInternet: <Wifi size={16} />,
    telephone: <Phone size={16} />,
    television: <Tv size={16} />,
    airConditioning: <Wind size={16} />,
    coffeeMaker: <Coffee size={16} />,
    microwave: <Utensils size={16} />,
  };
  return <>{icons[amenityKey] ?? null}</>;
};

interface IAmenityObject {
  id: string;
  amenityName: string;
  _translations?: { amenityName?: string };
}

const getActiveAmenities = (amenities: IAmenityObject[] | Record<string, unknown> | null): IAmenityObject[] => {
  if (Array.isArray(amenities)) return amenities.slice(0, 6);
  return [];
};

const formatAmenityName = (key: string): string =>
  key.replace(/([A-Z])/g, " $1").trim()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const RoomCard: React.FC<RoomCardProps> = ({
  room,
  bookingContext,
  onSelectRatePlan,
  selectedBoardType,
  loyalty,
  loyaltyDiscountInfo,
  loyaltyToggleOn,
  setLoyaltyToggle,
  loadingRatePlanKey,
}) => {
  const { t } = useTranslation();

  const loyaltyDiscount = loyalty?.CreationLoyaltyConfig;

  // ─── Media state ────────────────────────────────────────────────────────────
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(true);
  const hasVideo = !!room?.roomVideos?.url;
  const images = room.images?.length
    ? room.images
    : ["https://via.placeholder.com/600x400?text=No+Image+Available"];
  const totalMediaCount = images.length + (hasVideo ? 1 : 0);
  const prevImage = () => {
    if (showVideo) { setShowVideo(false); setCurrentImageIndex(images.length - 1); }
    else if (currentImageIndex === 0) { if (hasVideo) setShowVideo(true); else setCurrentImageIndex(images.length - 1); }
    else setCurrentImageIndex((p) => p - 1);
  };

  const nextImage = () => {
    if (showVideo) { setShowVideo(false); setCurrentImageIndex(0); }
    else if (currentImageIndex === images.length - 1) { if (hasVideo) setShowVideo(true); else setCurrentImageIndex(0); }
    else setCurrentImageIndex((p) => p + 1);
  };

  // ─── Colors ─────────────────────────────────────────────────────────────────
  const { colors } = useBookingStorage(bookingContext);
  const { primaryColor, buttonTextColor } = colors;

  // ─── Rate plan / combo state (UI-local only) ─────────────────────────────────
  const [expandedCombo, setExpandedCombo] = useState<string | null>(null);
  const [expandedPromotions, setExpandedPromotions] = useState<string | null>(null);
  const [selectedPromotions, setSelectedPromotions] = useState<Record<string, ISelectedPromotion[]>>({});

  const [expandedRatePlan, setExpandedRatePlan] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRatePlanForDetails, setSelectedRatePlanForDetails] = useState<IRoomPrice | null>(null);

  /** Fires a single outward callback with everything the parent needs to take over. */
  const handleAddClick = (combo: IRoomPrice, ratePlanKey: string) => {
    const selectedPromotionsList = selectedPromotions[combo.ratePlanCode] ?? [];
    onSelectRatePlan(
      {
        id: room.id, roomName: room.roomName, roomType: room.roomType,
        roomSize: room.roomSize, roomUnit: room.roomUnit, priority: room.priority,
        numberOfBedrooms: room.numberOfBedrooms, maxOccupancy: room.maxOccupancy,
        images: room.images, description: room.description,
        hasValidRate: room.hasValidRate, roomView: room.roomView,
      },
      combo,
      selectedPromotionsList,
      ratePlanKey
    );
  };

  const activeAmenities = getActiveAmenities(room.amenities);

  const groupedRatePlans = room.roomPrice.reduce<Record<string, IRoomPrice[]>>(
    (acc, rp) => {
      if (!acc[rp.ratePlanCode]) acc[rp.ratePlanCode] = [];
      acc[rp.ratePlanCode].push(rp);
      return acc;
    },
    {}
  );

  const isLoadingForRatePlan = (key: string) => loadingRatePlanKey === key;

  // ─── Loyalty calc helper ──────────────────────────────────────────────────────
  const getLoyaltyDiscountAmount = (basePrice: number): number => {
    if (!loyaltyDiscount) return 0;
    if (loyalty?.discountPercentage != null) return (basePrice * loyalty.discountPercentage) / 100;
    if (loyaltyDiscount.loyaltyDiscountType === "percentage") return (basePrice * loyaltyDiscount.discountValue) / 100;
    if (loyaltyDiscount.loyaltyDiscountType === "flat") return loyaltyDiscount.discountValue;
    return 0;
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Room Header Card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className="flex flex-col md:flex-row">
          {/* Media */}
          <div className="md:w-2/5 lg:w-1/3 relative">
            {showVideo ? (
              <div className="relative w-full h-48">
                <video
                  className="w-full h-full object-cover"
                  autoPlay muted loop playsInline
                  poster={room.roomVideos?.thumbnail}
                  key={room.roomVideos?.url}
                >
                  <source src={room.roomVideos?.url} type="video/mp4" />
                </video>
              </div>
            ) : (
              <img
                src={images[currentImageIndex]}
                alt={room._translations?.roomName ?? room.roomName}
                className="w-full h-48 object-cover"
              />
            )}

            {totalMediaCount > 0 && (
              <>
                <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 transition">
                  <ChevronLeft size={18} />
                </button>
                <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 transition">
                  <ChevronRight size={18} />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {images.map((_, idx) => (
                    <span key={idx} className={`h-2 w-2 rounded-full ${!showVideo && idx === currentImageIndex ? "bg-white" : "bg-white/50"}`} />
                  ))}
                  {hasVideo && <span className={`h-2 w-2 rounded-full ${showVideo ? "bg-white" : "bg-white/50"}`} />}
                </div>
              </>
            )}
          </div>

          {/* Room Info */}
          <div className="md:w-3/5 lg:w-2/3 p-4 md:p-5">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                  {room._translations?.roomName ?? room.roomName}
                </h2>
              </div>
            </div>

            <p className="text-xs md:text-sm text-gray-700 mb-3 leading-relaxed line-clamp-3">
              {room._translations ? room._translations.description : room.description}
            </p>

            <div className="flex flex-wrap gap-3 md:gap-4 text-xs md:text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1.5">
                <Users size={16} className="text-orange-500 flex-shrink-0" />
                <span className="font-medium">{formatNumber(room.maxOccupancy)} {t("RoomCard.guests", { defaultValue: "Guests" })}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Ruler size={16} className="text-orange-500 flex-shrink-0" />
                <span className="font-medium">{formatNumber(room.roomSize)} {room.roomUnit ? t(`Rooms.${room.roomUnit.toLowerCase()}`, { defaultValue: room.roomUnit }) : ""}</span>
              </div>
              {room.roomView && (
                <div className="flex items-center gap-1.5">
                  <Eye size={16} className="text-orange-500 flex-shrink-0" />
                  <span className="font-medium">
                    {room.roomView._translations?.viewName ?? room.roomView.MasterRoomView.viewName}
                  </span>
                </div>
              )}
              {room.numberOfBedrooms > 0 && (
                <div className="flex items-center gap-1.5">
                  <Eye size={16} className="text-orange-500 flex-shrink-0" />
                  <span className="font-medium">{formatNumber(room.numberOfBedrooms)} {t("RoomDetails.bedrooms", { defaultValue: "Bedrooms" })}</span>
                </div>
              )}
            </div>

            {activeAmenities.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {activeAmenities.map((amenity) => (
                  <div key={amenity.id} className="flex items-center gap-1 text-xs text-gray-700 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-200">
                    <AmenityIcon amenityKey={amenity.amenityName} />
                    <span className="font-medium">{amenity._translations?.amenityName ?? amenity.amenityName}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rate Plan Cards */}
      <div className="space-y-3">
        {Object.entries(groupedRatePlans)
          .filter(([, combos]) => {
            if (!selectedBoardType || selectedBoardType === "all") return true;
            return combos[0].ratePlanName === selectedBoardType;
          })
          .map(([ratePlanCode, combos]) => {
            const firstCombo = combos[0];
            const currency = firstCombo.currencyCode ?? "USD";
            const basePrice = firstCombo.totalAmount ?? 0;
            const loyaltyDiscountAmount = getLoyaltyDiscountAmount(basePrice);

            return (
              <div key={ratePlanCode} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Card Header */}
                <div className="flex items-center justify-between p-2 sm:px-4 sm:py-3 border-b border-gray-100">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                      {firstCombo._translations ? firstCombo._translations.ratePlanName : firstCombo.ratePlanName}
                    </h3>
                    {selectedPromotions[ratePlanCode]?.length > 0 && (
                      <span className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold rounded">
                        {t("RoomCard.promotionalRate")}
                      </span>
                    )}
                    {(firstCombo.touristTax?.calculatedTaxAmount ?? 0) > 0 && (
                      <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        <span className="w-1 h-1 rounded-full bg-amber-500" />
                        {t("RoomCard.taxNotIncluded")}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                    <button
                      onClick={() => { setSelectedRatePlanForDetails(firstCombo); setShowDetailsModal(true); }}
                      className="text-[11px] text-blue-500 hover:text-blue-700 font-medium hover:underline whitespace-nowrap"
                    >
                      {t("RoomCard.bookingConditions")}
                    </button>

                    {firstCombo.availablePromotions?.length > 0 && (
                      <button
                        onClick={() => setExpandedPromotions(expandedPromotions === ratePlanCode ? null : ratePlanCode)}
                        className="flex items-center gap-1 text-[11px] text-orange-500 hover:text-orange-700 font-semibold whitespace-nowrap"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {selectedPromotions[ratePlanCode]?.length > 0
                          ? `${formatNumber(selectedPromotions[ratePlanCode].length)} ${t("RoomCard.offersApplied")}`
                          : `${formatNumber(firstCombo.availablePromotions.length)} ${t("RoomCard.specialOfferAvailable")}`}
                      </button>
                    )}
                  </div>
                </div>

                {/* Promotions Panel */}
                {expandedPromotions === ratePlanCode && (firstCombo.availablePromotions?.length ?? 0) > 0 && (
                  <div className="px-4 py-3 bg-orange-50 border-b border-orange-100">
                    <p className="text-[10px] font-bold text-orange-800 uppercase tracking-wide mb-2">
                      🏷 {t("RoomCard.specialOffersAvailable")}
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {firstCombo.availablePromotions!.map((promo) => {
                        const isSelected = selectedPromotions[ratePlanCode]?.some((p) => p.id === promo.id);
                        const promoEmoji: Record<IPromotionType, string> = {
                          device_specific: "📱", mlos: "🌙", early_bird: "🐦",
                          offer_for_tonight: "🌙", normal: "🏷",
                        };
                        return (
                          <div
                            key={promo.id}
                            onClick={() => {
                              setSelectedPromotions((prev) => {
                                const current = prev[ratePlanCode] ?? [];
                                const already = current.some((p) => p.id === promo.id);
                                return {
                                  ...prev,
                                  [ratePlanCode]: already
                                    ? current.filter((p) => p.id !== promo.id)
                                    : [...current, {
                                      id: promo.id,
                                      promotionType: promo.promotionType,
                                      promotionName: promo.promotionName,
                                      discountValue: promo.discountValue,
                                      discountType: promo.discountType,
                                    }],
                                };
                              });
                            }}
                            className={`flex items-center justify-between px-3 py-2 rounded-lg border cursor-pointer transition-all ${isSelected ? "border-orange-400 bg-orange-100" : "border-orange-200 bg-white hover:border-orange-300"}`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-sm">{promoEmoji[promo.promotionType] ?? "🏷"}</span>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-orange-900 truncate">{promo.promotionType === "mlos" ? `${t("RoomCard.mlos", { nights: formatNumber(parseInt(promo.promotionName)) })}` : promo?._translations ? promo._translations.promotionName : promo.promotionName}</p>
                                <p className="text-[10px] text-orange-600">
                                  {promo.promotionType === "mlos"
                                    ? `${t("RoomCard.mlos", { nights: formatNumber(parseInt(promo.promotionName)) })}`
                                    : promo.promotionType === "early_bird"
                                      ? t("RoomCard.promotions.bookDaysInAdvance", { count: promo.advanceBookingDays })

                                      : t("RoomCard.promotions.specialOffer")}
                                  {promo.validTo && ` · Until ${new Date(promo.validTo).toLocaleDateString()}`}
                                </p>
                              </div>

                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                              <span className="px-1.5 py-0.5 bg-orange-500 text-white text-[9px] font-bold rounded">
                                -{formatNumber(promo.discountValue)}%
                              </span>
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? "border-orange-500 bg-orange-500" : "border-gray-300"}`}>
                                {isSelected && (
                                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {(selectedPromotions[ratePlanCode]?.length ?? 0) > 0 && (
                      <p className="mt-2 text-[10px] text-orange-600 font-medium text-center">
                        ✓ {formatNumber(selectedPromotions[ratePlanCode].length)} {t("RoomCard.offersSelected")}
                      </p>
                    )}
                  </div>
                )}

                {/* Combo Rows */}
                <div className="divide-y divide-gray-100">
                  {combos.map((combo) => {
                    const labelStr = typeof combo.comboLabel === 'string' ? combo.comboLabel : (combo.comboLabel?.label || '');
                    const comboId = typeof combo.comboLabel === 'string' ? combo.comboLabel : (combo.comboLabel?.id || labelStr);
                    const match = labelStr.match(/\((.+)\)$/);
                    const rawLabel = match ? match[1] : labelStr;
                    const isOnlyRoomOnly = combos.length === 1 && rawLabel === "Room Only";

                    const translatedLabel = typeof combo.comboLabel === 'object' && combo.comboLabel !== null && combo.comboLabel.id === "room_only" ? t("Rooms.roomOnly") : combo.comboLabel?._translations ? combo.comboLabel?._translations.name : combo.comboLabel.label;

                    const subLabel = translatedLabel
                      ? translatedLabel
                      : isOnlyRoomOnly
                        ? combo.ratePlanName
                        : rawLabel === "Room Only"
                          ? "Room Only"
                          : rawLabel.startsWith("+")
                            ? rawLabel.split("+").filter(Boolean).map((s) => s.trim()).join(" & ")
                            : rawLabel;

                    const comboBase = combo.totalAmount ?? 0;
                    const includedAddonsTotal = combo.addons?.reduce((sum, a) => sum + (a.price ?? 0), 0) ?? 0;
                    const roomOnlyPrice = comboBase - includedAddonsTotal;

                    const loyaltyDiscountOnRoom = loyaltyDiscountInfo
                      ? loyaltyDiscountInfo.type === "percentage"
                        ? (roomOnlyPrice * loyaltyDiscountInfo.value) / 100
                        : loyaltyDiscountInfo.value
                      : getLoyaltyDiscountAmount(roomOnlyPrice);

                    const comboAfterLoyalty = comboBase - loyaltyDiscountOnRoom;
                    const listPrice =
                      comboBase +
                      (combo.appliedDiscounts?.reduce((sum, d) => sum + (d.calculatedDiscountAmount ?? 0), 0) ?? 0);

                    // Whichever price is "live" right now, based on the loyalty toggle.
                    const displayedPrice = loyaltyToggleOn ? comboAfterLoyalty : comboBase;
                    const showStrike = listPrice - displayedPrice > 0.01;
                    const discountPercent = showStrike ? ((listPrice - displayedPrice) / listPrice) * 100 : 0;

                    const isComboExpanded = expandedCombo === `${ratePlanCode}-${comboId}`;
                    const loadingKey = `${ratePlanCode}-${comboId}`;

                    return (
                      <div key={comboId}>
                        <div className="flex items-center justify-between sm:px-4 p-2 hover:bg-gray-50 transition-colors">
                          <button
                            onClick={() => setExpandedCombo(isComboExpanded ? null : `${ratePlanCode}-${comboId}`)}
                            className="flex items-center gap-1 text-xs sm:text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors"
                          >
                            {isComboExpanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                            {subLabel}
                          </button>

                          <div className="flex items-center gap-2 sm:gap-3">
                            {loyalty && loyaltyDiscountAmount > 0 && !loyaltyToggleOn && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setLoyaltyToggle(!loyaltyToggleOn) }}
                                className="flex items-center gap-1.5 border border-dashed border-gray-300 rounded-lg px-2 py-1 hover:border-blue-400 transition-all group"
                              >
                                <Lock size={12} className="text-gray-400 group-hover:text-blue-500" />
                                <div className="flex flex-col items-start leading-tight">
                                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                                    {t("RoomCard.unlock")}
                                  </span>
                                  <span className="text-xs font-bold text-gray-700">
                                    {currencies.find((c: Currency) => c.code === currency)?.symbol} {formatNumber(Number(comboAfterLoyalty.toFixed(2)))}
                                  </span>
                                </div>
                              </button>
                            )}

                            <div className="text-right">
                              {showStrike && (
                                <div className="flex items-center gap-1 justify-end">
                                  <span className="text-[9px] sm:text-[10px] text-gray-400 line-through">
                                    {currencies.find((c: Currency) => c.code === currency)?.symbol} {formatNumber(Number(listPrice.toFixed(2)))}
                                  </span>
                                  <span className="text-[9px] sm:text-[10px] font-bold text-red-500">
                                    -{formatNumber(Number(discountPercent.toFixed(1)))}%
                                  </span>
                                </div>
                              )}
                              <span className="text-sm sm:text-base font-bold text-gray-900">
                                {currencies.find((c: Currency) => c.code === currency)?.symbol}{" "}
                                {formatNumber(Number(displayedPrice.toFixed(2)))}
                              </span>
                            </div>

                            <button
                              onClick={() => handleAddClick(combo, loadingKey)}
                              disabled={isLoadingForRatePlan(loadingKey)}
                              style={{ backgroundColor: primaryColor ?? "#777", color: buttonTextColor ?? "#fff" }}
                              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-[10px] sm:text-xs uppercase transition-all disabled:opacity-50 hover:opacity-90 hover:scale-105 active:scale-95 whitespace-nowrap shadow-sm"
                            >
                              {isLoadingForRatePlan(loadingKey) ? (
                                <div className="flex items-center gap-1.5">
                                  <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                  <span>{t("RoomCard.loading")}</span>
                                </div>
                              ) : t("RoomCard.add")}
                            </button>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isComboExpanded && (
                          <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100">
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">{t("RoomCard.basePrice")}:</span>
                                <span className="text-xs font-bold text-gray-800">
                                  {currencies.find((c: Currency) => c.code === currency)?.symbol}{" "}
                                  {formatNumber(Number((
                                    combo.totalAmount +
                                    (combo.appliedDiscounts?.reduce((sum, d) => sum + d.calculatedDiscountAmount, 0) ?? 0) -
                                    (combo.addons?.reduce((sum, a) => sum + a.price, 0) ?? 0)
                                  ).toFixed(2)))}
                                </span>
                              </div>

                              {((combo.appliedDiscounts?.length ?? 0) > 0 || (combo.addons?.filter((a) => a.price > 0).length ?? 0) > 0) && (
                                <span className="text-gray-300 text-xs">|</span>
                              )}

                              {combo.appliedDiscounts?.map((discount) => (
                                <div key={discount.id} className="flex items-center gap-1">
                                  <span className="text-[10px] text-green-700 truncate max-w-[120px]">
                                    {discount.promotionType === "mlos" ? `${t("RoomCard.mlos", { nights: formatNumber(parseInt(discount.promotionName)) })}` : discount?._translations ? discount._translations.promotionName : discount.promotionName}
                                  </span>
                                  <span className="text-[10px] font-bold text-green-600 whitespace-nowrap">
                                    -{currency} {formatNumber(Number(discount.calculatedDiscountAmount.toFixed(2)))}
                                  </span>
                                </div>
                              ))}

                              {combo.addons?.filter((a) => a.price > 0).map((addon) => (
                                <div key={addon.id} className="flex items-center gap-1">
                                  <span className="text-[10px] text-orange-700 truncate max-w-[120px]">🍽 {addon.name}</span>
                                  <span className="text-[10px] font-bold text-orange-600 whitespace-nowrap">+{currency} {formatNumber(Number(addon.price.toFixed(2)))}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Tourist Tax Footer */}
                {(firstCombo.touristTax?.calculatedTaxAmount ?? 0) > 0 && (
                  <div className="px-4 py-2 border-t border-amber-100 bg-amber-50 flex items-center justify-center gap-1.5">
                    <span className="text-amber-400 text-xs">ℹ️</span>
                    <p className="text-[11px] text-amber-800 text-center">
                      <span className="font-semibold">{firstCombo.touristTax?._translations ? firstCombo.touristTax?._translations.name : firstCombo.touristTax?.name ?? t("RoomCard.taxNotIncluded")}</span>
                      {" "}{t("Rooms.of")}{" "}
                      <span className="font-semibold">{currencies.find((c: Currency) => c.code === firstCombo.currencyCode)?.symbol}{" "}{formatNumber(Number((firstCombo.touristTax?.calculatedTaxAmount ?? 0).toFixed(2)))}</span>
                      {" "}{t("Rooms.is")}{" "}
                      <span className="font-semibold text-amber-900">{t("RoomCard.touristTax.notIncluded")}</span>
                      {" "}{t("RoomCard.touristTax.paidAtHotel")}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* Room Details Modal */}
      {showDetailsModal && selectedRatePlanForDetails && (
        <RoomDetails
          room={room}
          selectedRatePlan={selectedRatePlanForDetails}
          onClose={() => { setShowDetailsModal(false); setSelectedRatePlanForDetails(null); }}
        />
      )}
    </div>
  );
};

export default RoomCard;