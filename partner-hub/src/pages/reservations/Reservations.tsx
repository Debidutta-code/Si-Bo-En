import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  CalendarCheck, Search, ChevronLeft, ChevronRight, X, Eye, Pencil,
  XCircle, CheckCircle, Clock, Calendar,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import { fetchReservationsService, cancelReservationService } from './services/agent-reservation.service';
// import { checkAmendPrice, amendReservationApi } from './api'; // adjust path as needed
import type {
  IReservation, BookingStatus, IReservationFilters,
} from './interfaces/agent-reservation.interfaces';
import { ButtonLoader } from '@/components/Loader';
import ReservationViewModal from './components/ReservationViewModal';
import ReservationModifyModal from './components/ReservationModifyModal';

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

const ITEMS_PER_PAGE = 10;

const formatDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';

const formatCurrency = (amount: number, currency = 'AED') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount);

const MODIFIABLE: BookingStatus[] = ['confirmed', 'pending', 'modified'];
const CANCELLABLE: BookingStatus[] = ['confirmed', 'pending'];


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
  const [viewOpen, setViewOpen] = useState(false);
  const [modifyOpen, setModifyOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
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

  // ── Cancel ──
  const handleCancelReservation = async () => {
    if (!selectedReservation || !cancellationReason.trim()) {
      toast.error('Please provide a cancellation reason');
      return;
    }
    setIsCancelling(true);
    const response = await cancelReservationService(selectedReservation.id, {
      cancellationReason: cancellationReason.trim(),
    });
    if (response.success) {
      toast.success('Reservation cancelled successfully');
      setCancelOpen(false);
      setSelectedReservation(null);
      setCancellationReason('');
      fetchReservations();
    } else {
      toast.error(response.message || 'Failed to cancel reservation');
    }
    setIsCancelling(false);
  };

  // ── Open handlers ──
  const openView   = (r: IReservation) => { setSelectedReservation(r); setViewOpen(true); };
  const openModify = (r: IReservation) => { setSelectedReservation(r); setModifyOpen(true); };
  const openCancel = (r: IReservation) => { setSelectedReservation(r); setCancellationReason(''); setCancelOpen(true); };

  useEffect(() => { fetchReservations(); }, [currentPage, statusFilter]);

  function amendReservationApi(bookingCode: string, payload: any): Promise<{ success: boolean; message?: string; }> {
    throw new Error('Function not implemented.');
  }

  function checkAmendPrice(payload: any): Promise<{ success: boolean; data?: any; message?: string; }> {
    throw new Error('Function not implemented.');
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reservations</h1>
          <p className="text-muted-foreground">Manage and view all your property reservations</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => navigate('/property')}>
          <CalendarCheck className="h-4 w-4 mr-2" /> New Booking
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
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

      {/* Table */}
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
                      {reservations.map((r, index) => {
                        const cfg = statusColors[r.bookingStatus] ?? statusColors.pending;
                        const StatusIcon = cfg.icon;
                        return (
                          <motion.tr
                            key={r.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2, delay: index * 0.03 }}
                            className="hover:bg-muted/50 transition-colors"
                          >
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="text-sm font-medium">{r.bookingCode.split('-')[1]}</span>
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-sm font-medium">
                                {r.primaryGuest
                                  ? `${r.primaryGuest.firstName} ${r.primaryGuest.lastName}`
                                  : r.bookingUserEmail}
                              </p>
                              <p className="text-xs text-muted-foreground">{r.bookingUserPhone}</p>
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-sm">{r.property?.propertyName}</p>
                              <p className="text-xs text-muted-foreground">{r.roomName}</p>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                              {formatDate(r.reservationStartDate)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                              {formatDate(r.reservationEndDate)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <p className="text-sm font-medium">{formatCurrency(r.amount, r.currencyCode)}</p>
                            </td>
                            <td className="px-4 py-3">
                              <Badge className={`${cfg.bg} ${cfg.text} capitalize border-0 flex items-center gap-1 w-fit`}>
                                <StatusIcon className="h-3 w-3" />
                                {r.bookingStatus.replace('_', ' ')}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">

                                {/* View */}
                                <Button
                                  variant="ghost" size="icon" className="h-8 w-8"
                                  title="View Details"
                                  onClick={() => openView(r)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>

                                {/* Modify */}
                                {MODIFIABLE.includes(r.bookingStatus) && (
                                  <Button
                                    variant="ghost" size="icon"
                                    className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    title="Modify Reservation"
                                    onClick={() => openModify(r)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                )}

                                {/* Cancel */}
                                {CANCELLABLE.includes(r.bookingStatus) && (
                                  <Button
                                    variant="ghost" size="icon"
                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    title="Cancel Reservation"
                                    onClick={() => openCancel(r)}
                                  >
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
                  <p className="text-muted-foreground">
                    {searchTerm ? 'Try a different search term' : 'Create your first booking'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} results
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium px-4">Page {currentPage} of {totalPages}</span>
                <Button variant="outline" size="icon"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── View Modal ── */}
      <ReservationViewModal
        reservation={selectedReservation}
        open={viewOpen}
        onClose={() => setViewOpen(false)}
      />

      {/* ── Modify Modal ── */}
      {selectedReservation && modifyOpen && (
        <ReservationModifyModal
          open={modifyOpen}
          reservation={selectedReservation}  
          onClose={() => setModifyOpen(false)}
          onSuccess={() => { setModifyOpen(false); fetchReservations(); }}
          checkAmendPrice={checkAmendPrice}
          amendReservationApi={amendReservationApi}
        />
      )}

      {/* ── Cancel Dialog ── */}
      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Reservation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel{' '}
              <strong>{selectedReservation?.bookingCode.split('-')[1]}</strong>?
              Please provide a reason below.
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