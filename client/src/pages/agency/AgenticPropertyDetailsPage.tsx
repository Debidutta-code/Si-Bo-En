import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Building2, Bed, Calendar, DollarSign } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import Loader from '@/components/Loader/Loader';
import { getAgencyById } from './api/agency.api';
import { getAgenticPropertyById, getReservationsByAgenticPropertyId } from './api/agentic-property.api';
import { updateAgenticRoomAvailability } from './api/agentic-room.api';
import type { IAgencyWD, IAgenticPropertyWR, IAgenticRoom } from './interfaces';
import AddRoomsDialog from './components/AddRoomsDialog';
import type { ILoader } from '../dashboard/interface';

const AgenticPropertyDetailsPage: React.FC = () => {
    const { agencyId, propertyId } = useParams<{ agencyId: string; propertyId: string }>();
    const navigate = useNavigate();

    const [agency, setAgency] = useState<IAgencyWD | null>(null);
    const [agenticProperty, setAgenticProperty] = useState<IAgenticPropertyWR | null>(null);
    const [rooms, setRooms] = useState<IAgenticRoom[]>([]);
    const [reservations, setReservations] = useState<any[]>([]);
    const [loading, setLoading] = useState<ILoader>({
        isLoading: true,
        message: 'Loading property details...',
    });
    const [isAddRoomsOpen, setIsAddRoomsOpen] = useState(false);

    useEffect(() => {
        if (agencyId && propertyId) {
            fetchPropertyDetails();
        }
    }, [agencyId, propertyId]);

    const fetchPropertyDetails = async () => {
        if (!agencyId || !propertyId) return;

        setLoading({
            isLoading: true,
            message: 'Loading property details...',
        });
        try {
            // First get agency to find the agenticPropertyId
            const agencyResponse = await getAgencyById(agencyId);

            if (agencyResponse.success) {
                setAgency(agencyResponse.data);

                // Find the specific agentic property to get its ID
                const foundProperty = agencyResponse.data?.AgenticProperties?.find(
                    (ap: any) => ap.propertyId === propertyId
                );

                if (foundProperty) {
                    // Fetch property details and reservations
                    const [propertyDetails, reservationsResponse] = await Promise.all([
                        getAgenticPropertyById(foundProperty.id),
                        getReservationsByAgenticPropertyId(agencyId, propertyId),
                    ]);

                    if (propertyDetails.success) {
                        setAgenticProperty(propertyDetails.data);
                        // Use AgenticRooms from the property details (already allocated rooms)
                        setRooms(propertyDetails.data?.AgenticRooms || []);
                    }

                    if (reservationsResponse.success) {
                        setReservations(reservationsResponse.data || []);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch property details:', error);
        } finally {
            setLoading({
                isLoading: false,
                message: '',
            });
        }
    };

    const handleRoomAvailabilityToggle = async (roomId: string, currentStatus: boolean) => {
        try {
            const response = await updateAgenticRoomAvailability(roomId, !currentStatus);
            if (response.success) {
                fetchPropertyDetails();
            }
        } catch (error) {
            console.error('Failed to update room availability:', error);
        }
    };

    if (loading.isLoading) {
        return (
            <div className="min-h-screen w-full flex justify-center items-center">
                <Loader text={loading.message} />
            </div>
        );
    }

    if (!agency || !agenticProperty) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <p className="text-gray-500">Property not found</p>
                    <Button onClick={() => navigate(`/app/agency/${agencyId}`)} className="mt-4">
                        Back to Agency
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/app/agency/${agencyId}`)}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">{agenticProperty.propertyName}</h1>
                        <p className="text-gray-500 mt-1">{agency.agencyName} • Property Management</p>
                    </div>
                </div>
                <Badge variant={agenticProperty.isActive ? 'default' : 'secondary'}>
                    {agenticProperty.isActive ? 'Active' : 'Inactive'}
                </Badge>
            </div>

            {/* Property Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Property Code
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{agenticProperty.propertyCode}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Commission
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {agency.commissionType === 'percentage'
                                ? `${agency.commissionValue}%`
                                : `${agency.commissionCurrency} ${agency.commissionValue}`}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <Bed className="h-4 w-4" />
                            Allocated Rooms
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{rooms.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Reservations
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{reservations.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Rooms Section */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Allocated Rooms ({rooms.length})</CardTitle>
                    <Button onClick={() => setIsAddRoomsOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Rooms
                    </Button>
                </CardHeader>
                <CardContent>
                    {rooms.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Room Type</TableHead>
                                    <TableHead>Room Name</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Availability</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rooms.map((room) => (
                                    <TableRow key={room.id}>
                                        <TableCell className="font-medium">{room.roomType}</TableCell>
                                        <TableCell>{room.roomName}</TableCell>
                                        <TableCell>
                                            <Badge variant={room.isActive ? 'default' : 'secondary'}>
                                                {room.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={room.isActive}
                                                    onCheckedChange={() => handleRoomAvailabilityToggle(room.id, room.isActive)}
                                                />
                                                <span className="text-sm text-gray-500">
                                                    {room.isActive ? 'Available' : 'Unavailable'}
                                                </span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            No rooms allocated yet. Click "Add Rooms" to assign rooms to this property.
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Reservations Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Reservations</CardTitle>
                </CardHeader>
                <CardContent>
                    {reservations.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Booking ID</TableHead>
                                    <TableHead>Guest Name</TableHead>
                                    <TableHead>Room</TableHead>
                                    <TableHead>Check-in</TableHead>
                                    <TableHead>Check-out</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reservations.map((reservation) => (
                                    <TableRow key={reservation.id}>
                                        <TableCell className="font-medium">{reservation.bookingId}</TableCell>
                                        <TableCell>{reservation.guestName}</TableCell>
                                        <TableCell>{reservation.roomType}</TableCell>
                                        <TableCell>{new Date(reservation.checkIn).toLocaleDateString()}</TableCell>
                                        <TableCell>{new Date(reservation.checkOut).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Badge>{reservation.status}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {reservation.currency} {reservation.totalAmount}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            No reservations yet
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add Rooms Dialog */}
            <AddRoomsDialog
                open={isAddRoomsOpen}
                onOpenChange={setIsAddRoomsOpen}
                agenticPropertyId={agenticProperty.id}
                propertyId={propertyId!}
                onSuccess={fetchPropertyDetails}
            />
        </div>
    );
};

export default AgenticPropertyDetailsPage;
