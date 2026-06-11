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
import BackButton from '@/components/shared/BackButton';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
    return (
      <div className='h-screen flex justify-center items-center'>
        <Loader text={t('PropertyAgencies.loading')} />;
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <BackButton/>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('PropertyAgencies.title')}</h1>
        <p className="text-gray-500 mt-1">
          {t('PropertyAgencies.subtitle')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t('PropertyAgencies.statTotalAgencies')}
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
              {t('PropertyAgencies.statActiveAgencies')}
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
              {t('PropertyAgencies.statTotalRooms')}
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
          <CardTitle>{t('PropertyAgencies.tableTitle', { count: agencies.length })}</CardTitle>
        </CardHeader>
        <CardContent>
          {agencies.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('PropertyAgencies.colAgencyName')}</TableHead>
                  <TableHead>{t('PropertyAgencies.colType')}</TableHead>
                  <TableHead>{t('PropertyAgencies.colEmail')}</TableHead>
                  <TableHead>{t('PropertyAgencies.colCommission')}</TableHead>
                  <TableHead>{t('PropertyAgencies.colAllocatedRooms')}</TableHead>
                  <TableHead>{t('PropertyAgencies.colStatus')}</TableHead>
                  <TableHead className="text-right">{t('PropertyAgencies.colActions')}</TableHead>
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
                          {roomCount} {roomCount === 1 ? t('PropertyAgencies.room') : t('PropertyAgencies.rooms')}
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
                            ? t('PropertyAgencies.active')
                            : t('PropertyAgencies.inactive')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewReservations(agency.id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {t('PropertyAgencies.viewReservations')}
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
              <p>{t('PropertyAgencies.noAgencies')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyAgenciesPage;
