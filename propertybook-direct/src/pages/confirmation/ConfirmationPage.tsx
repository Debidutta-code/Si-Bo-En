import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Calendar, Mail, Phone, MapPin, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useBooking } from '@/contexts/BookingContext';
import { format, parseISO } from 'date-fns';

export default function ConfirmationPage() {
  const navigate = useNavigate();
  const { state, getPriceSummary, resetBooking } = useBooking();
  const summary = getPriceSummary();

  // Generate a mock reservation ID
  const reservationId = `RES-${Date.now().toString(36).toUpperCase()}`;

  useEffect(() => {
    // Redirect if missing required data
    if (!state.selectedRoom || !state.selectedRatePlan || !state.guestDetails) {
      navigate('/');
    }
  }, [state.selectedRoom, state.selectedRatePlan, state.guestDetails, navigate]);

  const handleNewBooking = () => {
    resetBooking();
    navigate('/');
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
    <div className="min-h-screen bg-background">
      {/* Success Header */}
      <div className="bg-success/10 border-b border-success/20">
        <div className="container py-12 md:py-16 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success mb-6 fade-in">
            <CheckCircle2 className="h-10 w-10 text-success-foreground" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 fade-in" style={{ animationDelay: '0.1s' }}>
            Booking Confirmed!
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-md mx-auto fade-in" style={{ animationDelay: '0.2s' }}>
            Thank you for your reservation. We've sent a confirmation email to{' '}
            <span className="font-medium text-foreground">{state.guestDetails.email}</span>
          </p>
        </div>
      </div>

      <main className="container py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          {/* Reservation Card */}
          <div className="bg-card rounded-xl border shadow-card overflow-hidden fade-in" style={{ animationDelay: '0.3s' }}>
            {/* Reservation ID */}
            <div className="bg-muted px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-sm text-muted-foreground">Reservation ID</p>
                <p className="text-xl font-bold font-mono">{reservationId}</p>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Printer className="h-4 w-4" />
                Print
              </Button>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              {/* Property Info */}
              <div className="flex items-start gap-4">
                {state.config?.logo && (
                  <img
                    src={state.config.logo}
                    alt={state.config.propertyName}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div>
                  <h2 className="text-xl font-bold">{state.config?.propertyName}</h2>
                  <p className="text-muted-foreground mt-1">{state.selectedRoom.name}</p>
                  <p className="text-sm text-muted-foreground">{state.selectedRatePlan.name}</p>
                </div>
              </div>

              <Separator />

              {/* Stay Details */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Check-in</p>
                    <p className="text-muted-foreground">
                      {format(parseISO(state.searchCriteria.startDate), 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p className="text-sm text-muted-foreground">From 3:00 PM</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Check-out</p>
                    <p className="text-muted-foreground">
                      {format(parseISO(state.searchCriteria.endDate), 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p className="text-sm text-muted-foreground">Until 11:00 AM</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Guest Info */}
              <div>
                <h3 className="font-semibold mb-3">Guest Information</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">Name:</span>{' '}
                    <span className="font-medium">{state.guestDetails.firstName} {state.guestDetails.lastName}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Email:</span>{' '}
                    <span className="font-medium">{state.guestDetails.email}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Phone:</span>{' '}
                    <span className="font-medium">{state.guestDetails.phone}</span>
                  </p>
                  {state.guestDetails.specialRequest && (
                    <p>
                      <span className="text-muted-foreground">Special Request:</span>{' '}
                      <span className="font-medium">{state.guestDetails.specialRequest}</span>
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Payment Summary */}
              <div>
                <h3 className="font-semibold mb-3">Payment Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {summary.ratePlanName} × {summary.nights} {summary.nights === 1 ? 'night' : 'nights'}
                    </span>
                    <span>{formatCurrency(summary.basePrice)}</span>
                  </div>
                  {summary.taxes > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Taxes & Fees</span>
                      <span>{formatCurrency(summary.taxes)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t font-semibold text-base">
                    <span>Total Paid</span>
                    <span className="text-primary">{formatCurrency(summary.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-8 bg-muted rounded-xl p-6 fade-in" style={{ animationDelay: '0.4s' }}>
            <h3 className="font-semibold mb-4">Need Help?</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {state.config?.contactEmail && (
                <a
                  href={`mailto:${state.config.contactEmail}`}
                  className="flex items-center gap-3 p-3 bg-card rounded-lg hover:bg-card/80 transition-colors"
                >
                  <Mail className="h-5 w-5 text-primary" />
                  <span className="text-sm">{state.config.contactEmail}</span>
                </a>
              )}
              {state.config?.contactPhone && (
                <a
                  href={`tel:${state.config.contactPhone}`}
                  className="flex items-center gap-3 p-3 bg-card rounded-lg hover:bg-card/80 transition-colors"
                >
                  <Phone className="h-5 w-5 text-primary" />
                  <span className="text-sm">{state.config.contactPhone}</span>
                </a>
              )}
              {state.config?.propertyAddress && (
                <div className="flex items-center gap-3 p-3 bg-card rounded-lg sm:col-span-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span className="text-sm">{state.config.propertyAddress}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 text-center fade-in" style={{ animationDelay: '0.5s' }}>
            <Button variant="booking" size="lg" onClick={handleNewBooking}>
              Make Another Booking
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
