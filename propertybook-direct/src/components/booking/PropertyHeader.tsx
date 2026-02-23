import { useState } from "react";
import { useBooking } from "@/contexts/BookingContext";
import { LogIn, CalendarDays, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

interface PropertyHeaderProps {
  className?: string;
  showBanner?: boolean;
}

export function PropertyHeader({
  className,
  showBanner = false,
}: PropertyHeaderProps) {
  const { state } = useBooking();
  const { propertyDetails } = state;
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!propertyDetails) return null;

  return (
    <header className={cn("relative", className)}>
      <div className="container py-2 sm:py-3 md:py-4 px-3 sm:px-4 flex justify-between items-center gap-2 sm:gap-4">
        {propertyDetails?.bookingEngineConfig?.logo && (
          <img
            src={propertyDetails?.bookingEngineConfig?.logo}
            alt={`${propertyDetails.propertyName} logo`}
            className="h-8 sm:h-10 md:h-12 w-auto object-contain rounded"
          />
        )}

        {/* Desktop buttons — hidden on mobile */}
        <div className="hidden sm:flex items-center gap-2 md:gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-black hover:text-black/90 bg-gray-300 border border-white/20 rounded-full px-3 md:px-4 h-8 md:h-9 text-xs sm:text-sm transition-all duration-200"
            onClick={() => window.open("https://agent.revchilltech.com/login")}
          >
            <LogIn className="h-4 w-4 mr-1.5" />
            Partner Login
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-black hover:text-black/90 bg-gray-300 border border-white/25 rounded-full px-3 md:px-4 h-8 md:h-9 text-xs sm:text-sm transition-all duration-200 shadow-sm"
            onClick={() => navigate("/my-bookings")}
          >
            <CalendarDays className="h-4 w-4 mr-1.5" />
            My Bookings
          </Button>
        </div>

        {/* Mobile hamburger — visible only on mobile */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="sm:hidden text-black hover:bg-gray-200 rounded-md"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="sm:hidden border-t bg-white/95 backdrop-blur-sm shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="container px-3 py-2 flex flex-col gap-1">
            <button
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-black hover:bg-gray-100 transition-colors"
              onClick={() => {
                window.open("https://agent.revchilltech.com/login");
                setMenuOpen(false);
              }}
            >
              <LogIn className="h-4 w-4 text-gray-600" />
              Partner Login
            </button>
            <button
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-black hover:bg-gray-100 transition-colors"
              onClick={() => {
                navigate("/my-bookings");
                setMenuOpen(false);
              }}
            >
              <CalendarDays className="h-4 w-4 text-gray-600" />
              My Bookings
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
