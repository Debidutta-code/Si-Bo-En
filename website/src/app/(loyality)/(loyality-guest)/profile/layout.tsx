"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { loyaltyLogout } from "@/src/store/loyaltyUserSlice";
import { LogOut } from "lucide-react";

const tabs = [
  { label: "My Profile", href: "/profile/" },
  { label: "My Bookings", href: "/profile/bookings/" },
];

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(loyaltyLogout());
    router.push("/login");
  };

  return (
    <div
      className="min-h-screen"
      style={{ fontFamily: "'DM Sans', sans-serif", background: "#fafafa" }}
    >
      {/* ── Sticky top nav */}
      <div
        className="sticky top-0 z-10 bg-white border-b border-[#f0f0f0]"
        style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}
      >
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Tab switcher */}
          <div className="flex items-center gap-1 bg-[#f5f5f5] rounded-[10px] p-1">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className="px-4 py-1.5 rounded-[8px] text-[13px] font-medium transition-all duration-150"
                  style={{
                    background: isActive ? "#fff" : "transparent",
                    color: isActive ? "black" : "#999",
                    boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                    textDecoration: "none",
                  }}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>

          {/* Sign out */}
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 active:scale-[0.97] text-white text-[13px] font-medium px-3.5 py-[7px] rounded-lg transition-all"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </div>

      {/* Page content */}
      <div className="max-w-4xl mx-auto px-6 py-10">{children}</div>
    </div>
  );
}
