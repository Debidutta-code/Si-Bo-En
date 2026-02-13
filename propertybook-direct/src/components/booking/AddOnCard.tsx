import { useBooking } from '@/contexts/BookingContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Minus, 
  Check,
  Utensils,
  Car,
  Sparkles,
  Clock,
  Heart,
  Wine,
  Package
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AddOn } from '@/types/booking';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  utensils: Utensils,
  car: Car,
  sparkles: Sparkles,
  clock: Clock,
  heart: Heart,
  wine: Wine,
  default: Package,
};

interface AddOnCardProps {
  addOn: AddOn;
}

export function AddOnCard({ addOn }: AddOnCardProps) {
  const { state, addAddOn, removeAddOn, updateAddOnQuantity } = useBooking();
  
  const selectedAddOn = state.selectedAddOns.find((sa) => sa.addOn.id === addOn.id);
  const isSelected = !!selectedAddOn;
  const quantity = selectedAddOn?.quantity || 1;

  const IconComponent = iconMap[addOn.icon || 'default'] || iconMap.default;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: addOn.currency,
    }).format(price);
  };

  const getPriceLabel = () => {
    switch (addOn.priceType) {
      case 'per_night':
        return 'per night';
      case 'per_person':
        return 'per person';
      case 'per_stay':
        return 'per stay';
      default:
        return '';
    }
  };

  const handleToggle = () => {
    if (isSelected) {
      removeAddOn(addOn.id);
    } else {
      addAddOn(addOn, 1);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) {
      removeAddOn(addOn.id);
    } else if (newQuantity <= (addOn.maxQuantity || 10)) {
      updateAddOnQuantity(addOn.id, newQuantity);
    }
  };

  return (
    <Card 
      className={cn(
        'transition-all duration-200 cursor-pointer hover:shadow-card',
        isSelected && 'ring-2 ring-primary border-primary bg-primary/5'
      )}
      onClick={handleToggle}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Icon */}
          <div className={cn(
            'w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0',
            isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
          )}>
            <IconComponent className="h-6 w-6" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-medium text-foreground">{addOn.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {addOn.description}
                </p>
              </div>
              {isSelected && (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Check className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-3">
              <div>
                <span className="font-semibold text-foreground">
                  {formatPrice(addOn.price)}
                </span>
                <span className="text-sm text-muted-foreground ml-1">
                  {getPriceLabel()}
                </span>
              </div>

              {isSelected && addOn.priceType === 'per_person' && (
                <div 
                  className="flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleQuantityChange(quantity - 1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleQuantityChange(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {!isSelected && (
                <Badge variant="secondary" className="text-xs">
                  + Add
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
