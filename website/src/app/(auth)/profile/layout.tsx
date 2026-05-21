"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store/store";
import { ProfileSidebar } from "@/src/components/loyalty/ProfileSidebar";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const loyaltyUser = useSelector((state: RootState) => (state as any).loyaltyUser);
  const profile     = loyaltyUser?.profile ?? null;
  const firstName   = profile?.guest?.firstName ?? "";
  const lastName    = profile?.guest?.lastName  ?? "";
  const name        = firstName
    ? `${firstName} ${lastName}`.trim()
    : profile?.guestEmail?.split("@")[0] ?? "Guest";
  const [collapsed, setCollapsed] = useState(false);
  const STORAGE_KEY = "bodyholiday-sidebar-collapsed";

  useEffect(() => {
    setCollapsed(localStorage.getItem(STORAGE_KEY) === "true");

    const handler = (e: Event) => setCollapsed((e as CustomEvent).detail.collapsed);
    window.addEventListener("sidebarToggle", handler);
    return () => window.removeEventListener("sidebarToggle", handler);
  }, []);

  return (
    <>
      <div className={`
        flex min-h-screen bg-gray-50 font-sans
        ${collapsed ? "overflow-hidden" : ""}
      `}>
        <ProfileSidebar />

        <div className={`
          flex-1 min-w-0 flex flex-col min-h-screen
          ${collapsed ? "ml-16" : "ml-[260px]"}
          transition-margin
        `}>
          {/* Top bar */}
          <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-8 h-[81px] flex items-center justify-end gap-5 flex-shrink-0">
            <div className="flex items-center gap-2.5 cursor-default">
              <span className="text-xs font-medium text-gray-800">{name}</span>
              <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center text-teal-600">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}