import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  User, Building2, Calendar, DollarSign, CreditCard, XCircle, CheckCircle, Clock,
} from 'lucide-react';
import { BookingStatus, IReservation } from '../interfaces/agent-reservation.interfaces';

// ─── Status config (local to avoid coupling) ─────────────────────────────────

const statusColors: Record<BookingStatus, { bg: string; text: string; icon: any }> = {
  confirmed:   { bg: 'bg-green-50',  text: 'text-green-700',  icon: CheckCircle },
  pending:     { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: Clock },
  cancelled:   { bg: 'bg-red-50',    text: 'text-red-700',    icon: XCircle },
  modified:    { bg: 'bg-blue-50',   text: 'text-blue-700',   icon: Calendar },
  no_show:     { bg: 'bg-gray-50',   text: 'text-gray-700',   icon: XCircle },
  checked_in:  { bg: 'bg-teal-50',   text: 'text-teal-700',   icon: CheckCircle },
  checked_out: { bg: 'bg-purple-50', text: 'text-purple-700', icon: CheckCircle },
  expired:     { bg: 'bg-gray-50',   text: 'text-gray-700',   icon: XCircle },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

const formatCurrency = (amount: number, currency = 'AED'): string =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount);

// ─── Layout helpers ───────────────────────────────────────────────────────────

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3 pb-1 border-b">
        {icon}
        <p className="font-semibold text-foreground text-sm">{title}</p>
      </div>
      {children}
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-6 gap-y-3">{children}</div>;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm font-medium capitalize">{value}</p>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: BookingStatus }) {
  const cfg = statusColors[status] ?? statusColors.pending;
  const Icon = cfg.icon;
  return (
    <Badge className={`${cfg.bg} ${cfg.text} capitalize border-0 flex items-center gap-1 w-fit text-xs px-2 py-1`}>
      <Icon className="h-3 w-3" />
      {status.replace('_', ' ')}
    </Badge>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  reservation: IReservation | null;
  open: boolean;
  onClose: () => void;
}

export default function ReservationViewModal({ reservation, open, onClose }: Props) {
  if (!reservation) return null;

  const r = reservation;
  const pricing = r.PricingBrakeDown;
  const commission = r.AgencyCommission;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-lg font-bold">Reservation Details</DialogTitle>
              <DialogDescription className="mt-0.5">
                Booking #{r.bookingCode.split('-')[1]}
              </DialogDescription>
            </div>
            <StatusBadge status={r.bookingStatus} />
          </div>
        </DialogHeader>

        {/* Quick summary strip */}
        <div className="bg-muted/40 rounded-lg px-4 py-3 grid grid-cols-3 gap-4 text-center border">
          <div>
            <p className="text-xs text-muted-foreground">Check-in</p>
            <p className="text-sm font-semibold">{formatDate(r.reservationStartDate)}</p>
          </div>
          <div className="border-x">
            <p className="text-xs text-muted-foreground">Check-out</p>
            <p className="text-sm font-semibold">{formatDate(r.reservationEndDate)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-sm font-semibold">{formatCurrency(r.amount, r.currencyCode)}</p>
          </div>
        </div>

        <div className="space-y-6 text-sm">

          {/* Booking Info */}
          <Section title="Booking Info" icon={<User className="h-4 w-4 text-muted-foreground" />}>
            <Grid>
              <Field label="Guest Name"
                value={r.primaryGuest ? `${r.primaryGuest.firstName} ${r.primaryGuest.lastName}` : 'N/A'} />
              <Field label="Email" value={r.bookingUserEmail} />
              <Field label="Phone" value={r.bookingUserPhone || 'N/A'} />
              <Field label="Booking Code" value={r.bookingCode.split('-')[1]} />
              <Field label="Booked At" value={formatDate(r.bookedAt)} />
              <Field label="Source" value={r.bookingSource} />
              <Field label="Device" value={r.deviceTypes} />
              <Field label="Platform" value={r.platforms} />
            </Grid>
          </Section>

          {/* Property & Room */}
          <Section title="Property & Room" icon={<Building2 className="h-4 w-4 text-muted-foreground" />}>
            <Grid>
              <Field label="Hotel" value={r.property?.propertyName || 'N/A'} />
              <Field label="Property Code" value={r.propertyCode || 'N/A'} />
              <Field label="Room" value={r.roomName || 'N/A'} />
              <Field label="Room Type" value={r.roomTypeCode || 'N/A'} />
              <Field label="Rate Plan" value={r.ratePlanName || r.ratePlanCode || 'N/A'} />
              <Field label="Country" value={r.countryCode} />
            </Grid>
          </Section>

          {/* Stay Dates */}
          <Section title="Stay Dates" icon={<Calendar className="h-4 w-4 text-muted-foreground" />}>
            <Grid>
              <Field label="Check-in (booked)" value={formatDate(r.reservationStartDate)} />
              <Field label="Check-out (booked)" value={formatDate(r.reservationEndDate)} />
              <Field label="Actual Check-in" value={formatDate(r.checkInDate)} />
              <Field label="Actual Check-out" value={formatDate(r.checkOutDate)} />
            </Grid>
          </Section>

          {/* Financial */}
          <Section title="Financial Summary" icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}>
            <Grid>
              <Field label="Total Amount" value={formatCurrency(r.amount, r.currencyCode)} />
              <Field label="Paid Amount" value={formatCurrency(r.paidAmount, r.currencyCode)} />
              <Field label="Extra to Pay" value={formatCurrency(r.extraAmountToPay, r.currencyCode)} />
              <Field label="Refund Amount" value={formatCurrency(r.refundAmount, r.currencyCode)} />
              <Field label="Payment Method" value={r.paymentMethod.replace(/_/g, ' ')} />
              <Field label="Currency" value={r.currencyCode} />
            </Grid>
          </Section>

          {/* Agency Commission */}
          {commission && (
            <Section title="Agency Commission" icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}>
              <Grid>
                <Field label="Commission Type" value={commission.commissionType} />
                <Field label="Commission Value"
                  value={commission.commissionType === 'percentage'
                    ? `${commission.commissionValue}%`
                    : formatCurrency(commission.commissionValue, commission.currencyCode)} />
                <Field label="Commission Amount" value={formatCurrency(commission.commissionAmount, commission.currencyCode)} />
                <Field label="Currency" value={commission.currencyCode} />
              </Grid>
            </Section>
          )}

          {/* Pricing Breakdown */}
          {pricing && (
            <Section title="Pricing Breakdown" icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}>
              <Grid>
                <Field label="Before Tax" value={formatCurrency(pricing.amountBeforeTax, pricing.currencyCode)} />
                <Field label="Tax" value={formatCurrency(pricing.taxedAmount, pricing.currencyCode)} />
                <Field label="Total" value={formatCurrency(pricing.totalAmount, pricing.currencyCode)} />
                <Field label="Chargeable Now" value={formatCurrency(pricing.currentChargeableAmount, pricing.currencyCode)} />
                <Field label="Pay Later" value={formatCurrency(pricing.latterpayableAmount, pricing.currencyCode)} />
                <Field label="Promo Discount" value={formatCurrency(pricing.promoCodeDiscount, pricing.currencyCode)} />
              </Grid>

              {(pricing.taxBrakeDown ?? []).length > 0 && (
                <div className="mt-4 p-3 bg-muted/30 rounded-md">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Tax Breakdown</p>
                  <div className="space-y-1.5">
                    {pricing.taxBrakeDown!.map((t, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{t.name}</span>
                        <span className="font-medium">{formatCurrency(t.taxedAmount, t.currencyCode)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(pricing.DailyPriceBrakeDown ?? []).length > 0 && (
                <div className="mt-3 p-3 bg-muted/30 rounded-md">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Daily Breakdown</p>
                  <div className="space-y-1.5">
                    {pricing.DailyPriceBrakeDown!.map((d, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          {formatDate(d.date)} — Room {d.roomNumber}
                        </span>
                        <span className="font-medium">{formatCurrency(d.totalAmount, d.currencyCode)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Section>
          )}

          {/* Guests */}
          {Array.isArray(r.guests) && r.guests.length > 0 && (
            <Section title="Guests" icon={<User className="h-4 w-4 text-muted-foreground" />}>
              <div className="space-y-2">
                {r.guests.map((g, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs border rounded-md p-2.5 bg-muted/20">
                    <Badge variant="outline" className="capitalize text-xs">{g.type}</Badge>
                    <span className="font-medium">{g.firstName || '—'} {g.lastName || '—'}</span>
                    {g.dateOfBirth && (
                      <span className="text-muted-foreground ml-auto">{g.dateOfBirth}</span>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Cancellation */}
          {r.cancellationReason && (
            <Section title="Cancellation" icon={<XCircle className="h-4 w-4 text-red-500" />}>
              <div className="p-3 bg-red-50 border border-red-100 rounded-md">
                <p className="text-sm text-red-700">{r.cancellationReason}</p>
                {r.cancelledAt && (
                  <p className="text-xs text-red-500 mt-1">Cancelled on {formatDate(r.cancelledAt)}</p>
                )}
              </div>
            </Section>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}