import { useBooking } from '@/contexts/BookingContext';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { format, parseISO } from 'date-fns';
import { CalendarDays, Users, Moon, Gift, Sparkles } from 'lucide-react';

interface PriceSummaryProps {
  className?: string;
  variant?: 'sidebar' | 'mobile';
}

export function PriceSummary({ className, variant = 'sidebar' }: PriceSummaryProps) {
  const { state, getPriceSummary } = useBooking();
  const summary = getPriceSummary();

  if (!summary || !state.searchCriteria) {
    return null;
  }

  const { searchCriteria } = state;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: summary.currency,
    }).format(amount);
  };

  if (variant === 'mobile') {
    return (
      <div className={cn(
        'fixed bottom-0 left-0 right-0 bg-card border-t shadow-sticky p-4 z-50 lg:hidden',
        className
      )}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {summary.nights} {summary.nights === 1 ? 'night' : 'nights'}
            </p>
            <p className="text-xl font-bold text-foreground">
              {formatCurrency(summary.total)}
            </p>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p>{summary.roomName}</p>
            <p>{summary.ratePlanName}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'bg-card rounded-xl shadow-card border p-6 space-y-4',
      className
    )}>
      <h3 className="font-semibold text-lg">Booking Summary</h3>
      
      <div className="space-y-3">
        {/* Stay details */}
        <div className="flex items-center gap-3 text-sm">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="font-medium">
              {format(parseISO(searchCriteria.startDate), 'MMM d')} — {format(parseISO(searchCriteria.endDate), 'MMM d, yyyy')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 text-sm">
          <Moon className="h-4 w-4 text-muted-foreground" />
          <p>{summary.nights} {summary.nights === 1 ? 'night' : 'nights'}</p>
        </div>
        
        <div className="flex items-center gap-3 text-sm">
          <Users className="h-4 w-4 text-muted-foreground" />
          <p>
            {searchCriteria.guests.adults} {searchCriteria.guests.adults === 1 ? 'Adult' : 'Adults'}
            {searchCriteria.guests.children > 0 && `, ${searchCriteria.guests.children} ${searchCriteria.guests.children === 1 ? 'Child' : 'Children'}`}
            {searchCriteria.guests.rooms > 1 && ` · ${searchCriteria.guests.rooms} Rooms`}
          </p>
        </div>
      </div>

      <Separator />

      {/* Room details */}
      <div className="space-y-2">
        <p className="font-medium">{summary.roomName}</p>
        <p className="text-sm text-muted-foreground">{summary.ratePlanName}</p>
      </div>

      <Separator />

      {/* Price breakdown */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Room ({summary.nights} {summary.nights === 1 ? 'night' : 'nights'})
          </span>
          <span>{formatCurrency(summary.basePrice + (summary.loyaltyDiscount || 0))}</span>
        </div>
        
        {summary.loyaltyDiscount && summary.loyaltyDiscount > 0 && (
          <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
            <span className="flex items-center gap-1">
              <Gift className="h-3 w-3" />
              {summary.loyaltyProgramName} Discount
            </span>
            <span>-{formatCurrency(summary.loyaltyDiscount)}</span>
          </div>
        )}
        
        {summary.addOnsTotal && summary.addOnsTotal > 0 && (
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Sparkles className="h-3 w-3" />
              Add-Ons ({state.selectedAddOns.length})
            </span>
            <span>{formatCurrency(summary.addOnsTotal)}</span>
          </div>
        )}
        
        {summary.taxes > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Taxes & Fees</span>
            <span>{formatCurrency(summary.taxes)}</span>
          </div>
        )}
      </div>

      <Separator />

      <div className="flex justify-between items-center">
        <span className="font-semibold text-lg">Total</span>
        <span className="font-bold text-xl text-primary">
          {formatCurrency(summary.total)}
        </span>
      </div>
    </div>
  );
}
