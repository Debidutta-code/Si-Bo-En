import { useNavigate } from 'react-router-dom';
import { useBooking } from '@/contexts/BookingContext';
import { PropertyHeader } from '@/components/booking/PropertyHeader';
import { BookingProgress } from '@/components/booking/BookingProgress';
import { PriceSummary } from '@/components/booking/PriceSummary';
import { AddOnCard } from '@/components/booking/AddOnCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import type { AddOn } from '@/types/booking';

// Mock add-ons data - would come from API
const mockAddOns: AddOn[] = [
  {
    id: 'breakfast',
    name: 'Breakfast Buffet',
    description: 'Start your day with our lavish breakfast spread featuring local and international cuisine.',
    price: 25,
    currency: 'USD',
    priceType: 'per_person',
    category: 'Dining',
    icon: 'utensils',
  },
  {
    id: 'airport-transfer',
    name: 'Airport Transfer',
    description: 'Comfortable private car transfer to/from the airport.',
    price: 50,
    currency: 'USD',
    priceType: 'per_stay',
    category: 'Transport',
    icon: 'car',
  },
  {
    id: 'spa-package',
    name: 'Spa Package',
    description: '60-minute relaxing massage and access to wellness facilities.',
    price: 120,
    currency: 'USD',
    priceType: 'per_person',
    category: 'Wellness',
    icon: 'sparkles',
  },
  {
    id: 'late-checkout',
    name: 'Late Checkout',
    description: 'Extend your stay until 4 PM on departure day.',
    price: 40,
    currency: 'USD',
    priceType: 'per_stay',
    category: 'Room',
    icon: 'clock',
  },
  {
    id: 'romantic-setup',
    name: 'Romantic Room Setup',
    description: 'Rose petals, candles, and a bottle of champagne waiting in your room.',
    price: 75,
    currency: 'USD',
    priceType: 'per_stay',
    category: 'Special Occasions',
    icon: 'heart',
  },
  {
    id: 'minibar',
    name: 'Premium Minibar',
    description: 'Daily restocked premium minibar with snacks and beverages.',
    price: 35,
    currency: 'USD',
    priceType: 'per_night',
    category: 'Room',
    icon: 'wine',
  },
];

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

  // Group add-ons by category
  const groupedAddOns = mockAddOns.reduce((acc, addOn) => {
    if (!acc[addOn.category]) {
      acc[addOn.category] = [];
    }
    acc[addOn.category].push(addOn);
    return acc;
  }, {} as Record<string, AddOn[]>);

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
