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
  const [initialLoading, setInitialLoading] = useState(true); // NEW: For initial page load
  const [isExternalRequest, setIsExternalRequest] = useState(false); // Track if loading from external source
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
  const initializedRef = useRef(false); // Prevent double initialization
  const [roomsData, setRoomsData] = useState<any[]>([]);
  const [addons, setAddons] = useState<any[]>([]);
  const [propertyDetails, setPropertyDetails] = useState<any>(null);

  // Ref to track if we're loading from external source
  const isLoadingFromExternal = useRef(false);

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

    const rawRooms = bookingContext.numberOfRooms || bookingContext.guests?.rooms;
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
    const bookingCtx = payload || bookingContext;
    
    // ✅ Validate required fields before making API call
    if (!bookingCtx?.PropertyCode) {
      console.error("❌ Missing PropertyCode");
      setInitialLoading(false);
      return;
    }
    
    if (!bookingCtx?.startDate || !bookingCtx?.endDate) {
      console.error("❌ Missing dates");
      setInitialLoading(false);
      return;
    }
    
    if (!bookingCtx?.guests || typeof bookingCtx.guests.rooms !== 'number') {
      console.error("❌ Invalid guests data");
      setInitialLoading(false);
      return;
    }

    setLoadingRooms(true);
    setErrorRooms("");
    dispatch({ type: "rooms/setRooms", payload: [] });
    setRoomsData([]);
    setAddons([]);
    setPropertyDetails(null);
    setShowPriceSummary(false);
    setPriceSummaryData(null);

    console.log("🚀 Sending API request with:", bookingCtx);

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

      const propertyDetails = data.data?.propertyDetails;

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
      localStorage.setItem("bookingContext", JSON.stringify(updatedContext));

      if (bookingEngineColor) {
        const bookingStorage = {
          colors: {
            primaryColor: bookingEngineColor.primaryColor,
            secondaryColor: bookingEngineColor.secondaryColor,
            tertiaryColor: bookingEngineColor.tertiaryColor,
            buttonTextColor: bookingEngineColor.buttonTextColor,
            logoIcon: null
          },
          logoIcon: bookingEngineColor.logo
        };
        localStorage.setItem("bookingstorage", JSON.stringify(bookingStorage));
      } else {
        const defaultBookingStorage = {
          colors: {
            primaryColor: "#2F2A1F",
            secondaryColor: "#E8DFC9",
            tertiaryColor: "#7D7566",
            buttonTextColor: "#FFFFFF",
            logoIcon: null
          },
          logoIcon: null
        };
        localStorage.setItem("bookingstorage", JSON.stringify(defaultBookingStorage));
      }

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
      setInitialLoading(false); // ✅ Always turn off loader after API call
    }
  };

  const searchParams = useSearchParams();

  // NEW: Get booking data from URL params
  const getBookingDataFromParams = () => {
    const code = searchParams.get("code");
    const checkin = searchParams.get("checkin");
    const checkout = searchParams.get("checkout");
    const adults = searchParams.get("adults");
    const children = searchParams.get("children");
    const rooms = searchParams.get("rooms");

    // Check if we have external params (checkin/checkout indicates external source)
    const hasExternalParams = !!(code && (checkin || checkout || adults || children || rooms));
    
    if (hasExternalParams) {
      // Will be set in the initialization useEffect
      const today = new Date();
      today.setDate(today.getDate() + 1);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const defaultStartDate = today.toISOString().split("T")[0];
      const defaultEndDate = tomorrow.toISOString().split("T")[0];

      // Parse rooms data from localStorage if available
      let roomsArray = [];
      const numRooms = parseInt(rooms || "1");
      
      try {
        const storedContext = localStorage.getItem("bookingContext");
        if (storedContext) {
          const parsed = JSON.parse(storedContext);
          if (parsed.guests?.rooms && Array.isArray(parsed.guests.rooms)) {
            roomsArray = parsed.guests.rooms;
          } else if (parsed.roomsDetail && Array.isArray(parsed.roomsDetail)) {
            roomsArray = parsed.roomsDetail;
          }
        }
      } catch (e) {
        console.error("Error parsing localStorage:", e);
      }

      // If no rooms array, create default structure
      if (roomsArray.length === 0) {
        const totalAdults = parseInt(adults || "1");
        const totalChildren = parseInt(children || "0");
        
        // Distribute guests across rooms
        for (let i = 0; i < numRooms; i++) {
          roomsArray.push({
            adults: i === 0 ? totalAdults : 0,
            children: i === 0 ? totalChildren : 0
          });
        }
      }

      return {
        PropertyCode: code,
        startDate: checkin || defaultStartDate,
        endDate: checkout || defaultEndDate,
        guests: {
          rooms: numRooms, // ✅ Always send as number for API
          adults: parseInt(adults || "1"),
          children: parseInt(children || "0")
        },
        roomsDetail: roomsArray, // ✅ Keep detailed array separately
        location: "",
        numberOfRooms: numRooms,
        isExternal: true // Mark this as external request
      };
    }

    return null;
  };

  // NEW: Initialize booking context from URL params or localStorage
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const initBookingContext = async () => {
      // Get default dates
      const today = new Date();
      today.setDate(today.getDate() + 1);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const defaultStartDate = today.toISOString().split("T")[0];
      const defaultEndDate = tomorrow.toISOString().split("T")[0];

      // First, try to get data from URL params
      const paramsData = getBookingDataFromParams();
      
      if (paramsData) {
        // Data from external source (URL params)
        console.log("📥 Loading from URL params:", paramsData);
        
        // Mark as external and show loader
        setIsExternalRequest(true);
        setInitialLoading(true);
        isLoadingFromExternal.current = true; // Prevent SearchWidget from triggering
        
        // Ensure dates are set
        const contextWithDates = {
          ...paramsData,
          startDate: paramsData.startDate || defaultStartDate,
          endDate: paramsData.endDate || defaultEndDate,
          numberOfRooms: paramsData.numberOfRooms || 1,
          location: paramsData.location || ""
        };
        
        dispatch(setBookingContext(contextWithDates));
        localStorage.setItem("bookingContext", JSON.stringify(contextWithDates));
        await handleSearchStart(contextWithDates);
        isLoadingFromExternal.current = false; // Allow SearchWidget after initial load
      } else {
        // No URL params, check localStorage
        const storedContext = localStorage.getItem("bookingContext");
        
        if (storedContext) {
          const parsedContext = JSON.parse(storedContext);
          
          // Validate stored context has required fields
          const validatedContext = {
            ...parsedContext,
            PropertyCode: parsedContext.PropertyCode || searchParams.get("code") || "WOQDD3",
            startDate: parsedContext.startDate || defaultStartDate,
            endDate: parsedContext.endDate || defaultEndDate,
            guests: parsedContext.guests || {
              rooms: 1,
              adults: 1,
              children: 0
            },
            location: parsedContext.location || "",
            numberOfRooms: parsedContext.numberOfRooms || parsedContext.guests?.rooms || 1
          };
          
          console.log("💾 Loading from localStorage:", validatedContext);
          dispatch(setBookingContext(validatedContext));
          localStorage.setItem("bookingContext", JSON.stringify(validatedContext));
          await handleSearchStart(validatedContext);
        } else {
          // No data at all, create default
          const urlCode = searchParams.get("code") || "WOQDD3";

          const defaultContext = {
            PropertyCode: urlCode,
            startDate: defaultStartDate,
            endDate: defaultEndDate,
            guests: {
              rooms: 1,
              adults: 1,
              children: 0
            },
            location: "",
            numberOfRooms: 1
          };

          console.log("🆕 Creating default context:", defaultContext);
          dispatch(setBookingContext(defaultContext));
          localStorage.setItem("bookingContext", JSON.stringify(defaultContext));
          await handleSearchStart(defaultContext);
        }
      }
    };

    initBookingContext();
  }, []);

  // Handle property code changes
  useEffect(() => {
    if (!initializedRef.current) return; // Only run after initialization
    if (isLoadingFromExternal.current) return; // Don't run during external load
    
    const urlCode = searchParams.get("code");
    
    if (urlCode && urlCode !== bookingContext.PropertyCode) {
      console.log("🔄 Property code changed in URL:", urlCode);
      
      // Ensure we have valid dates
      const today = new Date();
      today.setDate(today.getDate() + 1);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      
      const updatedContext = {
        ...bookingContext,
        PropertyCode: urlCode,
        startDate: bookingContext.startDate || today.toISOString().split("T")[0],
        endDate: bookingContext.endDate || tomorrow.toISOString().split("T")[0],
        numberOfRooms: bookingContext.numberOfRooms || bookingContext.guests?.rooms || 1,
        location: bookingContext.location || ""
      };

      dispatch(setBookingContext(updatedContext));
      localStorage.setItem("bookingContext", JSON.stringify(updatedContext));
      handleSearchStart(updatedContext);
    }
  }, [searchParams.get("code")]);

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

  const handleCloseUrgencyBanner = () => {
    setShowUrgencyBanner(false);
    localStorage.setItem('urgencyBannerDismissed', 'true');
  };

  useEffect(() => {
    const isDismissed = localStorage.getItem('urgencyBannerDismissed');
    if (isDismissed === 'true') {
      setShowUrgencyBanner(true);
      localStorage.setItem('urgencyBannerDismissed', 'false');
    }
  }, []);

  const availableBoardTypes = Array.from(
    new Set(
      roomsData
        .filter((room: Room) => room.has_valid_rate)
        .flatMap((room: Room) =>
          room.room_price.map((rp: any) => rp.ratePlanName)
        )
    )
  );

  const handleOpenUrgencyModal = () => {
    setUrgencyModalOpen(true);
  };

  // NEW: Simple spinner loader for external requests only
  if (initialLoading && isExternalRequest) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

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
        onLoad={() => setLoaded(true)}
      >
        <div className="sticky top-0 z-40 bg-white/90 backdrop-blur shadow-sm">
          <SearchWidget 
            onSearchStart={(payload) => {
              // Don't trigger if we're loading from external source
              if (!isLoadingFromExternal.current) {
                handleSearchStart(payload);
              }
            }} 
          />
        </div>

        <div className="px-4 pb-2">
          <div className="max-w-7xl mx-auto mt-10">
            <div className="flex gap-6">
              <div className={`flex-1 ${showPriceSummary ? 'lg:w-2/3' : 'w-full'} transition-all duration-300`}>
                {showUrgencyBanner && (
                  <div className="relative mb-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                      <div className="relative">
                        <button
                          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors z-10"
                          onClick={handleCloseUrgencyBanner}
                          aria-label="Close urgency message"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>

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

                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                      <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shadow-md border border-amber-200">
                        <MessageCircle />
                      </div>
                    </div>

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

                <div className="mb-6 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex items-center gap-2 flex-1">
                      <Building2 className="w-5 h-5 text-gray-700" />
                      <span className="text-sm md:text-base font-medium text-gray-900">
                        {roomsData.filter((room: Room) => room.has_valid_rate).length} Types of rooms available at {bookingContext?.hotelName || 'this hotel'}
                      </span>
                    </div>

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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <Select value={selectedBoardType} onValueChange={setSelectedBoardType}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select board type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All board types</SelectItem>
                        {availableBoardTypes.map((boardType) => {
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
                      <div className="space-y-8 rounded-xl md:p-4">
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