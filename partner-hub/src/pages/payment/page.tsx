import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle2,
  Calendar,
  MapPin,
  Mail,
  Phone,
  User,
  Home,
  FileText,
  DollarSign,
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { IBookingData, IAgentPricingResponse, IGuestFormData } from '../bookings/types/bookings.types';

interface LocationState {
  bookingData: IBookingData;
  pricingDetails: IAgentPricingResponse;
  guestData: IGuestFormData;
}

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  useEffect(() => {
    // If no booking data, redirect to home
    if (!state?.bookingData) {
      navigate('/property');
    }
  }, [state, navigate]);

  if (!state?.bookingData) {
    return null;
  }

  const { bookingData, pricingDetails, guestData } = state;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const currencyCode = bookingData.currencyCode || 'USD';

  return (
    <div className="min-h-screen bg-gradient-to-br from-success/5 via-background to-accent/5 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-success/20">
            <CardContent className="pt-12 pb-8">
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="flex justify-center"
                >
                  <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center">
                    <CheckCircle2 className="h-12 w-12 text-success" />
                  </div>
                </motion.div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    Booking Confirmed!
                  </h1>
                  <p className="text-muted-foreground">
                    Your reservation has been successfully created
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono font-semibold text-foreground">
                    {bookingData.bookingCode}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Booking Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-foreground">Booking Details</h2>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Property & Room Info */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">{bookingData.hotelName}</p>
                    <p className="text-sm text-muted-foreground">
                      {bookingData.roomTypeCode} • {bookingData.ratePlanCode}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Check-in & Check-out */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Check-in</p>
                      <p className="font-medium text-foreground">
                        {formatDate(bookingData.checkInDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Check-out</p>
                      <p className="font-medium text-foreground">
                        {formatDate(bookingData.checkOutDate)}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Guest Information */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <p className="font-medium text-foreground">
                      {guestData.firstName} {guestData.lastName}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pl-8">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{guestData.email}</p>
                  </div>
                  <div className="flex items-center gap-3 pl-8">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{guestData.phoneNumber}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Payment Summary
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Room Rate ({pricingDetails?.numberOfNights || 1} night
                    {(pricingDetails?.numberOfNights || 1) > 1 ? 's' : ''})
                  </span>
                  <span className="font-medium">
                    {formatCurrency(pricingDetails?.breakdown?.totalBaseAmount || 0, currencyCode)}
                  </span>
                </div>

                {pricingDetails?.breakdown?.totalIncludedAddons > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Add-ons</span>
                    <span className="font-medium">
                      {formatCurrency(pricingDetails.breakdown.totalIncludedAddons, currencyCode)}
                    </span>
                  </div>
                )}

                {pricingDetails?.breakdown?.agencyCommission > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Agency Commission</span>
                    <span className="font-medium">
                      {formatCurrency(pricingDetails.breakdown.agencyCommission, currencyCode)}
                    </span>
                  </div>
                )}

                {pricingDetails?.tax && pricingDetails.tax.length > 0 && (
                  <>
                    <Separator />
                    {pricingDetails.tax.map((tax, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{tax.name}</span>
                        <span className="font-medium">
                          {formatCurrency(tax.amount, currencyCode)}
                        </span>
                      </div>
                    ))}
                  </>
                )}
              </div>

              <Separator />

              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-semibold text-foreground">Total Amount</span>
                <span className="text-2xl font-bold text-foreground">
                  {formatCurrency(bookingData.amount, currencyCode)}
                </span>
              </div>

              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Payment Method:</span>{' '}
                  {bookingData.paymentMethod === 'pay_at_hotel' 
                    ? 'Pay at Hotel' 
                    : 'Payment Gateway'}
                </p>
                {bookingData.paymentMethod === 'pay_at_hotel' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Payment will be collected at the property during check-in
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/property')}
            className="w-full"
          >
            <Home className="h-5 w-5 mr-2" />
            Back to Home
          </Button>
          <Button
            size="lg"
            onClick={() => navigate('/reservations')}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            <FileText className="h-5 w-5 mr-2" />
            View Reservations
          </Button>
        </motion.div>

        {/* Confirmation Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <Card className="bg-muted/30">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground text-center">
                A confirmation email has been sent to{' '}
                <span className="font-medium text-foreground">{guestData.email}</span>
                <br />
                Please save your booking code for future reference.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}