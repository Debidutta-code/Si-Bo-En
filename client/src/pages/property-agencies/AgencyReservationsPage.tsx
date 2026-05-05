import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, DollarSign, Bed } from 'lucide-react';
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

interface IReservation {
  id: string;
  reservationCode: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  roomTypeCode: string;
  totalAmount: number;
  status: string;
  adults: number;
  children: number;
}

interface IAgency {
  id: string;
  agencyName: string;
  agencyEmail: string;
  agencyType: string;
  commissionRate: number;
}

const AgencyReservationsPage: React.FC = () => {
  const { propertyId, agencyId } = useParams<{ propertyId: string; agencyId: string }>();
  const navigate = useNavigate();
  
  const [agency, setAgency] = useState<IAgency | null>(null);
  const [reservations, setReservations] = useState<IReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReservations: 0,
    totalRevenue: 0,
    totalCommission: 0,
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
      
      // Fetch agency details and reservations
      const [agencyResponse, reservationsResponse] = await Promise.all([
        axiosInstance.get(`/agency/agencies/${agencyId}`),
        axiosInstance.get(`/agency/agentic-properties/reservations/${agencyId}/${propertyId}`),
      ]);

      if (agencyResponse.data.success) {
        setAgency(agencyResponse.data.data);
      }

      if (reservationsResponse.data.success) {
        const reservationsData = reservationsResponse.data.data || [];
        setReservations(reservationsData);
        
        // Calculate stats
        const totalRevenue = reservationsData.reduce(
          (sum: number, res: IReservation) => sum + (res.totalAmount || 0),
          0
        );
        const commissionRate = agencyResponse.data.data?.commissionRate || 0;
        const totalCommission = (totalRevenue * commissionRate) / 100;

        setStats({
          totalReservations: reservationsData.length,
          totalRevenue,
          totalCommission,
        });
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'default';
      case 'checked-in':
        return 'default';
      case 'checked-out':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return <Loader text="Loading reservations..." />;
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
            {agency?.agencyName} - Reservations
          </h1>
          <p className="text-gray-500 mt-1">
            {agency?.agencyType} • Commission: {agency?.commissionRate}%
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Reservations
            </CardTitle>
            <Calendar className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReservations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalRevenue.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Commission
            </CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${stats.totalCommission.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reservations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reservations ({reservations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {reservations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reservation Code</TableHead>
                  <TableHead>Guest Name</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Room Type</TableHead>
                  <TableHead>Guests</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell className="font-medium">
                      {reservation.reservationCode}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        {reservation.guestName}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(reservation.checkIn)}</TableCell>
                    <TableCell>{formatDate(reservation.checkOut)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Bed className="h-4 w-4 text-gray-400" />
                        {reservation.roomTypeCode}
                      </div>
                    </TableCell>
                    <TableCell>
                      {reservation.adults}A
                      {reservation.children > 0 && `, ${reservation.children}C`}
                    </TableCell>
                    <TableCell className="font-medium">
                      ${reservation.totalAmount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(reservation.status)}>
                        {reservation.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No reservations found for this agency</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AgencyReservationsPage;
