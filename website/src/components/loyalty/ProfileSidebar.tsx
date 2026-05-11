"use client";

import { useState } from "react";
import Image from "next/image";
import ZLogo from "@/src/components/assets/revchilli.png";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/store/store";
import { loyaltyLogout } from "@/src/store/loyaltyUserSlice";

const TEAL = "#1595A2";

const IconDashboard = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
  </svg>
);

const IconBooking = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconProfile = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconMessage = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const IconFaq = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const IconSignOut = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
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
  {
    section: "ACCOUNT",
    items: [
      { href: "/profile", label: "Profile", Icon: IconProfile },
      { href: "/profile", label: "Message Centre", Icon: IconMessage },
      { href: "/profile", label: "FAQ", Icon: IconFaq },
    ],
  },
] as const;

export function ProfileSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const loyaltyUser = useSelector((state: RootState) => (state as any).loyaltyUser);
  const bookingContext = useSelector((state: RootState) => state.booking);
  const dynamicLogo =
    bookingContext?.bookingEngineColor?.logo ||
    bookingContext?.PropertyDetails?.bookingEngineConfig?.logo;
  const profile = loyaltyUser?.profile ?? null;
  const email = profile?.guestEmail ?? loyaltyUser?.email ?? "";
  const firstName = profile?.guest?.firstName ?? "";
  const lastName = profile?.guest?.lastName ?? "";
  const name = firstName ? `${firstName} ${lastName}`.trim() : email.split("@")[0];
  const [collapsed, setCollapsed] = useState(false);
  const STORAGE_KEY = "bodyholiday-sidebar-collapsed";

  const handleLogout = () => {
    dispatch(loyaltyLogout());
    router.push("/login");
  };

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      window.dispatchEvent(new CustomEvent("sidebarToggle", { detail: { collapsed: next } }));
      return next;
    });
  };

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <style>{`
        /* ── Google Font ────────────────────────────────────────────────── */
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');

         /* ── Sidebar shell ──────────────────────────────────────────────── */
          .bh-sidebar {
            position: fixed;
            top: 0; left: 0;
            height: 100vh;
            width: 260px;
            background: #ffffff;
            border-right: 1px solid #e8ecef;
            display: flex;
            flex-direction: column;
            z-index: 40;
            font-family: 'DM Sans', sans-serif;
            overflow: visible;
            transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          }

         /* ── Brand / Logo area ──────────────────────────────────────────── */
         .bh-brand {
           padding: 0px 24px;
           border-bottom: 1px solid #f0f2f4;
           flex-shrink: 0;
           display: flex;
           align-items: center;
           min-height: 64px;
         }
        .bh-logo-text-main {
          font-size: 20px;
          font-weight: 700;
          color: #c0392b;           /* BodyHoliday uses red for brand name */
          letter-spacing: -0.02em;
          line-height: 1;
          font-family: 'DM Sans', sans-serif;
        }
        .bh-logo-text-sub {
          font-size: 11px;
          color: #c0392b;
          letter-spacing: 0.02em;
          margin-top: 1px;
          font-weight: 400;
        }

        /* ── Nav body ───────────────────────────────────────────────────── */
        .bh-nav {
          flex: auto;
          padding: 14px 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        /* Section label (e.g. "ACCOUNT") */
        .bh-section-label {
          font-size: 10.5px;
          font-weight: 600;
          color: #a0aab4;
          letter-spacing: 0.10em;
          text-transform: uppercase;
          padding: 14px 12px 6px;
          display: block;
        }

        /* Nav item */
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

        /* Active state — filled teal pill (matches BodyHoliday's navy) */
        .bh-nav-item.active {
          background: ${TEAL};
          color: #ffffff;
          font-weight: 500;
        }
        .bh-nav-item.active svg {
          stroke: #ffffff;
        }

        .bh-nav-icon {
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; width: 20px;
        }

        /* ── User pill at bottom ────────────────────────────────────────── */
        .bh-user {
          padding: 14px 20px;
          border-top: 1px solid #f0f2f4;
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }
        .bh-user-avatar {
          width: 34px; height: 34px;
          border-radius: 50%;
          background: #e8f6f8;
          border: 1.5px solid #c5e8ec;
          display: flex; align-items: center; justify-content: center;
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
          display: flex; align-items: center; justify-content: center;
          transition: color 0.15s, background 0.15s;
        }
        .bh-signout-btn:hover {
          color: #c0392b;
          background: #fdf0ee;
        }

        /* ── Footer ─────────────────────────────────────────────────────── */
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
        .bh-footer a:hover { text-decoration: underline; }

        /* ── Mobile: bottom tab bar ─────────────────────────────────────── */
        @media (max-width: 767px) {
          .bh-sidebar {
            top: auto; bottom: 0; left: 0;
            width: 100%; height: 60px;
            flex-direction: row;
            border-right: none;
            border-top: 1px solid #e8ecef;
            overflow: hidden;
          }
          .bh-brand  { display: none; }
          .bh-user   { display: none; }
          .bh-footer { display: none; }
          .bh-nav {
            flex-direction: row;
            align-items: center;
            justify-content: space-around;
            padding: 0 4px;
            gap: 0;
          }
          .bh-section-label { display: none; }
          .bh-nav-item {
            flex-direction: column;
            gap: 3px;
            padding: 8px 10px;
            font-size: 9.5px;
            border-radius: 10px;
            align-items: center;
            justify-content: center;
            min-width: 52px;
          }
          /* Mobile sign-out */
          .bh-mobile-signout {
            display: flex !important;
            flex-direction: column; align-items: center; gap: 3px;
            padding: 8px 10px; border-radius: 10px;
            border: none; cursor: pointer;
            font-size: 9.5px; color: #a0aab4; background: transparent;
            flex-shrink: 0;
            font-family: 'DM Sans', sans-serif;
          }
          .bh-mobile-signout:hover { color: #c0392b; }
        }
        .bh-mobile-signout { display: none; }
      `}</style>

      <aside
        className="bh-sidebar"
        style={{ width: collapsed ? 64 : 260, overflowX: "visible" }}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* ── Toggle button ── */}
        <button
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute top-6 -right-4 flex items-center justify-center w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm text-gray-500 z-[51] hover:bg-teal-600 hover:text-white transition-colors duration-150"
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
            className="transition-transform duration-250"
            style={{
              transform: collapsed ? "rotate(0deg)" : "rotate(180deg)",
              transition: "transform 0.25s",
            }}
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* ── Brand ── */}
        <div className="bh-brand" style={{
          padding: collapsed ? "40px" : "0px 24px",
          minHeight: collapsed ? 0 : "auto"
        }}>
          {!collapsed && (dynamicLogo ? (
            <div style={{ position: "relative", width: 140, height: 44 }}>
              <Image src={dynamicLogo} alt="Hotel Logo" fill style={{ objectFit: "contain" }} unoptimized />
            </div>
          ) : (
            <Image src={ZLogo} alt="Logo" width={120} height={40} style={{ objectFit: "contain" }} />
          ))}
        </div>

        {/* ── Nav ── */}
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
                    whiteSpace: "nowrap"
                  }}
                >
                  {group.section}
                </span>
              )}
              {group.items.map(({ href, label, Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`bh-nav-item${active ? " active" : ""}`}
                    aria-current={active ? "page" : undefined}
                    title={collapsed ? label : undefined}
                    data-collapsed={collapsed}
                  >
                    <span className="bh-nav-icon"><Icon /></span>
                    <span
                      style={{
                        opacity: collapsed ? 0 : 1,
                        transition: "opacity 0.15s ease",
                        overflow: "hidden",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {label}
                    </span>
                  </Link>
                );
              })}
            </div>
          ))}

          {/* Mobile sign-out in nav rail */}
          <button className="bh-mobile-signout" onClick={handleLogout} aria-label="Sign out">
            <IconSignOut />
            Sign out
          </button>
        </nav>

        {/* ── User + sign out ── */}
        <div className="bh-user" style={{ justifyContent: collapsed ? "center" : "flex-start" }}>
          <div className="bh-user-avatar">
            <IconProfile />
          </div>
           <span
             className="bh-user-name"
             title={name}
             style={{ opacity: collapsed ? 0 : 1, transition: "opacity 0.2s ease" }}
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

        {/* ── Footer ── */}
        {!collapsed && (
          <div className="bh-footer">
            <p>© 2024 Revchill. All Rights Reserved.</p>
            <p><a href="#">Terms and Conditions</a></p>
          </div>
        )}

      </aside>
    </>
  );
}

export default ProfileSidebar;