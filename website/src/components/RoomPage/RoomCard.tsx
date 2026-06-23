"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Ruler, Eye, Wifi, Coffee, Tv, Wind,
  Phone, Utensils, ChevronDown, ChevronLeft,
  ChevronRight, Lock, FileText, Tag,
} from "lucide-react";
import RoomDetails from "./RoomDetails";
import { CustomDlApllied, IRoom } from "@/src/app/(unauth)/Rooms/types";
import { useBookingStorage } from "../../hooks/useBookingStorage";
import {
  IPropertyLoyalityWithLoyality,
  IRoomDetails,
} from "@/src/app/(unauth)/Rooms/interface";
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

// ─── Prop interfaces ──────────────────────────────────────────────────────────
interface RoomCardProps {
  room: IRoomDetails;
  propertyDetails: unknown;
  bookingContext: IBookingContext;
  onSelectRatePlan: (
    room: IRoom,
    ratePlan: IRoomPrice,
    selectedPromotions: ISelectedPromotion[],
    customizableDealsApplied:CustomDlApllied
  ) => void;
  selectedBoardType?: string;
  loyalty: IPropertyLoyalityWithLoyality | null;
  loyaltyDiscountInfo?: ILoyaltyDiscountInfo | null;
  loyaltyToggleOn: boolean;
  setLoyaltyToggle: (value: boolean) => void;
  /** Set by parent while fetching – only that Add button shows a spinner */
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

// ─── Amenity icon map ─────────────────────────────────────────────────────────
const AMENITY_ICONS: Record<string, React.ReactNode> = {
  wifiInternet: <Wifi size={12} />,
  telephone: <Phone size={12} />,
  television: <Tv size={12} />,
  airConditioning: <Wind size={12} />,
  coffeeMaker: <Coffee size={12} />,
  microwave: <Utensils size={12} />,
};

const AmenityIcon = ({ amenityKey }: { amenityKey: string }) => (
  <>{AMENITY_ICONS[amenityKey] ?? null}</>
);

interface IAmenityObject {
  id: string;
  amenityName: string;
  _translations?: { amenityName?: string };
}

const getActiveAmenities = (
  amenities: IAmenityObject[] | Record<string, unknown> | null
): IAmenityObject[] => {
  if (Array.isArray(amenities)) return amenities.slice(0, 6);
  return [];
};

// ─── Shared animation variants ────────────────────────────────────────────────
const accordionVariants = {
  closed: { height: 0, opacity: 0 },
  open: { height: "auto", opacity: 1 },
};
const accordionTransition = { duration: 0.22, ease: "easeInOut" as const };

// ─── Component ────────────────────────────────────────────────────────────────
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

  // ── Media state ─────────────────────────────────────────────────────────────
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const hasVideo = !!room?.roomVideos?.url;
  const images = room.images?.length
    ? room.images
    : ["https://via.placeholder.com/600x400?text=No+Image+Available"];
  const totalMediaCount = images.length + (hasVideo ? 1 : 0);

  const prevImage = () => {
    if (showVideo) {
      setShowVideo(false);
      setCurrentImageIndex(images.length - 1);
    } else if (currentImageIndex === 0) {
      if (hasVideo) setShowVideo(true);
      else setCurrentImageIndex(images.length - 1);
    } else {
      setCurrentImageIndex((p) => p - 1);
    }
  };

  const nextImage = () => {
    if (showVideo) {
      setShowVideo(false);
      setCurrentImageIndex(0);
    } else if (currentImageIndex === images.length - 1) {
      if (hasVideo) setShowVideo(true);
      else setCurrentImageIndex(0);
    } else {
      setCurrentImageIndex((p) => p + 1);
    }
  };

  // ── Colors ──────────────────────────────────────────────────────────────────
  const { colors } = useBookingStorage(bookingContext);
  const { primaryColor, buttonTextColor } = colors;

  // ── Rate plan / combo state ──────────────────────────────────────────────────
  const [expandedCombo, setExpandedCombo] = useState<string | null>(null);
  const [expandedPromotions, setExpandedPromotions] = useState<string | null>(null);
  const [selectedPromotions, setSelectedPromotions] = useState<
    Record<string, ISelectedPromotion[]>
  >({});
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRatePlanForDetails, setSelectedRatePlanForDetails] =
    useState<IRoomPrice | null>(null);

  const handleAddClick = (combo: IRoomPrice, ratePlanKey: string) => {
    const selectedPromotionsList = selectedPromotions[combo.ratePlanCode] ?? [];
    onSelectRatePlan(
      {
        id: room.id,
        roomName: room.roomName,
        roomType: room.roomType,
        roomSize: room.roomSize,
        roomUnit: room.roomUnit,
        priority: room.priority,
        numberOfBedrooms: room.numberOfBedrooms,
        maxOccupancy: room.maxOccupancy,
        images: room.images,
        description: room.description,
        hasValidRate: room.hasValidRate,
        roomView: room.roomView,
      },
      combo,
      selectedPromotionsList,
      {
        isApplied:combo.comboLabel?.isCustomizableDeal,
        customizableDealId:combo.comboLabel?.customizableDealId,
      }
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

  const getLoyaltyDiscountAmount = (basePrice: number): number => {
    if (!loyaltyDiscount) return 0;
    if (loyalty?.discountPercentage != null)
      return (basePrice * loyalty.discountPercentage) / 100;
    if (loyaltyDiscount.loyaltyDiscountType === "percentage")
      return (basePrice * loyaltyDiscount.discountValue) / 100;
    if (loyaltyDiscount.loyaltyDiscountType === "flat")
      return loyaltyDiscount.discountValue;
    return 0;
  };

  // Key for image crossfade
  const mediaKey = showVideo ? "video" : `img-${currentImageIndex}`;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">

      {/* ── Room Header Card ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex flex-col md:flex-row">

          {/* Media carousel */}
          <div className="md:w-2/5 lg:w-1/3 relative overflow-hidden bg-gray-100 flex-shrink-0">
            <div className="relative w-full h-52 md:h-full min-h-[208px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={mediaKey}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.28 }}
                  className="absolute inset-0"
                >
                  {showVideo ? (
                    <video
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                      poster={room.roomVideos?.thumbnail}
                    >
                      <source src={room.roomVideos?.url} type="video/mp4" />
                    </video>
                  ) : (
                    <img
                      src={images[currentImageIndex]}
                      alt={room._translations?.roomName ?? room.roomName}
                      className="w-full h-full object-cover"
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Nav arrows */}
              {totalMediaCount > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/25 hover:bg-black/45 backdrop-blur-sm text-white rounded-full p-1.5 transition-all"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/25 hover:bg-black/45 backdrop-blur-sm text-white rounded-full p-1.5 transition-all"
                  >
                    <ChevronRight size={15} />
                  </button>

                  {/* Pill dots */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setShowVideo(false);
                          setCurrentImageIndex(idx);
                        }}
                        className={`h-1.5 rounded-full transition-all duration-300 ${!showVideo && currentImageIndex === idx
                          ? "w-4 bg-white"
                          : "w-1.5 bg-white/50 hover:bg-white/75"
                          }`}
                      />
                    ))}
                    {hasVideo && (
                      <button
                        onClick={() => setShowVideo(true)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${showVideo
                          ? "w-4 bg-white"
                          : "w-1.5 bg-white/50 hover:bg-white/75"
                          }`}
                      />
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Room info */}
          <div className="flex-1 p-5 flex flex-col justify-between gap-3">
            <div className="space-y-2">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight leading-snug">
                {room._translations?.roomName ?? room.roomName}
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                {room._translations?.description ?? room.description}
              </p>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-x-5 gap-y-1.5">
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Users size={14} className="text-gray-400" />
                <span>
                  {formatNumber(room.maxOccupancy)}{" "}
                  {t("RoomCard.guests", { defaultValue: "Guests" })}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Ruler size={14} className="text-gray-400" />
                <span>
                  {formatNumber(room.roomSize)}{" "}
                  {room.roomUnit
                    ? t(`Rooms.${room.roomUnit.toLowerCase()}`, {
                      defaultValue: room.roomUnit,
                    })
                    : ""}
                </span>
              </div>
              {room.roomView && (
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <Eye size={14} className="text-gray-400" />
                  <span>
                    {room.roomView._translations?.viewName ??
                      room.roomView.MasterRoomView.viewName}
                  </span>
                </div>
              )}
              {room.numberOfBedrooms > 0 && (
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <Eye size={14} className="text-gray-400" />
                  <span>
                    {formatNumber(room.numberOfBedrooms)}{" "}
                    {t("RoomDetails.bedrooms", { defaultValue: "Bedrooms" })}
                  </span>
                </div>
              )}
            </div>

            {/* Amenity chips */}
            {activeAmenities.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {activeAmenities.map((amenity) => (
                  <div
                    key={amenity.id}
                    className="flex items-center gap-1 text-[11px] text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full"
                  >
                    <AmenityIcon amenityKey={amenity.amenityName} />
                    <span>
                      {amenity._translations?.amenityName ?? amenity.amenityName}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Rate Plan Cards ───────────────────────────────────────────────────── */}
      <div className="space-y-2.5">
        {Object.entries(groupedRatePlans)
          .filter(([, combos]) => {
            if (!selectedBoardType || selectedBoardType === "all") return true;
            return combos[0].ratePlanName === selectedBoardType;
          })
          .map(([ratePlanCode, combos], planIdx) => {
            const firstCombo = combos[0];
            const currency = firstCombo.currencyCode ?? "USD";
            const currencySymbol =
              currencies.find((c: Currency) => c.code === currency)?.symbol ??
              currency;
            const basePrice = firstCombo.totalAmount ?? 0;
            const loyaltyDiscountAmount = getLoyaltyDiscountAmount(basePrice);
            const hasPromotions =
              (firstCombo.availablePromotions?.length ?? 0) > 0;
            const hasTax =
              (firstCombo.touristTax?.calculatedTaxAmount ?? 0) > 0;
            const isPromoExpanded = expandedPromotions === ratePlanCode;
            const showRatePlanLabel =
              firstCombo.comboLabel.label !== firstCombo.ratePlanName;

            return (
              <motion.div
                key={ratePlanCode}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.22,
                  delay: planIdx * 0.07,
                  ease: "easeOut",
                }}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
              >
                {/* Card header */}
                <div
                  className={`flex items-center justify-between px-4 py-3 ${showRatePlanLabel ? "border-b border-gray-50" : ""
                    }`}
                >
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    {showRatePlanLabel && (
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {firstCombo._translations?.ratePlanName ??
                          firstCombo.ratePlanName}
                      </span>
                    )}
                    {(selectedPromotions[ratePlanCode]?.length ?? 0) > 0 && (
                      <span className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-600 text-[9px] font-bold rounded uppercase tracking-wide">
                        {t("RoomCard.promotionalRate")}
                      </span>
                    )}
                    {hasTax && (
                      <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-600 text-[9px] font-semibold px-2 py-0.5 rounded-full">
                        <span className="w-1 h-1 rounded-full bg-amber-500" />
                        {t("RoomCard.taxNotIncluded")}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                    {/* Booking conditions */}
                    <button
                      onClick={() => {
                        setSelectedRatePlanForDetails(firstCombo);
                        setShowDetailsModal(true);
                      }}
                      className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 font-medium transition-colors whitespace-nowrap"
                    >
                      <FileText size={11} />
                      <span>{t("RoomCard.bookingConditions")}</span>
                    </button>

                    {/* Promotions toggle */}
                    {hasPromotions && (
                      <button
                        onClick={() =>
                          setExpandedPromotions(
                            isPromoExpanded ? null : ratePlanCode
                          )
                        }
                        className="flex items-center gap-1 text-[11px] font-semibold transition-colors whitespace-nowrap"
                        style={{ color: primaryColor ?? "#f97316" }}
                      >
                        <Tag size={11} />
                        <span>
                          {(selectedPromotions[ratePlanCode]?.length ?? 0) > 0
                            ? `${formatNumber(
                              selectedPromotions[ratePlanCode].length
                            )} ${t("RoomCard.offersApplied")}`
                            : `${formatNumber(
                              firstCombo.availablePromotions.length
                            )} ${t("RoomCard.specialOfferAvailable")}`}
                        </span>
                        <motion.span
                          animate={{ rotate: isPromoExpanded ? 180 : 0 }}
                          transition={{ duration: 0.18 }}
                          className="flex items-center"
                        >
                          <ChevronDown size={11} />
                        </motion.span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Promotions accordion */}
                <AnimatePresence initial={false}>
                  {isPromoExpanded && hasPromotions && (
                    <motion.div
                      initial="closed"
                      animate="open"
                      exit="closed"
                      variants={accordionVariants}
                      transition={accordionTransition}
                      style={{ overflow: "hidden" }}
                    >
                      <div className="px-4 py-3 bg-orange-50/50 border-y border-orange-100">
                        <p className="text-[9px] font-bold text-orange-800 uppercase tracking-widest mb-2">
                          🏷 {t("RoomCard.specialOffersAvailable")}
                        </p>
                        <div className="flex flex-col gap-1.5">
                          {firstCombo.availablePromotions.map((promo) => {
                            const isSelected = selectedPromotions[
                              ratePlanCode
                            ]?.some((p) => p.id === promo.id);
                            return (
                              <div
                                key={promo.id}
                                onClick={() => {
                                  setSelectedPromotions((prev) => {
                                    const current =
                                      prev[ratePlanCode] ?? [];
                                    const already = current.some(
                                      (p) => p.id === promo.id
                                    );
                                    return {
                                      ...prev,
                                      [ratePlanCode]: already
                                        ? current.filter(
                                          (p) => p.id !== promo.id
                                        )
                                        : [
                                          ...current,
                                          {
                                            id: promo.id,
                                            promotionType:
                                              promo.promotionType,
                                            promotionName:
                                              promo.promotionName,
                                            discountValue:
                                              promo.discountValue,
                                            discountType:
                                              promo.discountType,
                                          },
                                        ],
                                    };
                                  });
                                }}
                                className={`flex items-center justify-between px-3 py-2 rounded-lg border cursor-pointer transition-all ${isSelected
                                  ? "border-orange-400 bg-orange-100/60"
                                  : "border-orange-200/70 bg-white hover:border-orange-300"
                                  }`}
                              >
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-orange-900 truncate">
                                    {promo.promotionType === "mlos"
                                      ? t("RoomCard.mlos", {
                                        nights: formatNumber(
                                          parseInt(promo.promotionName)
                                        ),
                                      })
                                      : promo._translations?.promotionName ??
                                      promo.promotionName}
                                  </p>
                                  <p className="text-[10px] text-orange-400 mt-0.5">
                                    {promo.promotionType === "mlos"
                                      ? t("RoomCard.mlos", {
                                        nights: formatNumber(
                                          parseInt(promo.promotionName)
                                        ),
                                      })
                                      : promo.promotionType === "early_bird"
                                        ? t(
                                          "RoomCard.promotions.bookDaysInAdvance",
                                          {
                                            count: promo.advanceBookingDays,
                                          }
                                        )
                                        : t("RoomCard.promotions.specialOffer")}
                                    {promo.validTo &&
                                      ` · Until ${new Date(
                                        promo.validTo
                                      ).toLocaleDateString()}`}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                                  <span className="px-1.5 py-0.5 bg-orange-500 text-white text-[9px] font-bold rounded">
                                    -{formatNumber(promo.discountValue)}%
                                  </span>
                                  <div
                                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                                      ? "border-orange-500 bg-orange-500"
                                      : "border-gray-300"
                                      }`}
                                  >
                                    {isSelected && (
                                      <svg
                                        className="w-2.5 h-2.5 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={3}
                                          d="M5 13l4 4L19 7"
                                        />
                                      </svg>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {(selectedPromotions[ratePlanCode]?.length ?? 0) >
                          0 && (
                            <p className="mt-2 text-[10px] text-orange-600 font-medium text-center">
                              ✓{" "}
                              {formatNumber(
                                selectedPromotions[ratePlanCode].length
                              )}{" "}
                              {t("RoomCard.offersSelected")}
                            </p>
                          )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Combo rows */}
                <div className="divide-y divide-gray-50">
                  {combos.map((combo) => {
                    const labelStr =
                      typeof combo.comboLabel === "string"
                        ? combo.comboLabel
                        : combo.comboLabel?.label ?? "";
                    const comboId =
                      typeof combo.comboLabel === "string"
                        ? combo.comboLabel
                        : combo.comboLabel?.id ?? labelStr;
                    const match = labelStr.match(/\((.+)\)$/);
                    const rawLabel = match ? match[1] : labelStr;
                    const isOnlyRoomOnly =
                      combos.length === 1 && rawLabel === "Room Only";

                    const translatedLabel =
                      typeof combo.comboLabel === "object" &&
                        combo.comboLabel !== null &&
                        combo.comboLabel.id === "room_only"
                        ? t("Rooms.roomOnly")
                        : combo.comboLabel?._translations?.name ??
                        combo.comboLabel?.label;

                    const subLabel = translatedLabel
                      ? translatedLabel
                      : isOnlyRoomOnly
                        ? combo.ratePlanName
                        : rawLabel === "Room Only"
                          ? "Room Only"
                          : rawLabel.startsWith("+")
                            ? rawLabel
                              .split("+")
                              .filter(Boolean)
                              .map((s) => s.trim())
                              .join(" & ")
                            : rawLabel;

                    const comboBase = combo.totalAmount ?? 0;
                    const includedAddonsTotal =
                      combo.addons?.reduce(
                        (sum, a) => sum + (a.price ?? 0),
                        0
                      ) ?? 0;
                    const roomOnlyPrice = comboBase - includedAddonsTotal;

                    const loyaltyDiscountOnRoom = loyaltyDiscountInfo
                      ? loyaltyDiscountInfo.type === "percentage"
                        ? (roomOnlyPrice * loyaltyDiscountInfo.value) / 100
                        : loyaltyDiscountInfo.value
                      : getLoyaltyDiscountAmount(roomOnlyPrice);

                    const comboAfterLoyalty =
                      comboBase - loyaltyDiscountOnRoom;
                    const listPrice =
                      comboBase +
                      (combo.appliedDiscounts?.reduce(
                        (sum, d) => sum + (d.calculatedDiscountAmount ?? 0),
                        0
                      ) ?? 0);

                    const displayedPrice = loyaltyToggleOn
                      ? comboAfterLoyalty
                      : comboBase;
                    const showStrike = listPrice - displayedPrice > 0.01;
                    const discountPercent = showStrike
                      ? ((listPrice - displayedPrice) / listPrice) * 100
                      : 0;

                    const isComboExpanded =
                      expandedCombo === `${ratePlanCode}-${comboId}`;
                    const loadingKey = `${ratePlanCode}-${comboId}`;

                    return (
                      <div key={comboId}>
                        {/* Combo row */}
                        <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50/60 transition-colors">
                          {/* Label */}
                          <button
                            onClick={() =>
                              setExpandedCombo(
                                isComboExpanded
                                  ? null
                                  : `${ratePlanCode}-${comboId}`
                              )
                            }
                            className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors min-w-0 text-left"
                          >
                            <motion.span
                              animate={{ rotate: isComboExpanded ? 180 : 0 }}
                              transition={{ duration: 0.18 }}
                              className="flex-shrink-0 text-gray-300"
                            >
                              <ChevronDown size={14} />
                            </motion.span>
                            <span className="truncate">{subLabel}</span>
                          </button>

                          {/* Price + actions */}
                          <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                            {/* Loyalty unlock */}
                            {loyalty &&
                              loyaltyDiscountAmount > 0 &&
                              !loyaltyToggleOn && (
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setLoyaltyToggle(!loyaltyToggleOn);
                                  }}
                                  className="flex items-center gap-1.5 border border-dashed border-gray-200 hover:border-blue-300 rounded-lg px-2.5 py-1.5 transition-colors group"
                                >
                                  <Lock
                                    size={11}
                                    className="text-gray-300 group-hover:text-blue-400 transition-colors"
                                  />
                                  <div className="flex flex-col items-start leading-none gap-0.5">
                                    <span className="text-[8px] font-bold text-gray-300 group-hover:text-blue-400 uppercase tracking-widest transition-colors">
                                      {t("RoomCard.unlock")}
                                    </span>
                                    <span className="text-xs font-bold text-gray-700">
                                      {currencySymbol}{" "}
                                      {formatNumber(
                                        Number(comboAfterLoyalty.toFixed(2))
                                      )}
                                    </span>
                                  </div>
                                </motion.button>
                              )}

                            {/* Price block */}
                            <div className="text-right">
                              {showStrike && (
                                <div className="flex items-center justify-end gap-1 mb-0.5">
                                  <span className="text-[10px] text-gray-300 line-through">
                                    {currencySymbol}{" "}
                                    {formatNumber(Number(listPrice.toFixed(2)))}
                                  </span>
                                  <span className="text-[9px] font-bold text-red-400">
                                    -
                                    {formatNumber(
                                      Number(discountPercent.toFixed(1))
                                    )}
                                    %
                                  </span>
                                </div>
                              )}
                              <span className="text-base font-bold text-gray-900 tabular-nums">
                                {currencySymbol}{" "}
                                {formatNumber(
                                  Number(displayedPrice.toFixed(2))
                                )}
                              </span>
                            </div>

                            {/* Add button */}
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => handleAddClick(combo, loadingKey)}
                              disabled={isLoadingForRatePlan(loadingKey)}
                              style={{
                                backgroundColor: primaryColor ?? "#777",
                                color: buttonTextColor ?? "#fff",
                              }}
                              className="px-4 py-2 rounded-lg font-bold text-[11px] uppercase tracking-wide transition-opacity disabled:opacity-50 shadow-sm whitespace-nowrap"
                            >
                              {isLoadingForRatePlan(loadingKey) ? (
                                <div className="flex items-center gap-1.5">
                                  <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                  <span>{t("RoomCard.loading")}</span>
                                </div>
                              ) : (
                                t("RoomCard.add")
                              )}
                            </motion.button>
                          </div>
                        </div>

                        {/* Expanded combo breakdown */}
                        <AnimatePresence initial={false}>
                          {isComboExpanded && (
                            <motion.div
                              initial="closed"
                              animate="open"
                              exit="closed"
                              variants={accordionVariants}
                              transition={accordionTransition}
                              style={{ overflow: "hidden" }}
                            >
                              <div className="px-4 py-2.5 bg-gray-50/40 border-t border-gray-100">
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                                  {/* Base price */}
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[9px] text-gray-400 uppercase font-semibold tracking-widest">
                                      {t("RoomCard.basePrice")}:
                                    </span>
                                    <span className="text-xs font-bold text-gray-700 tabular-nums">
                                      {currencySymbol}{" "}
                                      {formatNumber(
                                        Number(
                                          (
                                            combo.totalAmount +
                                            (combo.appliedDiscounts?.reduce(
                                              (sum, d) =>
                                                sum +
                                                d.calculatedDiscountAmount,
                                              0
                                            ) ?? 0) -
                                            (combo.addons?.reduce(
                                              (sum, a) => sum + a.price,
                                              0
                                            ) ?? 0)
                                          ).toFixed(2)
                                        )
                                      )}
                                    </span>
                                  </div>

                                  {((combo.appliedDiscounts?.length ?? 0) >
                                    0 ||
                                    (combo.addons?.filter((a) => a.price > 0)
                                      .length ?? 0) > 0) && (
                                      <span className="text-gray-200 text-xs select-none">
                                        |
                                      </span>
                                    )}

                                  {combo.appliedDiscounts?.map((discount) => (
                                    <div
                                      key={discount.id}
                                      className="flex items-center gap-1"
                                    >
                                      <span className="text-[10px] text-emerald-600 truncate max-w-[120px]">
                                        {discount.promotionType === "mlos"
                                          ? t("RoomCard.mlos", {
                                            nights: formatNumber(
                                              parseInt(
                                                discount.promotionName
                                              )
                                            ),
                                          })
                                          : discount._translations
                                            ?.promotionName ??
                                          discount.promotionName}
                                      </span>
                                      <span className="text-[10px] font-bold text-emerald-500 whitespace-nowrap tabular-nums">
                                        {formatNumber(
                                          Number(
                                            discount.calculatedDiscountAmount.toFixed(
                                              2
                                            )
                                          )
                                        )}
                                        -{currency}
                                      </span>
                                    </div>
                                  ))}

                                  {combo.addons
                                    ?.filter((a) => a.price > 0)
                                    .map((addon) => (
                                      <div
                                        key={addon.id}
                                        className="flex items-center gap-1"
                                      >
                                        <span className="text-[10px] text-orange-600 truncate max-w-[120px]">
                                          + {addon._translations ? addon._translations.name : addon.name}
                                        </span>
                                        <span className="text-[10px] font-bold text-orange-500 whitespace-nowrap tabular-nums">
                                          {formatNumber(
                                            Number(addon.price.toFixed(2))
                                          )}
                                          <span className="ml-1">

                                            {currencies.find(
                                              (c: Currency) =>
                                                c.code === currency
                                            )?.symbol}
                                          </span>
                                        </span>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

                {/* Tourist tax footer */}
                {hasTax && (
                  <div className="px-4 py-2 border-t border-amber-100 bg-amber-50/40 flex items-center justify-center gap-1.5">
                    <span className="text-[11px] text-amber-400 select-none">
                      ℹ️
                    </span>
                    <p className="text-[11px] text-amber-700 text-center">
                      <span className="font-semibold">
                        {firstCombo.touristTax?._translations?.name ??
                          firstCombo.touristTax?.name ??
                          t("RoomCard.taxNotIncluded")}
                      </span>{" "}
                      {t("Rooms.of")}{" "}
                      <span className="font-semibold tabular-nums">
                        {currencies.find(
                          (c: Currency) =>
                            c.code === firstCombo.currencyCode
                        )?.symbol}{" "}
                        {formatNumber(
                          Number(
                            (
                              firstCombo.touristTax?.calculatedTaxAmount ?? 0
                            ).toFixed(2)
                          )
                        )}
                      </span>{" "}
                      {t("Rooms.is")}{" "}
                      <span className="font-semibold text-amber-800">
                        {t("RoomCard.touristTax.notIncluded")}
                      </span>{" "}
                      {t("RoomCard.touristTax.paidAtHotel")}
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
      </div>

      {/* Room Details Modal */}
      {showDetailsModal && selectedRatePlanForDetails && (
        <RoomDetails
          room={room}
          selectedRatePlan={selectedRatePlanForDetails}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedRatePlanForDetails(null);
          }}
        />
      )}
    </div>
  );
};

export default RoomCard;