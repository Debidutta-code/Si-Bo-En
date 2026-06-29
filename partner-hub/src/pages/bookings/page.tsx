import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { fetchPaymentDetailsService, createBookingService } from './service/bookings.service';
import type {
  IGuestFormData,
  IGuestFormErrors,
  IGuestEntry,
  GuestType,
  IPaymentDetails,
  PaymentMethodType,
  IAgentFinalPriceResponse,
  ICreateBookingPayload,
} from './types/bookings.types';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader } from '@/components/Loader';
import {
  ArrowLeft,
  Building,
  CreditCard,
  Check,
  DollarSign,
  CalendarDays,
  Users,
  Mail,
  Phone,
  Cake,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';

interface LocationState {
  room: {
    id: string;
    roomType: string;
    roomName: string;
  };
  roomPrice: {
    ratePlanCode: string;
    ratePlanName: string;
    currencyCode: string;
  };
  searchCriteria: {
    startDate: string;
    endDate: string;
  };
  pricingDetails: IAgentFinalPriceResponse;
}

// ─── Build initial guest list from dailyPriceBrakeDown ────────────────────────

function buildInitialGuests(pricingDetails: IAgentFinalPriceResponse): IGuestEntry[] {
  const guests: IGuestEntry[] = [];

  // each unique roomNumber appears multiple times (once per day)
  // so we only take the first occurrence of each room
  const seenRooms = new Set<string>();

  for (const day of pricingDetails.dailyPriceBrakeDown) {
    if (seenRooms.has(day.roomNumber)) continue;
    seenRooms.add(day.roomNumber);

    for (let i = 0; i < day.guestDistribution.adults; i++) {
      guests.push({ type: 'adult', firstName: '', lastName: '', dateOfBirth: '' });
    }
    for (let i = 0; i < day.guestDistribution.children; i++) {
      guests.push({ type: 'child', firstName: '', lastName: '', dateOfBirth: '' });
    }
  }

  return guests;
}

export default function BookingPage() {
  const navigate = useNavigate();
  const { propertyId, roomId } = useParams<{ propertyId: string; roomId: string }>();
  const location = useLocation();
  const locationState = location.state as LocationState;

  const [loading, setLoading] = useState<boolean>(true);
  const [paymentDetails, setPaymentDetails] = useState<IPaymentDetails | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAdditionalGuests, setShowAdditionalGuests] = useState(false);
  const selectedProperty = useAppSelector(
    (state: RootState) => state.property.selectedProperty
  );
  // console.log(selectedProperty)

  const user = useAppSelector(
    (state: RootState) => state.auth.user
  );
  const initialGuests = locationState?.pricingDetails
    ? buildInitialGuests(locationState.pricingDetails)
    : [];

  const [guestData, setGuestData] = useState<IGuestFormData>({
    primaryEmail: '',
    primaryPhone: '',
    guests: initialGuests,
  });

  const [errors, setErrors] = useState<IGuestFormErrors>({
    primaryEmail: undefined,
    primaryPhone: undefined,
    guests: initialGuests.map(() => ({})),
  });

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      if (!propertyId) return;
      setLoading(true);
      const result = await fetchPaymentDetailsService(propertyId);

      if (result.success && result.data) {
        setPaymentDetails(result.data);
        if (result.data.payAtHotel) {
          setSelectedPaymentMethod('payAtHotel');
        } else if (result.data.paymentGateway) {
          setSelectedPaymentMethod('paymentGateway');
        }
      } else {
        toast.error(result.message || 'Failed to fetch payment details');
      }
      setLoading(false);
    };

    fetchPaymentMethods();
  }, [propertyId]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const formatCurrency = (amount: number, currency: string = 'USD') =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  // ─── Validation ──────────────────────────────────────────────────────────────

  const validateForm = (): boolean => {
    const newErrors: IGuestFormErrors = {
      primaryEmail: undefined,
      primaryPhone: undefined,
      guests: guestData.guests.map(() => ({})),
    };

    if (!guestData.primaryEmail.trim()) {
      newErrors.primaryEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestData.primaryEmail)) {
      newErrors.primaryEmail = 'Invalid email format';
    }

    if (!guestData.primaryPhone.trim()) {
      newErrors.primaryPhone = 'Phone number is required';
    } else if (!/^[0-9+\s\-()]{10,}$/.test(guestData.primaryPhone)) {
      newErrors.primaryPhone = 'Invalid phone number';
    }

    guestData.guests.forEach((guest, i) => {
      const guestErrors: Partial<IGuestEntry> = {};

      const hasAnyValue =
        guest.firstName.trim() ||
        guest.lastName.trim() ||
        guest.dateOfBirth;

      // ✅ Primary guest (mandatory)
      if (i === 0) {
        if (!guest.firstName.trim()) {
          guestErrors.firstName = 'First name is required';
        }
        if (!guest.lastName.trim()) {
          guestErrors.lastName = 'Last name is required';
        }
      }

      // ✅ Other guests (optional but consistent if filled)
      else if (hasAnyValue) {
        if (!guest.firstName.trim()) {
          guestErrors.firstName = 'First name is required';
        }
        if (!guest.lastName.trim()) {
          guestErrors.lastName = 'Last name is required';
        }
      }

      newErrors.guests[i] = guestErrors;
    });

    setErrors(newErrors);

    const hasContactErrors = !!newErrors.primaryEmail || !!newErrors.primaryPhone;
    const hasGuestErrors = newErrors.guests.some((g) => Object.keys(g).length > 0);
    return !hasContactErrors && !hasGuestErrors;
  };

  // ─── Input handlers ───────────────────────────────────────────────────────────

  const handleContactChange = (field: 'primaryEmail' | 'primaryPhone', value: string) => {
    setGuestData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleGuestChange = (index: number, field: keyof IGuestEntry, value: string) => {
    setGuestData((prev) => {
      const updated = [...prev.guests];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, guests: updated };
    });
    setErrors((prev) => {
      const updated = [...prev.guests];
      updated[index] = { ...updated[index], [field]: undefined };
      return { ...prev, guests: updated };
    });
  };

  const primaryGuest = guestData.guests[0];
  const additionalGuests = guestData.guests.slice(1);

  const handleConfirmBooking = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }
    if (!selectedPaymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    setIsProcessing(true);

    try {
      const { pricingDetails, room, roomPrice, searchCriteria } = locationState;

      const seenRooms = new Set<string>();
      let totalAdults = 0;
      let totalChildren = 0;
      const roomsArray: { adults: number; children: number; childAges: number[] }[] = [];

      for (const day of pricingDetails.dailyPriceBrakeDown) {
        if (seenRooms.has(day.roomNumber)) continue;
        seenRooms.add(day.roomNumber);

        totalAdults += day.guestDistribution.adults;
        totalChildren += day.guestDistribution.children;
        roomsArray.push({
          adults: day.guestDistribution.adults,
          children: day.guestDistribution.children,
          childAges: day.guestDistribution.childAges || [],
        });
      }

      const bookingPayload: ICreateBookingPayload = {
        propertyCode: selectedProperty?.propertyCode,

        reservationStartDate: searchCriteria.startDate,
        reservationEndDate: searchCriteria.endDate,

        hotelName: selectedProperty?.name,
        roomTypeCode: room.roomType,
        ratePlanCode: roomPrice.ratePlanCode,
        roomName: room.roomName,

        bookingUserEmail: guestData.primaryEmail,
        bookingUserPhone: guestData.primaryPhone,

        numberOfRooms: new Set(
          pricingDetails.dailyPriceBrakeDown.map(item => item.roomNumber)
        ).size,
        finalPrice: pricingDetails,
        currencyCode: pricingDetails.currencyCode,
        agencyId: user.agencyId,
        agentId: user.id,
        guests: {
          rooms: new Set(
            pricingDetails.dailyPriceBrakeDown.map(item => item.roomNumber)
          ).size,
          adults: totalAdults,
          children: totalChildren,
          roomsArray: [
            {
              adults: totalAdults,
              children: totalChildren,
              childAges: [],
            },
          ],
        },

        paymentMethod:
          selectedPaymentMethod === 'payAtHotel'
            ? 'pay_at_hotel'
            : 'payment_gateway',
        selectedAddons: pricingDetails.addonBrakeDowns.map((a) => ({
          addonCode: a.addonId,
          addonId: a.addonId,
          addonName: a.name,
          availabilityId: a.addonId,
          date: new Date(a.date),
          price: a.amount,
          quantity: a.quantity,
          totalPrice: a.totalAmount,
          type: a.type,
        })),
        selectedPromotions: [],
        bookingSource: "agency",
        platforms: "web",
        bankDetails: paymentDetails,
        guestDetails: guestData.guests.map((guest) => ({
          type: guest.type,
          firstName: guest.firstName,
          lastName: guest.lastName,
          dateOfBirth: guest.dateOfBirth || "",
        })),
      };
      const bookingResult = await createBookingService(bookingPayload);

      if (bookingResult.success) {
        navigate('/payment-success', {
          state: {
            bookingData: {
              bookingCode: bookingResult.data.bookingCode,
              bookingStatus: bookingResult.data.bookingStatus,
              // Everything else comes from what you already had
              hotelName: bookingPayload.hotelName,
              reservationStartDate: bookingPayload.reservationStartDate,
              reservationEndDate: bookingPayload.reservationEndDate,
              roomTypeCode: bookingPayload.roomTypeCode,
              ratePlanCode: bookingPayload.ratePlanCode,
              bookingUserEmail: bookingPayload.bookingUserEmail,
              bookingUserPhone: bookingPayload.bookingUserPhone,
              currencyCode: bookingPayload.currencyCode,
              paymentMethod: bookingPayload.paymentMethod,
              amount: bookingPayload.finalPrice.totalAmount,
            },
            pricingDetails: bookingPayload.finalPrice,
            guestData: guestData,
          }
        });
      } else {
        toast.error(bookingResult.message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <Loader fullScreen text="Loading payment details..." />;
  if (!locationState?.pricingDetails || !paymentDetails) return null;

  const { pricingDetails, roomPrice, searchCriteria } = locationState;
  const currencyCode = pricingDetails.currencyCode;
  const uniqueNights = new Set(pricingDetails.dailyPriceBrakeDown.map(d => d.date)).size;

  // subtotal = amountBeforeTax + addons (derived for display)
  const subtotal = pricingDetails.amountBeforeTax;
  const pureBase = pricingDetails.amountBeforeTax - (pricingDetails.agencyCommissionAmount + pricingDetails.totalAddonAmount);

  const baseBeforeDiscounts = Math.round(pureBase + pricingDetails.totalPromotionAmount + pricingDetails.agencyCommissionAmount);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/property/${propertyId}/rooms`)}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Complete Your Booking</h1>
          <p className="text-muted-foreground">
            {searchCriteria && (
              <span>
                {formatDate(searchCriteria.startDate)} – {formatDate(searchCriteria.endDate)}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Contact Details */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="primaryEmail">Email <span className="text-destructive">*</span></Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="primaryEmail"
                        type="email"
                        value={guestData.primaryEmail}
                        onChange={(e) => handleContactChange('primaryEmail', e.target.value)}
                        placeholder="guest@email.com"
                        className={cn('pl-9', errors.primaryEmail && 'border-destructive')}
                      />
                    </div>
                    {errors.primaryEmail && <p className="text-sm text-destructive">{errors.primaryEmail}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="primaryPhone">Phone Number <span className="text-destructive">*</span></Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="primaryPhone"
                        type="tel"
                        value={guestData.primaryPhone}
                        onChange={(e) => handleContactChange('primaryPhone', e.target.value)}
                        placeholder="+1 234 567 8900"
                        className={cn('pl-9', errors.primaryPhone && 'border-destructive')}
                      />
                    </div>
                    {errors.primaryPhone && <p className="text-sm text-destructive">{errors.primaryPhone}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Guest Details */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Guest Details
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">

                {/* ─── PRIMARY GUEST ───────────────────────── */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      👤 Adult 1
                    </span>
                    <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-full font-semibold">
                      Primary Guest
                    </span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>First Name <span className="text-destructive">*</span></Label>
                      <Input
                        value={primaryGuest.firstName}
                        onChange={(e) => handleGuestChange(0, 'firstName', e.target.value)}
                        placeholder="First name"
                        className={cn(errors.guests[0]?.firstName && 'border-destructive')}
                      />
                      {errors.guests[0]?.firstName && (
                        <p className="text-sm text-destructive">{errors.guests[0].firstName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Last Name <span className="text-destructive">*</span></Label>
                      <Input
                        value={primaryGuest.lastName}
                        onChange={(e) => handleGuestChange(0, 'lastName', e.target.value)}
                        placeholder="Last name"
                        className={cn(errors.guests[0]?.lastName && 'border-destructive')}
                      />
                      {errors.guests[0]?.lastName && (
                        <p className="text-sm text-destructive">{errors.guests[0].lastName}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Date of Birth (Optional)</Label>
                    <div className="relative">
                      <Cake className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="date"
                        value={primaryGuest.dateOfBirth}
                        onChange={(e) => handleGuestChange(0, 'dateOfBirth', e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>

                {/* ─── TOGGLE BUTTON ───────────────────────── */}
                {additionalGuests.length > 0 && (
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => setShowAdditionalGuests((prev) => !prev)}
                  >
                    {showAdditionalGuests ? 'Hide Additional Guests' : 'Fill Additional Guest Details'}
                  </Button>
                )}

                {/* ─── ADDITIONAL GUESTS ───────────────────── */}
                {showAdditionalGuests && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {additionalGuests.map((guest, idx) => {
                      const index = idx + 1;

                      return (
                        <div key={`${guest.type}-${index}`} className="space-y-3">

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              {guest.type === 'adult' ? '👤' : '🧒'} {guest.type === 'adult' ? 'Adult' : 'Child'} {index + 1}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 bg-muted text-muted-foreground border rounded-full">
                              Optional
                            </span>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label>First Name</Label>
                              <Input
                                value={guest.firstName}
                                onChange={(e) => handleGuestChange(index, 'firstName', e.target.value)}
                                placeholder="First name"
                                className={cn(errors.guests[index]?.firstName && 'border-destructive')}
                              />
                              {errors.guests[index]?.firstName && (
                                <p className="text-sm text-destructive">{errors.guests[index].firstName}</p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label>Last Name</Label>
                              <Input
                                value={guest.lastName}
                                onChange={(e) => handleGuestChange(index, 'lastName', e.target.value)}
                                placeholder="Last name"
                                className={cn(errors.guests[index]?.lastName && 'border-destructive')}
                              />
                              {errors.guests[index]?.lastName && (
                                <p className="text-sm text-destructive">{errors.guests[index].lastName}</p>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Date of Birth (Optional)</Label>
                            <div className="relative">
                              <Cake className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="date"
                                value={guest.dateOfBirth}
                                onChange={(e) => handleGuestChange(index, 'dateOfBirth', e.target.value)}
                                className="pl-9"
                              />
                            </div>
                          </div>

                          {index < guestData.guests.length - 1 && <Separator />}
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment Method */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Pay at Hotel */}
                <div
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-lg border transition-all',
                    paymentDetails.payAtHotel
                      ? selectedPaymentMethod === 'payAtHotel'
                        ? 'border-accent bg-accent/5 cursor-pointer'
                        : 'border-border hover:bg-muted/50 cursor-pointer'
                      : 'border-muted bg-muted/30 cursor-not-allowed opacity-60'
                  )}
                  onClick={() => paymentDetails.payAtHotel && setSelectedPaymentMethod('payAtHotel')}
                >
                  <div className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg',
                    paymentDetails.payAtHotel
                      ? selectedPaymentMethod === 'payAtHotel' ? 'bg-accent text-accent-foreground' : 'bg-muted'
                      : 'bg-muted/50'
                  )}>
                    <Building className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Pay at Hotel</p>
                    <p className="text-sm text-muted-foreground">
                      {paymentDetails.payAtHotel ? 'Pay during check-in at the property' : 'Not available for this property'}
                    </p>
                  </div>
                  {paymentDetails.payAtHotel && selectedPaymentMethod === 'payAtHotel' && (
                    <Check className="h-5 w-5 text-accent" />
                  )}
                </div>

                {/* Payment Gateway */}
                <div
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-lg border transition-all',
                    paymentDetails.paymentGateway
                      ? selectedPaymentMethod === 'paymentGateway'
                        ? 'border-accent bg-accent/5 cursor-pointer'
                        : 'border-border hover:bg-muted/50 cursor-pointer'
                      : 'border-muted bg-muted/30 cursor-not-allowed opacity-60'
                  )}
                  onClick={() => paymentDetails.paymentGateway && setSelectedPaymentMethod('paymentGateway')}
                >
                  <div className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg',
                    paymentDetails.paymentGateway
                      ? selectedPaymentMethod === 'paymentGateway' ? 'bg-accent text-accent-foreground' : 'bg-muted'
                      : 'bg-muted/50'
                  )}>
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Pay Online</p>
                    <p className="text-sm text-muted-foreground">
                      {paymentDetails.paymentGateway ? 'Secure online payment via card/UPI' : 'Not available for this property'}
                    </p>
                  </div>
                  {paymentDetails.paymentGateway && selectedPaymentMethod === 'paymentGateway' && (
                    <Check className="h-5 w-5 text-accent" />
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column — Pricing Summary */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="sticky top-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Pricing Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Rate Plan Info */}
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium text-foreground mb-1">{roomPrice?.ratePlanName}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarDays className="h-3 w-3" />
                    <span>{formatDate(searchCriteria.startDate)} – {formatDate(searchCriteria.endDate)}</span>
                  </div>
                </div>

                <Separator />

                {/* Base Breakdown */}
                <div className="space-y-2">

                  {/* Room Rate — before any discounts */}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Room Rate</span>
                    <span className="font-medium">
                      {formatCurrency(baseBeforeDiscounts, currencyCode)}
                    </span>
                  </div>

                  {/* Each discount line */}
                  {pricingDetails.promotionBrakeDown.length > 0 && (
                    <div className="space-y-1">
                      {pricingDetails.promotionBrakeDown
                        .filter((promo) => promo.restrictionType !== 'payLater')
                        .map((promo, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-green-600 flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {promo.name}
                            </span>
                            <span className={cn(
                              'font-medium',
                              promo.restrictionType === 'decrease' ? 'text-green-600' : 'text-red-500'
                            )}>
                              {promo.restrictionType === 'decrease' ? '-' : '+'}
                              {formatCurrency(promo.discountAmount, promo.currencyCode ?? currencyCode)}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Total savings badge */}
                  {pricingDetails.totalPromotionAmount > 0 && (
                    <div className="flex justify-between text-sm px-2 py-1.5 bg-green-50 dark:bg-green-950/30 rounded-md">
                      <span className="text-green-700 dark:text-green-400 font-medium">Total Savings</span>
                      <span className="font-bold text-green-700 dark:text-green-400">
                        -{formatCurrency(pricingDetails.totalPromotionAmount, currencyCode)}
                      </span>
                    </div>
                  )}

                  {/* Promo code discount */}
                  {pricingDetails.promoCodeDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Promo Code</span>
                      <span className="font-medium text-green-600">
                        -{formatCurrency(pricingDetails.promoCodeDiscount, currencyCode)}
                      </span>
                    </div>
                  )}

                  {/* Addons */}
                  {pricingDetails.totalAddonAmount > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Included Add-ons</span>
                        <span className="font-medium">
                          {formatCurrency(pricingDetails.totalAddonAmount, currencyCode)}
                        </span>
                      </div>
                      {pricingDetails.addonBrakeDowns.map((addon) => (
                        <div key={addon.addonId} className="flex justify-between text-xs text-muted-foreground pl-3">
                          <span>• {addon.name}</span>
                          <span>{formatCurrency(addon.totalAmount, addon.currencyCode)}</span>
                        </div>
                      ))}
                    </>
                  )}

                  {/* Subtotal */}
                  <div className="flex justify-between text-sm font-medium pt-1 border-t border-dashed border-border">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(subtotal, currencyCode)}</span>
                  </div>
                </div>

                {/* Taxes */}
                {pricingDetails.taxBrakeDown.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Taxes & Fees</p>
                      {pricingDetails.taxBrakeDown.map((tax, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{tax.name}</span>
                          <span className="font-medium">
                            {formatCurrency(tax.taxedAmount, tax.currencyCode)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <Separator />

                {/* Grand Total */}
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-foreground">Grand Total</span>
                  <span className="font-bold text-xl text-foreground">
                    {formatCurrency(pricingDetails.totalAmount, currencyCode)}
                  </span>
                </div>

                {/* Pay Now + Pay at Hotel */}
                <div className="rounded-lg border border-border overflow-hidden text-sm">
                  <div className="flex justify-between items-center px-3 py-2.5 bg-green-50 dark:bg-green-950/30 border-b border-border">
                    <span className="text-green-700 dark:text-green-400 font-medium flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5" />
                      Pay Now
                    </span>
                    <span className="font-bold text-green-800 dark:text-green-300">
                      {formatCurrency(pricingDetails.currentChargeableAmount, currencyCode)}
                    </span>
                  </div>

                  {/* Pay at Hotel / Later Payable */}
                  {(pricingDetails.latterpayableAmount > 0 ||
                    pricingDetails.promotionBrakeDown.some(p => p.restrictionType === 'payLater')) && (
                      <div className="flex justify-between items-center px-3 py-2.5 bg-amber-50 dark:bg-amber-950/30">
                        <span className="text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1.5">
                          {pricingDetails.touristTax ? `🏛 ${pricingDetails.touristTax.name}` : '🏨 Pay at Hotel'}
                          <span className="font-normal text-xs">(pay at hotel)</span>
                        </span>
                        <span className="font-bold text-amber-800 dark:text-amber-300">
                          {formatCurrency(
                            pricingDetails.latterpayableAmount > 0
                              ? pricingDetails.latterpayableAmount
                              : pricingDetails.promotionBrakeDown
                                .filter(p => p.restrictionType === 'payLater')
                                .reduce((sum, p) => sum + p.discountAmount, 0),
                            pricingDetails.touristTax?.currencyCode ?? currencyCode
                          )}
                        </span>
                      </div>
                    )}
                </div>

                <div className="text-center text-xs text-muted-foreground">
                  {formatCurrency(pricingDetails.currentChargeableAmount / (uniqueNights || 1), currencyCode)} per night
                </div>

                <Button
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground mt-4"
                  size="lg"
                  onClick={handleConfirmBooking}
                  disabled={isProcessing || !selectedPaymentMethod}
                >
                  {isProcessing ? (
                    <>
                      <span className="mr-2">Processing...</span>
                      <div className="h-4 w-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                    </>
                  ) : (
                    <>Confirm Booking • {formatCurrency(pricingDetails.currentChargeableAmount, currencyCode)}</>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}