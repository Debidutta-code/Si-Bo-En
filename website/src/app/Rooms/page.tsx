"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/store";
import SearchWidget from "../../components/Home/SearchWidget";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { setBookingContext, setCurrency, setSenderUrl } from "../../store/bookingSlice";
import { useBookingColors } from "../../hooks/useBookingColors";
import RoomCard from "@/src/components/RoomPage/RoomCard";
import PriceSummarySidebar from "../../components/RoomPage/Pricesummerysidebar";
import { Room } from "@/src/store/roomsSlice";
import GuestFormModal from "../../components/GuestModals/GuestFormModal";
import { Building2, Calendar, MessageCircle, Moon, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog";

interface Guest {
  type: "adult" | "child";
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}

interface Addon {
  addonId: string;
  availabilityId: string;
  date: string;
  price: number;
  quantity: number;
  type: "PER_STAY" | "PER_NIGHT" | "ONCE";
  name: string;
  code: string;
}

interface DailyBreakdown {
  date: string;
  dayOfWeek: string;
  ratePlanCode: string;
  baseRate: number;
  additionalCharges: number;
  totalPerRoom: number;
  totalForAllRooms: number;
  currencyCode: string;
  childrenChargesBreakdown: any[];
  totalWithAddons: number;
}

interface Breakdown {
  totalBaseAmount: number;
  totalAdditionalCharges: number;
  totalAmount: number;
  numberOfNights: number;
  averagePerNight: number;
  totalAddonAmount?: number;
}

interface FinalPrice {
  totalAmount: number;
  numberOfNights: number;
  baseRatePerNight: number;
  additionalGuestCharges: number;
  breakdown: Breakdown;
  dailyBreakdown: DailyBreakdown[];
  availableRooms: number;
  requestedRooms: number;
  addons?: Addon[];
}

interface PriceSummaryData {
  room: Room;
  ratePlan: any;
  selectedAddons: any[];
  basePrice: number;
  totalAddonsPrice: number;
  finalprice?: any
}


const Rooms = () => {
  const { currency } = useSelector(
    (state: RootState) => state.booking
  );
  const [urgencyModalOpen, setUrgencyModalOpen] = useState(false);
  const [selectedBoardType, setSelectedBoardType] = useState("all");
  const [selectedCurrency, setSelectedCurrency] = useState(currency || "USD");
  const [showUrgencyBanner, setShowUrgencyBanner] = useState(true);
  const dispatch = useDispatch();
  const router = useRouter();
  const rooms = useSelector((state: RootState) => state.rooms.rooms);
  const bookingContext = useSelector((state: RootState) => state.booking);

  const [bookingRoom, setBookingRoom] = useState<Room | null>(null);
  const [currentRatePlan, setCurrentRatePlan] = useState<any>(null);
  const [selectedAddons, setSelectedAddons] = useState<any[]>([]);
  const [guestForms, setGuestForms] = useState<Guest[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    email: "",
    phoneNumber: "",
  });
  const [price, setPrice] = useState<number | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [errorPrice, setErrorPrice] = useState<string | null>(null);
  const [errorRooms, setErrorRooms] = useState<string | null>(null);
  const [loadingRooms, setLoadingRooms] = useState<boolean>(false);
  const [loadingBookNow, setLoadingBookNow] = useState<string | null>(null);
  const postMessageHandledRef = useRef(false);
  const [roomsData, setRoomsData] = useState<any[]>([]);
  const [addons, setAddons] = useState<any[]>([]);
  const [propertyDetails, setPropertyDetails] = useState<any>(null);

  // Price summary sidebar state
  const [showPriceSummary, setShowPriceSummary] = useState(false);
  const [priceSummaryData, setPriceSummaryData] = useState<PriceSummaryData | null>(null);

  const [finalPrice, setFinalPrice] = useState<FinalPrice | null>({
    totalAmount: 0,
    numberOfNights: 0,
    baseRatePerNight: 0,
    additionalGuestCharges: 0,
    breakdown: {
      totalBaseAmount: 0,
      totalAdditionalCharges: 0,
      totalAmount: 0,
      numberOfNights: 0,
      averagePerNight: 0,
      totalAddonAmount: 0,
    },
    dailyBreakdown: [],
    availableRooms: 0,
    requestedRooms: 0,
    addons: [],
  });

  const handlePriceUpdate = (data: PriceSummaryData) => {
    setPriceSummaryData(data);
    setShowPriceSummary(true);
  };
  const handleBookNow = async (room: Room, ratePlan: any, selectedAddonsList: any[]) => {
    setLoadingBookNow(`${room.id}-${ratePlan.ratePlanCode}`);
    setLoadingPrice(true);
    setErrorPrice(null);

    const rawRooms = bookingContext.guests?.rooms;
    let allGuests: Guest[] = [];
    let noOfAdults = 1;
    let noOfChildrens = 0;
    let noOfRooms = 1;

    if (Array.isArray(rawRooms)) {
      noOfRooms = rawRooms.length;
      rawRooms.forEach((room) => {
        for (let i = 0; i < (room.adults || 0); i++) {
          allGuests.push({
            type: "adult",
            firstName: "",
            lastName: "",
            dateOfBirth: "",
          });
        }
        for (let i = 0; i < (room.children || 0); i++) {
          allGuests.push({
            type: "child",
            firstName: "",
            lastName: "",
            dateOfBirth: "",
          });
        }
      });
      noOfAdults = allGuests.filter((g) => g.type === "adult").length;
      noOfChildrens = allGuests.filter((g) => g.type === "child").length;
    } else {
      noOfAdults = bookingContext.guests?.adults || 1;
      noOfChildrens = bookingContext.guests?.children || 0;
      noOfRooms = bookingContext.guests?.rooms || 1;
      for (let i = 0; i < noOfAdults; i++) {
        allGuests.push({
          type: "adult",
          firstName: "",
          lastName: "",
          dateOfBirth: "",
        });
      }
      for (let i = 0; i < noOfChildrens; i++) {
        allGuests.push({
          type: "child",
          firstName: "",
          lastName: "",
          dateOfBirth: "",
        });
      }
    }

    setGuestForms(allGuests);

    const payload: any = {
      propertyCode: bookingContext.PropertyCode,
      invTypeCode: room.room_type,
      ratePlanCode: ratePlan.ratePlanCode,
      startDate: bookingContext.startDate,
      endDate: bookingContext.endDate,
      noOfAdults,
      noOfChildrens,
      noOfRooms,
    };

    // Add addons to payload if selected
    if (selectedAddonsList && selectedAddonsList.length > 0) {
      payload.addons = selectedAddonsList.map(addon => ({
        addonId: addon.addonId,
        availabilityId: addon.availabilityId,
        date: addon.date,
        price: addon.price,
        quantity: addon.quantity,
        type: addon.type,
        name: addon.addonName,
        code: addon.addonCode,
      }));
    }

    try {
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
        const errMsg = data.message || "Failed to fetch price";
        toast.error(errMsg);
        setErrorPrice(errMsg);
        return;
      }

      setFinalPrice(data.data);
      setPrice(data?.data?.totalAmount || null);
      setBookingRoom(room);
      setCurrentRatePlan(ratePlan);
      setSelectedAddons(selectedAddonsList);

      // Hide price summary when showing guest modal
      setShowPriceSummary(false);
    } catch (error: any) {
      const errMsg =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again later.";

      setErrorPrice(errMsg);
      toast.error("Something went wrong. Please try again later.");
      console.error("Error fetching price:", errMsg);
    } finally {
      setLoadingPrice(false);
      setLoadingBookNow(null);
    }
  };

  const handleGuestDetailChange = (
    index: number,
    field: keyof Guest,
    value: string
  ) => {
    setGuestForms((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleContactChange = (
    field: "email" | "phoneNumber",
    value: string
  ) => {
    setContactInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearchStart = async (payload: any) => {
    setLoadingRooms(true);
    setErrorRooms("");
    dispatch({ type: "rooms/setRooms", payload: [] });
    setRoomsData([]);
    setAddons([]);
    setPropertyDetails(null);

    // Reset price summary when new search
    setShowPriceSummary(false);
    setPriceSummaryData(null);

    const bookingCtx = payload || bookingContext;
    if (!bookingCtx?.PropertyCode) {
      setLoadingRooms(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking-engine/fetch-rooms`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookingCtx),
        }
      );
      const data = await response.json();

      if (!response.ok || data.status === "fail") {
        const msg = data.message || "Failed to load rooms.";
        toast.error(msg);
        dispatch({ type: "rooms/setRooms", payload: [] });
        return;
      }

      // Extract property details from API response
      const propertyDetails = data.data?.propertyDetails;

      // Create booking engine color object from config
      const bookingEngineColor = propertyDetails?.bookingEngineConfig ? {
        primaryColor: propertyDetails.bookingEngineConfig.primaryColor,
        secondaryColor: propertyDetails.bookingEngineConfig.secondaryColor,
        tertiaryColor: propertyDetails.bookingEngineConfig.tertiaryColor,
        buttonTextColor: propertyDetails.bookingEngineConfig.buttonTextColor,
        bgImage: propertyDetails.bookingEngineConfig.bannerImage,
        logo: propertyDetails.bookingEngineConfig.logo
      } : undefined;

      const updatedContext = {
        ...bookingCtx,
        hotelName: data.propertyName || propertyDetails?.propertyName,
        PropertyDetails: propertyDetails,
        bookingEngineColor: bookingEngineColor,
      };

      dispatch(setBookingContext(updatedContext));

      dispatch({ type: "rooms/setRooms", payload: data.data || [] });
      setRoomsData(data.data?.rooms || []);
      setAddons(data.addons || []);
      setPropertyDetails(propertyDetails || null);

    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Something went wrong while fetching rooms.");
      dispatch({ type: "rooms/setRooms", payload: [] });
    } finally {
      setLoadingRooms(false);
    }
  };

  const searchParams = useSearchParams();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "bookingData") {
        const payload = event.data.payload;
        postMessageHandledRef.current = true;
        dispatch(setBookingContext(payload));
        dispatch(setSenderUrl(event.origin));
        sessionStorage.setItem("senderUrl", event.origin);
        localStorage.setItem("bookingContext", JSON.stringify(payload));
        handleSearchStart(payload);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [dispatch]);

  useEffect(() => {
    if (postMessageHandledRef.current) return;

    const initBookingContext = async () => {
      const urlCode = searchParams.get("code") || "WOQDD3";
      const storedContext = localStorage.getItem("bookingContext");
      const parsedContext = storedContext ? JSON.parse(storedContext) : {};

      const today = new Date();
      today.setDate(today.getDate() + 1);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const updatedContext = {
        ...parsedContext,
        PropertyCode: urlCode,
        startDate: parsedContext.startDate || today.toISOString().split("T")[0],
        endDate: parsedContext.endDate || tomorrow.toISOString().split("T")[0],
      };

      dispatch(setBookingContext(updatedContext));
      localStorage.setItem("bookingContext", JSON.stringify(updatedContext));
      await handleSearchStart(updatedContext);
    };

    initBookingContext();
  }, [dispatch, searchParams]);

  const bgImage =
    bookingContext?.bookingEngineColor?.bgImage ||
    bookingContext?.PropertyDetails?.image?.[0];

  useEffect(() => {
    if (!bgImage) return;

    setLoaded(false);
    const img = new Image();
    img.src = bgImage;
    img.onload = () => setLoaded(true);
    img.onerror = () => {
      console.error("Failed to load background image:", bgImage);
      setLoaded(true);
    };
  }, [bgImage]);

  const { primaryColor } = useBookingColors();

  // Close handler for urgency banner
  const handleCloseUrgencyBanner = () => {
    setShowUrgencyBanner(false);

    // Optional: Save to localStorage so it doesn't show again
    localStorage.setItem('urgencyBannerDismissed', 'true');
  };

  // Optional: Initialize banner visibility from localStorage
  useEffect(() => {
    const isDismissed = localStorage.getItem('urgencyBannerDismissed');
    if (isDismissed === 'true') {
      setShowUrgencyBanner(true);
      localStorage.setItem('urgencyBannerDismissed', 'false');
    }
  }, []);

  console.log("Rooms data:", roomsData);
  console.log("Booking context:", bookingContext);
  console.log("Property details:", propertyDetails);
  console.log("Addons:", addons);
  console.log("Final price:", finalPrice);
  console.log("Price summary data:", priceSummaryData);
  console.log("Selected board type:", selectedBoardType);
  console.log("Selected currency:", selectedCurrency);

  // Extract unique board types from all rooms
  const availableBoardTypes = Array.from(
    new Set(
      roomsData
        .filter((room: Room) => room.has_valid_rate)
        .flatMap((room: Room) =>
          room.room_price.map((rp: any) => rp.ratePlanName)
        )
    )
  );

  // Add this function
  const handleOpenUrgencyModal = () => {
    setUrgencyModalOpen(true);
  };

  return (
    <div className="w-full">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-400 border-t-transparent"></div>
        </div>
      )}
      <div
        className={`min-h-screen bg-cover bg-center bg-no-repeat transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"
          }`}
        // style={{ backgroundImage: `url(${bgImage})` }}
        onLoad={() => setLoaded(true)}
      >
        <div className="sticky top-0 z-40 bg-white/90 backdrop-blur shadow-sm">
          <SearchWidget
            onSearchStart={handleSearchStart} />
        </div>

        <div className="px-4 pb-2">
          <div className="max-w-7xl mx-auto mt-10">
            <div className="flex gap-6">
              {/* Main Content - Rooms List */}
              <div className={`flex-1 ${showPriceSummary ? 'lg:w-2/3' : 'w-full'} transition-all duration-300`}>
                {/* Urgency Banner */}
                {showUrgencyBanner && (
                  <div className="relative mb-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                      <div className="relative">
                        {/* Close button */}
                        <button
                          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors z-10"
                          onClick={handleCloseUrgencyBanner}
                          aria-label="Close urgency message"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>

                        {/* Main Text - moved up to make room for the clock icon */}
                        <div className="text-center px-6 pt-12 pb-4">
                          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                            YOU WILL GET THE BEST AVAILABLE PRICE IF YOU BOOK NOW!
                          </h3>
                          <p className="text-sm md:text-base text-gray-600 font-medium">
                            THE PRICES CAN RISE AT ANY MOMENT. DON'T WAIT ANY LONGER!
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Clock Icon positioned above the plus icon */}
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                      <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shadow-md border border-amber-200">
                        <MessageCircle />
                      </div>
                    </div>

                    {/* Plus Icon - Clickable */}
                    <div
                      className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 z-10 cursor-pointer"
                      onClick={handleOpenUrgencyModal}
                    >
                      <div className="w-7 h-7 rounded-full border-2 border-gray-800 flex items-center justify-center bg-white shadow-lg hover:bg-gray-50 transition-colors">
                        <Plus size={15} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Filter Section */}
                <div className="mb-6 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Room Types Info */}
                    <div className="flex items-center gap-2 flex-1">
                      <Building2 className="w-5 h-5 text-gray-700" />
                      <span className="text-sm md:text-base font-medium text-gray-900">
                        {roomsData.filter((room: Room) => room.has_valid_rate).length} Types of rooms available at {bookingContext?.hotelName || 'this hotel'}
                      </span>
                    </div>

                    {/* Date and Night Info */}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>From {bookingContext.startDate} to {bookingContext.endDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Moon className="w-4 h-4" />
                        <span>{(() => {
                          const start = new Date(bookingContext.startDate);
                          const end = new Date(bookingContext.endDate);
                          const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                          return `${nights} night${nights > 1 ? 's' : ''}`;
                        })()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Filter Dropdowns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {/* Board Type Filter */}
                    <Select value={selectedBoardType} onValueChange={setSelectedBoardType}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select board type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All board types</SelectItem>

                        {availableBoardTypes.map((boardType) => {
                          // Create a slug-like value for filtering (you'll use this later in RoomCard filtering)
                          const value = boardType
                            .toLowerCase()
                            .replace(/ & /g, "-")
                            .replace(/[^a-z0-9-]/g, "-")
                            .replace(/-+/g, "-");

                          return (
                            <SelectItem key={boardType} value={value}>
                              {boardType}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>

                    {/* Currency Filter */}
                    {/* <Select value={selectedCurrency} onValueChange={(value) => {
                      setSelectedCurrency(value);
                      dispatch(setCurrency(value));
                    }}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AED">United Arab Emirates dirham (د.إ)</SelectItem>
                        <SelectItem value="USD">United States Dollar ($)</SelectItem>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                        <SelectItem value="GBP">British Pound (£)</SelectItem>
                        <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                      </SelectContent>
                    </Select> */}
                  </div>
                </div>

                <div className="px-4 sm:px-4 py-4 bg-white border border-gray-200 rounded-xl">
                  {loadingRooms ? (
                    <div className="text-center py-20">
                      <div
                        className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 mx-auto"
                        style={{ borderColor: primaryColor }}
                      ></div>
                      <p className="mt-4 text-gray-600">Searching rooms...</p>
                    </div>
                  ) : errorRooms ? (
                    <div className="text-center text-red-600 text-xl py-10 font-medium">
                      {errorRooms}
                    </div>
                  ) : roomsData.length === 0 ? (
                    <div className="text-center text-gray-600 text-xl py-10 font-medium">
                      No rooms available for this hotel.
                    </div>
                  ) : roomsData.filter((room: Room) => room.has_valid_rate === true).length === 0 ? (
                    <div className="text-center py-10 text-gray-600 text-lg font-medium">
                      No rooms available
                    </div>
                  ) : (
                    <div>
                      {/* <h1
                        className="text-2xl font-semibold mb-6 mt-6"
                        style={{ color: primaryColor }}
                      >
                        Available Rooms
                      </h1> */}

                      <div className="space-y-8  rounded-xl md:p-4">
                        {roomsData
                          .filter((room: Room) => room.has_valid_rate)
                          .map((room: Room) => (
                            <RoomCard
                              key={room.id}
                              room={room}
                              propertyDetails={propertyDetails}
                              addons={addons}
                              bookingContext={bookingContext}
                              onBookNow={handleBookNow}
                              loadingBookNow={loadingBookNow}
                              onPriceUpdate={handlePriceUpdate}
                              selectedBoardType={selectedBoardType}
                            />
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Price Summary Sidebar */}
              {showPriceSummary && priceSummaryData && (
                <div className="hidden lg:block lg:w-82 xl:w-96">
                  <PriceSummarySidebar
                    bookingRoom={priceSummaryData.room}
                    currentRatePlan={priceSummaryData.ratePlan}
                    selectedAddons={priceSummaryData.selectedAddons}
                    basePrice={priceSummaryData.basePrice}
                    totalAddonsPrice={priceSummaryData.totalAddonsPrice}
                    finalPrice={priceSummaryData?.finalprice}
                    bookingContext={bookingContext}
                    onClose={() => {
                      setShowPriceSummary(false);
                      setPriceSummaryData(null);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Urgency Conditions Modal */}
      <Dialog open={urgencyModalOpen} onOpenChange={setUrgencyModalOpen}>
        <DialogContent className="sm:max-w-md md:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Conditions
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Exclusive advantage for bookings made on the official website
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Best Price Guarantee</h4>
              <p className="text-blue-700 text-sm">
                We guarantee that you won't find a lower price for the same room, dates, and conditions anywhere else online.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">Key Conditions:</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></div>
                  <span>Prices are subject to change and may increase at any time</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></div>
                  <span>Early booking discounts are only available through our official website</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></div>
                  <span>Limited availability - rooms may sell out quickly</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></div>
                  <span>Special promotions are exclusive to direct bookings</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></div>
                  <span>Flexible cancellation policies only apply to official website bookings</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <strong>Note:</strong> Booking through third-party websites or agents may result in higher prices and fewer benefits.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Guest Form Modal */}
      {bookingRoom && price && (
        <GuestFormModal
          guestForms={guestForms}
          contactInfo={contactInfo}
          price={price}
          finalPrice={finalPrice}
          loadingPrice={loadingPrice}
          errorPrice={errorPrice}
          bookingRoom={bookingRoom}
          bookingContext={bookingContext}
          onClose={() => {
            setBookingRoom(null);
            setCurrentRatePlan(null);
            setSelectedAddons([]);
          }}
          handleGuestDetailChange={handleGuestDetailChange}
          handleContactChange={handleContactChange}
          onSubmit={() => {
            if (!bookingRoom || !currentRatePlan) return;

            const bookingData = {
              PropertyCode: bookingContext.PropertyCode,
              startDate: bookingContext.startDate,
              endDate: bookingContext.endDate,
              guests: bookingContext.guests,
              location: bookingContext.location,
              roomId: bookingRoom.id,
              currency: currentRatePlan.currencycode,
              email: contactInfo.email,
              phone: contactInfo.phoneNumber,
              hotelName: bookingContext.hotelName,
              roomName: bookingRoom.room_name,
              ratePlanCode: currentRatePlan.ratePlanCode,
              roomTypeCode: bookingRoom.room_type,
              guestDetails: guestForms,
              finalPrice: finalPrice,
              numberOfRooms: finalPrice?.requestedRooms || 1,
              propertyDetails: bookingContext.PropertyDetails,
              selectedAddons: selectedAddons,
            };

            dispatch({
              type: "booking/setFullBookingDetails",
              payload: bookingData,
            });

            document.cookie = "can_access_payment=true; path=/; max-age=300";
            router.push("/Payment");
          }}
        />
      )}
    </div>
  );
};

export default Rooms;