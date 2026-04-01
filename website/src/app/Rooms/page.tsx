"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/store";
import SearchWidget from "../../components/Home/SearchWidget";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  setBookingContext,
  setBookingSource,
  setSenderUrl,
} from "../../store/bookingSlice";
import { useBookingColors } from "../../hooks/useBookingColors";
import RoomCard from "@/src/components/RoomPage/RoomCard";
import PriceSummarySidebar from "../../components/RoomPage/Pricesummerysidebar";
import { Room } from "@/src/store/roomsSlice";
import GuestFormModal from "../../components/GuestModals/GuestFormModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog";
import { IPropertyLoyalityWithLoyality } from "./interface";
import { LoyaltyProgramBanner } from "@/src/components/RoomPage/LoyalityBanner";
import { LoyaltyContainer } from "../../components/RoomPage/LoyalityContainer";
import { useTranslation } from "react-i18next";
import { Volume2, VolumeX } from "lucide-react";

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
  // Core PriceBrakeDown fields (from new booking-engine API)
  totalAmount: number;
  amountBeforeTax: number;
  taxedAmount: number;
  totalAddonAmount: number;
  totalPromotionAmount: number;
  currentChargeableAmount: number;
  latterpayableAmount: number;
  promoCodeDiscount: number;
  loyalityDiscount: number;
  currencyCode: string;
  dailyPriceBrakeDown: any[];
  taxBrakeDown: any[];
  addonBrakeDown: any[];
  promotionBrakeDown: any[];
  // Computed backward-compat fields (added by normalizePriceBrakeDown)
  numberOfNights: number;
  baseRatePerNight: number;
  requestedRooms: number;
  additionalGuestCharges: number;
  totalTaxAmount: number;
  dailyBreakdown: any[];
  // Legacy optional
  availableRooms?: number;
  addons?: any[];
}

interface PriceSummaryData {
  room: Room;
  ratePlan: any;
  selectedAddons: any[];
  basePrice: number;
  totalAddonsPrice: number;
  finalprice?: any;
}

function normalizePriceBrakeDown(
  raw: any,
  opts: { noOfRooms: number; ratePlanCode: string },
): any {
  if (!raw) return raw;
  const numberOfNights = new Set(
    raw.dailyPriceBrakeDown.map((d: any) => d.date),
  ).size;
  const baseRatePerNight: number =
    numberOfNights > 0 ? raw.amountBeforeTax / numberOfNights : 0;
  const additionalGuestCharges: number = (raw.dailyPriceBrakeDown ?? []).reduce(
    (s: number, d: any) => s + (d.additionalChargesAmount ?? 0),
    0,
  );
  const dailyBreakdown = (raw.dailyPriceBrakeDown ?? []).map((d: any) => ({
    ...d,
    ratePlanCode: opts.ratePlanCode,
    dayOfWeek: new Date(d.date).toLocaleDateString("en-US", {
      weekday: "long",
    }),
    baseRate: d.baseChargesAmount,
    totalPerRoom: d.totalAmount,
    totalForAllRooms: d.totalAmount * opts.noOfRooms,
    currencyCode: d.currencyCode,
  }));
  return {
    ...raw,
    numberOfNights,
    baseRatePerNight,
    requestedRooms: opts.noOfRooms,
    additionalGuestCharges,
    totalTaxAmount: raw.taxedAmount,
    dailyBreakdown,
  };
}

const Rooms = () => {
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const { t } = useTranslation();
  const [urgencyModalOpen, setUrgencyModalOpen] = useState(false);
  const [selectedBoardType, setSelectedBoardType] = useState("all");
  const [showUrgencyBanner, setShowUrgencyBanner] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true); // NEW: For initial page load
  const [isExternalRequest, setIsExternalRequest] = useState(false); // Track if loading from external source
  const dispatch = useDispatch();
  const router = useRouter();
  const bookingContext = useSelector((state: RootState) => state.booking);
  const [bookingSelectedPromotions, setBookingSelectedPromotions] = useState<
    any[]
  >([]);
  const [bookingRoom, setBookingRoom] = useState<Room | null>(null);
  const [currentRatePlan, setCurrentRatePlan] = useState<any>(null);
  const [selectedAddons, setSelectedAddons] = useState<any[]>([]);
  const [guestForms, setGuestForms] = useState<Guest[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loyaltyMemberEmail, setLoyaltyMemberEmail] = useState<string>("");
  // Controls LoyaltyContainer's modal only; LoyaltyProgramBanner manages its own modal state
  const [showLoyaltySignup, setShowLoyaltySignup] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    email: "",
    phoneNumber: "",
  });
  const [price, setPrice] = useState<number | null>(null);
  const [errorRooms, setErrorRooms] = useState<string | null>(null);
  // const [loadingRooms, setLoadingRooms] = useState<boolean>(false);
  const [loadingBookNow, setLoadingBookNow] = useState<string | null>(null);
  const initializedRef = useRef(false); // Prevent double initialization
  const [roomsData, setRoomsData] = useState<any[]>([]);
  const [addons, setAddons] = useState<any[]>([]);
  const [propertyDetails, setPropertyDetails] = useState<any>(null);

  // Ref to track if we're loading from external source
  const isLoadingFromExternal = useRef(false);

  // Price summary sidebar state
  const [showPriceSummary, setShowPriceSummary] = useState(false);
  const [priceSummaryData, setPriceSummaryData] =
    useState<PriceSummaryData | null>(null);
  const [loyaltyProgram, setLoyaltyProgram] =
    useState<IPropertyLoyalityWithLoyality | null>(null);

  const [finalPrice, setFinalPrice] = useState<FinalPrice | null>(null);

  const handlePriceUpdate = (data: PriceSummaryData) => {
    setPriceSummaryData(data);
    setShowPriceSummary(true);
  };

  const handleBookNow = (
    room: Room,
    ratePlan: any,
    selectedAddonsList: any[],
    selectedPromotionsList: any[],
    priceData: any,
  ) => {
    setBookingSelectedPromotions(selectedPromotionsList);

    const rawRooms =
      bookingContext.numberOfRooms || bookingContext.guests?.rooms;
    let allGuests: Guest[] = [];
    let noOfAdults = 1;
    let noOfChildrens = 0;
    let noOfRooms = 1;

    if (Array.isArray(rawRooms)) {
      noOfRooms = rawRooms.length;
      rawRooms.forEach((rm) => {
        for (let i = 0; i < (rm.adults || 0); i++) {
          allGuests.push({
            type: "adult",
            firstName: "",
            lastName: "",
            dateOfBirth: "",
          });
        }
        for (let i = 0; i < (rm.children || 0); i++) {
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
      noOfRooms =
        typeof bookingContext.guests?.rooms === "number"
          ? bookingContext.guests.rooms
          : Array.isArray(bookingContext.guests?.rooms)
            ? bookingContext.guests.rooms.length
            : 1;

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

    // Normalize the PriceBrakeDown response into the shape the rest of the app needs
    const normalized = normalizePriceBrakeDown(priceData, {
      noOfRooms,
      ratePlanCode: ratePlan.ratePlanCode,
    });

    setFinalPrice(normalized);
    setPrice(normalized?.totalAmount ?? null);
    setBookingRoom(room);
    setCurrentRatePlan(ratePlan);
    setSelectedAddons(selectedAddonsList);
    setShowPriceSummary(false);
  };

  const handleGuestDetailChange = (
    index: number,
    field: keyof Guest,
    value: string,
  ) => {
    setGuestForms((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleContactChange = (
    field: "email" | "phoneNumber",
    value: string,
  ) => {
    setContactInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearchStart = async (payload: any) => {
    // console.log("booking call", payload);
    const bookingCtx = payload || bookingContext;

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

    // Derive rooms count from whichever shape guests data is in
    const guestsRoomsCount =
      typeof bookingCtx.guests?.rooms === "number"
        ? bookingCtx.guests.rooms
        : Array.isArray(bookingCtx.guests?.roomsArray)
          ? bookingCtx.guests.roomsArray.length
          : Array.isArray(bookingCtx.guests?.rooms)
            ? bookingCtx.guests.rooms.length
            : 1;

    if (
      !bookingCtx?.guests ||
      (!bookingCtx.guests.rooms && !bookingCtx.guests.roomsArray)
    ) {
      console.error("❌ Invalid guests data");
      setInitialLoading(false);
      return;
    }

    setInitialLoading(true);
    setErrorRooms("");
    dispatch({ type: "rooms/setRooms", payload: [] });
    setRoomsData([]);
    setAddons([]);
    setPropertyDetails(null);
    setShowPriceSummary(false);
    setPriceSummaryData(null);
    setLoyaltyProgram(null);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking-engine/fetch-rooms`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            propertyCode: bookingCtx.PropertyCode,
            startDate: bookingCtx.startDate,
            endDate: bookingCtx.endDate,
            guests: {
              rooms: guestsRoomsCount,
              adults: bookingCtx.guests.adults || 1,
              children: bookingCtx.guests.children || 0,
              roomsArray: bookingCtx.guests.roomsArray || undefined,
            },
            location: bookingCtx.location || "",
            numberOfRooms: guestsRoomsCount,
            promocode: bookingCtx.promocode || "",
          }),
        },
      );
      const data = await response.json();
      //console.log(data)
      if (!response.ok || data.status === "fail") {
        const msg = data.message || t("Rooms.failedToLoad");
        toast.error(msg);
        dispatch({ type: "rooms/setRooms", payload: [] });
        return;
      }

      const propertyDetails = data.data?.propertyDetails;
      setLoyaltyProgram(propertyDetails?.loyaltyProgramConfig || null);
      const bookingEngineColor = propertyDetails?.bookingEngineConfig
        ? {
          primaryColor: propertyDetails.bookingEngineConfig.primaryColor,
          secondaryColor: propertyDetails.bookingEngineConfig.secondaryColor,
          tertiaryColor: propertyDetails.bookingEngineConfig.tertiaryColor,
          buttonTextColor:
            propertyDetails.bookingEngineConfig.buttonTextColor,
          bgImage: propertyDetails.bookingEngineConfig.bannerImage,
          logo: propertyDetails.bookingEngineConfig.logo,
        }
        : undefined;

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

      // Check for loyalty membership
      if (propertyDetails?.id) {
        const storedEmail = localStorage.getItem(
          `loyalty_member_${propertyDetails.id}`,
        );
        if (storedEmail) {
          setLoyaltyMemberEmail(storedEmail);
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || t("Rooms.somethingWentWrong"));
      dispatch({ type: "rooms/setRooms", payload: [] });
    } finally {
      setInitialLoading(false);
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
    const promocode = searchParams.get("promoCode");
    const bookingSource = searchParams.get("utm_source") || "direct";

    // Check if we have external params (checkin/checkout indicates external source)
    const hasExternalParams = !!(
      code &&
      (checkin || checkout || adults || children || rooms)
    );

    if (hasExternalParams) {
      // Will be set in the initialization useEffect
      const today = new Date();
      today.setDate(today.getDate() + 1);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const defaultStartDate = today.toISOString().split("T")[0];
      const defaultEndDate = tomorrow.toISOString().split("T")[0];

      let roomsArray: { adults: number; children: number; childAges: number[] }[] = [];
      const numRooms = parseInt(rooms || "1");

      const buildRoomsArrayFallback = (
        numRooms: number,
        totalAdults: number,
        totalChildren: number,
      ) => {
        const MAX_PER_ROOM = 8;
        const roomsArray = [];
        let remainingAdults = totalAdults - numRooms;
        let remainingChildren = totalChildren;
        if (remainingAdults < 0) {
          remainingAdults = 0;
        }
        for (let i = 0; i < numRooms; i++) {
          let roomAdults = 1;
          let roomChildren = 0;
          const adultSpace = MAX_PER_ROOM - roomAdults;
          const adultsToAdd = Math.min(remainingAdults, adultSpace);
          roomAdults += adultsToAdd;
          remainingAdults -= adultsToAdd;
          const childSpace = MAX_PER_ROOM - roomAdults;
          const childrenToAdd = Math.min(remainingChildren, childSpace);
          roomChildren = childrenToAdd;
          remainingChildren -= childrenToAdd;
          roomsArray.push({
            adults: roomAdults,
            children: roomChildren,
            childAges: Array(roomChildren).fill(0),
          });
        }
        return roomsArray;
      };

      // If no rooms array from localStorage, build it with fallback
      if (roomsArray.length === 0) {
        const totalAdults = parseInt(adults || "1");
        const totalChildren = parseInt(children || "0");

        // ✅ Replace the old dumb distribution with smart fallback
        roomsArray = buildRoomsArrayFallback(
          numRooms,
          totalAdults,
          totalChildren,
        );
      }

      return {
        PropertyCode: code,
        startDate: checkin || defaultStartDate,
        endDate: checkout || defaultEndDate,
        guests: {
          rooms: numRooms,
          adults: parseInt(adults || "1"),
          children: parseInt(children || "0"),
          roomsArray,
        },
        location: "",
        numberOfRooms: numRooms,
        promocode: promocode || "",
        isExternal: true,
        bookingSource: bookingSource,
      };
    }

    return null;
  };

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const initBookingContext = async () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const defaultStartDate = today.toISOString().split("T")[0];
      const defaultEndDate = tomorrow.toISOString().split("T")[0];

      const paramsData = getBookingDataFromParams();

      if (paramsData) {

        setIsExternalRequest(true);
        setInitialLoading(true);
        isLoadingFromExternal.current = true;

        const contextWithDates = {
          ...paramsData,
          startDate: paramsData.startDate || defaultStartDate,
          endDate: paramsData.endDate || defaultEndDate,
          numberOfRooms: paramsData.numberOfRooms || 1,
          location: paramsData.location || "",
          promocode: paramsData.promocode || "",
        };
        dispatch(setBookingSource(paramsData.bookingSource));
        dispatch(setBookingContext(contextWithDates));
        const referrer = document.referrer;
        if (referrer) {
          dispatch(setSenderUrl(referrer));
          sessionStorage.setItem("senderUrl", referrer);
        }
        await handleSearchStart(contextWithDates);
        isLoadingFromExternal.current = false;
      } else {
        const hasValidReduxState =
          bookingContext?.PropertyCode &&
          bookingContext?.startDate &&
          bookingContext?.endDate;

        if (hasValidReduxState) {
          await handleSearchStart(bookingContext);
        } else {
          const urlCode = searchParams.get("code") || "4BTXDZ";

          const defaultContext = {
            PropertyCode: urlCode,
            startDate: defaultStartDate,
            endDate: defaultEndDate,
            guests: {
              rooms: 1,
              adults: 1,
              children: 0,
              roomsArray: [
                {
                  adults: 1,
                  children: 0,
                  childAges: [],
                },
              ],
            },
            location: "",
            numberOfRooms: 1,
            promocode: "",
          };

          dispatch(setBookingContext(defaultContext));
          await handleSearchStart(defaultContext);
        }
      }
    };

    initBookingContext();
  }, []);

  useEffect(() => {
    if (!initializedRef.current) return;
    if (isLoadingFromExternal.current) return;

    const urlCode = searchParams.get("code");
    if (initialLoading) return;

    if (urlCode && urlCode !== bookingContext.PropertyCode) {
      const today = new Date();
      today.setDate(today.getDate() + 1);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const updatedContext = {
        ...bookingContext,
        PropertyCode: urlCode,
        startDate:
          bookingContext.startDate || today.toISOString().split("T")[0],
        endDate: bookingContext.endDate || tomorrow.toISOString().split("T")[0],
        numberOfRooms:
          typeof bookingContext.guests?.rooms === "number"
            ? bookingContext.guests.rooms
            : Array.isArray(bookingContext.guests?.rooms)
              ? bookingContext.guests.rooms.length
              : 1,
        location: bookingContext.location || "",
      };

      dispatch(setBookingContext(updatedContext));
      handleSearchStart(updatedContext);
    }
  }, [searchParams.get("code")]);

  const bgImage =
    bookingContext?.bookingEngineColor?.bgImage ||
    bookingContext?.PropertyDetails?.image?.[0];

  useEffect(() => {
    if (!bgImage) {
      setLoaded(true);
      return;
    }
    setLoaded(false);
    const img = new Image();
    img.src = bgImage;
    img.onload = () => setLoaded(true);
    img.onerror = () => setLoaded(true);
  }, [bgImage]);

  const { primaryColor } = useBookingColors();

  const availableBoardTypes = Array.from(
    new Set(
      roomsData
        .filter((room: Room) => room.hasValidRate)
        .flatMap((room: Room) =>
          room.roomPrice.map((rp: any) => rp.ratePlanName),
        ),
    ),
  );

  if (initialLoading) {
    return (
      <div className="w-full min-h-screen bg-gray-50">
        {/* Navbar Skeleton */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-20 lg:h-24">
              <div className="w-28 h-10 bg-gray-200 rounded-lg animate-pulse" />
              <div className="hidden lg:flex items-center gap-6">
                <div className="w-24 h-8 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* SearchWidget Skeleton */}
        <div className="w-full bg-[#F4EFE6] border-b border-[#D4CABA] px-4 py-3 mt-20 lg:mt-24">
          <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
            <div className="w-32 h-12 bg-gray-200 rounded-lg animate-pulse" />
            <div className="hidden md:flex items-center gap-4">
              <div className="w-64 h-14 bg-gray-200 rounded-[40px] animate-pulse" />
              <div className="w-32 h-14 bg-gray-200 rounded-xl animate-pulse" />
              <div className="w-24 h-8 bg-gray-200 rounded-lg animate-pulse" />
              <div className="w-28 h-12 bg-gray-200 rounded-full animate-pulse" />
            </div>
            <div className="w-24 h-6 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="max-w-7xl mx-auto px-4 py-6 mt-4 space-y-6">
          {/* Urgency banner skeleton */}
          <div className="w-full h-16 bg-gray-200 rounded-xl animate-pulse" />

          {/* Room cards skeleton */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden animate-pulse"
            >
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-72 h-52 bg-gray-200 flex-shrink-0" />
                <div className="flex-1 p-5 space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-1/3" />
                  <div className="flex gap-2">
                    <div className="h-5 w-16 bg-gray-200 rounded-full" />
                    <div className="h-5 w-20 bg-gray-200 rounded-full" />
                    <div className="h-5 w-14 bg-gray-200 rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-4/5" />
                    <div className="h-4 bg-gray-200 rounded w-3/5" />
                  </div>
                  <div className="flex gap-3">
                    {[1, 2, 3, 4].map((j) => (
                      <div
                        key={j}
                        className="h-8 w-20 bg-gray-200 rounded-lg"
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="space-y-1">
                      <div className="h-4 w-20 bg-gray-200 rounded" />
                      <div className="h-8 w-32 bg-gray-200 rounded" />
                    </div>
                    <div className="h-11 w-32 bg-gray-200 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Skeleton */}
        <footer className="fixed bottom-0 left-0 right-0 z-[9999] bg-white">
          <div className="bg-gray-200 animate-pulse">
            <div className="max-w-7xl mx-auto px-6 py-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="w-32 h-20 bg-gray-300 rounded-lg flex-shrink-0" />
                <div className="flex-1 max-w-2xl space-y-2 text-center">
                  <div className="h-4 bg-gray-300 rounded w-full" />
                  <div className="h-4 bg-gray-300 rounded w-4/5 mx-auto" />
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="w-6 h-6 bg-gray-300 rounded-full" />
                  <div className="w-6 h-6 bg-gray-300 rounded-full" />
                  <div className="w-6 h-6 bg-gray-300 rounded-full" />
                </div>
              </div>
            </div>
          </div>
          <div className="py-3 border-t bg-white">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-2">
              <div className="h-4 w-72 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </footer>
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
        <div className=" z-40 bg-white/90 backdrop-blur shadow-sm">
          <SearchWidget
            onSearchStart={(payload) => {
              // Don't trigger if we're loading from external source
              if (!isLoadingFromExternal.current) {
                handleSearchStart(payload);
              }
            }}
          />
        </div>
        <div className="px-4 py-3">
          <div className="max-w-7xl mx-auto">
            {showUrgencyBanner && (
              <div className="mb-4 relative">
                <div
                  className="rounded-xl p-4 shadow-md border-2"
                  style={{
                    backgroundColor: `${primaryColor}15`,
                    borderColor: `${primaryColor}40`,
                  }}
                >
                  <button
                    onClick={() => {
                      setShowUrgencyBanner(false);
                    }}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 uppercase">
                      {t("Rooms.urgencyBanner.title")}
                    </h3>
                    <p className="text-sm font-semibold text-gray-700 uppercase">
                      {t("Rooms.urgencyBanner.subtitle")}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {propertyDetails?.propertyVideos && (
                <div
                  className={`${loyaltyProgram ? "lg:col-span-7" : "lg:col-span-12"}`}
                >
                  <div
                    className="rounded-xl shadow-md border overflow-hidden h-full"
                    style={{ borderColor: `${primaryColor}40` }}
                  >
                    <div
                      className={`relative w-full ${loyaltyProgram ? "h-[348px]" : "h-[350px]"}`}
                    >

                      <video
                        className="w-full h-full object-cover"
                        autoPlay
                        loop
                        muted={isMuted}
                        // playsInline
                        src={propertyDetails.propertyVideos.url}
                      >
                        Your browser does not support the video.
                      </video>
                      {/* Optional: Video Title Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                        <h3 className="text-white font-semibold text-lg">
                          {propertyDetails.propertyName} - {t("Rooms.videoOverlay")}
                        </h3>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMuted(!isMuted);
                        }}
                        className="absolute bottom-6 right-6 bg-black/50 hover:bg-black/70 backdrop-blur-sm p-2 rounded-full transition-all duration-200 z-10 text-white"
                        aria-label={isMuted ? "Unmute video" : "Mute video"}
                      >
                        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {loyaltyProgram && (
                <div
                  data-loyalty-banner=""
                  className={`${propertyDetails?.propertyVideos ? "lg:col-span-5" : "lg:col-span-12"}`}
                >
                  <LoyaltyProgramBanner
                    loyaltyProgram={loyaltyProgram}
                    primaryColor={primaryColor}
                    onSignUpSuccess={(email) => setLoyaltyMemberEmail(email)}
                    onLogoutSuccess={() => setLoyaltyMemberEmail("")}
                  />
                </div>
              )}
            </div>
            {/* mt-4 section — was the 3-bullet benefits + dismiss button div */}
            {loyaltyProgram && (
              <div className="mt-4">
                <LoyaltyContainer
                  loyaltyProgram={loyaltyProgram!}
                  primaryColor={primaryColor}
                  showSignUpModal={showLoyaltySignup}
                  onShowSignUpModalChange={setShowLoyaltySignup}
                  toggleOn={!!loyaltyMemberEmail}
                  onToggleChange={(isOn) => {
                    if (isOn) {
                      const storedEmail = localStorage.getItem(
                        `loyalty_member_${loyaltyProgram?.propertyId}`,
                      );
                      if (storedEmail) {
                        setLoyaltyMemberEmail(storedEmail);
                      }
                    } else {
                      setLoyaltyMemberEmail("");
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="px-4 pb-2">
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-6">
              <div
                className={`flex-1 ${showPriceSummary ? "lg:w-2/3" : "w-full"} transition-all duration-300`}
              >
                <div className=" p-2 sm:p-4 bg-white border border-gray-200 rounded-xl">
                  {initialLoading ? (
                    <div className="text-center py-20">
                      <div
                        className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 mx-auto"
                        style={{ borderColor: primaryColor }}
                      ></div>
                      <p className="mt-4 text-gray-600">{t("Rooms.searchingRooms")}</p>
                    </div>
                  ) : errorRooms ? (
                    <div className="text-center text-red-600 text-xl py-10 font-medium">
                      {errorRooms}
                    </div>
                  ) : roomsData.length === 0 ? (
                    <div className="text-center text-gray-600 text-xl py-10 font-medium">
                      {t("Rooms.noRoomsHotel")}
                    </div>
                  ) : roomsData.filter(
                    (room: Room) => room.hasValidRate === true,
                  ).length === 0 ? (
                    <div className="text-center py-10 text-gray-600 text-lg font-medium">
                      {t("Rooms.noRooms")}
                    </div>
                  ) : (
                    <div>
                      <div className="space-y-8 rounded-xl md:p-4">
                        {roomsData
                          .filter((room: Room) => room.hasValidRate)
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
                              loyaltyMemberEmail={loyaltyMemberEmail}
                              loyalty={loyaltyProgram}
                              onUnlockLoyalty={() => {
                                setShowLoyaltySignup(true);
                              }}
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
              {t("Rooms.modal.title")}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {t("Rooms.modal.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">
                {t("Rooms.modal.guarantee.title")}
              </h4>
              <p className="text-blue-700 text-sm">
                {t("Rooms.modal.guarantee.description")}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">{t("Rooms.modal.keyConditions")}</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></div>
                  <span>{t("Rooms.modal.conditions.one")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></div>
                  <span>{t("Rooms.modal.conditions.two")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></div>
                  <span>{t("Rooms.modal.conditions.three")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></div>
                  <span>{t("Rooms.modal.conditions.four")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></div>
                  <span>{t("Rooms.modal.conditions.five")}</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <strong>{t("Rooms.modal.note")}</strong> {t("Rooms.modal.noteText")}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Guest Form Modal */}
      {bookingRoom && price !== null && (
        <GuestFormModal
          guestForms={guestForms}
          contactInfo={contactInfo}
          price={price}
          finalPrice={finalPrice}
          bookingContext={bookingContext}
          loyaltyMemberEmail={loyaltyMemberEmail}
          propertyId={propertyDetails?.id || ""}
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
              roomName: bookingRoom.roomName,
              ratePlanCode: currentRatePlan.ratePlanCode,
              roomTypeCode: bookingRoom.roomType,
              guestDetails: guestForms,
              finalPrice: finalPrice,
              numberOfRooms: finalPrice?.requestedRooms || 1,
              propertyDetails: bookingContext.PropertyDetails,
              selectedAddons: selectedAddons,
              selectedPromotions: bookingSelectedPromotions,
            };

            // In the onSubmit handler (around line 1100):
            if (
              bookingSelectedPromotions &&
              bookingSelectedPromotions.length > 0
            ) {
              bookingData.selectedPromotions = bookingSelectedPromotions.map(
                (promotion: any) => ({
                  id: promotion.id,
                  promotionType: promotion.type,
                  promotionName: promotion.name || promotion.promotionName,
                  discountValue: promotion.discountValue,
                  discountType: promotion.discountType,
                }),
              );
            }

            dispatch({
              type: "booking/setFullBookingDetails",
              payload: bookingData,
            });

            document.cookie = "can_access_payment=true; path=/; max-age=300";
            router.push(
              `/Payment?code=${bookingContext.PropertyCode || searchParams.get("code")}`,
            );
          }}
        />
      )}
    </div>
  );
};

export default Rooms;