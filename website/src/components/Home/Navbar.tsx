"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Globe, Menu, X, ChevronDown } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import ZLogo from "../assets/revchilli.png";
import { useDispatch, useSelector } from "react-redux";
import { setSenderUrl } from "@/src/store/bookingSlice";
import { RootState } from "../../store/store";
import LanguageSwitcher from "../languageSwitcher/LanguageSwitcher";
import { clearCustomer } from "@/src/store/customerSlice";
import axios from "axios";
import toast from "react-hot-toast";
import { usePropertyContext } from "@/src/components/context/property-context";

const Navbar = () => {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  // ─── Context & Redux ────────────────────────────────────────────────────────
  // bookingEngineColor, propertyConfigs come from PropertyContext now.
  // We still read senderUrl and customer from Redux — those aren't in the context.
  const { bookingEngineColor, propertyConfigs } = usePropertyContext();
  const senderUrl = useSelector((state: RootState) => state.booking.senderUrl);
  const customer = useSelector((state: RootState) => (state as any).customer);

  // ─── Route flags ────────────────────────────────────────────────────────────
  const isHomePage = pathname === "/";
  const isAgencyApplicationPage = pathname.includes("/agency-application");
  const isRoomsPage = pathname.includes("/Rooms");
  const isMyTripPage = pathname.includes("/my-trip");
  const isSpaPage = pathname.includes("/spa");

  const propertyCode = isRoomsPage
    ? searchParams.get("code")
    : searchParams.get("propertyCode");

  // ─── Local state ────────────────────────────────────────────────────────────
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const customerDropdownRef = useRef<HTMLDivElement>(null);

  const agenturl = process.env.NEXT_PUBLIC_PARTNER_URL!;
  const isSpaEnabled = propertyConfigs?.isSpaModuleEnabled;

  // ─── Logo: prefer context logo, fall back to localStorage, then default ─────
  const contextLogo = bookingEngineColor?.logo ?? null;
  const [localStorageLogo, setLocalStorageLogo] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("bookingstorage");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.logoIcon) setLocalStorageLogo(parsed.logoIcon);
      }
    } catch {
      // ignore parse errors
    }

    const onStorageChange = () => {
      try {
        const stored = localStorage.getItem("bookingstorage");
        const parsed = stored ? JSON.parse(stored) : null;
        setLocalStorageLogo(parsed?.logoIcon ?? null);
      } catch {
        setLocalStorageLogo(null);
      }
    };

    window.addEventListener("storage", onStorageChange);
    window.addEventListener("bookingStorageUpdated", onStorageChange);
    return () => {
      window.removeEventListener("storage", onStorageChange);
      window.removeEventListener("bookingStorageUpdated", onStorageChange);
    };
  }, []);

  const dynamicLogo = contextLogo ?? localStorageLogo;

  // ─── Click-outside for customer dropdown ────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        customerDropdownRef.current &&
        !customerDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCustomerDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const signout = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/customer/logout`,
        {},
        { withCredentials: true }
      );
      dispatch(clearCustomer());
      router.push(window.location.href);
    } catch {
      toast.error("Failed to sign out");
    }
  };

  const handleHomeClick = () => {
    const bookingEngineUrl = bookingEngineColor?.url ?? undefined;
    let url: string | undefined = bookingEngineUrl || senderUrl;

    if (!url) {
      url = sessionStorage.getItem("senderUrl") || undefined;
      if (url) dispatch(setSenderUrl(url));
    }

    const isExternalUrl = (candidate?: string) => {
      if (!candidate) return false;
      try {
        return new URL(candidate, window.location.origin).origin !== window.location.origin;
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

  const storeRedirectAndLogin = () => {
    sessionStorage.setItem("customerRedirectUrl", window.location.href);
    router.push("/login");
  };

  // ─── Shared button style (derived from context color) ───────────────────────
  const navBtnStyle = {
    backgroundColor: bookingEngineColor?.primaryColor
      ? `${bookingEngineColor.primaryColor}20`
      : "#F4EFE6",
    color: bookingEngineColor?.primaryColor || "#5B543F",
  };

  // ─── Logo renderer ──────────────────────────────────────────────────────────
  const renderLogo = () => {
    if (isHomePage || !dynamicLogo) {
      return (
        <Image src={ZLogo} alt="Logo" width={120} height={40} className="object-contain" />
      );
    }
    return (
      <div className="relative w-32 h-10 sm:w-40 sm:h-12">
        <Image src={dynamicLogo} alt="Hotel Logo" fill className="object-contain" unoptimized />
      </div>
    );
  };

  const navBg = isHomePage
    ? "bg-white/80 backdrop-blur-md text-black shadow-sm"
    : "bg-white text-black shadow";

  // ─── Shared nav links (reused in desktop + mobile) ──────────────────────────
  const sharedLinks = (
    <>
      {!isAgencyApplicationPage && (
        <button
          onClick={() => { setIsMenuOpen(false); router.push("/agency-application"); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={navBtnStyle}
        >
          <Globe size={16} /> {t("Navbar.becomApartner")}
        </button>
      )}

      <button
        onClick={() => { setIsMenuOpen(false); window.open(agenturl, "_blank"); }}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        style={navBtnStyle}
      >
        {t("Navbar.partnerLogin")}
      </button>

      {!isHomePage && !isMyTripPage && propertyCode && (
        <button
          onClick={() => { setIsMenuOpen(false); router.push(`/my-trip?propertyCode=${propertyCode}`); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={navBtnStyle}
        >
          {t("Navbar.myBooking")}
        </button>
      )}

      {isSpaEnabled && propertyCode && !isSpaPage && (
        <button
          onClick={() => { setIsMenuOpen(false); router.push(`/spa?propertyCode=${propertyCode}`); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={navBtnStyle}
        >
          {t("Navbar.spa")}
        </button>
      )}
    </>
  );

  // ─── Render ─────────────────────────────────────────────────────────────────
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

          {/* ── Desktop Nav ── */}
          <div className="hidden lg:flex items-center space-x-6 text-sm font-medium">
            {isHomePage && (
              <>
                <button onClick={handleHomeClick} className="hover:text-[#1A98A6]">
                  {t("Navbar.home")}
                </button>
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

            <div className="flex-shrink-0">
              <LanguageSwitcher />
            </div>

            {sharedLinks}

            {/* Customer dropdown */}
            <div className="relative" ref={customerDropdownRef}>
              <button
                onClick={
                  customer.isAuthenticated
                    ? () => setIsCustomerDropdownOpen((o) => !o)
                    : storeRedirectAndLogin
                }
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={navBtnStyle}
              >
                {customer.isAuthenticated
                  ? customer.customer?.firstName || "User"
                  : t("Navbar.customerLogin")}
                {customer.isAuthenticated && (
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${isCustomerDropdownOpen ? "rotate-180" : ""}`}
                  />
                )}
              </button>

              {customer.isAuthenticated && isCustomerDropdownOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl py-2 z-50"
                  style={{ border: "1px solid rgba(0,0,0,0.08)" }}
                >
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-semibold text-sm text-gray-800">
                      {customer.customer?.firstName} {customer.customer?.lastName}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{customer.customer?.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsCustomerDropdownOpen(false);
                        if (propertyCode) sessionStorage.setItem("lastPropertyCode", propertyCode);
                        router.push("/profile");
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      {t("Navbar.profile")}
                    </button>
                  </div>
                  <div className="border-t border-gray-100 py-1">
                    <button
                      onClick={() => { signout(); setIsCustomerDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      {t("Navbar.signOut")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsMenuOpen((o) => !o)}
            className="lg:hidden hover:opacity-80 transition duration-200 focus:outline-none"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* ── Mobile Menu ── */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white text-black rounded-md mt-2 py-4 px-4 space-y-3 text-sm shadow-lg">
            <div className="py-1">
              <LanguageSwitcher onLanguageChange={() => setIsMenuOpen(false)} />
            </div>

            {isHomePage && (
              <>
                <button
                  onClick={() => { setIsMenuOpen(false); handleHomeClick(); }}
                  className="block w-full text-left hover:text-amber-500"
                >
                  {t("Navbar.home")}
                </button>
                <p
                  onClick={() => { setIsMenuOpen(false); document.querySelector("#service")?.scrollIntoView({ behavior: "smooth" }); }}
                  className="cursor-pointer hover:text-[#1A98A6]"
                >
                  {t("Navbar.services")}
                </p>
                <p
                  onClick={() => { setIsMenuOpen(false); document.querySelector("#contact-us")?.scrollIntoView({ behavior: "smooth" }); }}
                  className="cursor-pointer hover:text-[#1A98A6]"
                >
                  {t("Navbar.contactUs")}
                </p>
              </>
            )}

            {/* Shared links (mobile variant: full-width centred) */}
            <div className="flex flex-col gap-3">
              {!isAgencyApplicationPage && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    router.push("/agency-application");
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
                  style={navBtnStyle}
                >
                  <Globe size={16} />
                  {t("Navbar.becomApartner")}
                </button>
              )}

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  window.open(agenturl, "_blank");
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
                style={navBtnStyle}
              >
                {t("Navbar.partnerLogin")}
              </button>

              {!isHomePage && !isMyTripPage && propertyCode && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    router.push(`/my-trip?propertyCode=${propertyCode}`);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
                  style={navBtnStyle}
                >
                  {t("Navbar.myBooking")}
                </button>
              )}

              {isSpaEnabled && propertyCode && !isSpaPage && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    router.push(`/spa?propertyCode=${propertyCode}`);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
                  style={navBtnStyle}
                >
                  {t("Navbar.spa")}
                </button>  
              )}
            </div>
            {/* Customer auth (mobile) */}
            {customer.isAuthenticated ? (
              <>
                <div className="px-4 py-2">
                  <p className="font-medium text-sm">
                    {customer.customer?.firstName} {customer.customer?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{customer.customer?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    if (propertyCode) sessionStorage.setItem("lastPropertyCode", propertyCode);
                    router.push("/profile");
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium"
                  style={navBtnStyle}
                >
                  {t("Navbar.profile")}
                </button>
                <button
                  onClick={() => { signout(); router.push(window.location.href); }}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-red-500"
                  style={{ backgroundColor: "#FEF2F2" }}
                >
                  {t("Navbar.signOut")}
                </button>
              </>
            ) : (
              <button
                onClick={() => { setIsMenuOpen(false); storeRedirectAndLogin(); }}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium"
                style={navBtnStyle}
              >
                {t("Navbar.customerLogin")}
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;