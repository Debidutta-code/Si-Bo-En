import { useNavigate } from 'react-router-dom';
import { useBooking } from '@/contexts/BookingContext';
import { PropertyHeader } from '@/components/booking/PropertyHeader';
import { BookingProgress } from '@/components/booking/BookingProgress';
import { PriceSummary } from '@/components/booking/PriceSummary';
import { AddOnCard } from '@/components/booking/AddOnCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import type { IAddon } from '@/types/booking';


export default function AddOnsPage() {
  const navigate = useNavigate();
  const { state } = useBooking();

  // Redirect if no room selected
  if (!state.selectedRatePlan || !state.selectedRoom) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please select a room first</p>
          <Button onClick={() => navigate('/rooms')}>Go to Rooms</Button>
        </div>
      </div>
    );
  }
// http://localhost:8080/api/v1/addon/addon-datewise/available?propertyCode=4BTXDZ&startDate=2026-02-17&endDate=2026-02-18&ratePlanCode=SRYWE9

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <PropertyHeader />
      <BookingProgress />

      <main className="container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Add-ons Selection */}
          <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/rooms')}
                  className="mb-2 -ml-2"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Rooms
                </Button>
                <h1 className="text-2xl font-bold">Enhance Your Stay</h1>
                <p className="text-muted-foreground mt-1">
                  Add special experiences and services to make your stay memorable
                </p>
              </div>
            </div>

            {/* Add-ons by Category */}
            {Object.entries(groupedAddOns).map(([category, addOns]) => (
              <div key={category} className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  {category}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addOns.map((addOn) => (
                    <AddOnCard key={addOn.id} addOn={addOn} />
                  ))}
                </div>
              </div>
            ))}

            {/* Continue Button */}
            <div className="flex justify-end pt-4">
              <Button
                size="lg"
                onClick={() => navigate('/guest-details')}
                className="min-w-[200px]"
              >
                Continue to Guest Details
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Price Summary Sidebar - Desktop */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-8">
              <PriceSummary />
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile Price Summary */}
      <PriceSummary variant="mobile" />
    </div>
  );
}
