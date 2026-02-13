import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Lock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useBooking } from '@/contexts/BookingContext';
import { PropertyHeader } from '@/components/booking/PropertyHeader';
import { BookingProgress } from '@/components/booking/BookingProgress';
import { PriceSummary } from '@/components/booking/PriceSummary';
import { format, parseISO } from 'date-fns';

export default function PaymentPage() {
  const navigate = useNavigate();
  const { state, getPriceSummary } = useBooking();
  const [isProcessing, setIsProcessing] = useState(false);
  const summary = getPriceSummary();

  useEffect(() => {
    // Redirect if missing required data
    if (!state.selectedRoom || !state.selectedRatePlan || !state.guestDetails) {
      navigate('/rooms');
    }
  }, [state.selectedRoom, state.selectedRatePlan, state.guestDetails, navigate]);

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    navigate('/confirmation');
  };

  if (!state.selectedRoom || !state.selectedRatePlan || !state.guestDetails || !summary || !state.searchCriteria) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: summary.currency,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <PropertyHeader />
      <BookingProgress />

      <main className="container py-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/guest-details')}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Payment Form */}
            <div className="lg:col-span-3">
              <div className="bg-card rounded-xl border p-6 md:p-8 shadow-card">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">Payment</h1>
                    <p className="text-sm text-muted-foreground">Secure checkout</p>
                  </div>
                </div>

                {/* Security badges */}
                <div className="flex items-center gap-4 mb-6 p-3 bg-muted rounded-lg">
                  <Shield className="h-5 w-5 text-success" />
                  <span className="text-sm text-muted-foreground">
                    Your payment is secured with 256-bit SSL encryption
                  </span>
                </div>

                {/* Mock Card Form */}
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="cardNumber"
                        placeholder="4242 4242 4242 4242"
                        className="h-12 pl-12"
                        disabled
                      />
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        className="h-12 mt-1.5"
                        disabled
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvc">CVC</Label>
                      <Input
                        id="cvc"
                        placeholder="123"
                        className="h-12 mt-1.5"
                        disabled
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="cardName">Name on Card</Label>
                    <Input
                      id="cardName"
                      placeholder="John Doe"
                      className="h-12 mt-1.5"
                      value={`${state.guestDetails.firstName} ${state.guestDetails.lastName}`}
                      disabled
                    />
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      This is a demo payment. No actual charge will be made.
                    </p>
                  </div>

                  <Button
                    variant="booking"
                    size="xl"
                    className="w-full"
                    onClick={handlePayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Pay {formatCurrency(summary.total)}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-xl border p-6 shadow-card sticky top-8">
                <h2 className="font-semibold text-lg mb-4">Booking Summary</h2>

                {/* Property */}
                <div className="flex items-center gap-3 mb-4">
                  {state.config?.logo && (
                    <img
                      src={state.config.logo}
                      alt={state.config.propertyName}
                      className="w-12 h-12 rounded object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium">{state.config?.propertyName}</p>
                    <p className="text-sm text-muted-foreground">{state.selectedRoom.name}</p>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Stay Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-in</span>
                    <span className="font-medium">
                      {format(parseISO(state.searchCriteria.startDate), 'EEE, MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-out</span>
                    <span className="font-medium">
                      {format(parseISO(state.searchCriteria.endDate), 'EEE, MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Guest</span>
                    <span className="font-medium">
                      {state.guestDetails.firstName} {state.guestDetails.lastName}
                    </span>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Price */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {summary.ratePlanName} × {summary.nights} nights
                    </span>
                    <span>{formatCurrency(summary.basePrice)}</span>
                  </div>
                  {summary.taxes > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Taxes & Fees</span>
                      <span>{formatCurrency(summary.taxes)}</span>
                    </div>
                  )}
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">Total</span>
                  <span className="font-bold text-2xl text-primary">
                    {formatCurrency(summary.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
