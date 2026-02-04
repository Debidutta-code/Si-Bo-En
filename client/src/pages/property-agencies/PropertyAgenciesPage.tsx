import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, Users, Calendar, Eye } from 'lucide-react';
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

interface IAgency {
  id: string;
  agencyName: string;
  agencyEmail: string;
  agencyType: string;
  commissionValue: number;
  isActive: boolean;
  AgenticProperties: Array<{
    id: string;
    propertyId: string;
    isActive: boolean;
    AgenticRooms: Array<{ id: string }>;
  }>;
}

const PropertyAgenciesPage: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  
  const [agencies, setAgencies] = useState<IAgency[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAgencies: 0,
    activeAgencies: 0,
    totalRooms: 0,
  });

  useEffect(() => {
    if (propertyId) {
      fetchPropertyAgencies();
    }
  }, [propertyId]);

  const fetchPropertyAgencies = async () => {
    if (!propertyId) return;
    
    setLoading(true);
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.get(`/agency/agentic-properties/property/${propertyId}`);
      
      if (response.data.success) {
        const agenciesData = response.data.data || [];
        setAgencies(agenciesData);
        
        // Calculate stats
        const totalRooms = agenciesData.reduce((sum: number, agency: IAgency) => {
          const propertyData = agency.AgenticProperties.find(ap => ap.propertyId === propertyId);
          return sum + (propertyData?.AgenticRooms?.length || 0);
        }, 0);
        
        setStats({
          totalAgencies: agenciesData.length,
          activeAgencies: agenciesData.filter((a: IAgency) => a.isActive).length,
          totalRooms,
        });
      }
    } catch (error) {
      console.error('Failed to fetch property agencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReservations = (agencyId: string) => {
    navigate(`/property/${propertyId}/agencies/${agencyId}/reservations`);
  };

  if (loading) {
    return <Loader text="Loading agencies..." />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Property Agencies</h1>
        <p className="text-gray-500 mt-1">
          View agencies assigned to this property and their reservations
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Agencies
            </CardTitle>
            <Building2 className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAgencies}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Agencies
            </CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAgencies}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Allocated Rooms
            </CardTitle>
            <Calendar className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRooms}</div>
          </CardContent>
        </Card>
      </div>

      {/* Agencies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Agencies ({agencies.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {agencies.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agency Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Allocated Rooms</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agencies.map((agency) => {
                  const propertyData = agency.AgenticProperties.find(
                    ap => ap.propertyId === propertyId
                  );
                  const roomCount = propertyData?.AgenticRooms?.length || 0;

                  return (
                    <TableRow key={agency.id}>
                      <TableCell className="font-medium">
                        {agency.agencyName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {agency.agencyType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {agency.agencyEmail}
                      </TableCell>
                      <TableCell>{agency.commissionValue}%</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {roomCount} {roomCount === 1 ? 'room' : 'rooms'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            agency.isActive && propertyData?.isActive
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {agency.isActive && propertyData?.isActive
                            ? 'Active'
                            : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewReservations(agency.id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Reservations
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No agencies assigned to this property yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyAgenciesPage;
