import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useBooking } from "@/contexts/BookingContext";
import { useFetchRooms } from "@/hooks/useFetchRooms";
import { PropertyHeader } from "@/components/booking/PropertyHeader";
import { RoomCard } from "@/components/booking/RoomCard";
import { PriceSummary } from "@/components/booking/PriceSummary";
import { LoyaltySignup } from "@/components/booking/LoyaltySignup";
import { PropertyVideo } from "@/components/booking/PropertyVideo";
import { RoomCardSkeleton } from "@/components/booking/Skeleton";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet";
import { BookingWidget } from "@/components/booking/BookingWidget";
import { PropertyFooter } from "@/components/booking/PropertyFooter";
export default function RoomsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { state, setSearchCriteria, setPropertyDetails, setRooms } =
    useBooking();
  const { fetchRooms, isLoading, error } = useFetchRooms();
  const loyaltyRef = useRef<HTMLDivElement>(null);

  const PropertyCode = searchParams.get("code") || "4BTXDZ";

  const loadRooms = async () => {
    try {
      let criteria = state.searchCriteria;

      if (!criteria) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        criteria = {
          PropertyCode,
          startDate: today.toISOString().split("T")[0],
          endDate: tomorrow.toISOString().split("T")[0],
          guests: { adults: 2, children: 0, rooms: 1 },
        };

        setSearchCriteria(criteria);
      }

      if (
        state.rooms.length === 0 ||
        state.propertyDetails?.propertyCode !== PropertyCode
      ) {
        const response = await fetchRooms({
          PropertyCode: criteria.PropertyCode,
          startDate: criteria.startDate,
          endDate: criteria.endDate,
          guests: criteria.guests,
        });
        // console.log(response)
        if (response) {
          setPropertyDetails(response.data.propertyDetails);
          setRooms(response.data.rooms);
        }
      }
    } catch (err) {
      console.error("Error loading rooms:", err);
    }
  };

  useEffect(() => {
    loadRooms();
  }, [state]);

  const availableRooms = state.rooms;

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <Helmet>
        <title>
          Book your stay with{" "}
          {state.propertyDetails?.propertyName || "RevChill"}
        </title>
        <meta
          name="description"
          content={`Book your stay with ${state.propertyDetails?.propertyName || "RevChill"}`}
        />
      </Helmet>
      <PropertyHeader />
      <div className="sticky top-0 z-20">
        <BookingWidget variant="compact" />
      </div>

      <main className="container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/")}
                  className="mb-2 -ml-2"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <div>{/* all the promoton details to be shown here */}</div>
                <h1 className="text-2xl font-bold">Select Your Room</h1>

                <p className="text-muted-foreground mt-1">
                  {availableRooms.length}{" "}
                  {availableRooms.length === 1 ? "room" : "rooms"} available
                  {state.propertyDetails && (
                    <span className="ml-2">
                      at {state.propertyDetails.propertyName}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Loyalty Program - Only show if available and active */}
            {state.propertyDetails?.loyaltyProgramConfig?.isActive && (
              <div ref={loyaltyRef}>
                <LoyaltySignup />
              </div>
            )}

            {error && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 text-destructive">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p>Failed to load rooms. Please try again.</p>
              </div>
            )}

            {isLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <RoomCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <>
                {/* Available Rooms */}
                <div className="space-y-6">
                  {availableRooms.map((room) => (
                    <RoomCard
                      key={room.id}
                      room={room}
                      onUnlockClick={() => {
                        loyaltyRef.current?.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                      }}
                    />
                  ))}
                </div>

                {state.rooms.length === 0 && !isLoading && (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                      <AlertCircle className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      No rooms available
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Try adjusting your dates or guest count
                    </p>
                    <Button onClick={() => navigate("/")}>Modify Search</Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Price Summary Sidebar - Desktop */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-8">
              {/* Property Video - Show if available */}
              {state.propertyDetails?.propertyVideos && (
                <PropertyVideo
                  video={state.propertyDetails.propertyVideos}
                  propertyName={state.propertyDetails.propertyName}
                />
              )}
              {state.selectedRatePlan && <PriceSummary />}
            </div>
          </aside>
        </div>
      </main>
      <PropertyFooter />
      {/* Mobile Price Summary */}
      {state.selectedRatePlan && <PriceSummary variant="mobile" />}
    </div>
  );
}
