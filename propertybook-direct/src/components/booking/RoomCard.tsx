import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Maximize2, 
  Eye, 
  Check, 
  ChevronRight,
  Coffee,
  Ban
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useBooking } from '@/contexts/BookingContext';
import { cn } from '@/lib/utils';
import type { Room, RatePlan } from '@/types/booking';

interface RoomCardProps {
  room: Room;
}

interface RatePlanCardProps {
  ratePlan: RatePlan;
  isSelected: boolean;
  onSelect: () => void;
}

function RatePlanCard({ ratePlan, isSelected, onSelect }: RatePlanCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: ratePlan.currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

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
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">{ratePlan.name}</span>
            {ratePlan.meal_plan && (
              <Badge variant="secondary" className="gap-1">
                <Coffee className="h-3 w-3" />
                {ratePlan.meal_plan}
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground">{ratePlan.description}</p>
          
          <div className="flex items-center gap-2 text-xs">
            {ratePlan.is_refundable ? (
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
            {ratePlan.includes_tax && (
              <span className="text-muted-foreground">• Tax included</span>
            )}
          </div>
        </div>
        
        <div className="text-right flex-shrink-0">
          <div className="text-2xl font-bold text-foreground">
            {formatCurrency(ratePlan.price_per_night)}
          </div>
          <div className="text-xs text-muted-foreground">per night</div>
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
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(
    state.selectedRoom?.id === room.id && state.selectedRatePlan 
      ? state.selectedRatePlan.id 
      : null
  );

  const handleSelectRatePlan = (ratePlan: RatePlan) => {
    setSelectedPlanId(ratePlan.id);
    selectRoom(room);
    selectRatePlan(ratePlan);
  };

  const handleContinue = () => {
    if (selectedPlanId) {
      navigate('/add-ons');
    }
  };

  const amenityIcons: Record<string, string> = {
    'Free WiFi': '📶',
    'Air Conditioning': '❄️',
    'Smart TV': '📺',
    'Mini Bar': '🍷',
    'In-room Safe': '🔒',
    'Lounge Access': '🏢',
    'Butler Service': '🛎️',
    'Work Desk': '💼',
  };

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
              alt={room.name}
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
            <h3 className="text-xl font-bold text-foreground">{room.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{room.short_description}</p>
          </div>

          {/* Room specs */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Maximize2 className="h-4 w-4" />
              <span>{room.size} {room.size_unit}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span>{room.view}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Max {room.max_occupancy} guests</span>
            </div>
          </div>

          {/* Amenities */}
          <div className="flex flex-wrap gap-2">
            {room.amenities.slice(0, 5).map((amenity) => (
              <Badge key={amenity.id} variant="outline" className="gap-1.5 py-1 px-2.5">
                <span>{amenityIcons[amenity.name] || '✓'}</span>
                {amenity.name}
              </Badge>
            ))}
            {room.amenities.length > 5 && (
              <Badge variant="outline" className="py-1 px-2.5">
                +{room.amenities.length - 5} more
              </Badge>
            )}
          </div>

          {room.has_valid_rate && room.rate_plans.length > 0 && (
            <>
              <Separator />

              {/* Rate Plans */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-foreground">Select Rate</h4>
                <div className="grid gap-3">
                  {room.rate_plans.map((ratePlan) => (
                    <RatePlanCard
                      key={ratePlan.id}
                      ratePlan={ratePlan}
                      isSelected={selectedPlanId === ratePlan.id}
                      onSelect={() => handleSelectRatePlan(ratePlan)}
                    />
                  ))}
                </div>
              </div>

              {/* CTA */}
              {selectedPlanId && (
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
