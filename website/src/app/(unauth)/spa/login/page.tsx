"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/store";

export default function SpaLoginGatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyCode = searchParams.get("propertyCode") || searchParams.get("code") || "";

  const customer = useSelector((state: RootState) => (state as any).customer);

  useEffect(() => {
    // If already logged in, go directly to spa list
    if (customer?.isAuthenticated) {
      router.replace(`/spa?propertyCode=${encodeURIComponent(propertyCode)}`);
    }
  }, [customer?.isAuthenticated, propertyCode, router]);

  // Not logged in -> show login UI on this route.
  // Reuse the existing /login UI by embedding it here.
  // This keeps the user on /spa/login instead of redirecting to /login.
  return (
    <iframe
      title="Spa Login"
      src={`/login${propertyCode ? `?propertyCode=${encodeURIComponent(propertyCode)}` : ""}`}
      style={{ width: "100%", height: "100vh", border: 0 }}
    />
  );

}


