import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, DollarSign, Bed, Hash, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Loader from '@/components/Loader/Loader';
import createAxiosInstance from '@/components/axiosInstance';
import { useTranslation } from 'react-i18next';

// --- Types matching the actual API response ---

interface IGuestDistribution {
  adults: number;
  children: number;
  childAges: number[];
}

interface IDailyPriceBreakdown {
  date: string;
  roomNumber?: string | number;
  totalAmount: number;
  currencyCode: string;
  baseChargesAmount: number;
  guestDistribution?: IGuestDistribution;
}

interface IAgencyCommission {
  commissionType: string;
  commissionValue: number;
  commissionAmount: number;
  commissionCurrency: string;
}

interface ITouristTax {
  id: string;
  name: string;
  currencyCode: string;
  discountType: string;
  discountValue: number;
  calculatedAmount: number;
}

interface IFinalPrice {
  touristTax?: ITouristTax;
  taxedAmount: number;
  totalAmount: number;
  currencyCode: string;
  amountBeforeTax: number;
  agencyCommission?: IAgencyCommission;
  agencyCommissionAmount: number;
  currentChargeableAmount: number;
  latterpayableAmount: number;
  totalAddonAmount: number;
  promoCodeDiscount: number;
  loyalityDiscount: number;
  dailyPriceBrakeDown: IDailyPriceBreakdown[];
}

interface IGuest {
  type: 'adult' | 'child';
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}

interface IReservation {
  id: string;
  propertyId: string;
  propertyCode: string;
  hotelName: string;
  roomName: string;
  roomTypeCode: string;
  ratePlanCode: string;
  ratePlanName: string;
  bookingCode: string;
  bookedAt: string;
  checkInDate: string | null;
  checkOutDate: string | null;
  reservationStartDate: string;
  reservationEndDate: string;
  countryCode: string;
  timezone: string;
  deviceTypes: string;
  platforms: string;
  primaryGuestId: string;
  guests: IGuest[];
  bookingUserEmail: string;
  bookingUserPhone: string;
  amount: number;
  currencyCode: string;
  finalPrice: IFinalPrice;
  paidAmount: number;
  extraAmountToPay: number;
  refundAmount: number;
  paymentMethod: string;
  bookingStatus: string;
  cancellationReason: string | null;
  bookingSource: string;
  isPromoUsed: boolean;
  cancelledAt: string | null;
  agencyId: string;
  createdAt: string;
  updatedAt: string;
}

interface IAgency {
  id: string;
  agencyName: string;
  agencyEmail: string;
  agencyType: string;
  commissionRate: number;
}

// --- Helpers ---

const getPrimaryGuest = (guests: IGuest[]): string => {
  const primary = guests.find((g) => g.firstName || g.lastName);
  if (!primary) return '—';
  return [primary.firstName, primary.lastName].filter(Boolean).join(' ');
};

const getGuestCounts = (guests: IGuest[]) => {
  const adults = guests.filter((g) => g.type === 'adult').length;
  const children = guests.filter((g) => g.type === 'child').length;
  return { adults, children };
};

const formatDate = (dateString: string | null): string => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatPaymentMethod = (method: string): string => {
  return method.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

const getStatusVariant = (
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status.toLowerCase()) {
    case 'confirmed':
      return 'default';
    case 'checked_in':
    case 'checked-in':
      return 'default';
    case 'checked_out':
    case 'checked-out':
      return 'secondary';
    case 'cancelled':
      return 'destructive';
    default:
      return 'secondary';
  }
};

// --- Component ---

const AgencyReservationsPage: React.FC = () => {
  const { t } = useTranslation();
  const { propertyId, agencyId } = useParams<{ propertyId: string; agencyId: string }>();
  const navigate = useNavigate();

  const [agency, setAgency] = useState<IAgency | null>(null);
  const [reservations, setReservations] = useState<IReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReservations: 0,
    totalRevenue: 0,
    totalCommission: 0,
    confirmedCount: 0,
    cancelledCount: 0,
  });

  useEffect(() => {
    if (propertyId && agencyId) {
      fetchData();
    }
  }, [propertyId, agencyId]);

  const fetchData = async () => {
    if (!propertyId || !agencyId) return;

    setLoading(true);
    try {
      const axiosInstance = createAxiosInstance();

      const [agencyResponse, reservationsResponse] = await Promise.all([
        axiosInstance.get(`/agency/agencies/${agencyId}`),
        axiosInstance.get(`/agency/agentic-properties/reservations/${agencyId}/${propertyId}`),
      ]);

      if (agencyResponse.data.success) {
        setAgency(agencyResponse.data.data);
      }

      if (reservationsResponse.data.success) {
        const reservationsData: IReservation[] = reservationsResponse.data.data || [];
        setReservations(reservationsData);

        const totalRevenue = reservationsData.reduce(
          (sum, res) => sum + (res.finalPrice?.totalAmount ?? res.amount ?? 0),
          0
        );
        const totalCommission = reservationsData.reduce(
          (sum, res) => sum + (res.finalPrice?.agencyCommissionAmount ?? 0),
          0
        );
        const confirmedCount = reservationsData.filter(
          (r) => r.bookingStatus === 'confirmed'
        ).length;
        const cancelledCount = reservationsData.filter(
          (r) => r.bookingStatus === 'cancelled'
        ).length;

        setStats({
          totalReservations: reservationsData.length,
          totalRevenue,
          totalCommission,
          confirmedCount,
          cancelledCount,
        });
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader text={t('AgencyReservations.loading')} />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/property/${propertyId}/agencies`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {agency?.agencyName ?? 'Agency'} — {t('AgencyReservations.reservationsTitle')}
          </h1>
          <p className="text-gray-500 mt-1">
            {agency?.agencyType && <span>{agency.agencyType} • </span>}
            {agency?.commissionRate != null && (
              <span>{t('AgencyReservations.commission')}: {agency.commissionRate}%</span>
            )}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{t('AgencyReservations.statTotal')}</CardTitle>
            <Calendar className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReservations}</div>
            <p className="text-xs text-gray-500 mt-1">{t('AgencyReservations.statReservations')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{t('AgencyReservations.statConfirmed')}</CardTitle>
            <Calendar className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.confirmedCount}</div>
            <p className="text-xs text-gray-500 mt-1">{t('AgencyReservations.statActiveBookings')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{t('AgencyReservations.statCancelled')}</CardTitle>
            <Calendar className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.cancelledCount}</div>
            <p className="text-xs text-gray-500 mt-1">{t('AgencyReservations.statCancelledBookings')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{t('AgencyReservations.statRevenue')}</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">{t('AgencyReservations.statTotalAed')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{t('AgencyReservations.statCommission')}</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.totalCommission.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">{t('AgencyReservations.statAgencyEarned')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Reservations Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('AgencyReservations.tableTitle', { count: reservations.length })}</CardTitle>
        </CardHeader>
        <CardContent>
          {reservations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('AgencyReservations.colBookingCode')}</TableHead>
                  <TableHead>{t('AgencyReservations.colPrimaryGuest')}</TableHead>
                  <TableHead>{t('AgencyReservations.colContact')}</TableHead>
                  <TableHead>{t('AgencyReservations.colStayDates')}</TableHead>
                  <TableHead>{t('AgencyReservations.colRoom')}</TableHead>
                  <TableHead>{t('AgencyReservations.colGuests')}</TableHead>
                  <TableHead>{t('AgencyReservations.colTotal', { code: reservations[0].countryCode })}</TableHead>
                  <TableHead>{t('AgencyReservations.colCommission', { code: reservations[0].countryCode })}</TableHead>
                  <TableHead>{t('AgencyReservations.colPayment')}</TableHead>
                  <TableHead>{t('AgencyReservations.colStatus')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.map((reservation) => {
                  const primaryGuest = getPrimaryGuest(reservation.guests);
                  const { adults, children } = getGuestCounts(reservation.guests);
                  const commissionAmount =
                    reservation.finalPrice?.agencyCommissionAmount ?? 0;

                  return (
                    <TableRow key={reservation.id}>
                      {/* Booking Code */}
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-1">
                          <Hash className="h-3 w-3 text-gray-400" />
                          {reservation.bookingCode.split("-")[1]}
                        </div>
                      </TableCell>

                      {/* Primary Guest */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400 shrink-0" />
                          <span>{primaryGuest}</span>
                        </div>
                      </TableCell>

                      {/* Contact */}
                      <TableCell>
                        <div className="flex flex-col gap-0.5 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-gray-400" />
                            {reservation.bookingUserEmail}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-gray-400" />
                            {reservation.bookingUserPhone}
                          </span>
                        </div>
                      </TableCell>

                      {/* Stay Dates */}
                      <TableCell>
                        <div className="text-sm">
                          <div>
                            {formatDate(
                              reservation.checkInDate ?? reservation.reservationStartDate
                            )}
                          </div>
                          <div className="text-gray-400">→</div>
                          <div>
                            {formatDate(
                              reservation.checkOutDate ?? reservation.reservationEndDate
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Room */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Bed className="h-4 w-4 text-gray-400 shrink-0" />
                          <div className="text-sm">
                            <div className="font-medium">{reservation.roomName}</div>
                            <div className="text-gray-500 text-xs">
                              {reservation.roomTypeCode} · {reservation.ratePlanName}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Guests */}
                      <TableCell>
                        <span>
                          {adults}A{children > 0 ? `, ${children}C` : ''}
                        </span>
                      </TableCell>

                      {/* Total Amount */}
                      <TableCell className="font-medium">
                        {(reservation.finalPrice?.totalAmount ?? reservation.amount).toFixed(2)}
                      </TableCell>

                      {/* Commission */}
                      <TableCell className="font-medium text-green-600">
                        {commissionAmount.toFixed(2)}
                      </TableCell>

                      {/* Payment Method */}
                      <TableCell className="text-sm text-gray-600">
                        {formatPaymentMethod(reservation.paymentMethod)}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge variant={getStatusVariant(reservation.bookingStatus)}>
                          {reservation.bookingStatus}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>{t('AgencyReservations.noReservations')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AgencyReservationsPage;