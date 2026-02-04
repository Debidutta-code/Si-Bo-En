import React, { useState, useEffect, useRef } from 'react';
import { Users, Ruler, Eye, Wifi, Coffee, Tv, Wind, Phone, Utensils, ChevronRight, Plus, Minus, ChevronDown, ChevronUp, ChevronLeft } from 'lucide-react';
import RoomDetails from './RoomDetails';
import AddonSelectionModal from './AddonSelectionModal';
import { Room } from "../../store/roomsSlice";
import { useBookingStorage } from '../../hooks/useBookingStorage';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/store/store';
import { useCurrencyConverter } from '@/src/hooks/useCurrencyConverter';
import toast from 'react-hot-toast';

interface RoomCardProps {
  room: Room;
  propertyDetails: any;
  addons: any[];
  bookingContext: any;
  onBookNow: (room: Room, ratePlan: any, selectedAddons: any[]) => void;
  loadingBookNow: string | null;
  onPriceUpdate?: (data: {
    room: Room;
    ratePlan: any;
    selectedAddons: any[];
    basePrice: number;
    totalAddonsPrice: number;
    finalprice: any
  }) => void;
  activeRatePlan?: string | null;
  selectedBoardType?: string;
}

// Helper to get dates between check-in and check-out (excluding checkout date)
const getDatesBetween = (startDate: string, endDate: string) => {
  const dates = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  while (start < end) {
    dates.push(new Date(start).toISOString().split('T')[0]);
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
    microwave: <Utensils size={16} />
  };

  return icons[amenityKey] || null;
};

// Get active amenities (show first 6)
const getActiveAmenities = (amenities: any) => {
  const active = [] as any;
  if (!amenities?.amenities) return active;

  for (const category of Object.values(amenities.amenities)) {
    if (typeof category === 'object') {
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
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
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
  selectedBoardType
}) => {
  // const { currency: selectedCurrency } = useSelector((state: RootState) => state.booking);
  const [loadingPriceFor, setLoadingPriceFor] = useState<string | null>(null);
  const isLoadingForRatePlan = (ratePlanCode: string) => {
    return loadingPriceFor === ratePlanCode || loadingBookNow === `${room.id}-${ratePlanCode}`;
  };
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = room.images?.length
    ? room.images
    : ["https://via.placeholder.com/600x400?text=No+Image+Available"];

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };


  // Use the custom hook to get dynamic branding colors
  const { colors } = useBookingStorage(bookingContext);

  const {
    primaryColor,
    buttonTextColor
  } = colors;

  const [expandedRatePlan, setExpandedRatePlan] = useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<Record<string, any>>({});
  const [showAllAddons, setShowAllAddons] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRatePlanForDetails, setSelectedRatePlanForDetails] = useState<any>(null);
  const [collapsedRatePlans, setCollapsedRatePlans] = useState<Set<string>>(new Set());
  const [latestPrice, setLatestPrice] = useState<any>(null);

  // New states for addon modal
  const [addonModalOpen, setAddonModalOpen] = useState(false);
  const [fetchedAddons, setFetchedAddons] = useState<any[]>([]);
  const [pendingRatePlan, setPendingRatePlan] = useState<any>(null);
  const [fetchingAddons, setFetchingAddons] = useState(false);

  const addonsRef = useRef<HTMLDivElement | null>(null);

  // Update price sidebar whenever addons change
  useEffect(() => {
    if (expandedRatePlan && onPriceUpdate && latestPrice) {
      const currentRatePlan = room.room_price.find((rp: any) => rp.ratePlanCode === expandedRatePlan);
      if (currentRatePlan) {
        const basePrice = currentRatePlan.baseByGuestAmts?.[0]?.amountBeforeTax || 0;
        const selectedAddonsList = Object.values(selectedAddons);
        const totalAddonsPrice = selectedAddonsList.reduce((sum: number, addon: any) => sum + addon.totalPrice, 0);

        onPriceUpdate({
          room,
          ratePlan: currentRatePlan,
          selectedAddons: selectedAddonsList,
          basePrice,
          totalAddonsPrice,
          finalprice: latestPrice
        });
      }
    }
  }, [selectedAddons, expandedRatePlan, latestPrice, onPriceUpdate, room]);

  const rooms = Array.isArray(bookingContext.guests?.rooms)
    ? bookingContext.guests.rooms
    : [{ adults: 1, children: 0 }];

  const noOfRooms = rooms.length || 1;

  const noOfAdults = rooms.reduce((sum: number, r: any) => sum + (r.adults || 0), 0);
  const noOfChildrens = rooms.reduce((sum: number, r: any) => sum + (r.children || 0), 0);

  const handleBookNowClick = async (ratePlan: any) => {
    setLoadingPriceFor(ratePlan.ratePlanCode);
    setPendingRatePlan(ratePlan);

    try {
      // Step 1: Always try to fetch available addons using the new API
      setFetchingAddons(true);
      try {
        console.log('Fetching addons for:', bookingContext.PropertyCode, bookingContext.startDate, bookingContext.endDate);
        const addonResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/addon/addon-datewise/available?propertyCode=${bookingContext.PropertyCode}&startDate=${bookingContext.startDate}&endDate=${bookingContext.endDate}`
        );
        const addonData = await addonResponse.json();
        console.log('Addon response:', addonData);

        if (addonResponse.ok && addonData.success && addonData.data?.length > 0) {
          setFetchedAddons(addonData.data);
          setAddonModalOpen(true);
          setLoadingPriceFor(null);
          setFetchingAddons(false);
          return; // Wait for modal interaction
        }
      } catch (addonError) {
        console.error('Error fetching addons:', addonError);
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
  const proceedWithBooking = async (ratePlan: any, selectedAddonsList: any[]) => {
    setLoadingPriceFor(ratePlan.ratePlanCode);
    try {
      const payload = {
        propertyCode: bookingContext.PropertyCode,
        invTypeCode: room.room_type,
        ratePlanCode: ratePlan.ratePlanCode,
        startDate: bookingContext.startDate,
        endDate: bookingContext.endDate,
        noOfAdults,
        noOfChildren: noOfChildrens,
        noOfRooms
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/ari/price/get-price`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Failed to fetch price");
      }
      setLatestPrice(data.data);

      // Proceed to booking with selected addons
      onBookNow(room, ratePlan, selectedAddonsList);
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

  const handleAddonQuantityChange = (addon: any, availability: any, quantity: number) => {
    const key = `${addon.id}-${availability.availabilityId}`;

    setSelectedAddons(prev => {
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
          type: addon.type
        };
      }
      return newState;
    });
  };

  const handleContinue = () => {
    const selectedAddonsList = Object.values(selectedAddons);
    const currentRatePlan = room.room_price.find((rp: any) => rp.ratePlanCode === expandedRatePlan);

    onBookNow(room, currentRatePlan, selectedAddonsList);
    setExpandedRatePlan(null);
    setSelectedAddons({});
    setCollapsedRatePlans(new Set());
  };

  const handleSkip = () => {
    const currentRatePlan = room.room_price.find((rp: any) => rp.ratePlanCode === expandedRatePlan);
    onBookNow(room, currentRatePlan, []);
    setExpandedRatePlan(null);
    setSelectedAddons({});
    setCollapsedRatePlans(new Set());
  };

  const handleViewDetails = (ratePlan: any) => {
    setSelectedRatePlanForDetails(ratePlan);
    setShowDetailsModal(true);
  };

  const toggleRatePlanCollapse = (ratePlanCode: string) => {
    setCollapsedRatePlans(prev => {
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
        const y = addonsRef.current.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }, 300);
  };

  const activeAmenities = getActiveAmenities(room.amenities);
  const bookingDates = getDatesBetween(bookingContext.startDate, bookingContext.endDate);

  const totalAddonsPrice = Object.values(selectedAddons).reduce((sum: number, addon: any) => sum + addon.totalPrice, 0);
  const totalAddonsCount = Object.values(selectedAddons).reduce((sum: number, addon: any) => sum + addon.quantity, 0);

  return (
    <div className="space-y-4">
      {/* Room Header Card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-2/5 lg:w-1/3 relative">
            <img
              src={images[currentImageIndex]}
              alt={room.room_name}
              className="w-full h-48 object-cover"
            />

            {/* Show arrows only if more than one image */}
            {images.length > 1 && (
              <>
                {/* Left Button */}
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 transition"
                >
                  <ChevronLeft size={18} />
                </button>

                {/* Right Button */}
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
                      className={`h-2 w-2 rounded-full ${idx === currentImageIndex
                        ? "bg-white"
                        : "bg-white/50"
                        }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>


          <div className="md:w-3/5 lg:w-2/3 p-4 md:p-5">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">{room.room_name}</h2>
                <p className="text-xs md:text-sm text-gray-500 font-medium mt-1">{room.room_type}</p>
              </div>
            </div>

            <p className="text-xs md:text-sm text-gray-700 mb-3 leading-relaxed line-clamp-3">{room.description}</p>

            <div className="flex flex-wrap gap-3 md:gap-4 text-xs md:text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1.5">
                <Users size={16} className="text-orange-500 flex-shrink-0" />
                <span className="font-medium">{room.max_occupancy} Guests</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Ruler size={16} className="text-orange-500 flex-shrink-0" />
                <span className="font-medium">{room.room_size} {room.room_unit}</span>
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
                  <div key={amenity} className="flex items-center gap-1 text-xs text-gray-700 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-200">
                    <AmenityIcon amenityKey={amenity} />
                    <span className="font-medium">{formatAmenityName(amenity)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rate Plan Cards */}
      <div className="space-y-3">
        {room.room_price
          ?.filter((ratePlan: any) => {
            if (!selectedBoardType || selectedBoardType === "all") return true;

            // Normalize ratePlanName for comparison
            const ratePlanName = ratePlan.ratePlanName?.trim();

            // Map selected value (slug) back to full name
            const boardMap: Record<string, string> = {
              "non-refundable": "Non Refundable",
              "bed-and-breakfast": "Bed and Breakfast",
              "bed-breakfast": "Bed and Breakfast",
              "half-board": "Half Board",
              "full-board": "Full Board",
              "all-inclusive": "All Inclusive",
              "room-only": "Room Only",
            };

            const targetName = boardMap[selectedBoardType];

            if (targetName) {
              return ratePlanName === targetName;
            }

            // Fallback: direct match or partial (safe)
            return ratePlanName?.toLowerCase().includes(selectedBoardType.replace(/-/g, ' '));
          })
          ?.map((ratePlan: any, index: number) => {
            const isExpanded = expandedRatePlan === ratePlan.ratePlanCode;
            const isCollapsed = collapsedRatePlans.has(ratePlan.ratePlanCode);
            const basePrice = ratePlan.baseByGuestAmts?.[0]?.amountBeforeTax || 0;
            const currency = ratePlan.currencyCode || 'USD';

            // console.log(ratePlan, 'ratePlan');

            // const { convertedAmount } = useCurrencyConverter(basePrice);

            return (
              <div
                key={`${ratePlan.ratePlanCode}-${index}`}
                className={`bg-white rounded-lg shadow-md overflow-hidden border-2 transition-all ${isExpanded ? 'border-orange-400' : 'border-gray-200'}`}
              >
                {/* Rate Plan Header */}
                <div className={`p-4 md:p-5 ${isCollapsed && !isExpanded ? 'pb-2' : ''}`}>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-base md:text-lg font-bold text-gray-900 leading-tight">
                          {ratePlan.ratePlanName || ratePlan.ratePlanCode}
                        </h3>
                        <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap">
                          Special Rate
                        </span>
                      </div>

                      {!isCollapsed && (
                        <>
                          <div className="space-y-1 text-xs md:text-sm text-gray-700 mb-2">
                            {ratePlan.policy?.cancellationPolicy?.description && (
                              <div className="flex items-start gap-1.5">
                                <span className="text-green-600 mt-0.5 flex-shrink-0">✓</span>
                                <span className="line-clamp-1">{ratePlan.policy.cancellationPolicy.description}</span>
                              </div>
                            )}
                            <div className="flex items-start gap-1.5">
                              <span className="text-green-600 mt-0.5 flex-shrink-0">✓</span>
                              <span>Complimentary WiFi included</span>
                            </div>
                            <div className="flex items-start gap-1.5">
                              <span className="text-green-600 mt-0.5 flex-shrink-0">✓</span>
                              <span>24/7 Room Service</span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleViewDetails(ratePlan)}
                            className="text-xs md:text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
                          >
                            View Details →
                          </button>
                        </>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-2 sm:min-w-[180px] md:min-w-[200px]">
                      {!isCollapsed && (
                        <div className="text-left sm:text-right">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xl md:text-2xl font-bold text-orange-600">
                              {currency === 'USD' ? '$' : currency} {basePrice.toLocaleString()}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">per night</span>
                        </div>
                      )}

                      <button
                        onClick={() => handleBookNowClick(ratePlan)}
                        disabled={isLoadingForRatePlan(ratePlan.ratePlanCode) || isExpanded}
                        style={{
                          backgroundColor: primaryColor || '#FF6B35',  // ✅ Add fallback
                          color: buttonTextColor || '#FFFFFF'  // ✅ Add fallback
                        }}
                        className="px-4 md:px-5 py-2 rounded-lg font-semibold text-sm md:text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg whitespace-nowrap hover:opacity-90"
                      >
                        {isLoadingForRatePlan(ratePlan.ratePlanCode) ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            <span>Loading...</span>
                          </div>
                        ) : isExpanded ? (
                          'Selected'
                        ) : (
                          'Book Now'
                        )}
                      </button>
                    </div>
                  </div>

                  {isCollapsed && !isExpanded && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => toggleRatePlanCollapse(ratePlan.ratePlanCode)}
                        className="flex items-center gap-1.5 text-xs md:text-sm text-gray-600 hover:text-gray-900 font-medium"
                      >
                        <ChevronDown size={16} />
                        Show rate plan details
                      </button>
                    </div>
                  )}

                  {!isCollapsed && !isExpanded && (
                    <button
                      onClick={() => toggleRatePlanCollapse(ratePlan.ratePlanCode)}
                      className="mt-2 text-xs md:text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                      <ChevronUp size={16} /> Collapse
                    </button>
                  )}
                </div>

                {/* Addons Section */}
                {isExpanded && addons && addons.length > 0 && (
                  <div ref={addonsRef} className="border-t-2 border-gray-200 bg-gradient-to-b from-orange-50 to-white p-4 md:p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg md:text-xl font-bold text-gray-900">Enhance Your Stay</h4>
                      <span className="text-xs md:text-sm text-gray-600">Optional Add-ons</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
                      {(showAllAddons ? addons : addons.slice(0, 2)).map((addon) => {
                        const relevantAvailabilities = addon.availabilities.filter((av: any) =>
                          bookingDates.includes(av.date) && av.isActive
                        );

                        if (relevantAvailabilities.length === 0) return null;

                        return (
                          <div key={addon.id} className="bg-white border-2 border-gray-200 rounded-lg p-3 md:p-4 hover:border-orange-300 hover:shadow-md transition-all">
                            <div className="flex gap-3">
                              {addon.images?.[0] && (
                                <img
                                  src={addon.images[0]}
                                  alt={addon.name}
                                  className="w-20 h-20 md:w-24 md:h-24 rounded-lg object-cover flex-shrink-0 border border-gray-200"
                                />
                              )}

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start flex-wrap justify-between mb-1.5 gap-2">
                                  <h5 className="font-bold text-sm md:text-base text-gray-900 leading-tight">{addon.name}</h5>
                                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold whitespace-nowrap flex-shrink-0">
                                    {addon.type}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600 mb-2 line-clamp-2">{addon.description}</p>

                                <div className="space-y-1.5">
                                  {relevantAvailabilities.map((availability: any) => {
                                    const key = `${addon.id}-${availability.availabilityId}`;
                                    const currentQuantity = selectedAddons[key]?.quantity || 0;

                                    return (
                                      <div key={availability.availabilityId} className="flex flex-wrap items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-200 gap-2">
                                        <div className="flex-1">
                                          <p className="text-xs md:text-sm font-medium text-gray-800 truncate">
                                            {new Date(availability.date).toLocaleDateString('en-US', {
                                              weekday: 'short',
                                              month: 'short',
                                              day: 'numeric'
                                            })}
                                          </p>
                                          <p className="text-xs text-gray-600">${availability.price} each</p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-1.5">
                                          {currentQuantity > 0 && (
                                            <span className="text-xs font-semibold text-orange-600">
                                              ${(availability.price * currentQuantity).toLocaleString()}
                                            </span>
                                          )}
                                          <div className="flex items-center">
                                            <button
                                              onClick={() => handleAddonQuantityChange(addon, availability, Math.max(0, currentQuantity - 1))}
                                              disabled={currentQuantity === 0}
                                              className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                                            >
                                              <Minus size={12} />
                                            </button>
                                            <span className="w-7 text-center font-bold text-sm text-gray-900">{currentQuantity}</span>
                                            <button
                                              onClick={() => handleAddonQuantityChange(addon, availability, currentQuantity + 1)}
                                              style={{ backgroundColor: primaryColor, color: buttonTextColor }}
                                              className="w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center transition-colors hover:opacity-90"
                                            >
                                              <Plus size={12} />
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {addons.length > 2 && (
                      <button
                        onClick={() => setShowAllAddons(!showAllAddons)}
                        className="text-orange-600 hover:text-orange-700 font-semibold text-xs md:text-sm flex items-center gap-1 mb-3 hover:underline"
                      >
                        {showAllAddons ? 'Show Less' : `See ${addons.length - 2} More Add-ons`}
                        <ChevronRight size={14} className={`transform transition-transform ${showAllAddons ? 'rotate-90' : ''}`} />
                      </button>
                    )}

                    <div className="flex flex-col sm:flex-row justify-end gap-2">
                      <button
                        onClick={handleSkip}
                        className="flex items-center justify-center gap-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium text-sm transition-all duration-200 border border-gray-300 order-2 sm:order-1"
                      >
                        Skip <span className="font-bold text-base">&gt;&gt;</span>
                      </button>

                      <button
                        onClick={handleContinue}
                        style={{
                          backgroundColor: primaryColor,
                          color: buttonTextColor,
                          borderColor: primaryColor
                        }}
                        className="px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 shadow hover:shadow-md order-1 sm:order-2 hover:opacity-90"
                      >
                        {totalAddonsCount > 0
                          ? `Continue with ${totalAddonsCount} Add-on${totalAddonsCount > 1 ? 's' : ''}`
                          : 'Continue'}
                      </button>
                    </div>
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
        currencyCode={pendingRatePlan?.currencyCode || 'USD'}
      />
    </div>
  );
};

export default RoomCard;