import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  CalendarCheck, Search, ChevronLeft, ChevronRight, X, Eye,
  XCircle, CheckCircle, Clock, Calendar, Building2, User, CreditCard,
  DollarSign, Percent
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { fetchReservationsService, cancelReservationService } from './services/agent-reservation.service';
import type {
  IReservation, BookingStatus, IReservationFilters, IPricingBreakdown, IAgencyCommissionRecord
} from './interfaces/agent-reservation.interfaces';
import { ButtonLoader } from '@/components/Loader';

const statusColors: Record<BookingStatus, { bg: string; text: string; icon: any }> = {
  confirmed:    { bg: 'bg-green-50',  text: 'text-green-700',  icon: CheckCircle },
  pending:      { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: Clock },
  cancelled:    { bg: 'bg-red-50',    text: 'text-red-700',    icon: XCircle },
  modified:     { bg: 'bg-blue-50',   text: 'text-blue-700',   icon: Calendar },
  no_show:      { bg: 'bg-gray-50',   text: 'text-gray-700',   icon: XCircle },
  checked_in:   { bg: 'bg-teal-50',   text: 'text-teal-700',   icon: CheckCircle },
  checked_out:  { bg: 'bg-purple-50', text: 'text-purple-700', icon: CheckCircle },
  expired:      { bg: 'bg-gray-50',   text: 'text-gray-700',   icon: XCircle },
};

const ITEMS_PER_PAGE = 10;

const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

const formatCurrency = (amount: number, currency = 'AED'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
};

// ─── Details Dialog ───────────────────────────────────────────────────────────

function ReservationDetailsDialog({
  reservation,
  open,
  onClose,
}: {
  reservation: IReservation | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!reservation) return null;
  const r = reservation;
  const commission = r.AgencyCommission;
  const pricing = r.PricingBrakeDown;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reservation Details</DialogTitle>
          <DialogDescription>Booking Code: {r.bookingCode.split("-")[1]}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 text-sm">

          {/* ── Guest & Booking ── */}
          <Section title="Booking Info" icon={<User className="h-4 w-4" />}>
            <Grid>
              <Field label="Guest Name"
                value={r.primaryGuest ? `${r.primaryGuest.firstName} ${r.primaryGuest.lastName}` : 'N/A'} />
              <Field label="Email"        value={r.bookingUserEmail} />
              <Field label="Phone"        value={r.bookingUserPhone || 'N/A'} />
              <Field label="Booking Code" value={r.bookingCode.split("-")[1]} />
              <Field label="Booked At"    value={formatDate(r.bookedAt)} />
              <Field label="Source"       value={r.bookingSource} />
              <Field label="Device"       value={r.deviceTypes} />
              <Field label="Platform"     value={r.platforms} />
            </Grid>
          </Section>

          {/* ── Property & Room ── */}
          <Section title="Property & Room" icon={<Building2 className="h-4 w-4" />}>
            <Grid>
              <Field label="Hotel"       value={r.property?.propertyName || 'N/A'} />
              <Field label="Property Code" value={r.propertyCode || 'N/A'} />
              <Field label="Room"        value={r.roomName || 'N/A'} />
              <Field label="Room Type"   value={r.roomTypeCode || 'N/A'} />
              <Field label="Rate Plan"   value={r.ratePlanName || r.ratePlanCode || 'N/A'} />
              <Field label="Country"     value={r.countryCode} />
            </Grid>
          </Section>

          {/* ── Dates ── */}
          <Section title="Stay Dates" icon={<Calendar className="h-4 w-4" />}>
            <Grid>
              {/* reservationStartDate / End are the booked dates */}
              <Field label="Check-in (booked)"  value={formatDate(r.reservationStartDate)} />
              <Field label="Check-out (booked)" value={formatDate(r.reservationEndDate)} />
              {/* checkInDate / checkOutDate are set only after actual check-in/out */}
              <Field label="Actual Check-in"  value={formatDate(r.checkInDate)} />
              <Field label="Actual Check-out" value={formatDate(r.checkOutDate)} />
            </Grid>
          </Section>

          {/* ── Financial ── */}
          <Section title="Financial Summary" icon={<DollarSign className="h-4 w-4" />}>
            <Grid>
              <Field label="Total Amount"    value={formatCurrency(r.amount, r.currencyCode)} />
              <Field label="Paid Amount"     value={formatCurrency(r.paidAmount, r.currencyCode)} />
              <Field label="Extra to Pay"    value={formatCurrency(r.extraAmountToPay, r.currencyCode)} />
              <Field label="Refund Amount"   value={formatCurrency(r.refundAmount, r.currencyCode)} />
              <Field label="Payment Method"  value={r.paymentMethod.replace(/_/g, ' ')} />
              <Field label="Currency"        value={r.currencyCode} />
            </Grid>
          </Section>


          {/* ── Pricing Breakdown ── */}
          {pricing && (
            <Section title="Pricing Breakdown" icon={<CreditCard className="h-4 w-4" />}>
              <Grid>
                <Field label="Before Tax"   value={formatCurrency(pricing.amountBeforeTax, pricing.currencyCode)} />
                <Field label="Tax"          value={formatCurrency(pricing.taxedAmount, pricing.currencyCode)} />
                <Field label="Total"        value={formatCurrency(pricing.totalAmount, pricing.currencyCode)} />
                <Field label="Chargeable"   value={formatCurrency(pricing.currentChargeableAmount, pricing.currencyCode)} />
                <Field label="Pay Later"    value={formatCurrency(pricing.latterpayableAmount, pricing.currencyCode)} />
                <Field label="Promo Disc."  value={formatCurrency(pricing.promoCodeDiscount, pricing.currencyCode)} />
              </Grid>

              {(pricing.taxBrakeDown ?? []).length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Tax Breakdown</p>
                  <div className="space-y-1">
                    {pricing.taxBrakeDown!.map((t, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span>{t.name}</span>
                        <span>{formatCurrency(t.taxedAmount, t.currencyCode)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(pricing.DailyPriceBrakeDown ?? []).length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Daily Breakdown</p>
                  <div className="space-y-1">
                    {pricing.DailyPriceBrakeDown!.map((d, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span>{formatDate(d.date)} — Room {d.roomNumber}</span>
                        <span>{formatCurrency(d.totalAmount, d.currencyCode)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Section>
          )}

          {/* ── Guests List ── */}
          {Array.isArray(r.guests) && r.guests.length > 0 && (
            <Section title="Guests" icon={<User className="h-4 w-4" />}>
              <div className="space-y-2">
                {r.guests.map((g, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs border rounded p-2">
                    <Badge variant="outline" className="capitalize">{g.type}</Badge>
                    <span>{g.firstName || '—'} {g.lastName || '—'}</span>
                    {g.dateOfBirth && <span className="text-muted-foreground">{g.dateOfBirth}</span>}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* ── Cancellation ── */}
          {r.cancellationReason && (
            <Section title="Cancellation" icon={<XCircle className="h-4 w-4 text-red-500" />}>
              <p className="text-muted-foreground">{r.cancellationReason}</p>
              {r.cancelledAt && (
                <p className="text-xs text-muted-foreground mt-1">Cancelled on {formatDate(r.cancelledAt)}</p>
              )}
            </Section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3 pb-1 border-b">
        {icon}
        <p className="font-semibold text-foreground">{title}</p>
      </div>
      {children}
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium capitalize">{value}</p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ReservationsPage() {
  const navigate = useNavigate();

  const [reservations, setReservations] = useState<IReservation[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedReservation, setSelectedReservation] = useState<IReservation | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchReservations = async () => {
    setIsLoading(true);
    const filters: IReservationFilters = {
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      ...(statusFilter !== 'all' && { bookingStatus: statusFilter as BookingStatus }),
      ...(searchTerm && { bookingCode: searchTerm }),
    };

    const response = await fetchReservationsService(filters);
    if (response.success && response.data) {
      setReservations(response.data.reservations);
      setTotalCount(response.data.pagination.total);
      setTotalPages(response.data.pagination.totalPages);
    } else {
      toast.error(response.message || 'Failed to fetch reservations');
      setReservations([]);
    }
    setIsLoading(false);
  };

  const handleSearch = () => { setCurrentPage(1); fetchReservations(); };

  const handleCancelReservation = async () => {
    if (!selectedReservation || !cancellationReason.trim()) {
      toast.error('Please provide a cancellation reason');
      return;
    }
    setIsCancelling(true);
    const response = await cancelReservationService(selectedReservation.id, { cancellationReason: cancellationReason.trim() });
    if (response.success) {
      toast.success('Reservation cancelled successfully');
      setCancelDialogOpen(false);
      setSelectedReservation(null);
      setCancellationReason('');
      fetchReservations();
    } else {
      toast.error(response.message || 'Failed to cancel reservation');
    }
    setIsCancelling(false);
  };

  const openDetailsDialog = (r: IReservation) => { setSelectedReservation(r); setDetailsDialogOpen(true); };
  const openCancelDialog  = (r: IReservation) => { setSelectedReservation(r); setCancellationReason(''); setCancelDialogOpen(true); };

  useEffect(() => { fetchReservations(); }, [currentPage, statusFilter]);

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reservations</h1>
          <p className="text-muted-foreground">Manage and view all your property reservations</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => navigate('/property')}>
          <CalendarCheck className="h-4 w-4 mr-2" />
          New Booking
        </Button>
      </div>

      {/* ── Filters ── */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by booking code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="modified">Modified</SelectItem>
                <SelectItem value="no_show">No Show</SelectItem>
                <SelectItem value="checked_in">Checked In</SelectItem>
                <SelectItem value="checked_out">Checked Out</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} variant="outline">
              <Search className="h-4 w-4 mr-2" /> Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Table ── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12"><ButtonLoader /></div>
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      {['Booking ID', 'Guest', 'Property', 'Check-in', 'Check-out', 'Amount', 'Status', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-border">
                    <AnimatePresence mode="wait">
                      {reservations.map((reservation, index) => {
                        const StatusIcon = statusColors[reservation.bookingStatus]?.icon ?? CheckCircle;
                        const commission = reservation.AgencyCommission;
                        return (
                          <motion.tr
                            key={reservation.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2, delay: index * 0.03 }}
                            className="hover:bg-muted/50 transition-colors"
                          >
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="text-sm font-medium">{reservation.bookingCode.split("-")[1]}</span>
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-sm font-medium">
                                {reservation.primaryGuest
                                  ? `${reservation.primaryGuest.firstName} ${reservation.primaryGuest.lastName}`
                                  : reservation.bookingUserEmail}
                              </p>
                              <p className="text-xs text-muted-foreground">{reservation.bookingUserPhone}</p>
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-sm">{reservation.property?.propertyName}</p>
                              <p className="text-xs text-muted-foreground">{reservation.roomName}</p>
                            </td>
                            {/* ── Use reservationStartDate / End ── */}
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                              {formatDate(reservation.reservationStartDate)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                              {formatDate(reservation.reservationEndDate)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <p className="text-sm font-medium">{formatCurrency(reservation.amount, reservation.currencyCode)}</p>
                            </td>
                            {/* <td className="px-4 py-3 whitespace-nowrap">
                              {commission ? (
                                <div>
                                  <p className="text-sm font-medium">{formatCurrency(commission.commissionAmount, commission.currencyCode)}</p>
                                  <p className="text-xs text-muted-foreground">{commission.commissionValue}{commission.commissionType === 'percentage' ? '%' : ''}</p>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </td> */}
                            <td className="px-4 py-3">
                              <Badge className={`${statusColors[reservation.bookingStatus]?.bg} ${statusColors[reservation.bookingStatus]?.text} capitalize border-0 flex items-center gap-1 w-fit`}>
                                <StatusIcon className="h-3 w-3" />
                                {reservation.bookingStatus.replace('_', ' ')}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDetailsDialog(reservation)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {(reservation.bookingStatus === 'confirmed' || reservation.bookingStatus === 'pending') && (
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => openCancelDialog(reservation)}>
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {reservations.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CalendarCheck className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold">No reservations found</h3>
                  <p className="text-muted-foreground">{searchTerm ? 'Try a different search term' : 'Create your first booking'}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} results
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium px-4">Page {currentPage} of {totalPages}</span>
                <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Details Dialog ── */}
      <ReservationDetailsDialog
        reservation={selectedReservation}
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
      />

      {/* ── Cancel Dialog ── */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Reservation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel <strong>{selectedReservation?.bookingCode.split("-")[1]}</strong>? Please provide a reason.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter cancellation reason..."
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Keep Reservation</AlertDialogCancel>
            <Button
              onClick={handleCancelReservation}
              disabled={isCancelling || !cancellationReason.trim()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isCancelling ? <ButtonLoader /> : 'Cancel Reservation'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}