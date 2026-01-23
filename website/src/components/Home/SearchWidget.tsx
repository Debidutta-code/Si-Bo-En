"use client";

import { useState, useEffect, useRef } from "react";
import { Users, Menu, X, Calendar, User, Key, ChevronRight } from "lucide-react";
import GuestSelector from "../GuestModals/GuestSelector";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./styles/custom-datepicker.css";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { setBookingContext, setSenderUrl } from "../../store/bookingSlice";
import toast from "react-hot-toast";
import { RootState } from "@/src/store/store";
import { useBookingColors } from "../../hooks/useBookingColors";
import React from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { useBookingStorage } from "@/src/hooks/useBookingStorage";
import defaultLogo from "../assets/revchilli.png";
interface SearchWidgetProps {
  onSearchStart?: (payload: {
    startDate: string;
    endDate: string;
    guests: any;
    PropertyCode: string;
  }) => void;
}

// Custom wrapper component for DatePicker with hover support
const DatePickerWithHover = ({
  checkIn,
  checkOut,
  temporaryCheckOut,
  onDateSelect,
  onDayMouseEnter,
  onDayMouseLeave,
  isSelectingRange
}: {
  checkIn: Date | null;
  checkOut: Date | null;
  temporaryCheckOut: Date | null;
  onDateSelect: (date: Date) => void;
  onDayMouseEnter: (date: Date) => void;
  onDayMouseLeave: () => void;
  isSelectingRange: boolean;
}) => {
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  // Custom day component to handle hover events
  const renderDayContents = (day: number, date: Date) => {
    return (
      <div
        className="react-datepicker__day-wrapper"
        onMouseEnter={() => {
          setHoverDate(date);
          onDayMouseEnter(date);
        }}
        onMouseLeave={() => {
          setHoverDate(null);
          onDayMouseLeave();
        }}
      >
        {day}
      </div>
    );
  };

  // Custom day class name function
  const getDayClassName = (date: Date) => {
    const baseClass = "terra-solis-day";
    const isInRange =
      checkIn &&
      date > checkIn &&
      (temporaryCheckOut ? date <= temporaryCheckOut : checkOut ? date <= checkOut : false);

    if (isInRange) {
      return `${baseClass} terra-solis-day-in-range`;
    }

    return baseClass;
  };

  return (
    <DatePicker
      selected={checkIn}
      onChange={(date) => {
        if (date) onDateSelect(date);
      }}
      minDate={new Date(new Date().setDate(new Date().getDate() + 1))}
      startDate={checkIn}
      endDate={temporaryCheckOut || checkOut}
      selectsStart
      selectsEnd
      monthsShown={2}
      inline
      calendarClassName="terra-solis-calendar"
      popperClassName="terra-solis-popper"
      dayClassName={getDayClassName}
      renderDayContents={renderDayContents}
    />
  );
};

const SearchWidget: React.FC<SearchWidgetProps> = ({ onSearchStart }) => {
  const senderUrl = useSelector((state: RootState) => state.booking.senderUrl);
  const dispatch = useDispatch();
  const [isGuestSelectorOpen, setIsGuestSelectorOpen] = useState(false);
  const [guestSummary, setGuestSummary] = useState(
    "1 adults - 0 children - 1 room"
  );
  const userTriggeredSearch = useRef(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  interface GuestInfo {
    adults: number;
    children: number;
    rooms: number;
  }

  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
    adults: 1,
    children: 0,
    rooms: 1,
  });

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(today.getDate() + 2);

  const [checkIn, setCheckIn] = useState<Date | null>(tomorrow);
  const [checkOut, setCheckOut] = useState<Date | null>(dayAfterTomorrow);
  const [loading, setLoading] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [temporaryCheckOut, setTemporaryCheckOut] = useState<Date | null>(null);
  const [isSelectingRange, setIsSelectingRange] = useState(false);
  const [selectionMode, setSelectionMode] = useState<'checkin' | 'checkout'>('checkin');

  const bookingContext = useSelector((state: RootState) => state.booking);

  // Get colors from Redux booking context with fallbacks
  // const primaryColor = bookingContext?.bookingEngineColor?.primaryColor || "#2F2A1F";
  // const secondaryColor = bookingContext?.bookingEngineColor?.primaryColor || "#E8DFC9";
  // const tertiaryColor = bookingContext?.bookingEngineColor?.tertiaryColor || "#7D7566";
  // const buttonTextColor = bookingContext?.bookingEngineColor?.buttonTextColor || "#2F2A1F";

  // // Get logo from booking context
  // const logoIcon = bookingContext?.PropertyDetails?.bookingEngineConfig?.logo ||
  //   bookingContext?.bookingEngineColor?.logo;

  const { colors, logoIcon } = useBookingStorage(bookingContext);
  const [currentLogo, setCurrentLogo] = useState<string | null>(logoIcon);
  const { primaryColor, secondaryColor, tertiaryColor, buttonTextColor } = colors;
  const hotelcode = bookingContext?.PropertyCode || "4BTXDZ";
  const PathName = usePathname();

  // console.log("guestInfo", guestInfo);
  // console.log("Booking colors:", { primaryColor, secondaryColor, tertiaryColor, buttonTextColor });

  // Calculate total guests
  const totalGuests = guestInfo.adults + guestInfo.children;

  useEffect(() => {
    if (bookingContext) {
      if (bookingContext.startDate) {
        setCheckIn(new Date(bookingContext.startDate));
        setSelectionMode('checkout');
      }
      if (bookingContext.endDate) {
        setCheckOut(new Date(bookingContext.endDate));
      }
      if (bookingContext.guests) {
        const g = bookingContext.guests;
        let totalAdults = 0;
        let totalChildren = 0;
        let roomsCount = 1;

        if (Array.isArray(g.rooms)) {
          roomsCount = g.rooms.length;
          g.rooms.forEach((room: any) => {
            totalAdults += room.adults || 0;
            totalChildren += room.children || 0;
          });
        } else if (typeof g.rooms === "number") {
          roomsCount = g.rooms;
          totalAdults = g.adults || 0;
          totalChildren = g.children || 0;
        } else {
          totalAdults = g.adults || 0;
          totalChildren = g.children || 0;
        }

        setGuestInfo(g);
        setGuestSummary(
          `${totalAdults || 1} adult${totalAdults !== 1 ? "s" : ""} - ${totalChildren || 0
          } child${totalChildren !== 1 ? "ren" : ""} - ${roomsCount} room${roomsCount !== 1 ? "s" : ""
          }`
        );
      }
    }
  }, [bookingContext]);

  useEffect(() => {
    if (
      userTriggeredSearch.current &&
      checkIn &&
      checkOut &&
      checkOut > checkIn
    ) {
      handleSearch();
      userTriggeredSearch.current = false;
    }
  }, [checkIn, checkOut, guestInfo]);
// ✅ ADD THIS ENTIRE useEffect
// ✅ REPLACE the useEffect you added with THIS improved version
useEffect(() => {
  const updateLogoFromStorage = () => {
    // Priority 1: Check bookingContext first
    const logoFromContext = 
      bookingContext?.bookingEngineColor?.logo || 
      bookingContext?.PropertyDetails?.bookingEngineConfig?.logo;
    
    if (logoFromContext) {
      setCurrentLogo(logoFromContext);
      return;
    }

    // Priority 2: Check localStorage
    try {
      const stored = localStorage.getItem('bookingstorage');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.logoIcon) {
          setCurrentLogo(parsed.logoIcon);
        } else {
          setCurrentLogo(null); // Reset if no logo
        }
      }
    } catch (error) {
      console.error('Error reading logo from storage:', error);
    }
  };

  // Run on mount and when dependencies change
  updateLogoFromStorage();

  // ✅ CRITICAL: Listen for storage changes (custom event)
  const handleStorageUpdate = () => {
    updateLogoFromStorage();
  };

  window.addEventListener('storage', handleStorageUpdate);
  
  // ✅ Also listen for a custom event we'll dispatch from Rooms
  window.addEventListener('bookingStorageUpdated', handleStorageUpdate);

  return () => {
    window.removeEventListener('storage', handleStorageUpdate);
    window.removeEventListener('bookingStorageUpdated', handleStorageUpdate);
  };
}, [bookingContext?.bookingEngineColor?.logo, bookingContext?.PropertyDetails?.bookingEngineConfig?.logo, logoIcon]);
  const handleGuestSelection = (summary: string, data: any) => {
    // console.log("Selected guest data:", data);
    // console.log("Selected guest summary:", summary);

    setGuestSummary(summary);

    // Transform the data from GuestSelector to match the expected format
    if (Array.isArray(data.rooms)) {
      // Calculate totals from rooms array
      const totalAdults = data.rooms.reduce((sum: number, room: any) => sum + (room.adults || 0), 0);
      const totalChildren = data.rooms.reduce((sum: number, room: any) => sum + (room.children || 0), 0);
      const roomsCount = data.rooms.length;

      const transformedData = {
        adults: totalAdults,
        children: totalChildren,
        rooms: roomsCount,
        // Keep the original rooms array for display purposes if needed
        roomsArray: data.rooms
      };

      setGuestInfo(transformedData);
    } else {
      // If data is already in the correct format, use it as is
      setGuestInfo(data);
    }

    userTriggeredSearch.current = true;
  };

  const router = useRouter();

  const handleSearch = async () => {
    if (!checkIn || !checkOut) {
      toast.error("Please select valid check-in and check-out dates.");
      return;
    } else if (checkOut <= checkIn) {
      toast.error("Check-out date must be after check-in date.");
      return;
    } else if (checkIn < new Date()) {
      toast.error("Check-in date cannot be earlier than today.");
      return;
    }

    setLoading(true);
    setIsMobileMenuOpen(false);

    const payload = {
      startDate: checkIn.toISOString().split("T")[0],
      endDate: checkOut.toISOString().split("T")[0],
      guests: guestInfo,
      PropertyCode: hotelcode,
    };

    try {
      if (onSearchStart) {
        onSearchStart(payload);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking-engine/fetch-rooms`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();

      if (!response.ok || data.status === "fail") {
        const msg = data.message || "Failed to load rooms.";
        toast.error(msg);
        return;
      }

      const fullContext = {
        ...bookingContext,
        ...payload,
        hotelName: data?.propertyName || "Hotel",
        PropertyDetails: data.propertyDetails,
        bookingEngineColor: data.bookingEngineColor,
      };
      dispatch(setBookingContext(fullContext));

      const localContext = {
        startDate: payload.startDate,
        endDate: payload.endDate,
        guests: payload.guests,
        PropertyCode: payload.PropertyCode,
        hotelName: fullContext.hotelName,
      };

      localStorage.setItem("bookingContext", JSON.stringify(localContext));
      dispatch({ type: "rooms/setRooms", payload: data.data || [] });

      const queryParams = new URLSearchParams({ code: hotelcode });
      if (PathName === "/") {
        router.push(`Rooms/?${queryParams.toString()}`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedContext = window.localStorage.getItem("bookingContext");
      if (storedContext) {
        dispatch(setBookingContext(JSON.parse(storedContext)));
      }
    }
  }, [dispatch]);

  const handleDateSelect = (date: Date) => {
    if (selectionMode === 'checkin') {
      // First click - set check-in
      setCheckIn(date);
      setCheckOut(null);
      setSelectionMode('checkout');
      setIsSelectingRange(true);
    } else if (selectionMode === 'checkout') {
      // Second click - set check-out
      if (date > checkIn!) {
        setCheckOut(date);
        setIsSelectingRange(false);
        // Close the calendar automatically after selecting check-out
        setTimeout(() => {
          setIsCalendarOpen(false);
          setSelectionMode('checkin'); // Reset for next time
          setTemporaryCheckOut(null);
        }, 300);
      } else if (date < checkIn!) {
        // If user selects a date before current check-in, start over
        setCheckIn(date);
        setCheckOut(null);
        setSelectionMode('checkout');
        setIsSelectingRange(true);
      }
    }
  };

  const handleDateMouseEnter = (date: Date) => {
    if (isSelectingRange && checkIn && date > checkIn) {
      setTemporaryCheckOut(date);
    }
  };

  const handleDateMouseLeave = () => {
    setTemporaryCheckOut(null);
  };

  const openCalendar = () => {
    setIsCalendarOpen(true);
    // If we have both dates already selected, start fresh
    if (checkIn && checkOut) {
      setSelectionMode('checkin');
      setIsSelectingRange(false);
      setTemporaryCheckOut(null);
    }
    // If we only have check-in, we're ready to select check-out
    else if (checkIn && !checkOut) {
      setSelectionMode('checkout');
      setIsSelectingRange(true);
    }
    // If we have nothing, start with check-in
    else {
      setSelectionMode('checkin');
      setIsSelectingRange(false);
    }
  };

  const closeCalendar = () => {
    setIsCalendarOpen(false);
    setTemporaryCheckOut(null);
    // Reset to check-in mode for next time
    if (!checkOut) {
      setSelectionMode('checkin');
      setIsSelectingRange(false);
    }
  };

  const handleHomeClick = () => {
    let url = senderUrl;

    // If Redux is empty (page reload), read from sessionStorage
    if (!url) {
      url = sessionStorage.getItem("senderUrl") || undefined;
      if (url) dispatch(setSenderUrl(url)); // sync back to Redux
    }

    if (url) {
      window.location.href = url;
    } else {
      router.push("/");
    }
  };

  // Function to get text color that contrasts with background
  const getContrastTextColor = (bgColor: string) => {
    // Convert hex to RGB
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return black or white based on luminance
    return luminance > 0.5 ? '#2F2A1F' : '#FFFFFF';
  };

  // Calculate button text color - use provided buttonTextColor or get contrast color
  const calculatedButtonTextColor = buttonTextColor || getContrastTextColor(secondaryColor);

  // console.log("Rendering SearchWidget with colors:", { primaryColor, secondaryColor, tertiaryColor, buttonTextColor }, bookingContext);

  return (
    <>
      {/* Backdrop Overlay */}
      {isCalendarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
          onClick={closeCalendar}
        />
      )}

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998] md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className="w-full bg-[#F4EFE6] border-b border-[#D4CABA]">
        {/* BREAKPOINT 1: Desktop (1280px and above) - Original full design */}
        <div className="hidden xl:block">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="flex items-center justify-between gap-8">
              {/* LEFT: LOGO */}
              <button
                onClick={handleHomeClick}
                className="flex items-center focus:outline-none"
              >
               {currentLogo ? (
  <div className="relative w-32 h-32">
    <Image
      src={currentLogo}
      alt="Hotel Logo"
      fill
      className="object-contain"
      unoptimized
    />
  </div>
) : (
  <div className="relative w-32 h-32">
    <Image
      src={defaultLogo}
      alt="Hotel Logo"
      fill
      className="object-contain"
      unoptimized
    />
  </div>
)}
              </button>

              {/* CENTER: BOOKING CONTROLS */}
              <div className="flex items-center gap-3 flex-1 justify-center">
                {/* CHECK-IN / CHECK-OUT CONTAINER */}
                <div
                  className="bg-white border-2 rounded-[40px] px-6 py-3 flex items-center gap-6 shadow-sm"
                  style={{ borderColor: tertiaryColor }}
                >
                  {/* CHECK-IN */}
                  <div
                    onClick={openCalendar}
                    className="cursor-pointer text-center min-w-[100px]"
                  >
                    <p
                      className="text-[9px] tracking-[0.15em] font-medium mb-1"
                      style={{ color: tertiaryColor }}
                    >
                      CHECK-IN
                    </p>
                    <p
                      className="text-[40px] font-semibold leading-none mb-1"
                      style={{ color: primaryColor }}
                    >
                      {checkIn?.getDate()}
                    </p>
                    <p
                      className="text-[10px] uppercase tracking-wider font-medium"
                      style={{ color: tertiaryColor }}
                    >
                      {checkIn?.toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  {/* ARROW SEPARATOR */}
                  <div
                    className="text-[32px] font-light leading-none px-2"
                    style={{ color: tertiaryColor }}
                  >
                    ›
                  </div>

                  {/* CHECK-OUT */}
                  <div
                    onClick={openCalendar}
                    className="cursor-pointer text-center min-w-[100px]"
                  >
                    <p
                      className="text-[9px] tracking-[0.15em] font-medium mb-1"
                      style={{ color: tertiaryColor }}
                    >
                      CHECK-OUT
                    </p>
                    <p
                      className="text-[40px] font-semibold leading-none mb-1"
                      style={{ color: primaryColor }}
                    >
                      {checkOut?.getDate() ?? "--"}
                    </p>
                    <p
                      className="text-[10px] uppercase tracking-wider font-medium"
                      style={{ color: tertiaryColor }}
                    >
                      {checkOut
                        ? checkOut.toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })
                        : "Select"}
                    </p>
                  </div>
                </div>

                {/* OCCUPANCY */}
                <button
                  onClick={() => setIsGuestSelectorOpen(true)}
                  className="bg-white border rounded-lg px-4 py-3 min-w-[140px] hover:bg-[#FAFAF8] transition-colors shadow-sm"
                  style={{ borderColor: '#C4BAA5' }}
                >
                  <p
                    className="text-[9px] tracking-[0.15em] font-medium mb-2"
                    style={{ color: tertiaryColor }}
                  >
                    OCCUPANCY
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    {/* Rooms */}
                    <div className="flex items-center gap-1">
                      <div className="w-5 h-5 bg-[#F4EFE6] rounded-full flex items-center justify-center">
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#5B543F"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                          <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                      </div>
                      <span
                        className="text-xs font-bold"
                        style={{ color: primaryColor }}
                      >
                        {Array.isArray(guestInfo.rooms) ? guestInfo.rooms.length : guestInfo.rooms || 1}
                      </span>
                    </div>

                    {/* Adults */}
                    <div className="flex items-center gap-1">
                      <div className="w-5 h-5 bg-[#F4EFE6] rounded-full flex items-center justify-center">
                        <Users className="w-2.5 h-2.5" style={{ color: '#5B543F' }} />
                      </div>
                      <span
                        className="text-xs font-bold"
                        style={{ color: primaryColor }}
                      >
                        {Array.isArray(guestInfo.rooms)
                          ? guestInfo.rooms.reduce((sum, room) => sum + (room.adults || 0), 0)
                          : guestInfo.adults || 1}
                      </span>
                    </div>

                    {/* Children */}
                    <div className="flex items-center gap-1">
                      <div className="w-5 h-5 bg-[#F4EFE6] rounded-full flex items-center justify-center">
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#5B543F"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M9 12h.01M15 12h.01M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5" />
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                      </div>
                      <span
                        className="text-xs font-bold"
                        style={{ color: primaryColor }}
                      >
                        {Array.isArray(guestInfo.rooms)
                          ? guestInfo.rooms.reduce((sum, room) => sum + (room.children || 0), 0)
                          : guestInfo.children || 0}
                      </span>
                    </div>
                  </div>
                </button>

                {/* PROMOTIONAL CODE */}
                <div className="flex flex-col min-w-[180px]">
                  <input
                    type="text"
                    placeholder="PROMOTIONAL CODE"
                    className="bg-transparent border-b-2 pb-2 text-[10px] tracking-[0.15em] placeholder-[#9B8B6F] focus:outline-none transition-colors"
                    style={{
                      borderColor: tertiaryColor,
                      color: tertiaryColor
                    }}
                  />
                </div>

                {/* BOOK BUTTON */}
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-10 py-4 rounded-full text-[11px] font-semibold tracking-[0.15em] disabled:opacity-60 transition-all shadow-sm hover:opacity-90"
                  style={{
                    backgroundColor: secondaryColor,
                    color: calculatedButtonTextColor
                  }}
                >
                  {loading ? "LOADING..." : "BOOK"}
                </button>
              </div>

              {/* RIGHT: MY BOOKING */}
              <div className="min-w-[140px] flex justify-end">
                <button
                  className="text-[11px] font-semibold tracking-[0.1em] hover:opacity-80 transition-colors"
                  style={{ color: primaryColor }}
                  onClick={() => router.push(`/my-trip`)}
                >
                  MY BOOKING
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* BREAKPOINT 2: Laptop (1024px - 1279px) - Compact desktop design */}
        <div className="hidden lg:block xl:hidden">
          <div className="max-w-[1400px] mx-auto px-6 py-3">
            <div className="flex items-center justify-between gap-6">
              {/* LEFT: LOGO - Compact */}
              <button
                onClick={handleHomeClick}
                className="flex items-center focus:outline-none"
              >
                {currentLogo ? (
  <div className="relative w-28 h-20">
    <Image
      src={currentLogo}
      alt="Hotel Logo"
      fill
      className="object-contain"
      unoptimized
    />
  </div>
) : (
  <div className="relative w-28 h-20">
    <Image
      src={defaultLogo}
      alt="Hotel Logo"
      fill
      className="object-contain"
      unoptimized
    />
  </div>
)}
              </button>

              {/* CENTER: COMPACT BOOKING CONTROLS */}
              <div className="flex items-center gap-3 flex-1 justify-center max-w-[850px]">
                {/* COMPACT DATES */}
                <div
                  onClick={openCalendar}
                  className="bg-white border-2 rounded-[32px] px-5 py-2.5 flex items-center gap-4 shadow-sm cursor-pointer hover:border-[#7D7566] transition-colors"
                  style={{ borderColor: tertiaryColor }}
                >
                  <div className="text-center min-w-[85px]">
                    <p
                      className="text-[9px] tracking-[0.15em] font-medium mb-1"
                      style={{ color: tertiaryColor }}
                    >
                      CHECK-IN
                    </p>
                    <p
                      className="text-[28px] font-semibold leading-none mb-1"
                      style={{ color: primaryColor }}
                    >
                      {checkIn?.getDate()}
                    </p>
                    <p
                      className="text-[9px] uppercase tracking-wider font-medium"
                      style={{ color: tertiaryColor }}
                    >
                      {checkIn?.toLocaleDateString("en-US", {
                        month: "short",
                      })}
                    </p>
                  </div>

                  <div
                    className="text-[24px] font-light leading-none"
                    style={{ color: tertiaryColor }}
                  >
                    ›
                  </div>

                  <div className="text-center min-w-[85px]">
                    <p
                      className="text-[9px] tracking-[0.15em] font-medium mb-1"
                      style={{ color: tertiaryColor }}
                    >
                      CHECK-OUT
                    </p>
                    <p
                      className="text-[28px] font-semibold leading-none mb-1"
                      style={{ color: primaryColor }}
                    >
                      {checkOut?.getDate() ?? "--"}
                    </p>
                    <p
                      className="text-[9px] uppercase tracking-wider font-medium"
                      style={{ color: tertiaryColor }}
                    >
                      {checkOut
                        ? checkOut.toLocaleDateString("en-US", {
                          month: "short",
                        })
                        : "Select"}
                    </p>
                  </div>
                </div>

                {/* COMPACT OCCUPANCY */}
                <button
                  onClick={() => setIsGuestSelectorOpen(true)}
                  className="bg-white border rounded-lg px-3 py-2 min-w-[120px] hover:bg-[#FAFAF8] transition-colors shadow-sm"
                  style={{ borderColor: '#C4BAA5' }}
                >
                  <p
                    className="text-[9px] tracking-[0.15em] font-medium mb-2"
                    style={{ color: tertiaryColor }}
                  >
                    OCCUPANCY
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-[#F4EFE6] rounded-full flex items-center justify-center">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#5B543F" strokeWidth="2">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                          <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                      </div>
                      <span
                        className="text-xs font-bold"
                        style={{ color: primaryColor }}
                      >
                        {Array.isArray(guestInfo.rooms) ? guestInfo.rooms.length : guestInfo.rooms || 1}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-[#F4EFE6] rounded-full flex items-center justify-center">
                        <Users className="w-2 h-2" style={{ color: '#5B543F' }} />
                      </div>
                      <span
                        className="text-xs font-bold"
                        style={{ color: primaryColor }}
                      >
                        {Array.isArray(guestInfo.rooms)
                          ? guestInfo.rooms.reduce((sum, room) => sum + (room.adults || 0), 0)
                          : guestInfo.adults || 1}
                      </span>
                    </div>
                  </div>
                </button>

                {/* COMPACT PROMO CODE */}
                <div className="flex flex-col min-w-[140px]">
                  <input
                    type="text"
                    placeholder="PROMO CODE"
                    className="bg-transparent border-b-2 pb-1.5 text-[9px] tracking-[0.15em] placeholder-[#9B8B6F] focus:outline-none"
                    style={{
                      borderColor: tertiaryColor,
                      color: tertiaryColor
                    }}
                  />
                </div>

                {/* COMPACT BOOK BUTTON */}
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-6 py-3 rounded-full text-[10px] font-semibold tracking-[0.15em] disabled:opacity-60 transition-all shadow-sm min-w-[90px] hover:opacity-90"
                  style={{
                    backgroundColor: secondaryColor,
                    color: calculatedButtonTextColor
                  }}
                >
                  {loading ? "LOADING..." : "BOOK"}
                </button>
              </div>

              {/* RIGHT: MY BOOKING - Compact */}
              <div className="min-w-[100px] flex justify-end">
                <button
                  className="text-[10px] font-semibold tracking-[0.1em] hover:opacity-80 transition-colors"
                  style={{ color: primaryColor }}
                  onClick={() => router.push(`/my-trip`)}
                >
                  MY BOOKING
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* BREAKPOINT 3: Tablet (768px - 1023px) - Grid layout */}
        <div className="hidden md:block lg:hidden">
          <div className="max-w-[1400px] mx-auto px-6 py-4">
            <div className="flex flex-col gap-4">
              {/* Top Row */}
              <div className="flex items-center justify-between">
                {/* Logo */}
                <button
                  onClick={handleHomeClick}
                  className="flex items-center focus:outline-none"
                >
                 {currentLogo ? (
  <div className="relative w-24 h-16">
    <Image
      src={currentLogo}
      alt="Hotel Logo"
      fill
      className="object-contain"
      unoptimized
    />
  </div>
) : (
  <div className="relative w-24 h-16">
    <Image
      src={defaultLogo}
      alt="Hotel Logo"
      fill
      className="object-contain"
      unoptimized
    />
  </div>
)}
                </button>

                <button
                  className="text-xs font-semibold tracking-[0.1em] hover:opacity-80 transition-colors"
                  style={{ color: primaryColor }}
                  onClick={() => router.push(`/my-trip`)}
                >
                  MY BOOKING
                </button>
              </div>

              {/* Booking Controls Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Dates */}
                <div
                  onClick={openCalendar}
                  className="bg-white border-2 rounded-2xl p-4 cursor-pointer hover:border-[#7D7566] transition-colors col-span-2"
                  style={{ borderColor: tertiaryColor }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" style={{ color: tertiaryColor }} />
                      <span
                        className="text-xs font-semibold tracking-[0.1em]"
                        style={{ color: primaryColor }}
                      >
                        DATES
                      </span>
                    </div>
                    <span className="text-xs" style={{ color: tertiaryColor }}>Edit</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <p
                        className="text-[12px] mb-1"
                        style={{ color: tertiaryColor }}
                      >
                        Check-in
                      </p>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: primaryColor }}
                      >
                        {checkIn?.getDate()}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: tertiaryColor }}
                      >
                        {checkIn?.toLocaleDateString("en-US", {
                          month: "short",
                        })}
                      </p>
                    </div>
                    <ChevronRight className="w-6 h-6" style={{ color: tertiaryColor }} />
                    <div className="text-center">
                      <p
                        className="text-[12px] mb-1"
                        style={{ color: tertiaryColor }}
                      >
                        Check-out
                      </p>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: primaryColor }}
                      >
                        {checkOut?.getDate() ?? "--"}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: tertiaryColor }}
                      >
                        {checkOut
                          ? checkOut.toLocaleDateString("en-US", {
                            month: "short",
                          })
                          : "Select"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Occupancy */}
                <button
                  onClick={() => setIsGuestSelectorOpen(true)}
                  className="bg-white border rounded-2xl p-4 text-left hover:border-[#9B8B6F] transition-colors"
                  style={{ borderColor: '#C4BAA5' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4" style={{ color: tertiaryColor }} />
                    <span
                      className="text-xs font-semibold"
                      style={{ color: primaryColor }}
                    >
                      GUESTS
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: primaryColor }}
                    >
                      {totalGuests} guest{totalGuests !== 1 ? 's' : ''}
                    </span>
                    <ChevronRight className="w-4 h-4 ml-auto" style={{ color: tertiaryColor }} />
                  </div>
                </button>

                {/* Promo Code */}
                <div
                  className="bg-white border rounded-2xl p-4 hover:border-[#9B8B6F] transition-colors"
                  style={{ borderColor: '#C4BAA5' }}
                >
                  <div
                    className="text-xs font-semibold mb-2"
                    style={{ color: primaryColor }}
                  >
                    PROMO CODE
                  </div>
                  <input
                    type="text"
                    placeholder="Enter code"
                    className="w-full bg-transparent text-sm placeholder-[#9B8B6F] focus:outline-none"
                    style={{ color: primaryColor }}
                  />
                </div>
              </div>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                disabled={loading}
                className="w-full py-4 rounded-full text-sm font-semibold tracking-[0.15em] disabled:opacity-60 transition-all shadow-sm hover:opacity-90"
                style={{
                  backgroundColor: secondaryColor,
                  color: calculatedButtonTextColor
                }}
              >
                {loading ? "LOADING..." : "BOOK NOW"}
              </button>
            </div>
          </div>
        </div>

        {/* BREAKPOINT 4: Mobile (Below 768px) */}
        <div className="md:hidden">
          {/* Top Bar */}
          <div className="px-4 py-3 flex items-center justify-between">
            {/* Logo */}
            <button
              onClick={handleHomeClick}
              className="flex items-center focus:outline-none"
            >
              {currentLogo ? (
  <div className="relative w-20 h-12">
    <Image
      src={currentLogo}
      alt="Hotel Logo"
      fill
      className="object-contain"
      unoptimized
    />
  </div>
) : (
  <div className="relative w-20 h-12">
    <Image
      src={defaultLogo}
      alt="Hotel Logo"
      fill
      className="object-contain"
      unoptimized
    />
  </div>
)}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" style={{ color: primaryColor }} />
              ) : (
                <Menu className="w-6 h-6" style={{ color: primaryColor }} />
              )}
            </button>
          </div>

          {/* Mobile Menu Panel */}
          {isMobileMenuOpen && (
            <div className="fixed top-[73px] left-0 right-0 bg-white border-t border-[#D4CABA] z-[9999] shadow-lg max-h-[calc(100vh-73px)] overflow-y-auto">
              <div className="p-4 space-y-6">
                {/* Dates Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" style={{ color: tertiaryColor }} />
                    <span
                      className="text-sm font-semibold"
                      style={{ color: primaryColor }}
                    >
                      SELECT DATES
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      onClick={openCalendar}
                      className="bg-[#F4EFE6] border border-[#D4CABA] rounded-xl p-4 text-center cursor-pointer"
                    >
                      <p className="text-xs text-[#7D7566] mb-1">Check-in</p>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: primaryColor }}
                      >
                        {checkIn?.getDate()}
                      </p>
                      <p className="text-xs text-[#7D7566]">
                        {checkIn?.toLocaleDateString("en-US", {
                          month: "short",
                        })}
                      </p>
                    </div>
                    <div
                      onClick={openCalendar}
                      className="bg-[#F4EFE6] border border-[#D4CABA] rounded-xl p-4 text-center cursor-pointer"
                    >
                      <p className="text-xs text-[#7D7566] mb-1">Check-out</p>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: primaryColor }}
                      >
                        {checkOut?.getDate() ?? "--"}
                      </p>
                      <p className="text-xs text-[#7D7566]">
                        {checkOut
                          ? checkOut.toLocaleDateString("en-US", {
                            month: "short",
                          })
                          : "Select"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Occupancy Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" style={{ color: tertiaryColor }} />
                    <span
                      className="text-sm font-semibold"
                      style={{ color: primaryColor }}
                    >
                      OCCUPANCY
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setIsGuestSelectorOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-[#F4EFE6] border border-[#D4CABA] rounded-xl p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#5B543F"
                            strokeWidth="2"
                          >
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <p className="text-xs text-[#7D7566]">Rooms</p>
                          <p
                            className="text-sm font-bold"
                            style={{ color: primaryColor }}
                          >
                            {Array.isArray(guestInfo.rooms) ? guestInfo.rooms.length : guestInfo.rooms || 1}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                          <User className="w-4 h-4" style={{ color: '#5B543F' }} />
                        </div>
                        <div className="text-left">
                          <p className="text-xs text-[#7D7566]">Adults</p>
                          <p
                            className="text-sm font-bold"
                            style={{ color: primaryColor }}
                          >
                            {Array.isArray(guestInfo.rooms)
                              ? guestInfo.rooms.reduce((sum, room) => sum + (room.adults || 0), 0)
                              : guestInfo.adults || 1}
                          </p>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5" style={{ color: tertiaryColor }} />
                  </button>
                </div>

                {/* Promo Code Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: primaryColor }}
                    >
                      PROMO CODE
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter code"
                    className="w-full bg-[#F4EFE6] border border-[#D4CABA] rounded-xl p-4 text-sm placeholder-[#9B8B6F] focus:outline-none focus:border-[#7D7566]"
                    style={{ color: primaryColor }}
                  />
                </div>

                {/* My Booking */}
                <button
                  className="w-full text-center text-sm font-semibold py-3 border-t border-[#D4CABA]"
                  style={{ color: primaryColor }}
                  onClick={() => router.push(`/my-trip`)}
                >
                  MY BOOKING
                </button>

                {/* Book Button */}
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="w-full py-4 rounded-full text-sm font-semibold disabled:opacity-60 transition-all shadow-sm hover:opacity-90"
                  style={{
                    backgroundColor: secondaryColor,
                    color: calculatedButtonTextColor
                  }}
                >
                  {loading ? "LOADING..." : "BOOK NOW"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* CALENDAR MODAL */}
        {/* CALENDAR MODAL - Rendered via Portal at root level */}
        {isCalendarOpen &&
          createPortal(
            <>

              <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
                onClick={() => setIsCalendarOpen(false)}
              />

              <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-auto" >

                <button
                  onClick={() => setIsCalendarOpen(false)}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white transition-colors shadow-md"
                >
                  <X className="w-5 h-5" style={{ color: primaryColor }} />
                </button>


                <div className="p-6 md:p-8">
                  <DatePickerWithHover
                    checkIn={checkIn}
                    checkOut={checkOut}
                    temporaryCheckOut={temporaryCheckOut}
                    onDateSelect={(date: Date) => {

                      if (selectionMode === 'checkin') {
                        setCheckIn(date);
                        setCheckOut(null);
                        setSelectionMode('checkout');
                        setIsSelectingRange(true);
                      } else {
                        if (date > checkIn!) {
                          setCheckOut(date);
                          setIsSelectingRange(false);
                          setTimeout(() => setIsCalendarOpen(false), 300);
                          setSelectionMode('checkin');
                          setTemporaryCheckOut(null);
                        } else {
                          setCheckIn(date);
                          setCheckOut(null);
                          setSelectionMode('checkout');
                          setIsSelectingRange(true);
                        }
                      }
                    }}
                    onDayMouseEnter={(date: Date) => {
                      if (isSelectingRange && checkIn && date > checkIn) {
                        setTemporaryCheckOut(date);
                      }
                    }}
                    onDayMouseLeave={() => setTemporaryCheckOut(null)}
                    isSelectingRange={isSelectingRange}
                  />
                </div>
              </div>
            </>,
            document.body
          )}

        <GuestSelector
          isOpen={isGuestSelectorOpen}
          onClose={() => setIsGuestSelectorOpen(false)}
          onApply={handleGuestSelection}
        />
      </div>
    </>
  );
};

export default SearchWidget;