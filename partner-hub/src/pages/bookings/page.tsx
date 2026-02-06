import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { setSelectedProperty, setRooms, setSelectedRoom } from '@/redux/slices/propertySlice';
import { resetBooking, setBookingDates, addGuest, setAddOns, setPaymentMethod, setTotalAmount } from '@/redux/slices/bookingSlice';
import { mockProperties, mockRooms, mockAddOns } from '@/lib/mockData';
import { Guest, GuestType, IdentityCardType, AddOn } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ButtonLoader } from '@/components/Loader';
import { cn } from '@/lib/utils';
import { format, differenceInDays, addDays } from 'date-fns';
import { ArrowLeft, CalendarIcon, IndianRupee, CreditCard, Building, Check, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

type BookingStep = 'dates' | 'guests' | 'addons' | 'payment' | 'confirm';

const steps: { key: BookingStep; label: string }[] = [
  { key: 'dates', label: 'Dates' },
  { key: 'guests', label: 'Guests' },
  { key: 'addons', label: 'Add-ons' },
  { key: 'payment', label: 'Payment' },
];

const emptyGuest = (propertyId: string): Guest => ({
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  userType: 'adult',
  propertyId,
  address: '',
  city: '',
  state: '',
  country: 'India',
  zipCode: '',
  userIdentityCardType: 'adhar_card',
  identityCardNumber: '',
});

export default function BookingPage() {
  const navigate = useNavigate();
  const { propertyId, roomId } = useParams<{ propertyId: string; roomId: string }>();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const selectedProperty = useAppSelector((state) => state.property.selectedProperty);
  const selectedRoom = useAppSelector((state) => state.property.selectedRoom);
  const currentBooking = useAppSelector((state) => state.booking.currentBooking);

  const [currentStep, setCurrentStep] = useState<BookingStep>('dates');
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [addOns, setLocalAddOns] = useState<AddOn[]>(mockAddOns.map(a => ({ ...a, selected: false })));
  const [paymentMethod, setLocalPaymentMethod] = useState<'pay_at_hotel' | 'pay_online' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    dispatch(resetBooking());

    if (propertyId && roomId) {
      const property = mockProperties.find((p) => p.id === propertyId);
      if (property) {
        dispatch(setSelectedProperty(property));
        dispatch(setRooms(mockRooms[propertyId] || []));
        const room = mockRooms[propertyId]?.find((r) => r.id === roomId);
        if (room) {
          dispatch(setSelectedRoom(room));
          setGuests([emptyGuest(propertyId)]);
        }
      }
    }
  }, [isAuthenticated, propertyId, roomId, navigate, dispatch]);

  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const roomTotal = selectedRoom ? selectedRoom.pricePerNight * nights : 0;
  const addOnsTotal = addOns.filter(a => a.selected).reduce((sum, a) => sum + a.price, 0);
  const totalAmount = roomTotal + addOnsTotal;

  const handleNextStep = () => {
    const stepIndex = steps.findIndex(s => s.key === currentStep);
    if (stepIndex < steps.length - 1) {
      if (currentStep === 'dates' && (!checkIn || !checkOut)) {
        toast.error('Please select check-in and check-out dates');
        return;
      }
      if (currentStep === 'guests') {
        const primaryGuest = guests[0];
        if (!primaryGuest?.firstName || !primaryGuest?.lastName || !primaryGuest?.phoneNumber) {
          toast.error('Please fill in required guest details');
          return;
        }
      }
      if (currentStep === 'payment' && !paymentMethod) {
        toast.error('Please select a payment method');
        return;
      }
      setCurrentStep(steps[stepIndex + 1].key);
    }
  };

  const handlePrevStep = () => {
    const stepIndex = steps.findIndex(s => s.key === currentStep);
    if (stepIndex > 0) {
      setCurrentStep(steps[stepIndex - 1].key);
    }
  };

  const handleConfirmBooking = async () => {
    setIsProcessing(true);
    
    // Store in redux
    if (checkIn && checkOut) {
      dispatch(setBookingDates({ checkIn: checkIn.toISOString(), checkOut: checkOut.toISOString() }));
    }
    guests.forEach(guest => dispatch(addGuest(guest)));
    dispatch(setAddOns(addOns.filter(a => a.selected)));
    if (paymentMethod) dispatch(setPaymentMethod(paymentMethod));
    dispatch(setTotalAmount(totalAmount));

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsProcessing(false);
    toast.success('Booking confirmed successfully!');
    navigate('/reservations');
  };

  const updateGuest = (index: number, field: keyof Guest, value: string) => {
    const updated = [...guests];
    updated[index] = { ...updated[index], [field]: value };
    setGuests(updated);
  };

  const addNewGuest = () => {
    if (selectedRoom && guests.length < selectedRoom.maxGuests) {
      setGuests([...guests, emptyGuest(propertyId || '')]);
    } else {
      toast.error(`Maximum ${selectedRoom?.maxGuests} guests allowed`);
    }
  };

  const removeGuest = (index: number) => {
    if (index > 0) {
      setGuests(guests.filter((_, i) => i !== index));
    }
  };

  const toggleAddOn = (id: string) => {
    setLocalAddOns(addOns.map(a => a.id === id ? { ...a, selected: !a.selected } : a));
  };

  if (!isAuthenticated || !selectedProperty || !selectedRoom) return null;

  const currentStepIndex = steps.findIndex(s => s.key === currentStep);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
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
        <div>
          <h1 className="text-2xl font-bold text-foreground">Book {selectedRoom.name}</h1>
          <p className="text-muted-foreground">{selectedProperty.name}</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.key} className="flex items-center flex-1">
            <div className="flex items-center gap-2">
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                index <= currentStepIndex 
                  ? "bg-accent text-accent-foreground" 
                  : "bg-muted text-muted-foreground"
              )}>
                {index < currentStepIndex ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <span className={cn(
                "text-sm font-medium hidden sm:inline",
                index <= currentStepIndex ? "text-foreground" : "text-muted-foreground"
              )}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={cn(
                "flex-1 h-0.5 mx-2",
                index < currentStepIndex ? "bg-accent" : "bg-muted"
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Dates Step */}
          {currentStep === 'dates' && (
            <Card>
              <CardHeader>
                <CardTitle>Select Booking Dates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Check-in Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !checkIn && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {checkIn ? format(checkIn, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={checkIn}
                          onSelect={(date) => {
                            setCheckIn(date);
                            if (date && (!checkOut || checkOut <= date)) {
                              setCheckOut(addDays(date, 1));
                            }
                          }}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Check-out Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !checkOut && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {checkOut ? format(checkOut, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={checkOut}
                          onSelect={setCheckOut}
                          disabled={(date) => date <= (checkIn || new Date())}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                {nights > 0 && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">{nights} night{nights > 1 ? 's' : ''}</span>
                      {' × '}
                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(selectedRoom.pricePerNight)}
                      {' = '}
                      <span className="font-semibold text-foreground">
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(roomTotal)}
                      </span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Guests Step */}
          {currentStep === 'guests' && (
            <div className="space-y-4">
              {guests.map((guest, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg">
                      {index === 0 ? 'Primary Guest' : `Guest ${index + 1}`}
                    </CardTitle>
                    {index > 0 && (
                      <Button variant="ghost" size="icon" onClick={() => removeGuest(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>First Name *</Label>
                        <Input
                          value={guest.firstName}
                          onChange={(e) => updateGuest(index, 'firstName', e.target.value)}
                          placeholder="Enter first name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Last Name *</Label>
                        <Input
                          value={guest.lastName}
                          onChange={(e) => updateGuest(index, 'lastName', e.target.value)}
                          placeholder="Enter last name"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={guest.email || ''}
                          onChange={(e) => updateGuest(index, 'email', e.target.value)}
                          placeholder="guest@email.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone Number *</Label>
                        <Input
                          value={guest.phoneNumber || ''}
                          onChange={(e) => updateGuest(index, 'phoneNumber', e.target.value)}
                          placeholder="+91 9876543210"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Guest Type</Label>
                        <Select
                          value={guest.userType}
                          onValueChange={(v) => updateGuest(index, 'userType', v as GuestType)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="adult">Adult</SelectItem>
                            <SelectItem value="child">Child</SelectItem>
                            <SelectItem value="infant">Infant</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>ID Type</Label>
                        <Select
                          value={guest.userIdentityCardType || 'adhar_card'}
                          onValueChange={(v) => updateGuest(index, 'userIdentityCardType', v as IdentityCardType)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="adhar_card">Aadhaar Card</SelectItem>
                            <SelectItem value="passport">Passport</SelectItem>
                            <SelectItem value="driving_license">Driving License</SelectItem>
                            <SelectItem value="voter_id">Voter ID</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>ID Number</Label>
                      <Input
                        value={guest.identityCardNumber || ''}
                        onChange={(e) => updateGuest(index, 'identityCardNumber', e.target.value)}
                        placeholder="Enter ID number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Address</Label>
                      <Input
                        value={guest.address || ''}
                        onChange={(e) => updateGuest(index, 'address', e.target.value)}
                        placeholder="Street address"
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="space-y-2">
                        <Label>City</Label>
                        <Input
                          value={guest.city || ''}
                          onChange={(e) => updateGuest(index, 'city', e.target.value)}
                          placeholder="City"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>State</Label>
                        <Input
                          value={guest.state || ''}
                          onChange={(e) => updateGuest(index, 'state', e.target.value)}
                          placeholder="State"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Country</Label>
                        <Input
                          value={guest.country || ''}
                          onChange={(e) => updateGuest(index, 'country', e.target.value)}
                          placeholder="Country"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>ZIP Code</Label>
                        <Input
                          value={guest.zipCode || ''}
                          onChange={(e) => updateGuest(index, 'zipCode', e.target.value)}
                          placeholder="ZIP"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {guests.length < (selectedRoom?.maxGuests || 1) && (
                <Button variant="outline" onClick={addNewGuest} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Guest
                </Button>
              )}
            </div>
          )}

          {/* Add-ons Step */}
          {currentStep === 'addons' && (
            <Card>
              <CardHeader>
                <CardTitle>Optional Add-ons</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {addOns.map((addon) => (
                  <div
                    key={addon.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg border transition-colors cursor-pointer",
                      addon.selected ? "border-accent bg-accent/5" : "border-border hover:bg-muted/50"
                    )}
                    onClick={() => toggleAddOn(addon.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox checked={addon.selected} />
                      <div>
                        <p className="font-medium text-foreground">{addon.name}</p>
                        <p className="text-sm text-muted-foreground">{addon.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 font-semibold text-foreground">
                      <IndianRupee className="h-4 w-4" />
                      {addon.price.toLocaleString()}
                    </div>
                  </div>
                ))}
                <p className="text-sm text-muted-foreground text-center pt-2">
                  You can skip this section if you don't need any add-ons
                </p>
              </CardContent>
            </Card>
          )}

          {/* Payment Step */}
          {currentStep === 'payment' && (
            <div className="space-y-4">
              {/* Price Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Price Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Room ({nights} night{nights > 1 ? 's' : ''})</span>
                    <span className="font-medium">₹{roomTotal.toLocaleString()}</span>
                  </div>
                  {addOns.filter(a => a.selected).map(addon => (
                    <div key={addon.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{addon.name}</span>
                      <span className="font-medium">₹{addon.price.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="border-t pt-3 flex justify-between">
                    <span className="font-semibold text-foreground">Total Amount</span>
                    <span className="font-bold text-xl text-foreground">₹{totalAmount.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-lg border transition-colors cursor-pointer",
                      paymentMethod === 'pay_at_hotel' ? "border-accent bg-accent/5" : "border-border hover:bg-muted/50"
                    )}
                    onClick={() => setLocalPaymentMethod('pay_at_hotel')}
                  >
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg",
                      paymentMethod === 'pay_at_hotel' ? "bg-accent text-accent-foreground" : "bg-muted"
                    )}>
                      <Building className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">Pay at Hotel</p>
                      <p className="text-sm text-muted-foreground">Pay during check-in at the property</p>
                    </div>
                    {paymentMethod === 'pay_at_hotel' && <Check className="h-5 w-5 text-accent" />}
                  </div>
                  <div
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-lg border transition-colors cursor-pointer",
                      paymentMethod === 'pay_online' ? "border-accent bg-accent/5" : "border-border hover:bg-muted/50"
                    )}
                    onClick={() => setLocalPaymentMethod('pay_online')}
                  >
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg",
                      paymentMethod === 'pay_online' ? "bg-accent text-accent-foreground" : "bg-muted"
                    )}>
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">Pay Online</p>
                      <p className="text-sm text-muted-foreground">Secure online payment via card/UPI</p>
                    </div>
                    {paymentMethod === 'pay_online' && <Check className="h-5 w-5 text-accent" />}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={handlePrevStep}
          disabled={currentStepIndex === 0}
        >
          Back
        </Button>
        {currentStep === 'payment' ? (
          <Button
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
            onClick={handleConfirmBooking}
            disabled={!paymentMethod || isProcessing}
          >
            {isProcessing ? (
              <>
                <ButtonLoader />
                <span className="ml-2">Processing...</span>
              </>
            ) : (
              `Confirm Booking • ₹${totalAmount.toLocaleString()}`
            )}
          </Button>
        ) : (
          <Button
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
            onClick={handleNextStep}
          >
            Continue
          </Button>
        )}
      </div>
    </div>
  );
}
