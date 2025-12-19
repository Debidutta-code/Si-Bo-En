"use client";

import { useState, useEffect } from "react";
import { Calendar, Users, Search } from "lucide-react";
import GuestSelector from "../GuestModals/GuestSelector";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { setBookingContext } from "../../store/bookingSlice";
import toast from "react-hot-toast";
import { RootState } from "@/src/store/store";
import { useRef } from "react";
import { useBookingColors } from "../../hooks/useBookingColors";

// Inside the component

interface SearchWidgetProps {
  onSearchStart?: (payload: {
    startDate: string;
    endDate: string;
    guests: any;
    PropertyCode: string;
  }) => void;
}


const SearchWidget: React.FC<SearchWidgetProps> = ({ onSearchStart }) => {
  const dispatch = useDispatch();
  const [isGuestSelectorOpen, setIsGuestSelectorOpen] = useState(false);
  const [guestSummary, setGuestSummary] = useState(
    "1 adults - 0 children - 1 room"
  );
  const userTriggeredSearch = useRef(false);

  interface GuestInfo {
    adults: number;
    children: number;
    rooms: number;
    // childAges: number[];
  }

  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
    adults: 1,
    children: 0,
    rooms: 1,
    // childAges: [],
  });

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(today.getDate() + 2);

  const [checkIn, setCheckIn] = useState<Date | null>(tomorrow);
  const [checkOut, setCheckOut] = useState<Date | null>(dayAfterTomorrow);

  const [loading, setLoading] = useState(false);


  // Inside your SearchWidget component, replace the hardcoded hotelcode with:
  const bookingContext = useSelector((state: RootState) => state.booking);
  const hotelcode = bookingContext?.PropertyCode || "WOQDD3";
  const PathName = usePathname();
  useEffect(() => {
    if (bookingContext) {
      // console.log("the searchWigettriggeredd")
      if (bookingContext.startDate) {
        setCheckIn(new Date(bookingContext.startDate));
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
      userTriggeredSearch.current = false; // reset the flag
    }
  }, [checkIn, checkOut, guestInfo]); // ✅ include guestInfo

  const handleGuestSelection = (summary: string, data: any) => {
    setGuestSummary(summary);
    setGuestInfo(data);
    userTriggeredSearch.current = true; // ✅ Mark guest change
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/room/rooms_by_propertyId2?code=${hotelcode}`,
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
      const hotelName = data?.propertyName || "Hotel";
      const fullContext = {
        ...bookingContext, // keep previous data
        ...payload,
        hotelName: data?.propertyName || "Hotel",
        PropertyDetails: data.propertyDetails,
        bookingEngineColor: data.bookingEngineColor,
      };
      dispatch(setBookingContext(fullContext)); // ✅ full context in Redux

      // Subset to save in localStorage
      const localContext = {
        startDate: payload.startDate,
        endDate: payload.endDate,
        guests: payload.guests,
        PropertyCode: payload.PropertyCode,
        hotelName: fullContext.hotelName, // only what you want locally
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
  const { buttonBgColor } = useBookingColors();
  return (
    <div className="w-full bg-[#F4EFE6] border-b border-[#E2DACB]">
      <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-3 items-center">

        {/* LEFT: LOGO */}
        <div className="flex items-center gap-2 text-xl font-semibold tracking-widest">
          <span>TERRA</span>
          <span className="font-light">SOLIS</span>
        </div>

        {/* CENTER: BOOKING CONTROLS */}
        <div className="flex justify-center">
          <div className="flex items-center gap-4">

            {/* CHECK-IN / CHECK-OUT */}
            {/* CHECK-IN / CHECK-OUT (IMAGE MATCHED UI) */}
            <div className="flex items-center bg-[#F3EEDD] border border-[#5B543F] rounded-[28px] px-8 py-4 gap-8">

              {/* CHECK-IN */}
              <div
                onClick={() => document.getElementById("checkin")?.click()}
                className="cursor-pointer text-center min-w-[90px]"
              >
                <p className="text-[11px] tracking-widest text-[#5B543F]">
                  CHECK-IN
                </p>

                <p className="text-[34px] font-medium leading-none text-[#2F2A1F]">
                  {checkIn?.getDate()}
                </p>

                <p className="text-[11px] uppercase tracking-wide text-[#5B543F]">
                  {checkIn?.toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </p>

                <DatePicker
                  id="checkin"
                  selected={checkIn}
                  onChange={(date) => setCheckIn(date)}
                  minDate={tomorrow}
                  className="hidden"
                />
              </div>

              {/* ARROW */}
              <span className="text-[28px] text-[#5B543F] leading-none">
                ›
              </span>

              {/* CHECK-OUT */}
              <div
                onClick={() => document.getElementById("checkout")?.click()}
                className="cursor-pointer text-center min-w-[90px]"
              >
                <p className="text-[11px] tracking-widest text-[#5B543F]">
                  CHECK-OUT
                </p>

                <p className="text-[34px] font-medium leading-none text-[#2F2A1F]">
                  {checkOut?.getDate() ?? "--"}
                </p>

                <p className="text-[11px] uppercase tracking-wide text-[#5B543F]">
                  {checkOut
                    ? checkOut.toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })
                    : "Select"}
                </p>

                <DatePicker
                  id="checkout"
                  selected={checkOut}
                  onChange={(date) => setCheckOut(date)}
                  minDate={checkIn || tomorrow}
                  className="hidden"
                />
              </div>

            </div>


            {/* OCCUPANCY */}
            <button
              onClick={() => setIsGuestSelectorOpen(true)}
              className="border border-[#D8CFBF] rounded-full px-6 py-3 text-left"
            >
              <p className="text-[11px] tracking-widest text-gray-600">
                OCCUPANCY
              </p>
              <p className="flex items-center gap-2 font-medium">
                <Users className="w-4 h-4" />
                {guestSummary}
              </p>
            </button>

            {/* PROMO CODE */}
            <div className="border-b border-gray-400 w-40 pb-1 text-sm text-gray-500">
              PROMOTIONAL CODE
            </div>

            {/* BOOK BUTTON */}
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-[#E8DFC9] hover:bg-[#DED3B8] px-8 py-3 rounded-full text-sm font-medium tracking-wide disabled:opacity-60"
            >
              {loading ? "LOADING..." : "BOOK"}
            </button>

          </div>
        </div>

        {/* RIGHT: MY BOOKING */}
        <div className="flex justify-end text-sm font-medium cursor-pointer">
          MY BOOKING
        </div>

        {/* GUEST MODAL */}
        {/* {isGuestSelectorOpen && (
          <GuestSelector onClose={() => setIsGuestSelectorOpen(false)} />
        )} */}

      </div>

      <GuestSelector
        isOpen={isGuestSelectorOpen}
        onClose={() => setIsGuestSelectorOpen(false)}
        onApply={handleGuestSelection}
      />
    </div>
  );

};

export default SearchWidget;
