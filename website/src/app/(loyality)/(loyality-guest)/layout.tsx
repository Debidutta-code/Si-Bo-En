"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/src/store/store";

export default function LoyaltyGuestLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isLoggedIn = useSelector((state: RootState) => (state as any).loyaltyUser?.isLoggedIn);

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login");
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0e0e0e" }}
      >
        <div
          className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "rgba(184,145,42,0.2)", borderTopColor: "#b8912a" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#f8f6f1" }}>
      {children}
    </div>
  );
}