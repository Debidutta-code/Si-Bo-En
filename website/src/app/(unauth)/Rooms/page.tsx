"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../store/store";
import SearchWidget from "../../../components/Home/SearchWidget";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  setBookingContext,
  setBookingSource,
  setSenderUrl,
} from "../../../store/bookingSlice";
import { useBookingColors } from "../../../hooks/useBookingColors";
import RoomCard from "@/src/components/RoomPage/RoomCard";
import GuestFormModal from "../../../components/GuestModals/GuestFormModal";
import { IPropertyLoyalityWithLoyality, IRoomDetails, IRoomPrice } from "./interface";
import { LoyaltyProgramBanner } from "@/src/components/RoomPage/LoyalityBanner";
import { LoyaltyContainer } from "../../../components/RoomPage/LoyalityContainer";
import { useTranslation } from "react-i18next";
import { Volume2, VolumeX } from "lucide-react";

import { usePropertyContext } from "@/src/components/context/property-context";
import { IFetchRoomsRequest, IFinalPrice, IGuest, IPriceSummaryData, IPropertyDetails, IRoom, ISelectedAddon, ISelectedPromotion } from "./types";
import { buildRoomsArrayFallback, fetchRoomsService, normalizePriceBreakdown } from "./services";
import { BookingConditionsModal, UrgencyBanner } from "./components";



const Rooms = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { propertyDetails, isLoading: propertyLoading } = usePropertyContext();
  const bookingContext = useSelector((state: RootState) => state.booking);
  const { primaryColor } = useBookingColors();

  // ─── Rooms state ──────────────────────────────────────────────────────────
  const [roomsData, setRoomsData] = useState<IRoomDetails[]>([]);
  // const [addons, setAddons] = useState<any[]>([]);
  const [loyaltyProgram, setLoyaltyProgram] =
    useState<IPropertyLoyalityWithLoyality | null>(null);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);

  // ─── Booking flow state ───────────────────────────────────────────────────
  const [bookingRoom, setBookingRoom] = useState<IRoom | null>(null);// state for showing selected room for booking
  const [currentRatePlan, setCurrentRatePlan] = useState<IRoomPrice | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<ISelectedAddon[]>([]);
  const [guestForms, setGuestForms] = useState<IGuest[]>([]);
  const [contactInfo, setContactInfo] = useState({ email: "", phoneNumber: "" });
  const [price, setPrice] = useState<number | null>(null);
  const [finalPrice, setFinalPrice] = useState<IFinalPrice | null>(null);
  const [bookingSelectedPromotions, setBookingSelectedPromotions] = useState<ISelectedPromotion[]>([]);
  // const [loadingBookNow, setLoadingBookNow] = useState<string | null>(null);

  // ─── Loyalty state ────────────────────────────────────────────────────────
  const [loyaltyDiscountInfo, setLoyaltyDiscountInfo] = useState<{
    type: string; value: number; currencyCode: string;
  } | null>(null);
  const [loyalityToogle, setLoyaltyToggle] = useState<boolean>(true);
  const [fetchedPropertyDetails, setFetchedPropertyDetails] = useState<IPropertyDetails | null>(null);
  const reproceedRef = useRef<((email: string) => Promise<void>) | null>(null);
  const [isFetchingStep2, setIsFetchingStep2] = useState(false);
  const [step2Error, setStep2Error] = useState<string | null>(null);

  const [isMuted, setIsMuted] = useState<boolean>(true);//property vedio muted
  const [bookingConditionsModal, setBookingConditionsModal] = useState<boolean>(false);
  const [showPriceSummary, setShowPriceSummary] = useState<boolean>(false);

  const isLoadingFromExternal = useRef(false);
  const bgImage =
    bookingContext?.bookingEngineColor?.bgImage ||
    bookingContext?.PropertyDetails?.image?.[0];


  const handleSearchStart = async (payload: any) => {
    const bookingCtx = payload || bookingContext;

    if (!bookingCtx?.PropertyCode || !bookingCtx?.startDate || !bookingCtx?.endDate) {
      console.error("❌ Missing required booking context fields");
      setInitialLoading(false);
      return;
    }

    const guestsRoomsCount =
      typeof bookingCtx.guests?.rooms === "number"
        ? bookingCtx.guests.rooms
        : Array.isArray(bookingCtx.guests?.roomsArray)
          ? bookingCtx.guests.roomsArray.length
          : Array.isArray(bookingCtx.guests?.rooms)
            ? bookingCtx.guests.rooms.length
            : 1;

    if (!bookingCtx?.guests || (!bookingCtx.guests.rooms && !bookingCtx.guests.roomsArray)) {
      console.error("❌ Invalid guests data");
      setInitialLoading(false);
      return;
    }

    setInitialLoading(true);
    dispatch({ type: "rooms/setRooms", payload: [] });
    setRoomsData([]);
    setShowPriceSummary(false);
    setLoyaltyProgram(null);

    const request: IFetchRoomsRequest = {
      propertyCode: bookingCtx.PropertyCode,
      startDate: bookingCtx.startDate,
      endDate: bookingCtx.endDate,
      guests: {
        rooms: guestsRoomsCount,
        adults: bookingCtx.guests.adults || 1,
        children: bookingCtx.guests.children || 0,
        roomsArray: bookingCtx.guests.roomsArray || [
          { adults: 1, children: 0, childAges: [] },
        ],
      },
      location: bookingCtx.location || "",
      numberOfRooms: guestsRoomsCount,
      promocode: bookingCtx.promocode || "",
    };

    const data = await fetchRoomsService(request);

    if (!data.success) {
      toast.error(data.message || t("Rooms.failedToLoad"));
      dispatch({ type: "rooms/setRooms", payload: [] });
      setInitialLoading(false);
      return;
    }

    setLoyaltyProgram(data.data?.propertyDetails?.loyaltyProgramConfig || null);
    setFetchedPropertyDetails(data.data?.propertyDetails);

    dispatch(
      setBookingContext({
        ...bookingCtx,
        propertyConfigs:
          data.data?.propertyDetails?.propertyConfigs || bookingCtx.propertyConfigs,
      } as any)
    );

    dispatch({ type: "rooms/setRooms", payload: data.data || [] });
    setRoomsData(data.data.rooms);

    setInitialLoading(false);
  };

  const getBookingDataFromParams = () => {
    const code = searchParams.get("code");
    const checkin = searchParams.get("checkin");
    const checkout = searchParams.get("checkout");
    const adults = searchParams.get("adults");
    const children = searchParams.get("children");
    const rooms = searchParams.get("rooms");
    const promocode = searchParams.get("promoCode");
    const bookingSource = searchParams.get("utm_source") || "direct";

    const hasExternalParams = !!(
      code && (checkin || checkout || adults || children || rooms)
    );
    if (!hasExternalParams) return null;

    const today = new Date();
    today.setDate(today.getDate() + 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const numRooms = parseInt(rooms || "1");
    let roomsArray: { adults: number; children: number; childAges: number[] }[] = [];

    const hasPerRoomData = searchParams.get("room1_adults") !== null;

    if (hasPerRoomData) {
      for (let i = 1; i <= numRooms; i++) {
        const roomAdults = parseInt(searchParams.get(`room${i}_adults`) || "1");
        const roomChildren = parseInt(searchParams.get(`room${i}_children`) || "0");
        const childAges: number[] = [];
        for (let ci = 1; ci <= roomChildren; ci++) {
          const ageParam = searchParams.get(`room${i}_child${ci}_age`);
          childAges.push(ageParam !== null ? parseInt(ageParam) : 0);
        }
        roomsArray.push({ adults: roomAdults, children: roomChildren, childAges });
      }
    } else {
      roomsArray = buildRoomsArrayFallback(
        numRooms,
        parseInt(adults || "1"),
        parseInt(children || "0")
      );
    }

    return {
      PropertyCode: code,
      startDate: checkin || today.toISOString().split("T")[0],
      endDate: checkout || tomorrow.toISOString().split("T")[0],
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
      bookingSource,
    };
  };

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const initBookingContext = async () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const defaultStartDate = today.toISOString().split("T")[0];
      const defaultEndDate = tomorrow.toISOString().split("T")[0];

      const paramsData = getBookingDataFromParams();

      if (paramsData) {
        // setIsExternalRequest(true);
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

      } else if (
        bookingContext?.PropertyCode &&
        bookingContext?.startDate &&
        bookingContext?.endDate
      ) {
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
            roomsArray: [{ adults: 1, children: 0, childAges: [] }],
          },
          location: "",
          numberOfRooms: 1,
          promocode: "",
        };
        dispatch(setBookingContext(defaultContext));
        await handleSearchStart(defaultContext);
      }
    };

    initBookingContext();
  }, []);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (
      bookingContext?.PropertyCode &&
      bookingContext?.startDate &&
      bookingContext?.endDate
    ) {
      handleSearchStart(bookingContext);
    }
  }, [i18n.language]);
  const handleOpenGuestModal = (
    room: IRoom,
    ratePlan: any,
    selectedAddonsList: ISelectedAddon[],
    selectedPromotionsList: any[]
  ) => {
    setBookingSelectedPromotions(selectedPromotionsList);
    setBookingRoom(room);
    setCurrentRatePlan(ratePlan);
    setSelectedAddons(selectedAddonsList);
    setFinalPrice(null);
    setPrice(null);
    setShowPriceSummary(false);
    setStep2Error(null);
    setContactInfo({ email: "", phoneNumber: "" });

    // Build guest forms from booking context
    const rawRooms = bookingContext.numberOfRooms || bookingContext.guests?.rooms;
    const allGuests: IGuest[] = [];

    if (Array.isArray(rawRooms)) {
      rawRooms.forEach((rm) => {
        for (let i = 0; i < (rm.adults || 0); i++)
          allGuests.push({ type: "adult", firstName: "", lastName: "", dateOfBirth: "" });
        for (let i = 0; i < (rm.children || 0); i++)
          allGuests.push({ type: "child", firstName: "", lastName: "", dateOfBirth: "" });
      });
    } else {
      const adults = bookingContext.guests?.adults || 1;
      const children = bookingContext.guests?.children || 0;
      for (let i = 0; i < adults; i++)
        allGuests.push({ type: "adult", firstName: "", lastName: "", dateOfBirth: "" });
      for (let i = 0; i < children; i++)
        allGuests.push({ type: "child", firstName: "", lastName: "", dateOfBirth: "" });
    }

    setGuestForms(allGuests);
  };

  const handleBookNow = (
    room: IRoom,
    ratePlan: any,
    selectedAddonsList: ISelectedAddon[],
    selectedPromotionsList: any[],
    priceData: any
  ) => {
    setBookingSelectedPromotions(selectedPromotionsList);
    setCurrentRatePlan(ratePlan);
    setSelectedAddons(selectedAddonsList);

    const rawRooms = bookingContext.numberOfRooms || bookingContext.guests?.rooms;
    let noOfRooms = 1;
    if (Array.isArray(rawRooms)) {
      noOfRooms = rawRooms.length;
    } else {
      noOfRooms = typeof bookingContext.guests?.rooms === "number"
        ? bookingContext.guests.rooms
        : 1;
    }

    const normalized = normalizePriceBreakdown(priceData, {
      noOfRooms,
      ratePlanCode: ratePlan.ratePlanCode,
    });

    setFinalPrice(normalized);
    setPrice(normalized?.totalAmount ?? null);
  };

  const handleGuestDetailChange = (index: number, field: keyof IGuest, value: string) => {
    setGuestForms((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleContactChange = (field: "email" | "phoneNumber", value: string) => {
    setContactInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleStep1Complete = async (email: string) => {
    if (!reproceedRef.current) return;
    setIsFetchingStep2(true);
    setStep2Error(null);
    try {
      await reproceedRef.current(email);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to fetch price";
      setStep2Error(msg);
    } finally {
      setIsFetchingStep2(false);
    }
  };

  const handleSubmitBooking = () => {
    if (!bookingRoom || !currentRatePlan) return;

    const bookingData: any = {
      PropertyCode: bookingContext.PropertyCode,
      startDate: bookingContext.startDate,
      endDate: bookingContext.endDate,
      guests: bookingContext.guests,
      location: bookingContext.location,
      roomId: bookingRoom.id,
      currency: currentRatePlan.currencyCode,
      email: contactInfo.email,
      phone: contactInfo.phoneNumber,
      hotelName: bookingContext.hotelName,
      roomName: bookingRoom.roomName,
      ratePlanCode: currentRatePlan.ratePlanCode,
      roomTypeCode: bookingRoom.roomType,
      guestDetails: guestForms,
      finalPrice,
      numberOfRooms: finalPrice?.requestedRooms || 1,
      propertyDetails: bookingContext.PropertyDetails,
      selectedAddons,
      selectedPromotions: bookingSelectedPromotions,
    };

    if (bookingSelectedPromotions?.length > 0) {
      bookingData.selectedPromotions = bookingSelectedPromotions.map((p: any) => ({
        id: p.id,
        promotionType: p.type,
        promotionName: p.name || p.promotionName,
        discountValue: p.discountValue,
        discountType: p.discountType,
      }));
    }

    dispatch({
      type: "booking/setFullBookingDetails",
      payload: { ...bookingData, isLoyaltyGuest: !!loyaltyDiscountInfo },
    });

    document.cookie = "can_access_payment=true; path=/; max-age=300";
    router.push(`/Payment?code=${bookingContext.PropertyCode || searchParams.get("code")}`);
  };


  if (initialLoading || propertyLoading) {
    return (
      <div className="w-full min-h-screen bg-gray-50">
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
        <div className="max-w-7xl mx-auto px-4 py-6 mt-4 space-y-6">
          <div className="w-full h-16 bg-gray-200 rounded-xl animate-pulse" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden animate-pulse">
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
      </div>
    );
  }

  return (
    <div className="w-full">


      <div
        className={`min-h-screen bg-cover bg-center bg-no-repeat transition-opacity duration-700`}
      >
        <div className="z-40 bg-white/90 backdrop-blur shadow-sm">
          <SearchWidget
            onSearchStart={(payload) => {
              if (!isLoadingFromExternal.current) handleSearchStart(payload);
            }}
          />
        </div>

        <div className="px-4 py-3">
          <div className="max-w-7xl mx-auto">
            <UrgencyBanner primaryColor={primaryColor} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {fetchedPropertyDetails?.propertyVideos && fetchedPropertyDetails?.propertyVideos !== null && (
                <div className={loyaltyProgram ? "lg:col-span-7" : "lg:col-span-12"}>
                  <div
                    className="rounded-xl shadow-md border overflow-hidden h-[348px]"
                    style={{ borderColor: `${primaryColor}40` }}
                  >
                    <div className="relative w-full h-full">
                      <video
                        className="w-full h-full object-cover"
                        autoPlay
                        loop
                        muted={isMuted}
                        playsInline
                        src={fetchedPropertyDetails.propertyVideos.url}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                        <h3 className="text-white font-semibold text-lg">
                          {fetchedPropertyDetails._translations
                            ? fetchedPropertyDetails._translations.propertyName
                            : fetchedPropertyDetails.propertyName}{" "}
                          — {t("Rooms.videoOverlay")}
                        </h3>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setIsMuted((m) => !m); }}
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
                <div className={fetchedPropertyDetails?.propertyVideos ? "lg:col-span-5" : "lg:col-span-12"}>
                  <LoyaltyProgramBanner
                    loyaltyProgram={loyaltyProgram}
                    primaryColor={primaryColor}
                    onDiscountVerified={setLoyaltyDiscountInfo}
                  />
                </div>
              )}
            </div>

            {loyaltyProgram && (
              <div className="mt-4">
                <LoyaltyContainer
                  loyaltyProgram={loyaltyProgram}
                  primaryColor={primaryColor}
                  toggleOn={loyalityToogle}
                  onToggleChange={setLoyaltyToggle}
                />
              </div>
            )}
          </div>
        </div>

        {/* Room list + price sidebar */}
        <div className="px-4 pb-2">
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-6">
              <div
                className={`flex-1 ${showPriceSummary ? "lg:w-2/3" : "w-full"} transition-all duration-300`}
              >
                <div className="p-2 sm:p-4 bg-white border border-gray-200 rounded-xl">
                  {roomsData.length === 0 ? (
                    <div className="text-center text-gray-600 text-xl py-10 font-medium">
                      {t("Rooms.noRoomsHotel")}
                    </div>
                  ) : roomsData.filter((r: IRoomDetails) => r.hasValidRate).length === 0 ? (
                    <div className="text-center py-10 text-gray-600 text-lg font-medium">
                      {t("Rooms.noRooms")}
                    </div>
                  ) : (
                    <div className="space-y-8 rounded-xl md:p-4">
                      {roomsData
                        .filter((room: IRoomDetails) => room.hasValidRate)
                        .map((room: IRoomDetails) => (
                          <RoomCard
                            key={room.id}
                            room={room}
                            propertyDetails={propertyDetails}
                            bookingContext={bookingContext}
                            onBookNow={handleBookNow}
                            onOpenGuestModal={handleOpenGuestModal}
                            onRegisterReproceed={(fn) => { reproceedRef.current = fn; }}
                            selectedBoardType="all"
                            loyalty={loyaltyProgram}
                            loyaltyDiscountInfo={loyaltyDiscountInfo}
                            loyaltyToggleOn={loyalityToogle}
                            setLoyaltyToggle={setLoyaltyToggle}
                            contactInfo={contactInfo}
                          />
                        ))}
                    </div>
                  )}
                </div>
              </div>


            </div>
          </div>
        </div>
      </div>

      {/* Booking conditions modal */}
      <BookingConditionsModal
        open={bookingConditionsModal}
        onOpenChange={setBookingConditionsModal}
      />

      {bookingRoom && (
        <GuestFormModal
          guestForms={guestForms}
          contactInfo={contactInfo}
          price={price}
          finalPrice={finalPrice}
          bookingContext={bookingContext}
          loyaltyDiscountInfo={loyaltyDiscountInfo}
          propertyId={propertyDetails?.id || ""}
          onClose={() => {
            setBookingRoom(null);
            setCurrentRatePlan(null);
            setSelectedAddons([]);
            setStep2Error(null);
          }}
          handleGuestDetailChange={handleGuestDetailChange}
          handleContactChange={handleContactChange}
          onStepOneComplete={handleStep1Complete}
          isFetchingStep2={isFetchingStep2}
          step2Error={step2Error}
          onSubmit={handleSubmitBooking}
        />
      )}
    </div>
  );
};

export default Rooms;