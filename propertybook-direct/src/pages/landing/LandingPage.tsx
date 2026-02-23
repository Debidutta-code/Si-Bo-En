import { BookingWidget } from "@/components/booking/BookingWidget";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
const hotelHeroImage =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=80";

import { Services } from "./components";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Full-screen Hero Section */}
      <Helmet>
        <title>Book your stay with RevChill</title>
        <meta name="description" content="Book your stay with RevChill" />
      </Helmet>
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        {/* Background Image - Full screen hero */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${hotelHeroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        </div>

        {/* Header with Logo */}
        <header className="container relative z-10 p-3 flex items-center justify-end gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open("https://agent.revchilltech.com/login")}
            className="bg-white/90 backdrop-blur-sm border-0 text-foreground hover:bg-white text-xs sm:text-sm px-2.5 sm:px-4 py-1.5 sm:py-2 h-auto"
          >
            Partner Login
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/my-bookings")}
            className="bg-white/90 backdrop-blur-sm border-0 text-foreground hover:bg-white text-xs sm:text-sm px-2.5 sm:px-4 py-1.5 sm:py-2 h-auto"
          >
            My Booking
          </Button>
        </header>

        {/* Hero Content */}
        <div className="relative z-10  flex flex-col items-center justify-center text-center p-4">
          <div className="space-y-4 mb-8 fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white leading-tight max-w-4xl drop-shadow-lg">
              Find Your Perfect Stay
            </h1>

            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto drop-shadow-md">
              Discover amazing comfort at exclusive rates. Experience luxury and
              world-class hospitality.
            </p>
          </div>
        </div>

        <div className="container relative z-10 pb-8 -mb-24">
          <div
            className="max-w-4xl mx-auto fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            <BookingWidget />
          </div>
        </div>
      </section>

      <Services />
    </div>
  );
}
