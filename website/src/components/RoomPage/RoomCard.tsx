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
import { IPropertyLoyalityWithLoyality } from "@/src/app/Rooms/interface";

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
}) => {
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
      const currentRatePlan = room.room_price.find(
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
const rooms = Array.isArray(bookingContext.guests?.rooms)
  ? bookingContext.guests.rooms
  : [{ 
      adults: bookingContext.guests?.adults || 1,
      children: bookingContext.guests?.children || 0
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
    setLoadingPriceFor(ratePlan.comboLabel);
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
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoadingPriceFor(null);
    }
  };

  // Helper function to proceed with booking after addon selection
  const proceedWithBooking = async (
    ratePlan: any,
    selectedAddonsList: any[],
  ) => {
    setLoadingPriceFor(ratePlan.comboLabel);
    try {
      const payload: any = {
        propertyCode: bookingContext.PropertyCode,
        invTypeCode: room.room_type,
        ratePlanCode: ratePlan.ratePlanCode,
        startDate: bookingContext.startDate,
        endDate: bookingContext.endDate,
        noOfAdults,
        noOfChildren: noOfChildrens,
        noOfRooms,
        roomDetails: bookingContext.guests.roomsArray,
        promoCode: bookingContext.promocode,
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
      toast.error("Failed to fetch price. Please try again.");
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
    const currentRatePlan = room.room_price.find(
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
    const currentRatePlan = room.room_price.find(
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
  const groupedRatePlans = room.room_price.reduce(
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
                alt={room.room_name}
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
                      className={`h-2 w-2 rounded-full ${
                        !showVideo && idx === currentImageIndex
                          ? "bg-white"
                          : "bg-white/50"
                      }`}
                    />
                  ))}
                  {hasVideo && (
                    <span
                      className={`h-2 w-2 rounded-full ${
                        showVideo ? "bg-white" : "bg-white/50"
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
                  {room.room_name}
                </h2>
                <p className="text-xs md:text-sm text-gray-500 font-medium mt-1">
                  {room.room_type}
                </p>
              </div>
            </div>

            <p className="text-xs md:text-sm text-gray-700 mb-3 leading-relaxed line-clamp-3">
              {room.description}
            </p>

            <div className="flex flex-wrap gap-3 md:gap-4 text-xs md:text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1.5">
                <Users size={16} className="text-orange-500 flex-shrink-0" />
                <span className="font-medium">{room.max_occupancy} Guests</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Ruler size={16} className="text-orange-500 flex-shrink-0" />
                <span className="font-medium">
                  {room.room_size} {room.room_unit}
                </span>
              </div>
              {room.room_view && (
                <div className="flex items-center gap-1.5">
                  <Eye size={16} className="text-orange-500 flex-shrink-0" />
                  <span className="font-medium">{room.room_view}</span>
                </div>
              )}
            </div>

            {activeAmenities.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {activeAmenities.map((amenity: any) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-1 text-xs text-gray-700 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-200"
                  >
                    <AmenityIcon amenityKey={amenity} />
                    <span className="font-medium">
                      {formatAmenityName(amenity)}
                    </span>
                  </div>
                ))}
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
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
              >
                {/* ── Card Header ── */}
                <div className="p-4 md:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Rate Plan Name + Badges */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <h3 className="text-lg md:text-xl font-bold text-gray-900 leading-tight uppercase">
                          {firstCombo.ratePlanName}
                        </h3>
                        {firstCombo.availableRooms &&
                          firstCombo.availableRooms <= 5 && (
                            <span className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 text-xs font-bold rounded-md uppercase animate-pulse">
                              ⚠ Only {firstCombo.availableRooms} Room
                              {firstCombo.availableRooms !== 1 ? "s" : ""} Left!
                            </span>
                          )}
                        {selectedPromotions[ratePlanCode]?.length > 0 && (
                          <span className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold rounded-md">
                            Promotional rate
                          </span>
                        )}
                      </div>

                      {!isCollapsed && (
                        <>
                          <button
                            onClick={() => handleViewDetails(firstCombo)}
                            className="text-xs md:text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
                          >
                            Booking conditions →
                          </button>

                          {/* Available Promotions Toggle */}
                          {firstCombo.availablePromotions?.length > 0 && (
                            <button
                              onClick={() =>
                                setExpandedPromotions(
                                  expandedPromotions === ratePlanCode
                                    ? null
                                    : ratePlanCode,
                                )
                              }
                              className="mt-2 flex items-center gap-1.5 text-xs md:text-sm text-orange-600 hover:text-orange-700 font-medium hover:underline"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                />
                              </svg>
                              {selectedPromotions[ratePlanCode]?.length > 0
                                ? `${selectedPromotions[ratePlanCode].length} Offer(s) Applied • ${firstCombo.availablePromotions.length} Available`
                                : `${firstCombo.availablePromotions.length} Special Offer${firstCombo.availablePromotions.length > 1 ? "s" : ""} Available`}
                            </button>
                          )}

                          {/* Promotions Panel — same as before, just use ratePlanCode as key */}
                          {expandedPromotions === ratePlanCode &&
                            firstCombo.availablePromotions?.length > 0 && (
                              <div className="mt-4 p-4 bg-gradient-to-br from-orange-50 to-amber-50 border-l-4 border-orange-400 rounded-lg">
                                <p className="text-xs font-bold text-orange-800 uppercase tracking-wide mb-3">
                                  🏷 Special Offers Available
                                </p>
                                <div className="space-y-2">
                                  {firstCombo.availablePromotions.map(
                                    (promo: any) => {
                                      const isSelected = selectedPromotions[
                                        ratePlanCode
                                      ]?.some((p: any) => p.id === promo.id);
                                      return (
                                        <div
                                          key={promo.id}
                                          onClick={() => {
                                            setSelectedPromotions((prev) => {
                                              const current =
                                                prev[ratePlanCode] || [];
                                              const alreadySelected =
                                                current.some(
                                                  (p: any) => p.id === promo.id,
                                                );
                                              return {
                                                ...prev,
                                                [ratePlanCode]: alreadySelected
                                                  ? current.filter(
                                                      (p: any) =>
                                                        p.id !== promo.id,
                                                    )
                                                  : [...current, promo],
                                              };
                                            });
                                          }}
                                          className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                            isSelected
                                              ? "border-orange-500 bg-orange-100"
                                              : "border-orange-200 bg-white hover:border-orange-400"
                                          }`}
                                        >
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                              <span className="text-xs font-bold text-orange-900">
                                                {promo.promotionType ===
                                                "device_specific"
                                                  ? "📱"
                                                  : promo.promotionType ===
                                                      "mlos"
                                                    ? "🌙"
                                                    : promo.promotionType ===
                                                        "early_bird"
                                                      ? "🐦"
                                                      : promo.promotionType ===
                                                          "offer_for_tonight"
                                                        ? "🌙"
                                                        : "🏷"}{" "}
                                                {promo.promotionName}
                                              </span>
                                              <span className="px-1.5 py-0.5 bg-orange-500 text-white text-[9px] font-bold rounded">
                                                -{promo.discountValue}%
                                              </span>
                                            </div>
                                            <p className="text-[10px] text-orange-700">
                                              {promo.promotionType === "mlos"
                                                ? `Minimum ${promo.minLos} night stay`
                                                : promo.promotionType ===
                                                    "device_specific"
                                                  ? "Device exclusive offer"
                                                  : promo.promotionType ===
                                                      "early_bird"
                                                    ? `Book ${promo.advanceBookingDays} days in advance`
                                                    : "Special offer"}
                                              {promo.validTo &&
                                                ` • Valid until ${new Date(promo.validTo).toLocaleDateString()}`}
                                            </p>
                                          </div>
                                          <div
                                            className={`ml-3 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                              isSelected
                                                ? "border-orange-500 bg-orange-500"
                                                : "border-gray-300"
                                            }`}
                                          >
                                            {isSelected && (
                                              <svg
                                                className="w-3 h-3 text-white"
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
                                      );
                                    },
                                  )}
                                </div>

                                {selectedPromotions[ratePlanCode]?.length >
                                  0 && (
                                  <p className="mt-2 text-[10px] text-orange-700 font-medium text-center">
                                    ✓ {selectedPromotions[ratePlanCode].length}{" "}
                                    offer(s) selected — will be applied at
                                    checkout
                                  </p>
                                )}
                              </div>
                            )}
                        </>
                      )}
                    </div>

                    {/* Tax info top-right (like in screenshot) */}
                    {firstCombo.touristTax?.calculatedTaxAmount > 0 && (
                      <div className="text-xs text-right text-gray-500 max-w-[200px] hidden sm:block">
                        TAX NOT INCLUDED:{" "}
                        {firstCombo.touristTax.name?.toUpperCase()} {currency}{" "}
                        {firstCombo.touristTax.calculatedTaxAmount.toFixed(2)} -
                        PAY AT THE HOTEL
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Combo Rows ── */}
                {!isCollapsed && (
                  <div className="divide-y divide-gray-100 border-t border-gray-100">
                    {combos.map((combo: any) => {
                      const match = combo.comboLabel.match(/\((.+)\)$/);
                      const rawLabel = match ? match[1] : combo.comboLabel;

                      const subLabel =
                        rawLabel === "Room Only"
                          ? "Room Only"
                          : rawLabel.startsWith("+")
                            ? rawLabel
                                .split("+")
                                .filter(Boolean)
                                .map((s: string) => s.trim())
                                .join(" & ")
                            : rawLabel;
                      const comboBase = combo.totalAmount || 0;
                      const comboAfterLoyalty =
                        comboBase -
                        (loyalty?.discountPercentage !== null &&
                        loyalty?.discountPercentage !== undefined
                          ? (comboBase * loyalty.discountPercentage) / 100
                          : loyaltyDiscount?.loyaltyDiscountType ===
                              "percentage"
                            ? (comboBase * loyaltyDiscount.discountValue) / 100
                            : loyaltyDiscount?.discountValue || 0);
                      const isComboExpanded =
                        expandedCombo === combo.comboLabel;

                      return (
                        <div
                          key={combo.comboLabel}
                          className="border-b border-gray-100 last:border-b-0"
                        >
                          {/* ── Main Row ── */}
                          <div className="flex items-center justify-between px-4 md:px-5 py-3 hover:bg-gray-50 transition-colors">
                            {/* Left: combo name + expand toggle */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  setExpandedCombo(
                                    isComboExpanded ? null : combo.comboLabel,
                                  )
                                }
                                className="flex items-center gap-1.5 text-sm font-semibold text-gray-800 hover:text-orange-600 transition-colors"
                              >
                                {isComboExpanded ? (
                                  <ChevronUp size={15} />
                                ) : (
                                  <ChevronDown size={15} />
                                )}
                                {subLabel}
                              </button>
                            </div>

                            {/* Right: pricing + ADD */}
                            <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
                              {/* Unlock box (non-members with loyalty) */}
                              {!isLoyaltyMember &&
                                loyaltyProgram &&
                                loyaltyDiscountAmount > 0 && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (onUnlockLoyalty) onUnlockLoyalty();
                                    }}
                                    className="flex flex-col items-center border-2 border-dashed border-gray-400 rounded-lg px-2.5 py-1.5 hover:border-blue-500 transition-all group"
                                  >
                                    <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">
                                      — UNLOCK —
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <svg
                                        className="w-3 h-3 text-gray-600 group-hover:text-blue-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                                        />
                                      </svg>
                                      <span className="text-xs font-bold text-gray-800">
                                        {currency}{" "}
                                        {comboAfterLoyalty.toLocaleString(
                                          undefined,
                                          {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          },
                                        )}
                                      </span>
                                    </div>
                                  </button>
                                )}

                              {/* Price */}
                              <div className="text-right">
                                {(isLoyaltyMember ||
                                  (!isLoyaltyMember && loyaltyProgram)) &&
                                  loyaltyDiscountAmount > 0 && (
                                    <div className="flex items-center gap-1 justify-end mb-0.5">
                                      <span className="text-xs text-gray-400 line-through">
                                        {currency}{" "}
                                        {comboBase.toLocaleString(undefined, {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })}
                                      </span>
                                      <span className="px-1.5 py-0.5 bg-green-500 text-white text-[9px] font-bold rounded">
                                        -{loyaltyDiscountPercentage}%
                                      </span>
                                    </div>
                                  )}
                                <span className="text-lg sm:text-xl font-bold text-gray-900">
                                  {currency}{" "}
                                  {(isLoyaltyMember
                                    ? comboAfterLoyalty
                                    : comboBase
                                  ).toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </span>
                              </div>

                              {/* ADD button */}
                              <button
                                onClick={() => handleBookNowClick(combo)}
                                disabled={isLoadingForRatePlan(
                                  combo.comboLabel,
                                )}
                                style={{
                                  backgroundColor: primaryColor || "#777",
                                  color: buttonTextColor || "#fff",
                                }}
                                className="px-4 sm:px-5 py-2 sm:py-3 rounded-lg font-bold text-xs sm:text-sm uppercase transition-all disabled:opacity-50 shadow-lg hover:shadow-xl whitespace-nowrap hover:opacity-90 hover:scale-105 active:scale-95"
                              >
                                {isLoadingForRatePlan(combo.comboLabel) ? (
                                  <div className="flex items-center gap-1.5">
                                    <div className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    <span>Loading...</span>
                                  </div>
                                ) : (
                                  "ADD"
                                )}
                              </button>
                            </div>
                          </div>

                          {/* ── Expanded Details ── */}
                          {isComboExpanded && (
                            <div className="px-4 md:px-5 pb-4 bg-gray-50 border-t border-gray-100">
                              {/* Base price breakdown */}
                              <div className="mt-3 grid grid-cols-1 lg:grid-cols-3 gap-2">
                                <div className="bg-white border border-gray-200 rounded-lg px-3 py-2">
                                  <p className="text-[10px] text-gray-500 uppercase font-semibold tracking-wide mb-1">
                                    Base Price
                                  </p>
                                  <p className="text-sm font-bold text-gray-800">
                                    {currency}{" "}
                                    {(
                                      combo.totalAmount +
                                      (combo.appliedDiscounts?.reduce(
                                        (sum: number, d: any) =>
                                          sum + d.calculatedDiscountAmount,
                                        0,
                                      ) ?? 0) -
                                      (combo.addons?.reduce(
                                        (sum: number, a: any) => sum + a.price,
                                        0,
                                      ) ?? 0)
                                    ).toFixed(2)}
                                  </p>
                                  <p className="text-[10px] text-gray-400">
                                    per night
                                  </p>
                                </div>

                                {combo.appliedDiscounts?.length > 0 && (
                                  <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                                    <p className="text-[10px] text-green-700 uppercase font-semibold tracking-wide mb-1">
                                      Auto-Applied Discounts
                                    </p>
                                    <div className="space-y-1">
                                      {combo.appliedDiscounts.map(
                                        (discount: any) => (
                                          <div
                                            key={discount.id}
                                            className="flex items-center justify-between gap-2"
                                          >
                                            <span className="text-[11px] text-green-800 truncate">
                                              {discount.promotionType ===
                                              "promocode"
                                                ? `🎟 ${discount.promotionName}`
                                                : discount.promotionType ===
                                                    "early_bird"
                                                  ? `🐦 ${discount.promotionName}`
                                                  : discount.promotionType ===
                                                      "geo"
                                                    ? `🌍 ${discount.promotionName}`
                                                    : discount.promotionType ===
                                                        "mlos"
                                                      ? `🌙 ${discount.promotionName}`
                                                      : `✓ ${discount.promotionName}`}
                                            </span>
                                            <span className="text-[11px] font-bold text-green-700 whitespace-nowrap">
                                              -{currency}{" "}
                                              {discount.calculatedDiscountAmount.toFixed(
                                                2,
                                              )}
                                            </span>
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  </div>
                                )}

                                {combo.addons?.filter((a: any) => a.price > 0)
                                  .length > 0 && (
                                  <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
                                    <p className="text-[10px] text-orange-700 uppercase font-semibold tracking-wide mb-1">
                                      Included Addons
                                    </p>
                                    <div className="space-y-1">
                                      {combo.addons
                                        .filter((a: any) => a.price > 0)
                                        .map((addon: any) => (
                                          <div
                                            key={addon.id}
                                            className="flex items-center justify-between gap-2"
                                          >
                                            <span className="text-[11px] text-orange-800 truncate">
                                              🍽 {addon.name}
                                            </span>
                                            <span className="text-[11px] font-bold text-orange-700 whitespace-nowrap">
                                              +{currency}{" "}
                                              {addon.price.toFixed(2)}
                                            </span>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Policies */}
                              <div className="mt-3 flex flex-wrap gap-2">
                                <button
                                  onClick={() => handleViewDetails(combo)}
                                  className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline"
                                >
                                  Booking conditions →
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ── Tourist Tax Footer ── */}
                {!isCollapsed &&
                  firstCombo.touristTax?.calculatedTaxAmount > 0 && (
                    <div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-100 text-center bg-gray-50">
                      Direct payment at hotel:{" "}
                      {firstCombo.touristTax.name?.toUpperCase()} — {currency}{" "}
                      {firstCombo.touristTax.calculatedTaxAmount.toFixed(2)}
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
