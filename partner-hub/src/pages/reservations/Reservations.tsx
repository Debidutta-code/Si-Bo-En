import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/redux/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  CalendarCheck, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Eye, 
  Filter,
  Calendar,
  XCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { fetchReservationsService, cancelReservationService } from './services/agent-reservation.service';
import type { IReservation, BookingStatus, IReservationFilters } from './interfaces/agent-reservation.interfaces';
import { ButtonLoader } from '@/components/Loader';

const statusColors: Record<BookingStatus, { bg: string; text: string; icon: any }> = {
  confirmed: { bg: 'bg-green-50', text: 'text-green-700', icon: CheckCircle },
  pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: Clock },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', icon: XCircle },
  modified: { bg: 'bg-blue-50', text: 'text-blue-700', icon: Calendar },
  no_show: { bg: 'bg-gray-50', text: 'text-gray-700', icon: XCircle },
};

const ITEMS_PER_PAGE = 10;

export default function ReservationsPage() {
  const navigate = useNavigate();

  const [reservations, setReservations] = useState<IReservation[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [selectedReservation, setSelectedReservation] = useState<IReservation | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState<boolean>(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState<boolean>(false);
  const [cancellationReason, setCancellationReason] = useState<string>('');
  const [isCancelling, setIsCancelling] = useState<boolean>(false);


  const fetchReservations = async (): Promise<void> => {
    setIsLoading(true);
    const filters: IReservationFilters = {
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      ...(statusFilter !== 'all' && { bookingStatus: statusFilter as BookingStatus }),
      ...(searchTerm && { bookingCode: searchTerm })
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

  const handleSearch = (): void => {
    setCurrentPage(1);
    fetchReservations();
  };

  const handleCancelReservation = async (): Promise<void> => {
    if (!selectedReservation || !cancellationReason.trim()) {
      toast.error('Please provide a cancellation reason');
      return;
    }

    setIsCancelling(true);
    const response = await cancelReservationService(selectedReservation.id, {
      cancellationReason: cancellationReason.trim()
    });

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

  const openDetailsDialog = (reservation: IReservation): void => {
    setSelectedReservation(reservation);
    setDetailsDialogOpen(true);
  };

  const openCancelDialog = (reservation: IReservation): void => {
    setSelectedReservation(reservation);
    setCancellationReason('');
    setCancelDialogOpen(true);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  useEffect(() => {
    fetchReservations();
  }, [currentPage, statusFilter]);


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reservations</h1>
          <p className="text-muted-foreground">
            Manage and view all your property reservations
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => navigate('/property')}
        >
          <CalendarCheck className="h-4 w-4 mr-2" />
          New Booking
        </Button>
      </div>

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
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <ButtonLoader />
        </div>
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Booking ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Guest</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Property</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Check-in</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Check-out</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-border">
                    <AnimatePresence mode="wait">
                      {reservations.map((reservation, index) => {
                        const StatusIcon = statusColors[reservation.bookingStatus]?.icon || CheckCircle;
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
                              <span className="text-sm font-medium text-foreground">{reservation.bookingCode}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <p className="text-sm font-medium text-foreground">
                                  {reservation.primaryGuest 
                                    ? `${reservation.primaryGuest.firstName} ${reservation.primaryGuest.lastName}`
                                    : reservation.bookingUserEmail}
                                </p>
                                <p className="text-xs text-muted-foreground">{reservation.bookingUserPhone}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-muted-foreground">{reservation.hotelName || reservation.propertyCode}</span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="text-sm text-muted-foreground">{formatDate(reservation.checkInDate)}</span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="text-sm text-muted-foreground">{formatDate(reservation.checkOutDate)}</span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="text-sm font-medium text-foreground">{formatCurrency(reservation.amount)}</span>
                            </td>
                            <td className="px-4 py-3">
                              <Badge className={`${statusColors[reservation.bookingStatus]?.bg} ${statusColors[reservation.bookingStatus]?.text} capitalize border-0 flex items-center gap-1 w-fit`}>
                                <StatusIcon className="h-3 w-3" />
                                {reservation.bookingStatus.replace('_', ' ')}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={() => openDetailsDialog(reservation)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {(reservation.bookingStatus === 'confirmed' || reservation.bookingStatus === 'pending') && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => openCancelDialog(reservation)}
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
                  <h3 className="font-semibold text-foreground">No reservations found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? 'Try a different search term' : 'Create your first booking'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of{' '}
                {totalCount} results
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium px-4">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reservation Details</DialogTitle>
            <DialogDescription>
              Booking Code: {selectedReservation?.bookingCode}
            </DialogDescription>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Guest Name</p>
                  <p className="text-sm text-foreground">
                    {selectedReservation.primaryGuest 
                      ? `${selectedReservation.primaryGuest.firstName} ${selectedReservation.primaryGuest.lastName}`
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-sm text-foreground">{selectedReservation.bookingUserEmail}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="text-sm text-foreground">{selectedReservation.bookingUserPhone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Property</p>
                  <p className="text-sm text-foreground">{selectedReservation.hotelName || selectedReservation.propertyCode}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Check-in</p>
                  <p className="text-sm text-foreground">{formatDate(selectedReservation.checkInDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Check-out</p>
                  <p className="text-sm text-foreground">{formatDate(selectedReservation.checkOutDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                  <p className="text-sm font-semibold text-foreground">{formatCurrency(selectedReservation.amount)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Paid Amount</p>
                  <p className="text-sm text-foreground">{formatCurrency(selectedReservation.paidAmount)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                  <p className="text-sm text-foreground capitalize">{selectedReservation.paymentMethod.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge className={`${statusColors[selectedReservation.bookingStatus]?.bg} ${statusColors[selectedReservation.bookingStatus]?.text} capitalize border-0 w-fit`}>
                    {selectedReservation.bookingStatus.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              {selectedReservation.cancellationReason && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cancellation Reason</p>
                  <p className="text-sm text-foreground">{selectedReservation.cancellationReason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Reservation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel reservation{' '}
              <strong>{selectedReservation?.bookingCode}</strong>? Please provide a reason for cancellation.
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
