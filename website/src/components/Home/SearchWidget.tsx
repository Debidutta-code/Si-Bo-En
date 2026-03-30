"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Users,
  X,
} from "lucide-react";
import GuestSelector from "../GuestModals/GuestSelector";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./styles/custom-datepicker.css";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { setBookingContext, setSenderUrl } from "../../store/bookingSlice";
import toast from "react-hot-toast";
import { RootState } from "@/src/store/store";
import React from "react";
import { createPortal } from "react-dom";
import { useBookingStorage } from "@/src/hooks/useBookingStorage";
interface Room {
  adults: number;
  children: number;
  childAges: number[];
}
interface GuestInfo {
  adults: number;
  children: number;
  rooms: number | Room[]; // ✅ Change from 'number' to allow both types
  roomsArray?: Room[]; // ✅ Add this
}
interface SearchWidgetProps {
  onSearchStart?: (payload: {
    startDate: string;
    endDate: string;
    guests: any;
    PropertyCode: string;
    promocode: string;
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
  isSelectingRange,
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
      (temporaryCheckOut
        ? date <= temporaryCheckOut
        : checkOut
          ? date <= checkOut
          : false);

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
      minDate={new Date()}
      startDate={checkIn}
      endDate={temporaryCheckOut || checkOut}
      selectsStart
      selectsEnd
      monthsShown={typeof window !== 'undefined' && window.innerWidth < 640 ? 1 : 2}
      inline
      calendarClassName="terra-solis-calendar"
      popperClassName="terra-solis-popper"
      dayClassName={getDayClassName}
      renderDayContents={renderDayContents}
    />
  );
};

const SearchWidget: React.FC<SearchWidgetProps> = ({ onSearchStart }) => {
  const { t, i18n } = useTranslation();
  const senderUrl = useSelector((state: RootState) => state.booking.senderUrl);

  const formatNumber = (num: number) => {
    if (i18n.language === "ar") {
      return num.toLocaleString("ar-EG");
    }
    return num.toString();
  };

  const dispatch = useDispatch();
  const [isGuestSelectorOpen, setIsGuestSelectorOpen] = useState(false);
  const [guestSummary, setGuestSummary] = useState(
    "1 adults - 0 children - 1 room",
  );
  const userTriggeredSearch = useRef(false);
  const [isRoomsPage, setIsRoomsPage] = useState(false);
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
    adults: 1,
    children: 0,
    rooms: 1,
    roomsArray: [{ adults: 1, children: 0, childAges: [] }],
  });

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const [checkIn, setCheckIn] = useState<Date | null>(today);
  const [checkOut, setCheckOut] = useState<Date | null>(tomorrow);
  const [promocode, setPromocode] = useState<string>("")
  const [loading, setLoading] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [temporaryCheckOut, setTemporaryCheckOut] = useState<Date | null>(null);
  const [isSelectingRange, setIsSelectingRange] = useState(false);
  const [selectionMode, setSelectionMode] = useState<"checkin" | "checkout">(
    "checkin",
  );

  const bookingContext = useSelector((state: RootState) => state.booking);


  const { colors, logoIcon } = useBookingStorage(bookingContext);
  const { primaryColor, secondaryColor, tertiaryColor, buttonTextColor } =
    colors;
  const hotelcode = bookingContext?.PropertyCode || "4BTXDZ";
  const PathName = usePathname();

  const totalGuests = guestInfo.adults + guestInfo.children;

  useEffect(() => {
    if (bookingContext) {
      if (bookingContext.startDate) {
        setCheckIn(new Date(bookingContext.startDate));
        setSelectionMode("checkout");
      }
      if (bookingContext.endDate) {
        setCheckOut(new Date(bookingContext.endDate));
      }
      if (bookingContext.promocode) {
        setPromocode(bookingContext.promocode);
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
        const normalizedGuests: GuestInfo = {
          adults: totalAdults,
          children: totalChildren,
          rooms: roomsCount,
          roomsArray: Array.isArray(g.rooms)
            ? g.rooms.map((r: any) => ({
              adults: r.adults || 0,
              children: r.children || 0,
              childAges: r.childAges || [],        // ✅ ensures childAges always exists
            }))
            : g.roomsArray?.map((r: any) => ({
              adults: r.adults || 0,
              children: r.children || 0,
              childAges: r.childAges || [],
            })) ?? [{ adults: totalAdults, children: totalChildren, childAges: [] }],
        };
        setGuestInfo(normalizedGuests);
        setGuestSummary(
          `${totalAdults || 1} adult${totalAdults !== 1 ? "s" : ""} - ${totalChildren || 0
          } child${totalChildren !== 1 ? "ren" : ""} - ${roomsCount} room${roomsCount !== 1 ? "s" : ""
          }`,
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
  useEffect(() => {
    setIsRoomsPage(PathName.includes('/Rooms'));
  }, [PathName]);
  const handleGuestSelection = (summary: string, data: any) => {
    setGuestSummary(summary);

    // Transform the data from GuestSelector to match the expected format
    if (Array.isArray(data.rooms)) {
      // Calculate totals from rooms array
      const totalAdults = data.rooms.reduce(
        (sum: number, room: any) => sum + (room.adults || 0),
        0,
      );
      const totalChildren = data.rooms.reduce(
        (sum: number, room: any) => sum + (room.children || 0),
        0,
      );
      const roomsCount = data.rooms.length;

      const transformedData = {
        adults: totalAdults,
        children: totalChildren,
        rooms: roomsCount,
        // Keep the original rooms array with childAges preserved
        roomsArray: data.rooms.map((r: any) => ({
          adults: r.adults || 0,
          children: r.children || 0,
          childAges: r.childAges || [],
        })),
      };

      setGuestInfo(transformedData);
    } else {
      // If data is already in the correct format, use it as is
      setGuestInfo(data);
    }

    userTriggeredSearch.current = true;
  };

  const router = useRouter();

  const promocodeRef = useRef(promocode);
  useEffect(() => {
    promocodeRef.current = promocode;
  }, [promocode]);

  const handleSearch = async () => {
    if (!checkIn || !checkOut) {
      toast.error(t("SearchWidget.errorDates"));
      return;
    }
    if (checkOut <= checkIn) {
      toast.error(t("SearchWidget.errorCheckOut"));
      return;
    }

    // Derive the rooms count from guestInfo
    const roomsCount =
      Array.isArray(guestInfo.rooms)
        ? guestInfo.rooms.length
        : typeof guestInfo.rooms === "number"
          ? guestInfo.rooms
          : 1;

    // Build a CLEAN payload — only the fields the API needs
    // Do NOT spread bookingContext to avoid leaking PropertyDetails, bookingEngineColor, etc.
    const payload = {
      PropertyCode: hotelcode,
      startDate: checkIn.toISOString().split("T")[0],
      endDate: checkOut.toISOString().split("T")[0],
      guests: guestInfo,
      location: bookingContext.location || "",
      numberOfRooms: roomsCount,
      promocode: promocodeRef.current, // ✅ always fresh, no stale closure
      bookingSource: bookingContext.bookingSource || "direct",
      paymentMethod: bookingContext.paymentMethod || "pay_at_hotel",
      hotelName: bookingContext.hotelName || "",
    };

    // Update Redux (Rooms page reads this directly on client-side navigation)
    dispatch(setBookingContext(payload));

    if (onSearchStart) {
      onSearchStart(payload); // ✅ Rooms.tsx does the one and only fetch
    }

    if (PathName === "/") {
      router.push(`Rooms/?${new URLSearchParams({ code: hotelcode }).toString()}`);
    }
  };


  const handleDateSelect = (date: Date) => {
    if (selectionMode === "checkin") {
      // First click - set check-in
      setCheckIn(date);
      setCheckOut(null);
      setSelectionMode("checkout");
      setIsSelectingRange(true);
    } else if (selectionMode === "checkout") {
      // Second click - set check-out
      if (date > checkIn!) {
        setCheckOut(date);
        setIsSelectingRange(false);
        // Close the calendar automatically after selecting check-out
        setTimeout(() => {
          setIsCalendarOpen(false);
          setSelectionMode("checkin"); // Reset for next time
          setTemporaryCheckOut(null);
        }, 300);
      } else if (date < checkIn!) {
        // If user selects a date before current check-in, start over
        setCheckIn(date);
        setCheckOut(null);
        setSelectionMode("checkout");
        setIsSelectingRange(true);
      }
    }
  };

  const handleDateMouseEnter = (date: Date) => {
    if (isSelectingRange && checkIn && date > checkIn) {
      setTemporaryCheckOut(date);
    }
  };



  const openCalendar = () => {
    setIsCalendarOpen(true);
    if (checkIn && checkOut) {
      setSelectionMode("checkin");
      setIsSelectingRange(false);
      setTemporaryCheckOut(null);
    }
    else if (checkIn && !checkOut) {
      setSelectionMode("checkout");
      setIsSelectingRange(true);
    }
    else {
      setSelectionMode("checkin");
      setIsSelectingRange(false);
    }
  };

  const closeCalendar = () => {
    setIsCalendarOpen(false);
    setTemporaryCheckOut(null);
    // Reset to check-in mode for next time
    if (!checkOut) {
      setSelectionMode("checkin");
      setIsSelectingRange(false);
    }
  };

  // ✅ Redux only, no sessionStorage
  const handleHomeClick = () => {
    if (senderUrl) {
      window.location.href = senderUrl;
    } else {
      router.push("/");
    }
  };

  // Function to get text color that contrasts with background
  const getContrastTextColor = (bgColor: string) => {
    // Convert hex to RGB
    const hex = bgColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return black or white based on luminance
    return luminance > 0.5 ? "#2F2A1F" : "#FFFFFF";
  };

  // Calculate button text color - use provided buttonTextColor or get contrast color
  const calculatedButtonTextColor =
    buttonTextColor || getContrastTextColor(secondaryColor);

  // //console.log("Rendering SearchWidget with colors:", { primaryColor, secondaryColor, tertiaryColor, buttonTextColor }, bookingContext);

  return (
    <>
      {isCalendarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
          onClick={closeCalendar}
        />
      )}

      <div className="w-full bg-[#F4EFE6] border-b border-[#D4CABA]">
        <div className="mx-auto px-4 sm:px-6 py-3 flex justify-center">
          {/* Widget Row */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 lg:gap-4 xl:gap-6 w-full max-w-[900px]">

            {/* Date Selector */}
            <div
              onClick={openCalendar}
              className="bg-white border-2 rounded-xl lg:rounded-[40px] px-4 lg:px-6 py-3 lg:py-4 flex items-center gap-3 lg:gap-6 shadow-sm cursor-pointer hover:border-[#7D7566] transition-colors flex-1 lg:flex-initial"
              style={{ borderColor: tertiaryColor }}
            >
              {/* Check-in */}
              <div className="text-center flex-1 min-w-[70px] lg:min-w-[100px]">
                <p className="text-[9px] tracking-[0.15em] font-medium mb-1" style={{ color: tertiaryColor }}>
                  {t("SearchWidget.checkIn")}
                </p>
                <p className="text-2xl lg:text-[40px] font-semibold leading-none mb-1" style={{ color: primaryColor }}>
                  {formatNumber(checkIn?.getDate() ?? 0)}
                </p>
                <p className="text-[9px] lg:text-[10px] uppercase tracking-wider font-medium" style={{ color: tertiaryColor }}>
                  {checkIn?.toLocaleDateString(i18n.language === "ar" ? "ar-EG" : "en-US", { month: "short", year: "numeric" })}
                </p>
              </div>

              {/* Arrow */}
              <div className="text-xl lg:text-[32px] font-light px-2 flex-shrink-0" style={{ color: tertiaryColor }}>
                ›
              </div>

              {/* Check-out */}
              <div className="text-center flex-1 min-w-[70px] lg:min-w-[100px]">
                <p className="text-[9px] tracking-[0.15em] font-medium mb-1" style={{ color: tertiaryColor }}>
                  {t("SearchWidget.checkOut")}
                </p>
                <p className="text-2xl lg:text-[40px] font-semibold leading-none mb-1" style={{ color: primaryColor }}>
                  {checkOut ? formatNumber(checkOut.getDate()) : "--"}
                </p>
                <p className="text-[9px] lg:text-[10px] uppercase tracking-wider font-medium" style={{ color: tertiaryColor }}>
                  {checkOut
                    ? checkOut.toLocaleDateString(i18n.language === "ar" ? "ar-EG" : "en-US", { month: "short", year: "numeric" })
                    : t("SearchWidget.checkOutSelect")}
                </p>
              </div>
            </div>

            {/* Occupancy */}
            <button
              onClick={() => setIsGuestSelectorOpen(true)}
              className="bg-white border rounded-xl px-4 py-3 hover:bg-[#FAFAF8] transition-colors shadow-sm w-full md:w-auto"
              style={{ borderColor: "#C4BAA5" }}
            >
              <p className="text-[9px] tracking-[0.15em] font-medium mb-2" style={{ color: tertiaryColor }}>
                {t("SearchWidget.occupancy")}
              </p>
              <div className="flex items-center justify-center gap-3">
                {/* Rooms */}
                <div className="flex items-center gap-1">
                  <div className="w-5 h-5 bg-[#F4EFE6] rounded-full flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#5B543F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold" style={{ color: primaryColor }}>
                    {formatNumber(Array.isArray(guestInfo.rooms) ? guestInfo.rooms.length : guestInfo.rooms || 1)}
                  </span>
                </div>
                {/* Adults */}
                <div className="flex items-center gap-1">
                  <div className="w-5 h-5 bg-[#F4EFE6] rounded-full flex items-center justify-center">
                    <Users className="w-2.5 h-2.5" style={{ color: "#5B543F" }} />
                  </div>
                  <span className="text-xs font-bold" style={{ color: primaryColor }}>
                    {formatNumber(Array.isArray(guestInfo.rooms)
                      ? guestInfo.rooms.reduce((sum, room) => sum + (room.adults || 0), 0)
                      : guestInfo.adults || 1)}
                  </span>
                </div>
                {/* Children */}
                <div className="flex items-center gap-1">
                  <div className="w-5 h-5 bg-[#F4EFE6] rounded-full flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#5B543F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 12h.01M15 12h.01M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5" />
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold" style={{ color: primaryColor }}>
                    {formatNumber(Array.isArray(guestInfo.rooms)
                      ? guestInfo.rooms.reduce((sum, room) => sum + (room.children || 0), 0)
                      : guestInfo.children || 0)}
                  </span>
                </div>
              </div>
            </button>

            {/* Promo Code */}
            <div className="flex flex-col min-w-[130px] xl:min-w-[180px]">
              <input
                type="text"
                value={promocode}
                onChange={(e) => {
                  setPromocode(e.target.value.toUpperCase());
                  promocodeRef.current = e.target.value.toUpperCase(); // ✅ sync immediately, no useEffect lag
                }}
                placeholder={t("SearchWidget.promoCode")}
                className="bg-transparent border-b-2 pb-2 text-[10px] tracking-[0.15em] placeholder-[#9B8B6F] focus:outline-none transition-colors w-full"
                style={{ borderColor: tertiaryColor, color: tertiaryColor }}
              />
            </div>

            {/* Book Button */}
            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full md:w-auto px-6 lg:px-10 py-3 lg:py-4 rounded-full text-xs lg:text-[11px] font-semibold tracking-[0.15em] disabled:opacity-60 transition-all shadow-sm hover:opacity-90 whitespace-nowrap"
              style={{ backgroundColor: secondaryColor, color: calculatedButtonTextColor }}
            >
              {loading ? t("SearchWidget.loading") : t("SearchWidget.bookNow")}
            </button>
          </div>
        </div>

        {/* Calendar Modal */}
        {isCalendarOpen && createPortal(
          <>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]" onClick={() => setIsCalendarOpen(false)} />
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 overflow-auto">
              <button
                onClick={() => setIsCalendarOpen(false)}
                className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white transition-colors shadow-md"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: primaryColor }} />
              </button>
              {/* Mobile: single month, Desktop: two months */}
              <div className="p-3 sm:p-6 w-full max-w-sm sm:max-w-2xl">
                <DatePickerWithHover
                  checkIn={checkIn}
                  checkOut={checkOut}
                  temporaryCheckOut={temporaryCheckOut}
                  onDateSelect={(date: Date) => {
                    if (selectionMode === "checkin") {
                      setCheckIn(date);
                      setCheckOut(null);
                      setSelectionMode("checkout");
                      setIsSelectingRange(true);
                    } else {
                      if (date > checkIn!) {
                        setCheckOut(date);
                        setIsSelectingRange(false);
                        setTimeout(() => setIsCalendarOpen(false), 300);
                        setSelectionMode("checkin");
                        setTemporaryCheckOut(null);
                      } else {
                        setCheckIn(date);
                        setCheckOut(null);
                        setSelectionMode("checkout");
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

