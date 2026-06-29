import { useState, useCallback, type FC } from 'react';
import { startOfDay, isBefore } from 'date-fns';
import toast from 'react-hot-toast';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft, ChevronRight, RefreshCw, CheckCircle, Loader2,
  CalendarDays, Users, Minus, Plus, Trash2, PlusCircle, AlertCircle,
} from 'lucide-react';import { ButtonLoader } from '@/components/Loader';
import { IReservation } from '../interfaces/agent-reservation.interfaces';

// ─── Types (inline — avoids extra import if amend.types isn't available) ──────

type AmendStep = 1 | 2 | 3;
type PriceStatus = 'idle' | 'loading' | 'success' | 'error';

interface IAmendRoom {
  adults: number;
  children: number;
  childAges: number[];
}

interface IAmendGuest {
  type: 'adult' | 'child';
  firstName: string;
  lastName: string;
  dob: string;
  age?: number | null;
}

interface IGuestFieldErrors {
  firstName?: string;
  lastName?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const parseDate = (date: any): string => {
  if (typeof date === 'string') return date.split('T')[0];
  if (date && typeof date === 'object' && '$date' in date) return date.$date.split('T')[0];
  return '';
};

const formatCurrency = (amount: number, currency = 'AED') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount);

const formatDisplayDate = (d: string) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const normalizeGuests = (guests: any[]): IAmendGuest[] =>
  (guests || []).map((g) => ({
    type: g.type === 'child' ? 'child' : 'adult',
    firstName: g.firstName || '',
    lastName: g.lastName || '',
    dob: typeof g.dob === 'string' ? g.dob.split('T')[0]
      : typeof g.dateOfBirth === 'string' ? g.dateOfBirth.split('T')[0] : '',
    age: g.age ?? undefined,
  }));

const buildInitialRooms = (reservation: IReservation): IAmendRoom[] => {
  const breakdown =
    (reservation as any).priceBreakdowns?.[0]?.dailyPriceBrakeDown ??
    (reservation as any).finalPrice?.dailyPriceBrakeDown ??
    reservation.PricingBrakeDown?.DailyPriceBrakeDown ?? [];

  const roomMap = new Map<string, IAmendRoom>();
  for (const day of breakdown) {
    if (!roomMap.has(day.roomNumber)) {
      roomMap.set(day.roomNumber, {
        adults: day.guestDistribution?.adults ?? 1,
        children: day.guestDistribution?.children ?? 0,
        childAges: [...(day.guestDistribution?.childAges ?? [])],
      });
    }
  }
  return roomMap.size > 0 ? Array.from(roomMap.values()) : [{ adults: 1, children: 0, childAges: [] }];
};

// ─── Step Indicator ───────────────────────────────────────────────────────────

const steps = ['Dates & Rooms', 'Guest Details', 'Review & Confirm'];

function StepIndicator({ current }: { current: AmendStep }) {
  return (
    <div className="flex items-center w-full">
      {steps.map((label, idx) => {
        const num = (idx + 1) as AmendStep;
        const done = current > num;
        const active = current === num;
        return (
          <div key={idx} className="flex-1 flex flex-col items-center relative">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold z-10 transition-all
              ${active ? 'bg-blue-600 text-white shadow-md ring-4 ring-blue-100'
                : done ? 'bg-blue-500 text-white'
                : 'bg-muted text-muted-foreground'}`}>
              {done ? <CheckCircle className="h-4 w-4" /> : num}
            </div>
            <span className={`mt-2 text-xs font-medium whitespace-nowrap
              ${active ? 'text-blue-600' : 'text-muted-foreground'}`}>
              {label}
            </span>
            {idx < steps.length - 1 && (
              <div className={`absolute top-4 left-1/2 w-full h-[2px] -z-0 transition-colors
                ${done ? 'bg-blue-400' : 'bg-muted'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 1: Dates & Rooms ────────────────────────────────────────────────────

function StepDatesRooms({
  checkIn, checkOut, rooms,
  onCheckInChange, onCheckOutChange,
  onAddRoom, onRemoveRoom,
  onAdultChange, onChildChange, onChildAgeChange,
  dateErrors, onNext,
}: {
  checkIn: string; checkOut: string; rooms: IAmendRoom[];
  onCheckInChange: (v: string) => void; onCheckOutChange: (v: string) => void;
  onAddRoom: () => void; onRemoveRoom: (i: number) => void;
  onAdultChange: (i: number, d: number) => void;
  onChildChange: (i: number, d: number) => void;
  onChildAgeChange: (i: number, ci: number, age: number) => void;
  dateErrors: { checkIn?: string; checkOut?: string };
  onNext: () => void;
}) {
  return (
    <div className="space-y-6">

      {/* Dates */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-blue-600" /> Stay Dates
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs mb-1 block">Check-in Date</Label>
            <Input type="date" value={checkIn} onChange={(e) => onCheckInChange(e.target.value)}
              className={dateErrors.checkIn ? 'border-red-400' : ''} />
            {dateErrors.checkIn && <p className="text-xs text-red-500 mt-1">{dateErrors.checkIn}</p>}
          </div>
          <div>
            <Label className="text-xs mb-1 block">Check-out Date</Label>
            <Input type="date" value={checkOut} onChange={(e) => onCheckOutChange(e.target.value)}
              className={dateErrors.checkOut ? 'border-red-400' : ''} />
            {dateErrors.checkOut && <p className="text-xs text-red-500 mt-1">{dateErrors.checkOut}</p>}
          </div>
        </div>
      </div>

      {/* Rooms */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600" /> Rooms & Guests
          </h3>
          <Button variant="outline" size="sm" onClick={onAddRoom} className="text-xs gap-1">
            <PlusCircle className="h-3.5 w-3.5" /> Add Room
          </Button>
        </div>

        <div className="space-y-3">
          {rooms.map((room, ri) => (
            <div key={ri} className="border rounded-lg p-4 bg-muted/20">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-muted-foreground">Room {ri + 1}</span>
                {rooms.length > 1 && (
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-50"
                    onClick={() => onRemoveRoom(ri)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>

              {/* Adults */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Adults</span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-7 w-7"
                    onClick={() => onAdultChange(ri, -1)} disabled={room.adults <= 1}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-6 text-center text-sm font-medium">{room.adults}</span>
                  <Button variant="outline" size="icon" className="h-7 w-7"
                    onClick={() => onAdultChange(ri, 1)}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Children */}
              <div className="flex items-center justify-between">
                <span className="text-sm">Children</span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-7 w-7"
                    onClick={() => onChildChange(ri, -1)} disabled={room.children <= 0}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-6 text-center text-sm font-medium">{room.children}</span>
                  <Button variant="outline" size="icon" className="h-7 w-7"
                    onClick={() => onChildChange(ri, 1)}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Child ages */}
              {room.childAges.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {room.childAges.map((age, ci) => (
                    <div key={ci}>
                      <Label className="text-xs mb-1 block text-muted-foreground">Child {ci + 1} Age</Label>
                      <Input type="number" min={0} max={17} value={age}
                        onChange={(e) => onChildAgeChange(ri, ci, Number(e.target.value))}
                        className="h-8 text-sm" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button onClick={onNext} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          Next: Guest Details <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Step 2: Guest Details ────────────────────────────────────────────────────

function StepGuestDetails({
  guests, guestErrors, onGuestChange, onBack, onNext,
}: {
  guests: IAmendGuest[];
  guestErrors: Record<string, IGuestFieldErrors>;
  onGuestChange: (i: number, field: keyof IAmendGuest, value: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Primary guest (first adult) is required. All other guests are optional.
      </p>

      {guests.map((guest, i) => {
        const isPrimary = i === 0 && guest.type === 'adult';
        const errs = guestErrors[`guest-${i}`] ?? {};
        return (
          <div key={i} className="border rounded-lg p-4 bg-muted/20">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant={guest.type === 'adult' ? 'default' : 'secondary'} className="capitalize text-xs">
                {guest.type}
              </Badge>
              <span className="text-xs text-muted-foreground font-medium">
                Guest {i + 1} {isPrimary && '(Primary)'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1 block">
                  First Name {isPrimary && <span className="text-red-500">*</span>}
                </Label>
                <Input value={guest.firstName}
                  onChange={(e) => onGuestChange(i, 'firstName', e.target.value)}
                  placeholder="First name"
                  className={`h-9 text-sm ${errs.firstName ? 'border-red-400' : ''}`} />
                {errs.firstName && <p className="text-xs text-red-500 mt-1">{errs.firstName}</p>}
              </div>
              <div>
                <Label className="text-xs mb-1 block">
                  Last Name {isPrimary && <span className="text-red-500">*</span>}
                </Label>
                <Input value={guest.lastName}
                  onChange={(e) => onGuestChange(i, 'lastName', e.target.value)}
                  placeholder="Last name"
                  className={`h-9 text-sm ${errs.lastName ? 'border-red-400' : ''}`} />
                {errs.lastName && <p className="text-xs text-red-500 mt-1">{errs.lastName}</p>}
              </div>
              <div>
                <Label className="text-xs mb-1 block">Date of Birth</Label>
                <Input type="date" value={guest.dob}
                  onChange={(e) => onGuestChange(i, 'dob', e.target.value)}
                  className="h-9 text-sm" />
              </div>
              {guest.type === 'child' && (
                <div>
                  <Label className="text-xs mb-1 block">Age</Label>
                  <Input type="number" min={0} max={17}
                    value={guest.age ?? ''}
                    onChange={(e) => onGuestChange(i, 'age', e.target.value)}
                    className="h-9 text-sm" />
                </div>
              )}
            </div>
          </div>
        );
      })}

      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        <Button onClick={onNext} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          Next: Review <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Step 3: Review & Confirm ─────────────────────────────────────────────────

function StepReview({
  reservation, checkIn, checkOut, rooms, guests,
  priceStatus, updatedAmount,
  loading, onBack, onConfirm, onRetry,
}: {
  reservation: IReservation;
  checkIn: string; checkOut: string;
  rooms: IAmendRoom[]; guests: IAmendGuest[];
  priceStatus: PriceStatus; updatedAmount: number;
  loading: boolean;
  onBack: () => void;
  onConfirm: () => void;
  onRetry: () => void;
}) {
  const currency = reservation.currencyCode;
  const paidAmount = reservation.paidAmount;
  const diff = updatedAmount - paidAmount;

  return (
    <div className="space-y-5">

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="border rounded-lg p-3 bg-muted/20">
          <p className="text-xs text-muted-foreground mb-1">New Check-in</p>
          <p className="text-sm font-semibold">{formatDisplayDate(checkIn)}</p>
        </div>
        <div className="border rounded-lg p-3 bg-muted/20">
          <p className="text-xs text-muted-foreground mb-1">New Check-out</p>
          <p className="text-sm font-semibold">{formatDisplayDate(checkOut)}</p>
        </div>
        <div className="border rounded-lg p-3 bg-muted/20">
          <p className="text-xs text-muted-foreground mb-1">Rooms</p>
          <p className="text-sm font-semibold">{rooms.length}</p>
        </div>
        <div className="border rounded-lg p-3 bg-muted/20">
          <p className="text-xs text-muted-foreground mb-1">Guests</p>
          <p className="text-sm font-semibold">{guests.length} ({guests.filter(g => g.type === 'adult').length}A / {guests.filter(g => g.type === 'child').length}C)</p>
        </div>
      </div>

      {/* Price section */}
      <div className="border rounded-lg overflow-hidden">
        <div className="px-4 py-2.5 bg-muted/40 border-b flex items-center justify-between">
          <p className="text-sm font-semibold">Price Update</p>
          {priceStatus === 'error' && (
            <Button variant="ghost" size="sm" onClick={onRetry} className="text-xs gap-1 h-7 text-blue-600">
              <RefreshCw className="h-3 w-3" /> Retry
            </Button>
          )}
        </div>
        <div className="px-4 py-4">
          {priceStatus === 'loading' && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              Fetching updated price…
            </div>
          )}
          {priceStatus === 'error' && (
            <div className="flex items-center gap-2 text-sm text-red-600 py-2">
              <AlertCircle className="h-4 w-4" />
              Could not fetch updated price. Please retry.
            </div>
          )}
          {priceStatus === 'success' && (
            <div className="space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Original Amount</span>
                <span>{formatCurrency(reservation.amount, currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Already Paid</span>
                <span>{formatCurrency(paidAmount, currency)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold border-t pt-2.5">
                <span>New Total</span>
                <span className="text-blue-600">{formatCurrency(updatedAmount, currency)}</span>
              </div>
              {diff > 0 && (
                <div className="flex justify-between text-sm text-amber-700 bg-amber-50 rounded-md px-3 py-2">
                  <span>Extra to Pay</span>
                  <span className="font-semibold">{formatCurrency(diff, currency)}</span>
                </div>
              )}
              {diff < 0 && (
                <div className="flex justify-between text-sm text-green-700 bg-green-50 rounded-md px-3 py-2">
                  <span>Refund Amount</span>
                  <span className="font-semibold">{formatCurrency(Math.abs(diff), currency)}</span>
                </div>
              )}
            </div>
          )}
          {priceStatus === 'idle' && (
            <p className="text-sm text-muted-foreground py-2">Price will load automatically…</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <Button variant="outline" onClick={onBack} className="gap-2" disabled={loading}>
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        <Button
          onClick={onConfirm}
          disabled={priceStatus !== 'success' || loading}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2 min-w-[150px]"
        >
          {loading ? <><ButtonLoader /> Modifying…</> : <><CheckCircle className="h-4 w-4" /> Confirm Modify</>}
        </Button>
      </div>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  reservation: IReservation;
  onClose: () => void;
  onSuccess: () => void;
  checkAmendPrice: (payload: any) => Promise<{ success: boolean; data?: any; message?: string }>;
  amendReservationApi: (bookingCode: string, payload: any) => Promise<{ success: boolean; message?: string }>;
}

const ReservationModifyModal: FC<Props> = ({
  open, reservation, onClose, onSuccess, checkAmendPrice, amendReservationApi,
}) => {
  const initialCheckIn = parseDate(reservation.reservationStartDate);
  const initialCheckOut = parseDate(reservation.reservationEndDate);
  const originalRooms = new Set(
    reservation.PricingBrakeDown?.DailyPriceBrakeDown?.map((d: any) => d.roomNumber).filter(Boolean) || []
  ).size || 1;

  // ── Step state ──
  const [step, setStep] = useState<AmendStep>(1);

  // ── Step 1 ──
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [rooms, setRooms] = useState<IAmendRoom[]>(buildInitialRooms(reservation));
  const [dateErrors, setDateErrors] = useState<{ checkIn?: string; checkOut?: string }>({});

  // ── Step 2 ──
  const [guests, setGuests] = useState<IAmendGuest[]>(normalizeGuests(reservation.guests));
  const [guestErrors, setGuestErrors] = useState<Record<string, IGuestFieldErrors>>({});

  // ── Step 3 ──
  const [updatedAmount, setUpdatedAmount] = useState(reservation.amount);
  const [finalPrice, setFinalPrice] = useState<any>(null);
  const [priceStatus, setPriceStatus] = useState<PriceStatus>('idle');
  const [loading, setLoading] = useState(false);

  const resetPrice = useCallback(() => setPriceStatus('idle'), []);

  // ── Room handlers ──
  const handleAddRoom = () => { setRooms(p => [...p, { adults: 1, children: 0, childAges: [] }]); resetPrice(); };
  const handleRemoveRoom = (i: number) => {
    if (rooms.length <= 1) { toast.error('At least one room is required'); return; }
    setRooms(p => p.filter((_, idx) => idx !== i)); resetPrice();
  };
  const handleAdultChange = (ri: number, d: number) => {
    setRooms(p => { const u = [...p]; const nv = u[ri].adults + d; if (nv < 1) return p; u[ri] = { ...u[ri], adults: nv }; return u; }); resetPrice();
  };
  const handleChildChange = (ri: number, d: number) => {
    setRooms(p => {
      const u = [...p]; const r = u[ri]; const nc = r.children + d;
      if (nc < 0) return p;
      const ages = [...r.childAges]; if (d > 0) ages.push(0); else ages.pop();
      u[ri] = { ...r, children: nc, childAges: ages }; return u;
    }); resetPrice();
  };
  const handleChildAgeChange = (ri: number, ci: number, age: number) => {
    setRooms(p => { const u = [...p]; const ages = [...u[ri].childAges]; ages[ci] = age; u[ri] = { ...u[ri], childAges: ages }; return u; }); resetPrice();
  };

  // ── Date validation ──
  const validateDates = (): boolean => {
    const errs: typeof dateErrors = {};
    const today = startOfDay(new Date());
    const isPast = isBefore(startOfDay(new Date(initialCheckIn)), today);
    const cin = new Date(checkIn); const cout = new Date(checkOut);
    if (!checkIn) errs.checkIn = 'Check-in date is required';
    else if (!isPast && cin <= today) errs.checkIn = 'Check-in must be a future date';
    if (!checkOut) errs.checkOut = 'Check-out date is required';
    else if (cout <= cin) errs.checkOut = 'Check-out must be after check-in';
    setDateErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Step 1 → 2 ──
  const handleStep1Next = () => {
    if (!validateDates()) return;
    const existing_adults = guests.filter(g => g.type === 'adult');
    const existing_children = guests.filter(g => g.type === 'child');
    const newGuests: IAmendGuest[] = [];
    let ai = 0, ci = 0;
    rooms.forEach(room => {
      for (let i = 0; i < room.adults; i++)
        newGuests.push(existing_adults[ai++] ?? { type: 'adult', firstName: '', lastName: '', dob: '' });
      room.childAges.forEach(age => {
        const ex = existing_children[ci++];
        newGuests.push(ex ? { ...ex, age } : { type: 'child', firstName: '', lastName: '', dob: '', age });
      });
    });
    setGuests(newGuests); setGuestErrors({}); setStep(2);
  };

  // ── Guest handlers ──
  const handleGuestChange = (i: number, field: keyof IAmendGuest, value: string) => {
    setGuests(p => { const u = [...p]; u[i] = { ...u[i], [field]: field === 'age' ? (value === '' ? undefined : Number(value)) : value }; return u; });
    setGuestErrors(p => {
      const key = `guest-${i}`; if (!p[key]) return p;
      const u = { ...p[key] }; delete u[field as keyof IGuestFieldErrors];
      if (!Object.keys(u).length) { const { [key]: _, ...rest } = p; return rest; }
      return { ...p, [key]: u };
    });
  };

  // ── Guest validation ──
  const validateGuests = (): boolean => {
    const re = /^[A-Za-z\s]+$/; const errs: Record<string, IGuestFieldErrors> = {}; let valid = true;
    guests.forEach((g, i) => {
      const isPrimary = i === 0 && g.type === 'adult'; const ge: IGuestFieldErrors = {};
      if (isPrimary) {
        if (!g.firstName.trim()) { ge.firstName = 'First name is required'; valid = false; }
        else if (!re.test(g.firstName)) { ge.firstName = 'Letters only'; valid = false; }
        if (!g.lastName.trim()) { ge.lastName = 'Last name is required'; valid = false; }
        else if (!re.test(g.lastName)) { ge.lastName = 'Letters only'; valid = false; }
      } else {
        if (g.firstName.trim() && !re.test(g.firstName)) { ge.firstName = 'Letters only'; valid = false; }
        if (g.lastName.trim() && !re.test(g.lastName)) { ge.lastName = 'Letters only'; valid = false; }
      }
      if (Object.keys(ge).length) errs[`guest-${i}`] = ge;
    });
    setGuestErrors(errs); return valid;
  };

  // ── Fetch price ──
  const fetchPrice = async () => {
    setPriceStatus('loading');
    const adults = rooms.reduce((s, r) => s + r.adults, 0);
    const children = rooms.reduce((s, r) => s + r.children, 0);
    const childAges = rooms.flatMap(r => r.childAges);
    const guestDistribution = rooms.map(r => ({ adults: r.adults, children: r.children, childAges: r.childAges }));

    const result = await checkAmendPrice({
      bookingCode: reservation.bookingCode,
      propertyCode: reservation.propertyCode || '',
      invTypeCode: reservation.roomTypeCode || '',
      startDate: checkIn, endDate: checkOut,
      noOfAdults: adults, noOfChildren: children,
      noOfRooms: rooms.length,
      ratePlanCode: reservation.ratePlanCode || '',
      childAges, guestDistribution,
    });

    if (!result.success || !result.data) {
      setPriceStatus('error');
      toast.error(result.message || 'Failed to fetch updated price');
      return;
    }
    const p = result.data;
    const total = Number(p.totalAmount);
    const diff = total - (reservation.paidAmount || 0);
    setFinalPrice({
      ...p,
      booking: { finalPayable: diff > 0 ? diff : 0, refundAmount: diff < 0 ? Math.abs(diff) : 0, discount: p.promoCodeDiscount || 0 },
    });
    setUpdatedAmount(total);
    setPriceStatus('success');
  };

  // ── Step 2 → 3 ──
  const handleStep2Next = async () => {
    if (!validateGuests()) { toast.error('Please fix guest details'); return; }
    setStep(3);
    fetchPrice();
  };

  // ── Confirm ──
  const handleConfirm = async () => {
    if (priceStatus !== 'success') { toast.error('Please wait for price to load'); return; }
    setLoading(true);
    const result = await amendReservationApi(reservation.bookingCode, {
      propertyCode: reservation.propertyCode,
      checkInDate: checkIn, checkOutDate: checkOut,
      requestedRooms: rooms.length, rooms, previousRooms: originalRooms,
      guests, roomTypeCode: reservation.roomTypeCode, ratePlanCode: reservation.ratePlanCode,
      amount: updatedAmount, finalPrice,
      currencyCode: reservation.currencyCode,
      bookingUserEmail: reservation.bookingUserEmail,
      bookingUserPhone: reservation.bookingUserPhone,
      status: 'Modified',
      extraAmountToPay: finalPrice?.booking?.finalPayable || 0,
      refundAmount: finalPrice?.booking?.refundAmount || 0,
      paymentType: reservation.paymentMethod,
    });
    setLoading(false);
    if (!result.success) { toast.error(result.message || 'Failed to modify reservation'); return; }
    toast.success('Reservation modified successfully');
    onSuccess(); onClose();
  };

  const handleClose = () => {
    if (!loading) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">

        {/* Header */}
        <DialogHeader className="px-6 py-5 border-b">
          <div>
            <DialogTitle className="text-xl font-bold">Modify Reservation</DialogTitle>
            <DialogDescription className="mt-0.5 text-sm">
              #{reservation.bookingCode.split('-')[1]}
            </DialogDescription>
          </div>
          <div className="mt-5">
            <StepIndicator current={step} />
          </div>
        </DialogHeader>

        {/* Property strip */}
        <div className="px-6 py-3 bg-muted/40 border-b">
          <p className="font-semibold text-sm text-foreground">{reservation.hotelName || reservation.property?.propertyName || 'Property'}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-xs text-muted-foreground">
            <span>
              <span className="font-medium text-foreground">Stay: </span>
              {formatDisplayDate(initialCheckIn)} → {formatDisplayDate(initialCheckOut)}
            </span>
            <span><span className="font-medium text-foreground">Room: </span>{reservation.roomTypeCode}</span>
            <span><span className="font-medium text-foreground">Rate: </span>{reservation.ratePlanCode}</span>
          </div>
        </div>

        {/* Step content */}
        <div className="px-6 py-6">
          {step === 1 && (
            <StepDatesRooms
              checkIn={checkIn} checkOut={checkOut} rooms={rooms}
              onCheckInChange={(v) => { setCheckIn(v); setDateErrors(p => ({ ...p, checkIn: undefined })); resetPrice(); }}
              onCheckOutChange={(v) => { setCheckOut(v); setDateErrors(p => ({ ...p, checkOut: undefined })); resetPrice(); }}
              onAddRoom={handleAddRoom} onRemoveRoom={handleRemoveRoom}
              onAdultChange={handleAdultChange} onChildChange={handleChildChange}
              onChildAgeChange={handleChildAgeChange}
              dateErrors={dateErrors} onNext={handleStep1Next}
            />
          )}
          {step === 2 && (
            <StepGuestDetails
              guests={guests} guestErrors={guestErrors}
              onGuestChange={handleGuestChange}
              onBack={() => setStep(1)} onNext={handleStep2Next}
            />
          )}
          {step === 3 && (
            <StepReview
              reservation={reservation} checkIn={checkIn} checkOut={checkOut}
              rooms={rooms} guests={guests} priceStatus={priceStatus}
              updatedAmount={updatedAmount} loading={loading}
              onBack={() => setStep(2)} onConfirm={handleConfirm} onRetry={fetchPrice}
            />
          )}
        </div>

      </DialogContent>
    </Dialog>
  );
};

export default ReservationModifyModal;