"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/store";
import SearchWidget from "../../components/Home/SearchWidget";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { setBookingContext, setSenderUrl } from "../../store/bookingSlice";
import { useBookingColors } from "../../hooks/useBookingColors";
import RoomCard from "@/src/components/RoomPage/RoomCard";
import PriceSummarySidebar from "../../components/RoomPage/Pricesummerysidebar";
import { Room } from "@/src/store/roomsSlice";
import GuestFormModal from "../../components/GuestModals/GuestFormModal";

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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/rate-plan/getRoomRentPrice`,
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

      const updatedContext = {
        ...bookingCtx,
        hotelName: data.propertyName,
        PropertyDetails: data.propertyDetails,
        bookingEngineColor: data.bookingEngineColor,
      };
      dispatch(setBookingContext(updatedContext));

      dispatch({ type: "rooms/setRooms", payload: data.data || [] });
      setRoomsData(data.data?.rooms || []);
      setAddons(data.addons || []);
      setPropertyDetails(data.propertyDetails || null);
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
        style={{ backgroundImage: `url(${bgImage})` }}
        onLoad={() => setLoaded(true)}
      >
        <div className="sticky top-0 z-40 bg-white/90 backdrop-blur shadow-sm">
          <SearchWidget onSearchStart={handleSearchStart} />
        </div>

        <div className="px-4 pb-2">
          <div className="max-w-7xl mx-auto mt-10">
            <div className="flex gap-6">
              {/* Main Content - Rooms List */}
              <div className={`flex-1 ${showPriceSummary ? 'lg:w-2/3' : 'w-full'} transition-all duration-300`}>
                <div className="px-4 sm:px-6 py-2 bg-gray-200 rounded-xl">
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
                      <h1
                        className="text-2xl font-semibold mb-6 mt-6"
                        style={{ color: primaryColor }}
                      >
                        Available Rooms
                      </h1>
                      <div className="space-y-8 bg-gray-100 rounded-xl md:p-4">
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