import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useBooking } from '@/contexts/BookingContext';
import { useFetchRooms } from '@/hooks/useFetchRooms';
import { PropertyHeader } from '@/components/booking/PropertyHeader';
import { BookingProgress } from '@/components/booking/BookingProgress';
import { RoomCard } from '@/components/booking/RoomCard';
import { PriceSummary } from '@/components/booking/PriceSummary';
import { LoyaltySignup } from '@/components/booking/LoyaltySignup';
import { RoomCardSkeleton } from '@/components/booking/Skeleton';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { } from "./services";
export default function RoomsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { state,  setSearchCriteria } = useBooking();
  const { fetchRooms, isLoading, error } = useFetchRooms();

  const PropertyCode = searchParams.get('code') || '4BTXDZ';
  const loadRooms = async () => {
    console.log(state.searchCriteria)
    if (!state.searchCriteria) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const defaultCriteria = {
        startDate: today.toISOString().split('T')[0],
        endDate: tomorrow.toISOString().split('T')[0],
        guests: { adults: 2, children: 0, rooms: 1 },
        PropertyCode
      };

      setSearchCriteria(defaultCriteria);

      const response = await fetchRooms(state.searchCriteria);
    } else if (state.rooms.length === 0) {
      const response = await fetchRooms(state.searchCriteria);
    }
  };
  useEffect(() => {
    loadRooms();
  }, [state.searchCriteria]);

  const availableRooms = state.rooms.filter(room => room.has_valid_rate);
  const soldOutRooms = state.rooms.filter(room => !room.has_valid_rate);

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <PropertyHeader />
      <BookingProgress />

      <main className="container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Room List */}
          <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/')}
                  className="mb-2 -ml-2"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <h1 className="text-2xl font-bold">Select Your Room</h1>
                <p className="text-muted-foreground mt-1">
                  {availableRooms.length} {availableRooms.length === 1 ? 'room' : 'rooms'} available
                </p>
              </div>
            </div>

            <LoyaltySignup />

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
                    <RoomCard key={room.id} room={room} />
                  ))}
                </div>

                {/* Sold Out Rooms */}
                {soldOutRooms.length > 0 && (
                  <div className="space-y-6 mt-8">
                    <h2 className="text-lg font-semibold text-muted-foreground">
                      Sold Out
                    </h2>
                    {soldOutRooms.map((room) => (
                      <RoomCard key={room.id} room={room} />
                    ))}
                  </div>
                )}

                {state.rooms.length === 0 && !isLoading && (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                      <AlertCircle className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No rooms available</h3>
                    <p className="text-muted-foreground mb-6">
                      Try adjusting your dates or guest count
                    </p>
                    <Button onClick={() => navigate('/')}>
                      Modify Search
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Price Summary Sidebar - Desktop */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-8">
              {state.selectedRatePlan && <PriceSummary />}
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile Price Summary */}
      {state.selectedRatePlan && <PriceSummary variant="mobile" />}
    </div>
  );
}
