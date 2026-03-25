import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { fetchPaymentDetailsService, createBookingService } from './service/bookings.service';
import type {
  IGuestFormData,
  IPaymentDetails,
  PaymentMethodType,
  IAgentPricingResponse,
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
  User,
  Mail,
  Phone,
  Cake,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LocationState {
  roomsData: any[];
  ratePlan: any;
  dateRange: any;
  pricingDetails: IAgentPricingResponse;
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

  // Guest form data
  const [guestData, setGuestData] = useState<IGuestFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
  });

  // Validation errors
  const [errors, setErrors] = useState<Partial<IGuestFormData>>({});

  useEffect(() => {
    // Check if we have the required state data
    // if (!locationState?.pricingDetails || !locationState?.ratePlan) {
    //   toast.error('Missing booking details. Please start from property selection.');
    //   navigate('/property');
    //   return;
    // }

    const fetchPaymentMethods = async () => {
      console.log(propertyId, "propertyId")
      if (!propertyId) return;

      setLoading(true);
      const result = await fetchPaymentDetailsService(propertyId);
      console.log(result, "result")

      if (result.success && result.data) {
        setPaymentDetails(result.data);

        // Auto-select the first available payment method
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
  }, [propertyId, locationState, navigate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
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

  const validateForm = (): boolean => {
    const newErrors: Partial<IGuestFormData> = {};

    if (!guestData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!guestData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!guestData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!guestData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[0-9+\s-()]{10,}$/.test(guestData.phoneNumber)) {
      newErrors.phoneNumber = 'Invalid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof IGuestFormData, value: string) => {
    setGuestData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleConfirmBooking = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    if (!selectedPaymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    // if (!locationState?.pricingDetails || !locationState?.ratePlan || !locationState?.dateRange) {
    //   toast.error('Missing booking information');
    //   return;
    // }

    setIsProcessing(true);

    try {
      const { pricingDetails, ratePlan, dateRange, roomsData } = locationState;
      console.log(roomsData, "pricingDetails, ratePlan, dateRange, roomsData")
      const room = roomsData.find((r: any) => r.room.room.id === roomId);
      
      if (!room) {
        toast.error('Room information not found');
        setIsProcessing(false);
        return;
      }

      // Get property details from the first charge
      const firstCharge = ratePlan.chargesPerDay[0]?.charge;
      if (!firstCharge) {
        toast.error('Pricing information not found');
        setIsProcessing(false);
        return;
      }

      // Build booking payload
      const bookingPayload: ICreateBookingPayload = {
        data: {
          bookingDetails: {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            propertyCode: firstCharge.propertyCode,
            hotelName: room.room.room.roomName, // You might want to get actual hotel name
            roomTypeCode: firstCharge.roomTypeCode,
            ratePlanCode: ratePlan?.ratePlan.ratePlanCode,
            numberOfRooms: pricingDetails.requestedRooms,
            finalPrice: pricingDetails,
            currency: pricingDetails.dailyBreakdown[0]?.currencyCode || 'USD',
            email: guestData.email,
            phone: guestData.phoneNumber,
            guests: {
              adults: 2, // You might want to track this from search filters
              children: 0,
              rooms: pricingDetails.requestedRooms,
            },
            paymentMethod: selectedPaymentMethod,
            selectedAddons: [],
            selectedPromotions: [],
          },
          guestDetails: [
            {
              type: 'adult',
              firstName: guestData.firstName,
              lastName: guestData.lastName,
              dateOfBirth: guestData.dateOfBirth,
              email: guestData.email,
              phone: guestData.phoneNumber,
            },
          ],
        },
      };

      console.log('Creating booking with payload:', bookingPayload);

      const result = await createBookingService(bookingPayload);

      if (result.success) {
        toast.success('Booking confirmed successfully!');
        
        // Navigate to payment success page with booking data
        navigate('/payment-success', {
          state: {
            bookingData: result.data,
            pricingDetails,
            guestData,
          },
        });
      } else {
        toast.error(result.message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return <Loader fullScreen text="Loading payment details..." />;
  }

  if (!locationState?.pricingDetails || !paymentDetails) {
    return null;
  }

  const { pricingDetails, ratePlan, dateRange } = locationState;
  const currencyCode = pricingDetails.dailyBreakdown[0]?.currencyCode || 'USD';

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
            {dateRange && (
              <span>
                {formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)} • {pricingDetails.numberOfNights} night{pricingDetails.numberOfNights > 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Guest Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Guest Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">
                      First Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      value={guestData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Enter first name"
                      className={cn(errors.firstName && 'border-destructive')}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-destructive">{errors.firstName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">
                      Last Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      value={guestData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Enter last name"
                      className={cn(errors.lastName && 'border-destructive')}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-destructive">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={guestData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="guest@email.com"
                        className={cn('pl-9', errors.email && 'border-destructive')}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">
                      Phone Number <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phoneNumber"
                        type="tel"
                        value={guestData.phoneNumber}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                        placeholder="+1 234 567 8900"
                        className={cn('pl-9', errors.phoneNumber && 'border-destructive')}
                      />
                    </div>
                    {errors.phoneNumber && (
                      <p className="text-sm text-destructive">{errors.phoneNumber}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth (Optional)</Label>
                  <div className="relative">
                    <Cake className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={guestData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment Method */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
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
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg',
                      paymentDetails.payAtHotel
                        ? selectedPaymentMethod === 'payAtHotel'
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-muted'
                        : 'bg-muted/50'
                    )}
                  >
                    <Building className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Pay at Hotel</p>
                    <p className="text-sm text-muted-foreground">
                      {paymentDetails.payAtHotel
                        ? 'Pay during check-in at the property'
                        : 'Not available for this property'}
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
                  onClick={() =>
                    paymentDetails.paymentGateway && setSelectedPaymentMethod('paymentGateway')
                  }
                >
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg',
                      paymentDetails.paymentGateway
                        ? selectedPaymentMethod === 'paymentGateway'
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-muted'
                        : 'bg-muted/50'
                    )}
                  >
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Pay Online</p>
                    <p className="text-sm text-muted-foreground">
                      {paymentDetails.paymentGateway
                        ? 'Secure online payment via card/UPI'
                        : 'Not available for this property'}
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

        {/* Right Column - Pricing Summary */}
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
                  <DollarSign className="h-5 w-5" />
                  Pricing Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Rate Plan Info */}
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium text-foreground mb-1">
                    {ratePlan?.ratePlan.ratePlanName}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarDays className="h-3 w-3" />
                    <span>
                      {pricingDetails.numberOfNights} night{pricingDetails.numberOfNights > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Pricing Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Base Amount</span>
                    <span className="font-medium">
                      {formatCurrency(pricingDetails.breakdown.totalBaseAmount, currencyCode)}
                    </span>
                  </div>

                  {pricingDetails.breakdown.totalAdditionalCharges > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Additional Charges</span>
                      <span className="font-medium">
                        {formatCurrency(pricingDetails.breakdown.totalAdditionalCharges, currencyCode)}
                      </span>
                    </div>
                  )}

                  {pricingDetails.includedAddons.length > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Included Add-ons</span>
                        <span className="font-medium">
                          {formatCurrency(pricingDetails.breakdown.totalIncludedAddons, currencyCode)}
                        </span>
                      </div>
                      <div className="pl-4 space-y-1">
                        {pricingDetails.includedAddons.map((addon) => (
                          <div key={addon.addonId} className="flex justify-between text-xs text-muted-foreground">
                            <span>• {addon.addonName}</span>
                            <span>{formatCurrency(addon.amount, addon.currencyCode)}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <Separator />

                {/* Subtotal */}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">
                    {formatCurrency(pricingDetails.breakdown.subtotal, currencyCode)}
                  </span>
                </div>

                {/* Commission */}
                {pricingDetails.breakdown.agencyCommission > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Agency Commission ({pricingDetails.agencyCommission.commissionValue}%)
                    </span>
                    <span className="font-medium">
                      {formatCurrency(pricingDetails.breakdown.agencyCommission, currencyCode)}
                    </span>
                  </div>
                )}

                {/* Taxes */}
                {pricingDetails.tax.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-1">
                      {pricingDetails.tax.map((tax, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{tax.name}</span>
                          <span className="font-medium">
                            {formatCurrency(tax.amount, currencyCode)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <Separator />

                {/* Total */}
                <div className="flex justify-between pt-2">
                  <span className="font-semibold text-foreground">Total Amount</span>
                  <span className="font-bold text-xl text-foreground">
                    {formatCurrency(pricingDetails.totalAmount, currencyCode)}
                  </span>
                </div>

                {/* Average per night */}
                <div className="text-center text-xs text-muted-foreground">
                  {formatCurrency(pricingDetails.breakdown.averagePerNight, currencyCode)} per night
                </div>

                {/* Confirm Button */}
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
                    <>Confirm Booking • {formatCurrency(pricingDetails.totalAmount, currencyCode)}</>
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