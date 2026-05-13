"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Globe, Menu, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import ZLogo from "../assets/revchilli.png";
import { useDispatch, useSelector } from "react-redux";
import { setSenderUrl } from "@/src/store/bookingSlice";
import { RootState } from "../../store/store";
import LanguageSwitcher from "../languageSwitcher/LanguageSwitcher";

const Navbar = () => {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const propertyCode = searchParams.get("code");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dynamicLogo, setDynamicLogo] = useState<string | null>(null);
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isAgencyApplicationPage = pathname.includes("/agency-application");
  const isRoomsPage = pathname.includes("/Rooms");
  const dispatch = useDispatch();
  const router = useRouter();
  const bookingContext = useSelector((state: RootState) => state.booking);
  const senderUrl = useSelector((state: RootState) => state.booking.senderUrl);
  const agenturl = process.env.NEXT_PUBLIC_PARTNER_URL!;

  useEffect(() => {
    const updateLogo = () => {
      const logoFromContext =
        bookingContext?.bookingEngineColor?.logo ||
        bookingContext?.PropertyDetails?.bookingEngineConfig?.logo;

      if (logoFromContext) {
        setDynamicLogo(logoFromContext);
        return;
      }

      try {
        const stored = localStorage.getItem("bookingstorage");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.logoIcon) {
            setDynamicLogo(parsed.logoIcon);
            return;
          }
        }
      } catch (error) {
        console.error("Error reading logo from storage:", error);
      }

      setDynamicLogo(null);
    };

    updateLogo();
    window.addEventListener("storage", updateLogo);
    window.addEventListener("bookingStorageUpdated", updateLogo);
    return () => {
      window.removeEventListener("storage", updateLogo);
      window.removeEventListener("bookingStorageUpdated", updateLogo);
    };
  }, [
    bookingContext?.bookingEngineColor?.logo,
    bookingContext?.PropertyDetails?.bookingEngineConfig?.logo,
  ]);

  const handleHomeClick = () => {
    const bookingEngineUrl =
      bookingContext?.PropertyDetails?.bookingEngineConfig?.url ||
      bookingContext?.bookingEngineColor?.url;

    let url = bookingEngineUrl || senderUrl;
    if (!url) {
      url = sessionStorage.getItem("senderUrl") || undefined;
      if (url) dispatch(setSenderUrl(url));
    }

    const isExternalUrl = (candidate?: string) => {
      if (!candidate) return false;
      try {
        const u = new URL(candidate, window.location.origin);
        return u.origin !== window.location.origin;
      } catch {
        return false;
      }
    };

    if (isExternalUrl(url)) {
      window.location.href = url!;
    } else {
      router.push("/");
    }
    setIsMenuOpen(false);
  };

  const renderLogo = () => {
    if (isHomePage) {
      return (
        <Image src={ZLogo} alt="Logo" width={120} height={40} className="object-contain" />
      );
    }

    if (dynamicLogo) {
      return (
        <div className="relative w-32 h-10 sm:w-40 sm:h-12">
          <Image src={dynamicLogo} alt="Hotel Logo" fill className="object-contain" unoptimized />
        </div>
      );
    }

    return (
      <Image src={ZLogo} alt="Logo" width={120} height={40} className="object-contain" />
    );
  };

  const navBg = isHomePage
    ? "bg-white/80 backdrop-blur-md text-black shadow-sm"
    : "bg-white text-black shadow";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20 lg:h-24">

          {/* Logo */}
          <div className="flex-shrink-0">
            <button onClick={handleHomeClick} className="flex items-center focus:outline-none">
              {renderLogo()}
            </button>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-6 text-sm font-medium">

            {/* Home Page Links */}
            {isHomePage && (
              <>
                <button onClick={handleHomeClick} className="hover:text-[#1A98A6]">{t("Navbar.home")}</button>
                <p
                  onClick={() => document.querySelector("#service")?.scrollIntoView({ behavior: "smooth" })}
                  className="cursor-pointer hover:text-[#1A98A6]"
                >
                  {t("Navbar.services")}
                </p>
                <p
                  onClick={() => document.querySelector("#contact-us")?.scrollIntoView({ behavior: "smooth" })}
                  className="cursor-pointer hover:text-[#1A98A6]"
                >
                  {t("Navbar.contactUs")}
                </p>
              </>
            )}

            {/* Language Switcher — before Partner Login */}
            <div className="flex-shrink-0">
              <LanguageSwitcher />
            </div>

            {/* Partner Login */}
             {
              !isAgencyApplicationPage && (
                <button
              onClick={()=>router.push("/agency-application")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: bookingContext?.bookingEngineColor?.primaryColor
                  ? `${bookingContext?.bookingEngineColor?.primaryColor}20`
                  : "#F4EFE6",
                color: bookingContext?.bookingEngineColor?.primaryColor || "#5B543F",
              }}
            >
             <Globe size={16} /> {t("Navbar.becomApartner")}
            </button>
              )
             }
            <button
              onClick={() => window.open(agenturl, "_blank")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: bookingContext?.bookingEngineColor?.primaryColor
                  ? `${bookingContext?.bookingEngineColor?.primaryColor}20`
                  : "#F4EFE6",
                color: bookingContext?.bookingEngineColor?.primaryColor || "#5B543F",
              }}
            >
              {t("Navbar.partnerLogin")}
            </button>
            <button
              onClick={() => router.push(`/login`)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: bookingContext?.bookingEngineColor?.primaryColor
                  ? `${bookingContext?.bookingEngineColor?.primaryColor}20`
                  : "#F4EFE6",
                color: bookingContext?.bookingEngineColor?.primaryColor || "#5B543F",
              }}
            >
              {t("Navbar.loyaltyGuestLogin")}
            </button>

            {/* My Booking */}
            {!isHomePage && propertyCode && (
              <button
                onClick={() => router.push(`/my-trip?propertyCode=${propertyCode}`)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: bookingContext?.bookingEngineColor?.primaryColor
                    ? `${bookingContext?.bookingEngineColor?.primaryColor}20`
                    : "#F4EFE6",
                  color: bookingContext?.bookingEngineColor?.primaryColor || "#5B543F",
                }}
              >
                {t("Navbar.myBooking")}
              </button>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden hover:opacity-80 transition duration-200 focus:outline-none"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white text-black rounded-md mt-2 py-4 px-4 space-y-3 text-sm shadow-lg">

            {/* Language Switcher — top of mobile menu */}
            <div className="py-1">
              <LanguageSwitcher onLanguageChange={() => setIsMenuOpen(false)} />
            </div>

            {/* Home Page Links */}
            {isHomePage && (
              <>
                <button
                  onClick={() => { setIsMenuOpen(false); handleHomeClick(); }}
                  className="block w-full text-left hover:text-amber-500"
                >
                  {t("Navbar.home")}
                </button>
                <p
                  onClick={() => {
                    setIsMenuOpen(false);
                    document.querySelector("#service")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="cursor-pointer hover:text-[#1A98A6]"
                >
                  {t("Navbar.services")}
                </p>
                <p
                  onClick={() => {
                    setIsMenuOpen(false);
                    document.querySelector("#contact-us")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="cursor-pointer hover:text-[#1A98A6]"
                >
                  {t("Navbar.contactUs")}
                </p>
              </>
            )}

            {isRoomsPage && (
              <>
               {
                  !isAgencyApplicationPage && (
                    <button
                  onClick={()=>router.push("/agency-application")}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: bookingContext?.bookingEngineColor?.primaryColor
                      ? `${bookingContext?.bookingEngineColor?.primaryColor}20`
                      : "#F4EFE6",
                    color: bookingContext?.bookingEngineColor?.primaryColor || "#5B543F",
                  }}
                >
                 <Globe size={16} /> {t("Navbar.becomApartner")}
                </button>
                  )
                }
                <button
              onClick={() => router.push(`/login`)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: bookingContext?.bookingEngineColor?.primaryColor
                      ? `${bookingContext?.bookingEngineColor?.primaryColor}20`
                      : "#F4EFE6",
                    color: bookingContext?.bookingEngineColor?.primaryColor || "#5B543F",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
              {t("Navbar.loyaltyGuestLogin")}
                </button>
                
                <button
                  onClick={() => { setIsMenuOpen(false); window.open(agenturl, "_blank"); }}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: bookingContext?.bookingEngineColor?.primaryColor
                      ? `${bookingContext?.bookingEngineColor?.primaryColor}20`
                      : "#F4EFE6",
                    color: bookingContext?.bookingEngineColor?.primaryColor || "#5B543F",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  {t("Navbar.partnerLogin")}
                </button>
                <button
                  onClick={() => router.push(`/my-trip?propertyCode=${propertyCode}`)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: bookingContext?.bookingEngineColor?.primaryColor
                      ? `${bookingContext?.bookingEngineColor?.primaryColor}20`
                      : "#F4EFE6",
                    color: bookingContext?.bookingEngineColor?.primaryColor || "#5B543F",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                    <rect x="9" y="3" width="6" height="4" rx="1" />
                  </svg>
                  {t("Navbar.myBooking")}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;