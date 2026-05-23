"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import ZLogo from "@/src/components/assets/revchilli.png";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/store/store";
import { clearCustomer } from "@/src/store/customerSlice";

const TEAL = "#1595A2";

const IconDashboard = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
  </svg>
);

const IconBooking = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconProfile = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconMenu = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const IconClose = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconSignOut = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const NAV = [
  {
    section: null,
    items: [
      { href: "/profile", label: "My BodyHoliday", Icon: IconDashboard },
      { href: "/profile/bookings", label: "Reservations", Icon: IconBooking },
    ],
  },
] as const;

export function ProfileSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const bookingContext = useSelector(
    (state: RootState) => state.booking
  );

  const dynamicLogo =
    bookingContext?.bookingEngineColor?.logo ||
    bookingContext?.PropertyDetails?.bookingEngineConfig?.logo;

  const customerData = useSelector(
    (state: RootState) => state.customer.customer
  );

  const email = customerData?.email ?? "";
  const firstName = customerData?.firstName ?? "";
  const lastName = customerData?.lastName ?? "";

  const name = firstName
    ? `${firstName} ${lastName}`.trim()
    : email.split("@")[0];

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const STORAGE_KEY = "bodyholiday-sidebar-collapsed";

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;

      setIsMobile(mobile);

      if (!mobile) {
        setMobileOpen(false);
      }
    };

    checkMobile();

    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    setCollapsed(localStorage.getItem(STORAGE_KEY) === "true");
  }, []);

  const handleLogout = () => {
    const storedPropertyCode =
      sessionStorage.getItem("lastPropertyCode");

    if (storedPropertyCode) {
      sessionStorage.setItem(
        "customerRedirectUrl",
        `/Rooms?code=${storedPropertyCode}`
      );
    }

    dispatch(clearCustomer());

    router.push("/login");
  };

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;

      localStorage.setItem(STORAGE_KEY, String(next));

      window.dispatchEvent(
        new CustomEvent("sidebarToggle", {
          detail: { collapsed: next },
        })
      );

      return next;
    });
  };

  const toggleMobileMenu = () => {
    setMobileOpen(!mobileOpen);
  };

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');

        .bh-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          width: 260px;
          background: #ffffff;
          border-right: 1px solid #e8ecef;
          display: flex;
          flex-direction: column;
          z-index: 40;
          font-family: 'DM Sans', sans-serif;
          overflow-y: auto;
          transition: transform 0.3s ease-in-out;
        }

        @media (min-width: 768px) {
          .bh-sidebar {
            transform: translateX(0) !important;
          }

          .mobile-hamburger {
            display: none !important;
          }
        }

        @media (max-width: 767px) {
          .bh-sidebar {
            transform: translateX(-100%);
            width: 280px;
            z-index: 1000;
            transition: transform 0.3s ease;
          }

          .bh-sidebar.mobile-open {
            transform: translateX(0);
          }

          .mobile-hamburger {
            position: fixed;
            top: 16px;
            left: 16px;
            z-index: 1001;

            width: 44px;
            height: 44px;

            border: none;
            border-radius: 12px;

            background: white;
            color: #111827;

            display: flex;
            align-items: center;
            justify-content: center;

            cursor: pointer;

            box-shadow: 0 4px 14px rgba(0,0,0,0.12);

            transition: all 0.2s ease;
          }

          .mobile-hamburger:hover {
            background: #f8fafc;
          }

          .mobile-close-btn {
            width: 36px;
            height: 36px;

            border: none;
            border-radius: 10px;

            background: #f1f5f9;
            color: #334155;

            display: flex;
            align-items: center;
            justify-content: center;

            cursor: pointer;

            flex-shrink: 0;

            transition: all 0.2s ease;
          }

          .mobile-close-btn:hover {
            background: #e2e8f0;
          }

          .mobile-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.45);
            z-index: 999;
            display: none;
            backdrop-filter: blur(2px);
          }

          .mobile-overlay.show {
            display: block;
          }
        }

        .bh-brand {
          padding: 0 20px;
          border-bottom: 1px solid #f0f2f4;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 68px;
        }

        .bh-nav {
          flex: auto;
          padding: 14px 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .bh-section-label {
          font-size: 10.5px;
          font-weight: 600;
          color: #a0aab4;
          letter-spacing: 0.10em;
          text-transform: uppercase;
          padding: 14px 12px 6px;
          display: block;
        }

        .bh-nav-item {
          display: flex;
          align-items: center;
          gap: 11px;
          width: 100%;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 400;
          color: #4a5568;
          background: transparent;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: background 0.13s, color 0.13s;
          font-family: 'DM Sans', sans-serif;
          text-align: left;
          line-height: 1;
        }

        .bh-nav-item[data-collapsed="true"] {
          justify-content: center;
          gap: 0;
          padding: 10px;
        }

        .bh-nav-item:hover:not(.active) {
          background: #f4f7fa;
          color: #1a202c;
        }

        .bh-nav-item.active {
          background: ${TEAL};
          color: #ffffff;
          font-weight: 500;
        }

        .bh-nav-item.active svg {
          stroke: #ffffff;
        }

        .bh-nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 20px;
        }

        .bh-user {
          padding: 14px 20px;
          border-top: 1px solid #f0f2f4;
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .bh-user-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #e8f6f8;
          border: 1.5px solid #c5e8ec;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: ${TEAL};
        }

        .bh-user-name {
          font-size: 13px;
          font-weight: 500;
          color: #1a202c;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
          min-width: 0;
        }

        .bh-signout-btn {
          flex-shrink: 0;
          color: #a0aab4;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.15s, background 0.15s;
        }

        .bh-signout-btn:hover {
          color: #c0392b;
          background: #fdf0ee;
        }

        .bh-footer {
          padding: 12px 20px 18px;
          border-top: 1px solid #f0f2f4;
          flex-shrink: 0;
        }

        .bh-footer p {
          font-size: 10.5px;
          color: #a0aab4;
          line-height: 1.7;
        }

        .bh-footer a {
          color: ${TEAL};
          text-decoration: none;
        }

        .bh-footer a:hover {
          text-decoration: underline;
        }

        .bh-mobile-signout {
          display: none;
        }
      `}</style>

      {/* Mobile Hamburger */}
      {isMobile && !mobileOpen && (
        <button
          className="mobile-hamburger"
          onClick={toggleMobileMenu}
          aria-label="Open Menu"
        >
          <IconMenu />
        </button>
      )}

      {/* Mobile Overlay */}
      <div
        className={`mobile-overlay ${mobileOpen ? "show" : ""}`}
        onClick={toggleMobileMenu}
      />

      {/* Sidebar */}
      <aside
        className={`bh-sidebar ${
          mobileOpen ? "mobile-open" : ""
        }`}
        style={{ width: collapsed ? 64 : 260 }}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Desktop Toggle */}
        <button
          onClick={toggle}
          aria-label={
            collapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
          className="absolute top-6 -right-4 items-center justify-center w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm text-gray-500 z-[51] hover:bg-teal-600 hover:text-white transition-colors duration-150 hidden md:flex"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: collapsed
                ? "rotate(0deg)"
                : "rotate(180deg)",
              transition: "transform 0.25s",
            }}
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Brand */}
        <div
          className="bh-brand"
          style={{
            padding: collapsed ? "20px" : "0 20px",
            minHeight: collapsed ? 0 : "68px",
          }}
        >
          {!collapsed && (
            <>
              {dynamicLogo ? (
                <div
                  style={{
                    position: "relative",
                    width: 140,
                    height: 44,
                  }}
                >
                  <Image
                    src={dynamicLogo}
                    alt="Hotel Logo"
                    fill
                    style={{ objectFit: "contain" }}
                    unoptimized
                  />
                </div>
              ) : (
                <Image
                  src={ZLogo}
                  alt="Logo"
                  width={120}
                  height={40}
                  style={{ objectFit: "contain" }}
                />
              )}

              {isMobile && (
                <button
                  className="mobile-close-btn"
                  onClick={toggleMobileMenu}
                  aria-label="Close Menu"
                >
                  <IconClose />
                </button>
              )}
            </>
          )}
        </div>

        {/* Nav */}
        <nav className="bh-nav">
          {NAV.map((group, gi) => (
            <div key={gi}>
              {group.section && (
                <span
                  className="bh-section-label"
                  style={{
                    opacity: collapsed ? 0 : 1,
                    transition: "opacity 0.2s ease",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                  }}
                >
                  {group.section}
                </span>
              )}

              {group.items.map(
                ({ href, label, Icon }) => {
                  const active = isActive(href);

                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => {
                        if (isMobile)
                          setMobileOpen(false);
                      }}
                      className={`bh-nav-item${
                        active ? " active" : ""
                      }`}
                      aria-current={
                        active ? "page" : undefined
                      }
                      title={
                        collapsed ? label : undefined
                      }
                      data-collapsed={collapsed}
                    >
                      <span className="bh-nav-icon">
                        <Icon />
                      </span>

                      <span
                        style={{
                          opacity: collapsed ? 0 : 1,
                          transition:
                            "opacity 0.15s ease",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {label}
                      </span>
                    </Link>
                  );
                }
              )}
            </div>
          ))}

          <button
            className="bh-mobile-signout"
            onClick={handleLogout}
            aria-label="Sign out"
          >
            <IconSignOut />
            <span>Sign out</span>
          </button>
        </nav>

        {/* User */}
        <div
          className="bh-user"
          style={{
            justifyContent: collapsed
              ? "center"
              : "flex-start",
          }}
        >
          <div className="bh-user-avatar">
            <IconProfile />
          </div>

          <span
            className="bh-user-name"
            title={name}
            style={{
              opacity: collapsed ? 0 : 1,
              transition: "opacity 0.2s ease",
            }}
          >
            {name}
          </span>

          {!collapsed && (
            <button
              className="bh-signout-btn"
              onClick={handleLogout}
              title="Sign out"
              aria-label="Sign out"
            >
              <IconSignOut />
            </button>
          )}
        </div>

        {/* Footer */}
        {!collapsed && (
          <div className="bh-footer">
            <p>© 2024 Revchill. All Rights Reserved.</p>
            <p>
              <a href="#">
                Terms and Conditions
              </a>
            </p>
          </div>
        )}
      </aside>
    </>
  );
}

export default ProfileSidebar;