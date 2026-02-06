import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { setReservations, setTotalCount, setCurrentPage } from '@/redux/slices/bookingSlice';
import { mockReservations } from '@/lib/mockData';
import { Reservation, ReservationStatus } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { CalendarCheck, Search, ChevronLeft, ChevronRight, X, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const statusColors: Record<ReservationStatus, { bg: string; text: string }> = {
  confirmed: { bg: 'bg-success/10', text: 'text-success' },
  pending: { bg: 'bg-warning/10', text: 'text-warning' },
  checked_in: { bg: 'bg-accent/10', text: 'text-accent' },
  checked_out: { bg: 'bg-muted', text: 'text-muted-foreground' },
  cancelled: { bg: 'bg-destructive/10', text: 'text-destructive' },
};

const ITEMS_PER_PAGE = 5;

export default function ReservationsPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const reservations = useAppSelector((state) => state.booking.reservations);
  const totalCount = useAppSelector((state) => state.booking.totalCount);
  const currentPage = useAppSelector((state) => state.booking.currentPage);

  const [searchTerm, setSearchTerm] = useState('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(setReservations(mockReservations));
    dispatch(setTotalCount(mockReservations.length));
  }, [isAuthenticated, navigate, dispatch]);

  const filteredReservations = reservations.filter(
    (r) =>
      r.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredReservations.length / ITEMS_PER_PAGE);
  const paginatedReservations = filteredReservations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCancelReservation = () => {
    if (selectedReservation) {
      const updated = reservations.map((r) =>
        r.id === selectedReservation.id ? { ...r, status: 'cancelled' as ReservationStatus } : r
      );
      dispatch(setReservations(updated));
      toast.success('Reservation cancelled successfully');
      setCancelDialogOpen(false);
      setSelectedReservation(null);
    }
  };

  const openCancelDialog = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setCancelDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reservations</h1>
          <p className="text-muted-foreground">
            Manage and view all your property reservations
          </p>
        </div>
        <Button
          className="bg-accent hover:bg-accent/90 text-accent-foreground"
          onClick={() => navigate('/property')}
        >
          <CalendarCheck className="h-4 w-4 mr-2" />
          New Booking
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by guest, property, or ID..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            dispatch(setCurrentPage(1));
          }}
          className="pl-10"
        />
      </div>

      {/* Reservations Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Guest</th>
                  <th>Property</th>
                  <th>Room</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedReservations.map((reservation, index) => (
                  <motion.tr
                    key={reservation.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <td className="font-medium text-foreground">{reservation.id}</td>
                    <td>
                      <div>
                        <p className="font-medium text-foreground">{reservation.guestName}</p>
                        <p className="text-xs text-muted-foreground">{reservation.guestPhone}</p>
                      </div>
                    </td>
                    <td className="text-muted-foreground">{reservation.propertyName}</td>
                    <td className="text-muted-foreground">{reservation.roomName}</td>
                    <td className="text-muted-foreground">{formatDate(reservation.checkIn)}</td>
                    <td className="text-muted-foreground">{formatDate(reservation.checkOut)}</td>
                    <td className="font-medium text-foreground">{formatCurrency(reservation.totalAmount)}</td>
                    <td>
                      <Badge
                        className={`${statusColors[reservation.status].bg} ${statusColors[reservation.status].text} capitalize`}
                      >
                        {reservation.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {(reservation.status === 'confirmed' || reservation.status === 'pending') && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => openCancelDialog(reservation)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {paginatedReservations.length === 0 && (
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredReservations.length)} of{' '}
            {filteredReservations.length} results
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => dispatch(setCurrentPage(currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => dispatch(setCurrentPage(currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Cancel Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Reservation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel reservation{' '}
              <strong>{selectedReservation?.id}</strong> for{' '}
              <strong>{selectedReservation?.guestName}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Reservation</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelReservation}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Cancel Reservation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
