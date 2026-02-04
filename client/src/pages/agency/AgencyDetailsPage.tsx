import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Users, Building2, DollarSign, MapPin, Mail, Phone } from 'lucide-react';
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
import { getAgencyById, getReservationsForAgency } from './api/agency.api';
import { getAgenticPropertyById } from './api/agentic-property.api';
import type { IAgencyWD, IAgenticProperty } from './interfaces';
import EditAgencyDialog from './components/EditAgencyDialog';
import AssignPropertyDialog from './components/AssignPropertyDialog';
import type { ILoader } from '../dashboard/interface';

const AgencyDetailsPage: React.FC = () => {
  const { agencyId } = useParams<{ agencyId: string }>();
  const navigate = useNavigate();
  
  const [agency, setAgency] = useState<IAgencyWD | null>(null);
  const [properties, setProperties] = useState<IAgenticProperty[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState<ILoader>({
    isLoading: true,
    message: 'Loading agency details...',
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAssignPropertyOpen, setIsAssignPropertyOpen] = useState(false);

  useEffect(() => {
    if (agencyId) {
      fetchAgencyDetails();
    }
  }, [agencyId]);

  const fetchAgencyDetails = async () => {
    if (!agencyId) return;

    setLoading({
      isLoading: true,
      message: 'Loading agency details...',
    });
    try {
      const [agencyResponse, reservationsResponse] = await Promise.all([
        getAgencyById(agencyId),
        getReservationsForAgency(agencyId, 1, 10),
      ]);

      if (agencyResponse.success) {
        setAgency(agencyResponse.data);
        
        // Fetch details for each agentic property
        if (agencyResponse.data.AgenticProperties) {
          const propertiesDetails = await Promise.all(
            agencyResponse.data.AgenticProperties.map((ap: any) => 
              getAgenticPropertyById(ap.id)
            )
          );
          setProperties(propertiesDetails.filter(p => p.success).map(p => p.data));
        }
      }

      if (reservationsResponse.success) {
        setReservations(reservationsResponse.data.reservations || []);
      }
    } catch (error) {
      console.error('Failed to fetch agency details:', error);
    } finally {
      setLoading({
        isLoading: false,
        message: '',
      });
    }
  };

if (loading.isLoading) {
    return (
      <div className="min-h-screen w-full flex justify-center items-center">
        <Loader text={loading.message} />
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Agency not found</p>
          <Button onClick={() => navigate('/app/agency')} className="mt-4">
            Back to Agencies
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
            onClick={() => navigate('/app/agency')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{agency.agencyName}</h1>
            <p className="text-gray-500 mt-1">Agency Details & Management</p>
          </div>
        </div>
        <Button onClick={() => setIsEditDialogOpen(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Agency
        </Button>
      </div>

      {/* Agency Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Agency Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={agency.agencyType === 'travel_agency' ? 'default' : 'secondary'}>
              {agency.agencyType === 'travel_agency' ? 'Travel Agency' : 'Corporate'}
            </Badge>
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
              <Building2 className="h-4 w-4" />
              Properties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{properties.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agency.Agents?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{agency.agencyEmail}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Contact Number</p>
                <p className="font-medium">{agency.contactNo}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">{agency.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">IATA Code</p>
                <p className="font-medium">{agency.iataCode}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Tax Number</p>
                <p className="font-medium">{agency.taxNo}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agents Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Agents ({agency.Agents?.length || 0})</CardTitle>
          <Button onClick={() => navigate(`/app/agency/${agencyId}/agents`)}>
            <Users className="h-4 w-4 mr-2" />
            Manage Agents
          </Button>
        </CardHeader>
        <CardContent>
          {agency.Agents && agency.Agents.length > 0 ? (
            <div className="space-y-2">
              {agency.Agents.slice(0, 5).map((agent) => (
                <div key={agent.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{agent.agentName}</p>
                    <p className="text-sm text-gray-500">{agent.agentEmail}</p>
                  </div>
                  <Badge>{agent.isDeleted ? 'Inactive' : 'Active'}</Badge>
                </div>
              ))}
              {agency.Agents.length > 5 && (
                <Button
                  variant="link"
                  onClick={() => navigate(`/app/agency/${agencyId}/agents`)}
                  className="w-full"
                >
                  View all {agency.Agents.length} agents
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No agents assigned yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Properties Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Assigned Properties ({properties.length})</CardTitle>
          <Button onClick={() => setIsAssignPropertyOpen(true)}>
            <Building2 className="h-4 w-4 mr-2" />
            Assign Property
          </Button>
        </CardHeader>
        <CardContent>
          {properties.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property Name</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell className="font-medium">
                      {property.propertyName}
                    </TableCell>
                    <TableCell>
                      {agency.commissionType === 'percentage'
                        ? `${agency.commissionValue}%`
                        : `${agency.commissionCurrency} ${agency.commissionValue}`}
                    </TableCell>
                    <TableCell>
                      <Badge variant={property.isActive ? 'default' : 'secondary'}>
                        {property.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/app/agency/${agencyId}/property/${property.propertyId}`)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No properties assigned yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Reservations */}
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
                  <TableHead>Property</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell className="font-medium">{reservation.bookingId}</TableCell>
                    <TableCell>{reservation.guestName}</TableCell>
                    <TableCell>{reservation.propertyName}</TableCell>
                    <TableCell>{new Date(reservation.checkIn).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(reservation.checkOut).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge>{reservation.status}</Badge>
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

      {/* Dialogs */}
      <EditAgencyDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        agency={agency}
        onSuccess={fetchAgencyDetails}
      />

      <AssignPropertyDialog
        open={isAssignPropertyOpen}
        onOpenChange={setIsAssignPropertyOpen}
        agencyId={agencyId!}
        onSuccess={fetchAgencyDetails}
      />
    </div>
  );
};

export default AgencyDetailsPage;
