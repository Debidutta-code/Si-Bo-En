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
  Package,
  Percent,
} from 'lucide-react';
import { motion } from 'framer-motion';
import type {
  IBookingData,
  IAgentFinalPriceResponse,
  IGuestFormData,
} from '../bookings/types/bookings.types';

interface LocationState {
  bookingData: IBookingData;
  pricingDetails: IAgentFinalPriceResponse;
  guestData: IGuestFormData;
}

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  useEffect(() => {
    if (!state?.bookingData) {
      navigate('/property');
    }
  }, [state, navigate]);

  if (!state?.bookingData) return null;

  const { bookingData, pricingDetails, guestData } = state;
  const bd = pricingDetails;
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const fmt = (amount: number, currency?: string) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || bookingData.currencyCode || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  const currencyCode = bd.currencyCode || 'USD';

  // Primary guest name from IGuestFormData
  const primaryGuest = guestData?.guests?.[0];
  const guestName = primaryGuest
    ? `${primaryGuest.firstName} ${primaryGuest.lastName}`
    : bookingData.primaryGuest
      ? `${bookingData.primaryGuest.firstName} ${bookingData.primaryGuest.lastName}`
      : '—';
  const uniqueNights = new Set(pricingDetails?.dailyPriceBrakeDown?.map(d => d.date)).size;
  const avgPerNight = uniqueNights > 0
    ? (pricingDetails.currentChargeableAmount / uniqueNights)
    : 0;
    console.log(bookingData)
  return (
    <div className="min-h-screen bg-gradient-to-br from-success/5 via-background to-accent/5 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* ── Success Header ── */}
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
                  <h1 className="text-3xl font-bold text-foreground mb-2">Booking Confirmed!</h1>
                  <p className="text-muted-foreground">Your reservation has been successfully created</p>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono font-semibold text-foreground">{bookingData.bookingCode.split("-")[1]}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Booking Details ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-foreground">Booking Details</h2>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Check-in</p>
                    <p className="font-medium text-foreground">{formatDate(bookingData.reservationStartDate)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Check-out</p>
                    <p className="font-medium text-foreground">{formatDate(bookingData.reservationEndDate)}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Guest */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground shrink-0" />
                  <p className="font-medium text-foreground">{guestName}</p>
                </div>
                <div className="flex items-center gap-3 pl-8">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <p className="text-sm text-muted-foreground">{guestData?.primaryEmail || bookingData.bookingUserEmail}</p>
                </div>
                <div className="flex items-center gap-3 pl-8">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <p className="text-sm text-muted-foreground">{guestData?.primaryPhone || bookingData.bookingUserPhone}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Payment Summary ── */}
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
            <CardContent className="space-y-3">

              {/* Base Amount */}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Base Amount</span>
                <span className="font-medium">{fmt(bd?.amountBeforeTax ?? 0)}</span>
              </div>

              {/* Addons */}
              {(bd?.totalAddonAmount ?? 0) > 0 && (
                <>
                  <Separator />
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5" /> Included add-ons
                  </p>
                  {pricingDetails?.addonBrakeDown?.map((addon) => (
                    <div key={addon.addonId} className="flex justify-between text-sm pl-2">
                      <span className="text-muted-foreground">{addon.name}</span>
                      <span className="font-medium">{fmt(addon.totalAmount, addon.currencyCode)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Add-ons Total</span>
                    <span className="font-medium">{fmt(bd.totalAddonAmount)}</span>
                  </div>
                </>
              )}

              <Separator />

              {/* Taxes */}
              {(pricingDetails?.taxBrakeDown?.length ?? 0) > 0 && (
                <>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Taxes</p>
                  {pricingDetails.taxBrakeDown.map((tax, i) => (
                    <div key={i} className="flex justify-between text-sm pl-2">
                      <span className="text-muted-foreground">{tax.name}</span>
                      <span className="font-medium">{fmt(tax.taxedAmount, tax.currencyCode)}</span>
                    </div>
                  ))}
                </>
              )}

              <Separator />

              {/* Amount due now */}
              <div className="flex justify-between text-base font-semibold">
                <span className="text-foreground">Amount due now</span>
                <span className="text-foreground">
                  {fmt(pricingDetails?.currentChargeableAmount ?? bookingData.amount)}
                </span>
              </div>

              {/* Tourist tax — pay later */}
              {pricingDetails?.touristTax && (pricingDetails.touristTax.calculatedAmount ?? 0) > 0 && (
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-amber-800 dark:text-amber-300">
                      {pricingDetails.touristTax.name}{" "}
                      <span className="font-normal">(pay at property)</span>
                    </span>
                    <span className="font-semibold text-amber-800 dark:text-amber-300">
                      {fmt(pricingDetails.touristTax.calculatedAmount, pricingDetails.touristTax.currencyCode)}
                    </span>
                  </div>
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    This amount is collected at the property and is not charged now.
                  </p>
                </div>
              )}

              {/* Grand total */}
              <div className="flex justify-between items-center pt-1">
                <span className="text-lg font-semibold text-foreground">
                  Total (incl. tourist tax)
                </span>
                <span className="text-2xl font-bold text-foreground">
                  {fmt(pricingDetails?.totalAmount ?? bookingData.amount)}
                </span>
              </div>

              {/* Average per night — fixed */}
              {avgPerNight > 0 && (
                <p className="text-xs text-muted-foreground text-right">
                  {fmt(avgPerNight)} avg / night
                </p>
              )}

              <Separator />

              {/* Payment method */}
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Payment method: </span>
                  {bookingData.paymentMethod === 'pay_at_hotel' ? 'Pay at hotel' : 'Payment gateway'}
                </p>
                {bookingData.paymentMethod === 'pay_at_hotel' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Payment will be collected at the property during check-in.
                  </p>
                )}
              </div>

              {/* Availability note */}
              {pricingDetails?.availableRooms !== undefined && (
                <p className="text-xs text-muted-foreground text-right">
                  {pricingDetails.requestedRooms} room{pricingDetails.requestedRooms !== 1 ? 's' : ''} requested
                </p>
              )}

            </CardContent>
          </Card>
        </motion.div>

        {/* ── Action Buttons ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <Button variant="outline" size="lg" onClick={() => navigate('/property')} className="w-full">
            <Home className="h-5 w-5 mr-2" />
            Back to home
          </Button>
          <Button
            size="lg"
            onClick={() => navigate('/reservations')}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            <FileText className="h-5 w-5 mr-2" />
            View reservations
          </Button>
        </motion.div>

        {/* ── Confirmation note ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <Card className="bg-muted/30">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground text-center">
                A confirmation email has been sent to{' '}
                <span className="font-medium text-foreground">
                  {guestData?.primaryEmail || bookingData.bookingUserEmail}
                </span>
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