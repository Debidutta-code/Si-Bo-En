"use client";

import { useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import SLogo from "../assets/SLogo.png";
import ZLogo from "../assets/ZLogo.png";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { setBookingContext, clearSenderUrl, setSenderUrl } from "@/src/store/bookingSlice";
import axios from "axios";
import { RootState } from "../../store/store";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const dispatch = useDispatch();
  const router = useRouter();
  const bookingContext = useSelector((state: RootState) => state.booking);
  const senderUrl = useSelector((state: RootState) => state.booking.senderUrl);

  const staticBookingData = {
    PropertyCode: "WOQDD3",
  };

  const handleBookNowClick = async () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(today.getDate() + 2);

    const startDate = tomorrow.toISOString().split("T")[0];
    const endDate = dayAfterTomorrow.toISOString().split("T")[0];

    const basePayload = {
      startDate,
      endDate,
      guests: { adults: 1, children: 0, rooms: 1, childAges: [] },
      PropertyCode:
        bookingContext.PropertyCode || staticBookingData.PropertyCode,
      location: "DefaultCity",
      numberOfRooms: 1,
    };

    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/room/rooms_by_propertyId2?code=${staticBookingData.PropertyCode}`,
        basePayload
      );

      const hotelName = response.data?.propertyName || "Hotel";

      const finalPayload = { ...basePayload, hotelName };

      dispatch(setBookingContext(finalPayload));
      localStorage.setItem("bookingContext", JSON.stringify(finalPayload));

      const queryParams = new URLSearchParams({
        code: staticBookingData.PropertyCode,
      });
      router.push(`/Rooms?${queryParams.toString()}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
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

  setIsMenuOpen(false); // close mobile menu if open
};


  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 ${
        isHomePage ? "bg-black text-white" : "bg-white text-black shadow"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20 lg:h-24">

<div className="flex-shrink-0">
  <button
    onClick={handleHomeClick}
    className="flex items-center focus:outline-none"
  >
    <Image
      src={isHomePage ? ZLogo : SLogo}
      alt="Logo"
      width={isHomePage ? 120 : 160}
      height={isHomePage ? 40 : 70}
      className="object-contain"
    />
  </button>
</div>


          {/* Desktop Nav */}
         <div className="hidden lg:flex items-center md:space-x-4 lg:space-x-6 text-sm font-medium">
  <button onClick={handleHomeClick} className="hover:text-amber-400">
    Home
  </button>

  <p
    onClick={() => document.querySelector("#service")?.scrollIntoView({ behavior: "smooth" })}
    className="cursor-pointer hover:text-amber-400"
  >
    Services
  </p>
  <p
    onClick={() => document.querySelector("#facilities")?.scrollIntoView({ behavior: "smooth" })}
    className="cursor-pointer hover:text-amber-400"
  >
    Facilities
  </p>
  <p
    onClick={() => document.querySelector("#testimonials")?.scrollIntoView({ behavior: "smooth" })}
    className="cursor-pointer hover:text-amber-400"
  >
    Testimonials
  </p>
  <p
    onClick={() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })}
    className="cursor-pointer hover:text-amber-400"
  >
    Contact Us
  </p>

  <div className="hidden lg:flex items-center space-x-4">
    {isHomePage && (
      <button
        onClick={handleBookNowClick}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
      >
        View Room
      </button>
    )}
    <div className="flex items-center space-x-2 bg-amber-500 px-3 py-1 rounded-full">
      <Phone className="w-4 h-4" />
      <span className="no-underline">+91 9777403555</span>
    </div>
  </div>
</div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            className={`lg:hidden ${
              isHomePage ? "text-white" : "text-black"
            } hover:opacity-80 transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded`}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
       {isMenuOpen && (
  <div
    className={`lg:hidden ${
      isHomePage
        ? "bg-black bg-opacity-90 text-white"
        : "bg-white text-black"
    } rounded-md mt-2 py-4 px-4 space-y-3 text-sm`}
  >
    <button
      onClick={() => {
        setIsMenuOpen(false);
        handleHomeClick();
      }}
      className="block w-full text-left"
    >
      Home
    </button>
 <p
    onClick={() => { setIsMenuOpen(false); document.querySelector("#service")?.scrollIntoView({ behavior: "smooth" })}}
    className="cursor-pointer hover:text-amber-400"
  >
    Services
  </p>
  <p
    onClick={() => { setIsMenuOpen(false) ;document.querySelector("#facilities")?.scrollIntoView({ behavior: "smooth" })}}
    className="cursor-pointer hover:text-amber-400"
  >
    Facilities
  </p>
  <p
    onClick={() =>{setIsMenuOpen(false); document.querySelector("#testimonials")?.scrollIntoView({ behavior: "smooth" })}}
    className="cursor-pointer hover:text-amber-400"
  >
    Testimonials
  </p>
    <p
      onClick={() => {
        setIsMenuOpen(false);
        document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
      }}
      className="block w-full text-left cursor-pointer"
    >
      Contact Us
    </p>

    <button
      onClick={() => {
        setIsMenuOpen(false);
        handleBookNowClick();
      }}
      className="w-full bg-indigo-600 text-white py-2 rounded"
    >
      View Room
    </button>

    <div className="flex items-center space-x-2 mt-4">
      <Phone className="w-4 h-4" />
      <span>+91 9777403555</span>
    </div>
  </div>
)}

      </div>
    </nav>
  );
};

export default Navbar;
