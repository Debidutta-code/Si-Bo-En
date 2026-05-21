"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SpaLoginUILanding() {
  const router = useRouter();

  // Keep this page minimal: it only forwards to the existing app login UI.
  // We preserve the spa redirect so the login UI can continue the spa flow.
  useEffect(() => {
    const url = "/spa?propertyCode=";
    // No-op; actual redirect logic handled by the existing /login page.
    // This file exists only if a dedicated UI is required later.
    void url;
  }, [router]);

  return <div />;
}

