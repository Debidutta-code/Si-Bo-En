import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  Ruler,
  Eye,
  Wifi,
  Coffee,
  Tv,
  Wind,
  Phone,
  Utensils,
  ChevronRight,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
} from "lucide-react";
import RoomDetails from "./RoomDetails";
import AddonSelectionModal from "./AddonSelectionModal";
import { Room } from "../../store/roomsSlice";
import { useBookingStorage } from "../../hooks/useBookingStorage";
import toast from "react-hot-toast";
import { IPropertyLoyalityWithLoyality } from "@/src/app/(unauth)/Rooms/interface";
import { useTranslation } from "react-i18next";

interface RoomCardProps {
  room: Room;
  propertyDetails: any;
  addons: any[];
  bookingContext: any;
  onBookNow: (
    room: Room,
    ratePlan: any,
    selectedAddons: any[],
    selectedPromotion: any,
    priceData: any,
  ) => void;
  loadingBookNow: string | null;
  onPriceUpdate?: (data: {
    room: Room;
    ratePlan: any;
    selectedAddons: any[];
    basePrice: number;
    totalAddonsPrice: number;
    finalprice: any;
  }) => void;
  activeRatePlan?: string | null;
  selectedBoardType?: string;
  loyaltyMemberEmail?: string;
  loyalty: IPropertyLoyalityWithLoyality | null;
  onUnlockLoyalty?: () => void;
  loyaltyDiscountInfo?: { type: string; value: number; currencyCode: string } | null;

}

// Helper to get dates between check-in and check-out (excluding checkout date)
const getDatesBetween = (startDate: string, endDate: string) => {
  const dates = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  while (start < end) {
    dates.push(new Date(start).toISOString().split("T")[0]);
    start.setDate(start.getDate() + 1);
  }

  return dates;
};

// Amenity icon mapper
const AmenityIcon = ({ amenityKey }: { amenityKey: string }) => {
  const icons: Record<string, any> = {
    wifiInternet: <Wifi size={16} />,
    telephone: <Phone size={16} />,
    television: <Tv size={16} />,
    airConditioning: <Wind size={16} />,
    coffeeMaker: <Coffee size={16} />,
    microwave: <Utensils size={16} />,
  };

  return icons[amenityKey] || null;
};

// Get active amenities (show first 6)
const getActiveAmenities = (amenities: any) => {
  const active = [] as any;
  if (Array.isArray(amenities)) {
    return amenities.slice(0, 6);
  }
  if (!amenities?.amenities) return active;

  for (const category of Object.values(amenities.amenities)) {
    if (typeof category === "object") {
      for (const [key, value] of Object.entries(category as any)) {
        if (value === true) active.push(key);
      }
    }
  }

  return active.slice(0, 6);
};

// Format amenity name
const formatAmenityName = (key: string) => {
  return key
    .replace(/([A-Z])/g, " $1")
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const RoomCard: React.FC<RoomCardProps> = ({
  room,
  propertyDetails,
  addons,
  bookingContext,
  onBookNow,
  loadingBookNow,
  onPriceUpdate,
  activeRatePlan,
  selectedBoardType,
  loyaltyMemberEmail,
  loyalty,
  onUnlockLoyalty,
  loyaltyDiscountInfo,
}) => {
  const { t } = useTranslation();
  // const { currency: selectedCurrency } = useSelector((state: RootState) => state.booking);
  const [loadingPriceFor, setLoadingPriceFor] = useState<string | null>(null);

  // Get loyalty program info from loyalty prop (passed from parent) or bookingContext
  const loyaltyProgram = loyalty; // ← use the loyalty prop directly
  const loyaltyDiscount = loyalty?.CreationLoyaltyConfig;
  const isLoyaltyMember = !!loyaltyMemberEmail;
  const [expandedCombo, setExpandedCombo] = useState<string | null>(null);

  const isLoadingForRatePlan = (comboLabel: string) => {
    return loadingPriceFor === comboLabel;
  };
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const hasVideo = room.roomVideos?.url;
  const images = room.images?.length
    ? room.images
    : ["https://via.placeholder.com/600x400?text=No+Image+Available"];
  const totalMediaCount = images.length + (hasVideo ? 1 : 0);

  const prevImage = () => {
    if (showVideo) {
      // If showing video, go back to last image
      setShowVideo(false);
      setCurrentImageIndex(images.length - 1);
    } else if (currentImageIndex === 0) {
      // If at first image, loop to video (if exists) or last image
      if (hasVideo) {
        setShowVideo(true);
      } else {
        setCurrentImageIndex(images.length - 1);
      }
    } else {
      // Go to previous image
      setCurrentImageIndex((prev) => prev - 1);
    }
  };

  const nextImage = () => {
    if (showVideo) {
      // If showing video, loop back to first image
      setShowVideo(false);
      setCurrentImageIndex(0);
    } else if (currentImageIndex === images.length - 1) {
      // If at last image
      if (hasVideo) {
        // Show video if available
        setShowVideo(true);
      } else {
        // Otherwise loop back to first image
        setCurrentImageIndex(0);
      }
    } else {
      // Go to next image
      setCurrentImageIndex((prev) => prev + 1);
    }
  };

  // Use the custom hook to get dynamic branding colors
  const { colors } = useBookingStorage(bookingContext);

  const { primaryColor, buttonTextColor } = colors;

  const [expandedRatePlan, setExpandedRatePlan] = useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<Record<string, any>>({});
  const [showAllAddons, setShowAllAddons] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRatePlanForDetails, setSelectedRatePlanForDetails] =
    useState<any>(null);
  const [collapsedRatePlans, setCollapsedRatePlans] = useState<Set<string>>(
    new Set(),
  );
  const [latestPrice, setLatestPrice] = useState<any>(null);

  // New states for addon modal
  const [addonModalOpen, setAddonModalOpen] = useState(false);
  const [fetchedAddons, setFetchedAddons] = useState<any[]>([]);
  const [pendingRatePlan, setPendingRatePlan] = useState<any>(null);
  const [fetchingAddons, setFetchingAddons] = useState(false);
  const [expandedPromotions, setExpandedPromotions] = useState<string | null>(
    null,
  );
  const [selectedPromotions, setSelectedPromotions] = useState<
    Record<string, any[]>
  >({});
  const addonsRef = useRef<HTMLDivElement | null>(null);

  // Update price sidebar whenever addons change
  useEffect(() => {
    if (expandedRatePlan && onPriceUpdate && latestPrice) {
      const currentRatePlan = room.roomPrice.find(
        (rp: any) => rp.ratePlanCode === expandedRatePlan,
      );
      if (currentRatePlan) {
        const basePrice =
          currentRatePlan.baseByGuestAmts?.[0]?.amountBeforeTax || 0;
        const selectedAddonsList = Object.values(selectedAddons);
        const totalAddonsPrice = selectedAddonsList.reduce(
          (sum: number, addon: any) => sum + addon.totalPrice,
          0,
        );

        onPriceUpdate({
          room,
          ratePlan: currentRatePlan,
          selectedAddons: selectedAddonsList,
          basePrice,
          totalAddonsPrice,
          finalprice: latestPrice,
        });
      }
    }
  }, [selectedAddons, expandedRatePlan, latestPrice, onPriceUpdate, room]);
  const getPromotionTypeText = (promotionType: string, promo?: any) => {
    switch (promotionType) {
      case "early_bird":
        return "Early Bird Offer";
      case "mlos":
        return `Minimum ${promo?.minLos || 1} night stay`;
      case "offer_for_tonight":
        return "Tonight Special Offer";
      default:
        return "Special Offer";
    }
  };
  const rooms = Array.isArray(bookingContext.guests?.roomsArray) &&
    bookingContext.guests.roomsArray.length > 0
    ? bookingContext.guests.roomsArray
    : [{
      adults: bookingContext.guests?.adults || 1,
      children: bookingContext.guests?.children || 0,
      childAges: []
    }];
  const noOfRooms = rooms.length || 1;

  const noOfAdults = rooms.reduce(
    (sum: number, r: any) => sum + (r.adults || 0),
    0,
  );
  const noOfChildrens = rooms.reduce(
    (sum: number, r: any) => sum + (r.children || 0),
    0,
  );

  const handleBookNowClick = async (ratePlan: any) => {
    setLoadingPriceFor(`${ratePlan.ratePlanCode}-${ratePlan.comboLabel}`);
    setPendingRatePlan(ratePlan);

    try {
      // Step 1: Always try to fetch available addons using the new API
      setFetchingAddons(true);
      try {
        const addonResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/addon/addon-datewise/available?propertyCode=${bookingContext.PropertyCode}&startDate=${bookingContext.startDate}&endDate=${bookingContext.endDate}&ratePlanCode=${ratePlan.ratePlanCode}`,
        );
        const addonData = await addonResponse.json();
        //console.log('Addon response:', addonData);

        if (
          addonResponse.ok &&
          addonData.success &&
          addonData.data?.length > 0
        ) {
          setFetchedAddons(addonData.data);
          setAddonModalOpen(true);
          setLoadingPriceFor(null);
          setFetchingAddons(false);
          return; // Wait for modal interaction
        }
      } catch (addonError) {
        console.error("Error fetching addons:", addonError);
        // Continue without addons if fetch fails
      }
      setFetchingAddons(false);

      // Step 2: No addons available, proceed directly to price fetch
      await proceedWithBooking(ratePlan, []);
    } catch (error) {
      console.error("Error in booking flow:", error);
      toast.error(t("RoomCard.errors.somethingWentWrong"));
    } finally {
      setLoadingPriceFor(null);
    }
  };

  // Helper function to proceed with booking after addon selection
  const proceedWithBooking = async (
    ratePlan: any,
    selectedAddonsList: any[],
  ) => {
    setLoadingPriceFor(`${ratePlan.ratePlanCode}-${ratePlan.comboLabel}`);
    try {
      const childAges = bookingContext.guests.roomsArray
        ? bookingContext.guests.roomsArray.flatMap((room: any) => room.childAges || [])
        : Array(bookingContext.guests.children || 0).fill(0);

      const payload: any = {
        propertyCode: bookingContext.PropertyCode,
        invTypeCode: room.roomType,
        ratePlanCode: ratePlan.ratePlanCode,
        startDate: bookingContext.startDate,
        endDate: bookingContext.endDate,
        noOfAdults,
        noOfChildren: noOfChildrens,
        noOfRooms,
        childAges,
        promoCode: bookingContext.promocode,
        guestDistribution: bookingContext.guests.roomsArray,
      };

      // ✅ ADD LOYALTY GUEST EMAIL TO PAYLOAD
      if (loyaltyMemberEmail) {
        payload.guestEmail = loyaltyMemberEmail;
      }

      // ✅ ADD SELECTED PROMOTION TO PAYLOAD
      // Around line 223 - Update to send array of promotions:
      const selectedPromotionsList =
        selectedPromotions[ratePlan.ratePlanCode] || [];
      if (selectedPromotionsList.length > 0) {
        payload.promotions = selectedPromotionsList.map((promotions) => ({
          id: promotions.id,
          promotionType: promotions.type === "mlos" ? "mlos" : "normal",
        }));
      }

      if (selectedAddonsList && selectedAddonsList.length > 0) {
        const addonMap: Record<string, any> = {};
        selectedAddonsList.forEach((addon: any) => {
          if (!addonMap[addon.addonId]) {
            addonMap[addon.addonId] = {
              addOnId: addon.addonId,
              availability: [],
            };
          }
          addonMap[addon.addonId].availability.push({
            date: addon.date,
            quantity: addon.quantity,
          });
        });
        payload.parsedAddons = Object.values(addonMap);
      }

      if (ratePlan.addons && ratePlan.addons.length > 0) {
        payload.includedAddons = ratePlan.addons.map(
          (addon: any) => addon.id,
        ) as string[];
      }
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking-engine/pricing/get-price`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();
      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Failed to fetch price");
      }
      setLatestPrice(data.data);

      // Proceed to booking with selected addons, passing price data up
      onBookNow(
        room,
        ratePlan,
        selectedAddonsList,
        selectedPromotionsList,
        data.data,
      );
    } catch (error) {
      console.error("Error fetching price:", error);
      toast.error(t("RoomCard.errors.failedToFetchPrice"));
    } finally {
      setLoadingPriceFor(null);
    }
  };

  // Handle addon modal continue
  const handleAddonContinue = (selectedAddonsList: any[]) => {
    setAddonModalOpen(false);
    if (pendingRatePlan) {
      proceedWithBooking(pendingRatePlan, selectedAddonsList);
    }
  };

  // Handle addon modal skip
  const handleAddonSkip = () => {
    setAddonModalOpen(false);
    if (pendingRatePlan) {
      proceedWithBooking(pendingRatePlan, []);
    }
  };

  const handleAddonQuantityChange = (
    addon: any,
    availability: any,
    quantity: number,
  ) => {
    const key = `${addon.id}-${availability.availabilityId}`;

    setSelectedAddons((prev) => {
      const newState = { ...prev };

      if (quantity <= 0) {
        delete newState[key];
      } else {
        newState[key] = {
          addonId: addon.id,
          addonName: addon.name,
          addonCode: addon.code,
          availabilityId: availability.availabilityId,
          date: availability.date,
          price: availability.price,
          quantity: quantity,
          totalPrice: availability.price * quantity,
          type: addon.type,
        };
      }
      return newState;
    });
  };

  // Around line 355:
  const handleContinue = () => {
    const selectedAddonsList = Object.values(selectedAddons);
    const currentRatePlan = room.roomPrice.find(
      (rp: any) => rp.ratePlanCode === expandedRatePlan,
    );
    const selectedPromotionsList =
      selectedPromotions[expandedRatePlan || ""] || [];

    onBookNow(
      room,
      currentRatePlan,
      selectedAddonsList,
      selectedPromotionsList,
      latestPrice,
    );
    setExpandedRatePlan(null);
    setSelectedAddons({});
    setCollapsedRatePlans(new Set());
  };

  const handleSkip = () => {
    const currentRatePlan = room.roomPrice.find(
      (rp: any) => rp.ratePlanCode === expandedRatePlan,
    );
    const selectedPromotionsList =
      selectedPromotions[expandedRatePlan || ""] || [];

    onBookNow(room, currentRatePlan, [], selectedPromotionsList, latestPrice);
    setExpandedRatePlan(null);
    setSelectedAddons({});
    setCollapsedRatePlans(new Set());
  };

  const handleViewDetails = (ratePlan: any) => {
    setSelectedRatePlanForDetails(ratePlan);
    setShowDetailsModal(true);
  };

  const toggleRatePlanCollapse = (ratePlanCode: string) => {
    setCollapsedRatePlans((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(ratePlanCode)) {
        newSet.delete(ratePlanCode);
      } else {
        newSet.add(ratePlanCode);
      }
      return newSet;
    });
  };

  const scrollToAddons = () => {
    setTimeout(() => {
      if (addonsRef.current) {
        const yOffset = -200;
        const y =
          addonsRef.current.getBoundingClientRect().top +
          window.scrollY +
          yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }, 300);
  };

  const activeAmenities = getActiveAmenities(room.amenities);
  const bookingDates = getDatesBetween(
    bookingContext.startDate,
    bookingContext.endDate,
  );

  const totalAddonsCount = Object.values(selectedAddons).reduce(
    (sum: number, addon: any) => sum + addon.quantity,
    0,
  );
  // Group combos by ratePlanCode → one card per rate plan
  const groupedRatePlans = room.roomPrice.reduce(
    (acc: Record<string, any[]>, rp: any) => {
      if (!acc[rp.ratePlanCode]) acc[rp.ratePlanCode] = [];
      acc[rp.ratePlanCode].push(rp);
      return acc;
    },
    {},
  );
  return (
    <div className="space-y-4">
      {/* Room Header Card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-2/5 lg:w-1/3 relative">
            {/* Media Display */}
            {showVideo ? (
              // Video Player
              <div className="relative w-full h-48">
                <video
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  poster={room.roomVideos?.thumbnail}
                  key={room.roomVideos?.url}
                >
                  <source src={room.roomVideos?.url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : (
              // Image Display
              <img
                src={images[currentImageIndex]}
                alt={room._translations?.roomName || room.roomName}
                className="w-full h-48 object-cover"
              />
            )}

            {/* Navigation Arrows - Show only if more than one media item */}
            {totalMediaCount > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 transition"
                >
                  <ChevronLeft size={18} />
                </button>

                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 transition"
                >
                  <ChevronRight size={18} />
                </button>

                {/* Dots indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {images.map((_, idx) => (
                    <span
                      key={idx}
                      className={`h-2 w-2 rounded-full ${!showVideo && idx === currentImageIndex
                        ? "bg-white"
                        : "bg-white/50"
                        }`}
                    />
                  ))}
                  {hasVideo && (
                    <span
                      className={`h-2 w-2 rounded-full ${showVideo ? "bg-white" : "bg-white/50"
                        }`}
                    />
                  )}
                </div>
              </>
            )}
          </div>

          <div className="md:w-3/5 lg:w-2/3 p-4 md:p-5">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                  {room._translations?.roomName || room.roomName}
                </h2>
                <p className="text-xs md:text-sm text-gray-500 font-medium mt-1">
                  {room._translations?.roomType || room.roomType}
                </p>
              </div>
            </div>

            <p className="text-xs md:text-sm text-gray-700 mb-3 leading-relaxed line-clamp-3">
              {room._translations?.description || room.description}
            </p>

            <div className="flex flex-wrap gap-3 md:gap-4 text-xs md:text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1.5">
                <Users size={16} className="text-orange-500 flex-shrink-0" />
                <span className="font-medium">{room.maxOccupancy} Guests</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Ruler size={16} className="text-orange-500 flex-shrink-0" />
                <span className="font-medium">
                  {room.roomSize} {room.roomUnit}
                </span>
              </div>
              {room.roomView && (
                <div className="flex items-center gap-1.5">
                  <Eye size={16} className="text-orange-500 flex-shrink-0" />
                  <span className="font-medium">{room.roomView}</span>
                </div>
              )}
            </div>

            {activeAmenities.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {activeAmenities.map((amenity: any) => {
                  const isObject = typeof amenity === 'object' && amenity !== null;
                  const amenityKey = isObject ? amenity.amenityName : amenity;
                  const displayName = isObject ? (amenity._translations?.amenityName || amenity.amenityName) : formatAmenityName(amenity);
                  
                  return (
                  <div
                    key={isObject ? amenity.id : amenity}
                    className="flex items-center gap-1 text-xs text-gray-700 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-200"
                  >
                    <AmenityIcon amenityKey={amenityKey} />
                    <span className="font-medium">
                      {displayName}
                    </span>
                  </div>
                )})}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rate Plan Cards */}
      {/* Rate Plan Cards */}
      <div className="space-y-3">
        {Object.entries(groupedRatePlans)
          .filter(([_, combos]: [string, any[]]) => {
            if (!selectedBoardType || selectedBoardType === "all") return true;
            return combos[0].ratePlanName === selectedBoardType;
          })
          .map(([ratePlanCode, combos]: [string, any[]]) => {
            const firstCombo = combos[0]; // shared: name, policy, promotions, touristTax, badges
            const isCollapsed = collapsedRatePlans.has(ratePlanCode);

            // Loyalty calc based on first combo's totalAmount
            const basePrice = firstCombo.totalAmount || 0;
            const currency = firstCombo.currencyCode || "USD";
            let loyaltyDiscountAmount = 0;
            let loyaltyDiscountPercentage = 0;

            if (loyaltyDiscount) {
              if (
                loyalty?.discountPercentage !== null &&
                loyalty?.discountPercentage !== undefined
              ) {
                loyaltyDiscountAmount =
                  (basePrice * loyalty.discountPercentage) / 100;
                loyaltyDiscountPercentage = loyalty.discountPercentage;
              } else if (loyaltyDiscount.loyaltyDiscountType === "percentage") {
                loyaltyDiscountAmount =
                  (basePrice * loyaltyDiscount.discountValue) / 100;
                loyaltyDiscountPercentage = loyaltyDiscount.discountValue;
              } else if (loyaltyDiscount.loyaltyDiscountType === "flat") {
                loyaltyDiscountAmount = loyaltyDiscount.discountValue;
                loyaltyDiscountPercentage = Math.round(
                  (loyaltyDiscountAmount / basePrice) * 100,
                );
              }
            }
            return (
              <div
                key={ratePlanCode}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
              >
                {/* ── Card Header ── */}
                <div className="flex items-center justify-between p-2 sm:px-4 sm:py-3 border-b border-gray-100">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                      {firstCombo._translations?.ratePlanName || firstCombo.ratePlanName}
                    </h3>

                    {firstCombo.availableRooms && firstCombo.availableRooms <= 5 && (
                      <span className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold rounded uppercase animate-pulse">
                        ⚠ {firstCombo.availableRooms === 1
                          ? t("RoomCard.onlyRoomsLeft", { count: firstCombo.availableRooms })
                          : t("RoomCard.onlyRoomsLeftPlural", { count: firstCombo.availableRooms })}
                      </span>
                    )}

                    {selectedPromotions[ratePlanCode]?.length > 0 && (
                      <span className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold rounded">
                        {t("RoomCard.promotionalRate")}
                      </span>
                    )}

                    {firstCombo.touristTax?.calculatedTaxAmount > 0 && (
                      <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        <span className="w-1 h-1 rounded-full bg-amber-500" />
                        {t("RoomCard.taxNotIncluded")}
                      </span>
                    )}
                  </div>

                  {/* Booking conditions + promotions toggle — right side */}
                  <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                    <button
                      onClick={() => handleViewDetails(firstCombo)}
                      className="text-[11px] text-blue-500 hover:text-blue-700 font-medium hover:underline whitespace-nowrap"
                    >
                      {t("RoomCard.bookingConditions")}
                    </button>

                    {firstCombo.availablePromotions?.length > 0 && (
                      <button
                        onClick={() =>
                          setExpandedPromotions(
                            expandedPromotions === ratePlanCode ? null : ratePlanCode,
                          )
                        }
                        className="flex items-center gap-1 text-[11px] text-orange-500 hover:text-orange-700 font-semibold whitespace-nowrap"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {selectedPromotions[ratePlanCode]?.length > 0
                          ? `${selectedPromotions[ratePlanCode].length} ${t("RoomCard.offersApplied")}`
                          : `${firstCombo.availablePromotions.length} ${t("RoomCard.specialOfferAvailable")}`}
                      </button>
                    )}
                  </div>
                </div>

                {/* ── Promotions Panel ── */}
                {expandedPromotions === ratePlanCode && firstCombo.availablePromotions?.length > 0 && (
                  <div className="px-4 py-3 bg-orange-50 border-b border-orange-100">
                    <p className="text-[10px] font-bold text-orange-800 uppercase tracking-wide mb-2">
                      🏷 {t("RoomCard.specialOffersAvailable")}
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {firstCombo.availablePromotions.map((promo: any) => {
                        const isSelected = selectedPromotions[ratePlanCode]?.some((p: any) => p.id === promo.id);
                        return (
                          <div
                            key={promo.id}
                            onClick={() => {
                              setSelectedPromotions((prev) => {
                                const current = prev[ratePlanCode] || [];
                                const alreadySelected = current.some((p: any) => p.id === promo.id);
                                return {
                                  ...prev,
                                  [ratePlanCode]: alreadySelected
                                    ? current.filter((p: any) => p.id !== promo.id)
                                    : [...current, promo],
                                };
                              });
                            }}
                            className={`flex items-center justify-between px-3 py-2 rounded-lg border cursor-pointer transition-all ${isSelected
                              ? "border-orange-400 bg-orange-100"
                              : "border-orange-200 bg-white hover:border-orange-300"
                              }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-sm">
                                {promo.promotionType === "device_specific" ? "📱"
                                  : promo.promotionType === "mlos" ? "🌙"
                                    : promo.promotionType === "early_bird" ? "🐦"
                                      : promo.promotionType === "offer_for_tonight" ? "🌙"
                                        : "🏷"}
                              </span>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-orange-900 truncate">{promo._translations?.promotionName || promo.promotionName}</p>
                                <p className="text-[10px] text-orange-600">
                                  {promo.promotionType === "mlos"
                                    ? `Min. ${promo.minLos} nights`
                                    : promo.promotionType === "early_bird"
                                      ? t("RoomCard.promotions.bookDaysInAdvance", { count: promo.advanceBookingDays })
                                      : t("RoomCard.promotions.specialOffer")}
                                  {promo.validTo && ` · Until ${new Date(promo.validTo).toLocaleDateString()}`}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                              <span className="px-1.5 py-0.5 bg-orange-500 text-white text-[9px] font-bold rounded">
                                -{promo.discountValue}%
                              </span>
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? "border-orange-500 bg-orange-500" : "border-gray-300"
                                }`}>
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
                    {selectedPromotions[ratePlanCode]?.length > 0 && (
                      <p className="mt-2 text-[10px] text-orange-600 font-medium text-center">
                        ✓ {selectedPromotions[ratePlanCode].length} offer(s) selected — applied at checkout
                      </p>
                    )}
                  </div>
                )}

                {/* ── Combo Rows ── */}
                <div className="divide-y divide-gray-100">
                  {combos.map((combo: any) => {
                    const match = combo.comboLabel.match(/\((.+)\)$/);
                    const rawLabel = match ? match[1] : combo.comboLabel;
                    const isOnlyRoomOnly = combos.length === 1 && rawLabel === "Room Only";
                    const subLabel = isOnlyRoomOnly
                      ? (combo._translations?.ratePlanName || combo.ratePlanName)
                      : rawLabel === "Room Only"
                        ? "Room Only"
                        : rawLabel.startsWith("+")
                          ? rawLabel.split("+").filter(Boolean).map((s: string) => s.trim()).join(" & ")
                          : rawLabel;

                    const comboBase = combo.totalAmount || 0;

                    // Loyalty discount applies to room price only, not included addons
                    const includedAddonsTotal = combo.addons?.reduce(
                      (sum: number, a: any) => sum + (a.price || 0), 0
                    ) ?? 0;
                    const roomOnlyPrice = comboBase - includedAddonsTotal;

                    const loyaltyDiscountOnRoom = isLoyaltyMember && loyaltyDiscountInfo
                      ? (loyaltyDiscountInfo.type === "percentage"
                        ? (roomOnlyPrice * loyaltyDiscountInfo.value) / 100
                        : loyaltyDiscountInfo.value)
                      : (loyalty?.discountPercentage !== null && loyalty?.discountPercentage !== undefined
                        ? (roomOnlyPrice * loyalty.discountPercentage) / 100
                        : loyaltyDiscount?.loyaltyDiscountType === "percentage"
                          ? (roomOnlyPrice * loyaltyDiscount.discountValue) / 100
                          : loyaltyDiscount?.discountValue || 0);

                    const comboAfterLoyalty = comboBase - loyaltyDiscountOnRoom;
                    const isComboExpanded = expandedCombo === `${ratePlanCode}-${combo.comboLabel}`;

                    return (
                      <div key={combo.comboLabel}>
                        {/* ── Main Row ── */}
                        <div className="flex items-center justify-between sm:px-4 p-2 hover:bg-gray-50 transition-colors">
                          {/* Left */}
                          <button
                            onClick={() => setExpandedCombo(isComboExpanded ? null : `${ratePlanCode}-${combo.comboLabel}`)}
                            className="flex items-center gap-1 text-xs sm:text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors"
                          >
                            {isComboExpanded
                              ? <ChevronUp size={14} className="text-gray-400" />
                              : <ChevronDown size={14} className="text-gray-400" />}
                            {subLabel}
                          </button>

                          {/* Right */}
                          <div className="flex items-center gap-2 sm:gap-3">
                            {/* Loyalty unlock */}
                            {!isLoyaltyMember && loyaltyProgram && loyaltyDiscountAmount > 0 && (
                              <button
                                onClick={(e) => { e.stopPropagation(); if (onUnlockLoyalty) onUnlockLoyalty(); }}
                                className="flex flex-col items-center border border-dashed border-gray-300 rounded-lg px-2 py-1 hover:border-blue-400 transition-all group"
                              >
                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                                  — {t("RoomCard.unlock")} —
                                </span>
                                <div className="flex items-center gap-1">
                                  <svg className="w-3 h-3 text-gray-500 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                  </svg>
                                  <span className="text-xs font-bold text-gray-700">
                                    {currency} {comboAfterLoyalty.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </span>
                                </div>
                              </button>
                            )}

                            <div className="text-right">
                              {isLoyaltyMember && loyaltyDiscountInfo && (
                                <div className="flex items-center gap-1 justify-end">
                                  <span className="text-[9px] sm:text-[10px] text-gray-400 line-through">
                                    {currency} {comboBase.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </span>
                                  <span className="px-1 py-0.5 bg-green-500 text-white text-[9px] font-bold rounded">
                                    -{loyaltyDiscountInfo.type === "percentage"
                                      ? `${loyaltyDiscountInfo.value}%`
                                      : `${loyaltyDiscountInfo.currencyCode} ${loyaltyDiscountInfo.value}`}
                                  </span>
                                </div>
                              )}
                              <span className="text-sm sm:text-base font-bold text-gray-900">
                                {currency}{" "}
                                {(isLoyaltyMember ? comboAfterLoyalty : comboBase).toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </div>

                            {/* ADD button */}
                            <button
                              onClick={() => handleBookNowClick(combo)}
                              disabled={isLoadingForRatePlan(`${ratePlanCode}-${combo.comboLabel}`)}
                              style={{ backgroundColor: primaryColor || "#777", color: buttonTextColor || "#fff" }}
                              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-[10px] sm:text-xs uppercase transition-all disabled:opacity-50 hover:opacity-90 hover:scale-105 active:scale-95 whitespace-nowrap shadow-sm"
                            >
                              {isLoadingForRatePlan(`${ratePlanCode}-${combo.comboLabel}`) ? (
                                <div className="flex items-center gap-1.5">
                                  <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                  <span>{t("RoomCard.loading")}</span>
                                </div>
                              ) : (
                                t("RoomCard.add")
                              )}
                            </button>
                          </div>
                        </div>

                        {/* ── Expanded Details ── */}
                        {isComboExpanded && (
                          <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100">
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">

                              {/* Base Price */}
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">
                                  {t("RoomCard.basePrice")}:
                                </span>
                                <span className="text-xs font-bold text-gray-800">
                                  {currency}{" "}
                                  {(
                                    combo.totalAmount +
                                    (combo.appliedDiscounts?.reduce((sum: number, d: any) => sum + d.calculatedDiscountAmount, 0) ?? 0) -
                                    (combo.addons?.reduce((sum: number, a: any) => sum + a.price, 0) ?? 0)
                                  ).toFixed(2)}
                                </span>
                                {/* <span className="text-[10px] text-gray-400">{t("RoomCard.perNight")}</span> */}
                              </div>

                              {(combo.appliedDiscounts?.length > 0 || combo.addons?.filter((a: any) => a.price > 0).length > 0) && (
                                <span className="text-gray-300 text-xs">|</span>
                              )}

                              {/* Applied Discounts inline */}
                              {combo.appliedDiscounts?.map((discount: any) => (
                                <div key={discount.id} className="flex items-center gap-1">
                                  <span className="text-[10px] text-green-700 truncate max-w-[120px]">
                                    {discount.promotionType === "promocode" ? `🎟 ${discount.promotionName}`
                                      : discount.promotionType === "early_bird" ? `🐦 ${discount.promotionName}`
                                        : discount.promotionType === "geo" ? `🌍 ${discount.promotionName}`
                                          : discount.promotionType === "mlos" ? `🌙 ${discount.promotionName}`
                                            : `✓ ${discount.promotionName}`}
                                  </span>
                                  <span className="text-[10px] font-bold text-green-600 whitespace-nowrap">
                                    -{currency} {discount.calculatedDiscountAmount.toFixed(2)}
                                  </span>
                                </div>
                              ))}

                              {/* Included Addons inline */}
                              {combo.addons?.filter((a: any) => a.price > 0).map((addon: any) => (
                                <div key={addon.id} className="flex items-center gap-1">
                                  <span className="text-[10px] text-orange-700 truncate max-w-[120px]">
                                    🍽 {addon.name}
                                  </span>
                                  <span className="text-[10px] font-bold text-orange-600 whitespace-nowrap">
                                    +{currency} {addon.price.toFixed(2)}
                                  </span>
                                </div>
                              ))}

                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* ── Tourist Tax Footer ── */}
                {firstCombo.touristTax?.calculatedTaxAmount > 0 && (
                  <div className="px-4 py-2 border-t border-amber-100 bg-amber-50 flex items-center justify-center gap-1.5">
                    <span className="text-amber-400 text-xs">ℹ️</span>
                    <p className="text-[11px] text-amber-800 text-center">
                      <span className="font-semibold">{firstCombo.touristTax._translations?.name || firstCombo.touristTax.name || t("RoomCard.taxNotIncluded")}</span>
                      {" "}of{" "}
                      <span className="font-semibold">
                        {firstCombo.touristTax.currencyCode || currency} {firstCombo.touristTax.calculatedTaxAmount.toFixed(2)}
                      </span>
                      {" "}is{" "}
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
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedRatePlanForDetails(null);
          }}
        />
      )}

      {/* Addon Selection Modal */}
      <AddonSelectionModal
        isOpen={addonModalOpen}
        onClose={() => {
          setAddonModalOpen(false);
          setPendingRatePlan(null);
          setFetchedAddons([]);
        }}
        addons={fetchedAddons}
        bookingDates={bookingDates}
        onContinue={handleAddonContinue}
        onSkip={handleAddonSkip}
        primaryColor={primaryColor}
        buttonTextColor={buttonTextColor}
        currencyCode={pendingRatePlan?.currencyCode || "USD"}
      />
    </div>
  );
};

export default RoomCard;
