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
import { useTranslation } from 'react-i18next';

const AgenticPropertyDetailsPage: React.FC = () => {
    const { t } = useTranslation();

    const { agencyId, propertyId } = useParams<{ agencyId: string; propertyId: string }>();
    const navigate = useNavigate();

    const [agency, setAgency] = useState<IAgencyWD | null>(null);
    const [agenticProperty, setAgenticProperty] = useState<IAgenticPropertyWR | null>(null);
    const [rooms, setRooms] = useState<IAgenticRoom[]>([]);
    const [reservations, setReservations] = useState<any[]>([]);
    const [loading, setLoading] = useState<ILoader>({
        isLoading: true,
        message: t('AgenticPropertyDetailsPage.loader.loadingDetails'),
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
            message: t('AgenticPropertyDetailsPage.loader.loadingDetails'),
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
                    <p className="text-gray-500">{t('AgenticPropertyDetailsPage.notFound.message')}</p>
                    <Button onClick={() => navigate(`/app/agency/${agencyId}`)} className="mt-4">
                        {t('AgenticPropertyDetailsPage.notFound.backToAgency')}
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
                        <p className="text-gray-500 mt-1">
                            {agency.agencyName} • {t('AgenticPropertyDetailsPage.header.subtitle')}
                        </p>
                    </div>
                </div>
                <Badge variant={agenticProperty.isActive ? 'default' : 'secondary'}>
                    {agenticProperty.isActive ? t('AgenticPropertyDetailsPage.header.active') : t('AgenticPropertyDetailsPage.header.inactive')}
                </Badge>
            </div>

            {/* Property Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            {t('AgenticPropertyDetailsPage.cards.propertyCode')}
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
                            {t('AgenticPropertyDetailsPage.cards.commission')}
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
                            {t('AgenticPropertyDetailsPage.cards.allocatedRooms')}
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
                            {t('AgenticPropertyDetailsPage.cards.reservations')}
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
                    <CardTitle>{t('AgenticPropertyDetailsPage.roomsSection.title', { count: rooms.length })}</CardTitle>
                    <Button onClick={() => setIsAddRoomsOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        {t('AgenticPropertyDetailsPage.roomsSection.addRooms')}
                    </Button>
                </CardHeader>
                <CardContent>
                    {rooms.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('AgenticPropertyDetailsPage.roomsSection.tableHead.roomType')}</TableHead>
                                    <TableHead>{t('AgenticPropertyDetailsPage.roomsSection.tableHead.roomName')}</TableHead>
                                    <TableHead>{t('AgenticPropertyDetailsPage.roomsSection.tableHead.status')}</TableHead>
                                    <TableHead>{t('AgenticPropertyDetailsPage.roomsSection.tableHead.availability')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rooms.map((room) => (
                                    <TableRow key={room.id}>
                                        <TableCell className="font-medium">{room.roomType}</TableCell>
                                        <TableCell>{room.roomName}</TableCell>
                                        <TableCell>
                                            <Badge variant={room.isActive ? 'default' : 'secondary'}>
                                                {room.isActive
                                                    ? t('AgenticPropertyDetailsPage.roomsSection.active')
                                                    : t('AgenticPropertyDetailsPage.roomsSection.inactive')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={room.isActive}
                                                    onCheckedChange={() => handleRoomAvailabilityToggle(room.id, room.isActive)}
                                                />
                                                <span className="text-sm text-gray-500">
                                                    {room.isActive
                                                        ? t('AgenticPropertyDetailsPage.roomsSection.available')
                                                        : t('AgenticPropertyDetailsPage.roomsSection.unavailable')}
                                                </span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            {t('AgenticPropertyDetailsPage.roomsSection.noRooms')}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Reservations Section */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('AgenticPropertyDetailsPage.reservationsSection.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    {reservations.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('AgenticPropertyDetailsPage.reservationsSection.tableHead.bookingId')}</TableHead>
                                    <TableHead>{t('AgenticPropertyDetailsPage.reservationsSection.tableHead.guestName')}</TableHead>
                                    <TableHead>{t('AgenticPropertyDetailsPage.reservationsSection.tableHead.room')}</TableHead>
                                    <TableHead>{t('AgenticPropertyDetailsPage.reservationsSection.tableHead.checkIn')}</TableHead>
                                    <TableHead>{t('AgenticPropertyDetailsPage.reservationsSection.tableHead.checkOut')}</TableHead>
                                    <TableHead>{t('AgenticPropertyDetailsPage.reservationsSection.tableHead.status')}</TableHead>
                                    <TableHead>{t('AgenticPropertyDetailsPage.reservationsSection.tableHead.amount')}</TableHead>
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
                            {t('AgenticPropertyDetailsPage.reservationsSection.noReservations')}
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
