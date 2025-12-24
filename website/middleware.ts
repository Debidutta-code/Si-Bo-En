// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const protectedPaths = ["/Payment", "/PaymentSuccess"];
  const pathname = request.nextUrl.pathname;

  const canAccess = request.cookies.get("can_access_payment")?.value;
  const isConfirmed = request.cookies.get("bookingConfirmed")?.value;

  // 🔐 Block access if already confirmed OR cookie not set
  if (protectedPaths.includes(pathname)) {
    if (isConfirmed === "true" || canAccess !== "true") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/Payment", "/PaymentSuccess"],
};
