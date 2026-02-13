import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Maximize2, 
  Eye, 
  Check, 
  ChevronRight,
  Ban,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useBooking } from '@/contexts/BookingContext';
import { cn } from '@/lib/utils';
import type { IRoom, IRoomPrice } from '@/types/booking';

interface RoomCardProps {
  room: IRoom;
}

interface RatePlanCardProps {
  ratePlan: IRoomPrice;
  isSelected: boolean;
  onSelect: () => void;
  nights: number;
}

function RatePlanCard({ ratePlan, isSelected, onSelect, nights }: RatePlanCardProps) {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: ratePlan.currencyCode,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const pricePerNight = nights > 0 ? ratePlan.totalAmount / nights : ratePlan.totalAmount;
  
  const isCancellable = ratePlan.policy?.cancellationPolicy !== null;
  
  const hasTax = ratePlan.touristTax && ratePlan.touristTax.calculatedTaxAmount > 0;

  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full text-left p-4 rounded-lg border-2 transition-all duration-200',
        isSelected
          ? 'border-primary bg-primary/5 shadow-card-hover'
          : 'border-border hover:border-primary/30 hover:bg-muted/50'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-foreground">{ratePlan.ratePlanName}</span>
            
            {/* Show promotions */}
            {ratePlan.availablePromotions.length > 0 && (
              <Badge variant="default" className="gap-1 bg-green-600">
                <Tag className="h-3 w-3" />
                {ratePlan.availablePromotions[0].promotionName}
              </Badge>
            )}
          </div>
          
          {/* Show pricing breakdown by guest */}
          {ratePlan.baseByGuestAmts.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {ratePlan.baseByGuestAmts.map((base, idx) => (
                <span key={idx}>
                  {base.numberOfGuests} guest{base.numberOfGuests > 1 ? 's' : ''}: {formatCurrency(base.amountBeforeTax)}
                  {idx < ratePlan.baseByGuestAmts.length - 1 ? ' • ' : ''}
                </span>
              ))}
            </p>
          )}
          
          <div className="flex items-center gap-2 text-xs flex-wrap">
            {isCancellable ? (
              <span className="text-success flex items-center gap-1">
                <Check className="h-3 w-3" />
                Free cancellation
              </span>
            ) : (
              <span className="text-destructive flex items-center gap-1">
                <Ban className="h-3 w-3" />
                Non-refundable
              </span>
            )}
            {hasTax && (
              <span className="text-muted-foreground">• Tax included</span>
            )}
            {ratePlan.addons.length > 0 && (
              <span className="text-muted-foreground">
                • {ratePlan.addons.length} add-on{ratePlan.addons.length > 1 ? 's' : ''} available
              </span>
            )}
          </div>

          {/* Show promotion details */}
          {ratePlan.availablePromotions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {ratePlan.availablePromotions.slice(0, 2).map((promo) => (
                <span key={promo.id} className="text-xs text-green-600 font-medium">
                  Save {promo.discountValue}
                  {promo.discountType === 'PERCENTAGE' ? '%' : ` ${ratePlan.currencyCode}`}
                  {promo.minLos && ` (Min ${promo.minLos} nights)`}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div className="text-right flex-shrink-0">
          <div className="text-2xl font-bold text-foreground">
            {formatCurrency(pricePerNight)}
          </div>
          <div className="text-xs text-muted-foreground">per night</div>
          {nights > 1 && (
            <div className="text-xs text-muted-foreground mt-1">
              {formatCurrency(ratePlan.totalAmount)} total
            </div>
          )}
        </div>
      </div>
      
      {isSelected && (
        <div className="mt-3 pt-3 border-t border-primary/20">
          <div className="flex items-center gap-2 text-sm text-primary font-medium">
            <Check className="h-4 w-4" />
            Selected
          </div>
        </div>
      )}
    </button>
  );
}

export function RoomCard({ room }: RoomCardProps) {
  const navigate = useNavigate();
  const { state, selectRoom, selectRatePlan } = useBooking();
  const [selectedPlanCode, setSelectedPlanCode] = useState<string | null>(
    state.selectedRoom?.id === room.id && state.selectedRatePlan 
      ? state.selectedRatePlan.ratePlanCode 
      : room.room_price.length > 0 ? room.room_price[0].ratePlanCode : null
  );
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);

  const handleSelectRatePlan = (ratePlan: IRoomPrice): void => {
    setSelectedPlanCode(ratePlan.ratePlanCode);
    selectRoom(room);
    selectRatePlan(ratePlan);
    // Close the sheet after selection
    setIsSheetOpen(false);
  };

  const handleContinue = (): void => {
    if (selectedPlanCode) {
      navigate('/add-ons');
    }
  };

  // Calculate nights from search criteria
  const nights = state.searchCriteria 
    ? Math.ceil(
        (new Date(state.searchCriteria.endDate).getTime() - 
         new Date(state.searchCriteria.startDate).getTime()) / 
        (1000 * 60 * 60 * 24)
      )
    : 1;

  const amenityIcons: Record<string, string> = {
    'Free WiFi': '📶',
    'WiFi': '📶',
    'Air Conditioning': '❄️',
    'AC': '❄️',
    'Smart TV': '📺',
    'TV': '📺',
    'Television': '📺',
    'Mini Bar': '🍷',
    'Minibar': '🍷',
    'In-room Safe': '🔒',
    'Safe': '🔒',
    'Lounge Access': '🏢',
    'Butler Service': '🛎️',
    'Work Desk': '💼',
    'Desk': '💼',
    'Balcony': '🏝️',
    'Ocean View': '🌊',
    'Sea View': '🌊',
    'City View': '🏙️',
    'Garden View': '🌳',
    'Coffee Maker': '☕',
    'Coffee': '☕',
    'Bathroom': '🚿',
    'Shower': '🚿',
    'Bathtub': '🛁',
    'Bath': '🛁',
    'Hair Dryer': '💨',
    'Hairdryer': '💨',
    'Iron': '👔',
    'Telephone': '📞',
    'Phone': '📞',
  };

  const getAmenityIcon = (amenityName: string): string => {
    // Try exact match first
    if (amenityIcons[amenityName]) {
      return amenityIcons[amenityName];
    }
    
    // Try partial match (case insensitive)
    for (const [key, icon] of Object.entries(amenityIcons)) {
      if (amenityName.toLowerCase().includes(key.toLowerCase())) {
        return icon;
      }
    }
    
    return '✓';
  };

  const selectedRatePlan = room.room_price.find(
    (rp) => rp.ratePlanCode === selectedPlanCode
  );

  const hasMultipleRates = room.room_price.length > 1;

  return (
    <div className={cn(
      'bg-card rounded-xl overflow-hidden shadow-card border transition-all duration-300',
      'hover:shadow-card-hover fade-in'
    )}>
      <div className="flex flex-col lg:flex-row">
        {/* Room Image */}
        <div className="lg:w-2/5 relative">
          <div className="aspect-[4/3] lg:aspect-auto lg:h-full">
            <img
              src={room.images[0]}
              alt={room.room_name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          {!room.has_valid_rate && (
            <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center">
              <Badge variant="destructive" className="text-lg px-4 py-2">
                Sold Out
              </Badge>
            </div>
          )}
        </div>

        {/* Room Details */}
        <div className="lg:w-3/5 p-6 space-y-4">
          {/* Header */}
          <div>
            <h3 className="text-xl font-bold text-foreground">{room.room_name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{room.room_type}</p>
          </div>

          {/* Description if available */}
          {room.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {room.description}
            </p>
          )}

          {/* Room specs */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Maximize2 className="h-4 w-4" />
              <span>{room.room_size} {room.room_unit}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span>{room.room_view}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Max {room.max_occupancy} guests</span>
            </div>
          </div>

          {/* Amenities */}
          {room.amenities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {room.amenities
                .filter(amenity => amenity.isActive)
                .slice(0, 5)
                .map((amenity) => (
                  <Badge key={amenity.id} variant="outline" className="gap-1.5 py-1 px-2.5">
                    <span>{getAmenityIcon(amenity.amenityName)}</span>
                    {amenity.amenityName}
                  </Badge>
                ))}
              {room.amenities.filter(a => a.isActive).length > 5 && (
                <Badge variant="outline" className="py-1 px-2.5">
                  +{room.amenities.filter(a => a.isActive).length - 5} more
                </Badge>
              )}
            </div>
          )}

          {room.has_valid_rate && room.room_price.length > 0 && (
            <>
              <Separator />

              {/* Rate Plans */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-foreground">Select Rate</h4>
                </div>

                {/* Show the selected rate plan card */}
                {selectedRatePlan && (
                  <RatePlanCard
                    ratePlan={selectedRatePlan}
                    isSelected={true}
                    onSelect={() => handleSelectRatePlan(selectedRatePlan)}
                    nights={nights}
                  />
                )}

                {/* View more rates button - only show if there are multiple rates */}
                {hasMultipleRates && (
                  <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        View {room.room_price.length - 1} more rate{room.room_price.length - 1 > 1 ? 's' : ''}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
                      <SheetHeader>
                        <SheetTitle>Available Rates for {room.room_name}</SheetTitle>
                        <SheetDescription>
                          Select the rate plan that best suits your needs
                        </SheetDescription>
                      </SheetHeader>
                      <div className="mt-6 space-y-4">
                        {room.room_price.map((ratePlan) => (
                          <RatePlanCard
                            key={ratePlan.ratePlanCode}
                            ratePlan={ratePlan}
                            isSelected={ratePlan.ratePlanCode === selectedPlanCode}
                            onSelect={() => handleSelectRatePlan(ratePlan)}
                            nights={nights}
                          />
                        ))}
                      </div>
                    </SheetContent>
                  </Sheet>
                )}
              </div>

              {/* CTA */}
              {selectedPlanCode && (
                <Button
                  variant="booking"
                  size="lg"
                  className="w-full mt-4"
                  onClick={handleContinue}
                >
                  Continue
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}