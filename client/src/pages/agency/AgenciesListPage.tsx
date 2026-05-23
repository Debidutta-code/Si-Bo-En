import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { getAgencies, deleteAgency } from './api/agency.api';
import type { IAgency } from './interfaces';
import CreateAgencyDialog from './components/CreateAgencyDialog';
import EditAgencyDialog from './components/EditAgencyDialog';
import DeleteConfirmDialog from './components/DeleteConfirmDialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ILoader } from '../dashboard/interface';
import { useTranslation } from 'react-i18next';

const AgenciesListPage: React.FC = () => {
    const { t } = useTranslation();

  const navigate = useNavigate();
  const [agencies, setAgencies] = useState<IAgency[]>([]);
  const [loading, setLoading] = useState<ILoader>({
    isLoading: true,
    message: t('Agency.loading'),
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit, _setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAgencies, setTotalAgencies] = useState(0);
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState<IAgency | null>(null);

  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [commissionFilter, setCommissionFilter] = useState<string>('all');

  useEffect(() => {
    fetchAgencies();
  }, [page, limit]);

  const fetchAgencies = async () => {
    setLoading({
      isLoading: true,
      message: t('Agency.loading'),
    });
    try {
      const response = await getAgencies(page, limit);
      if (response.success) {
        setAgencies(response.data || []);
        setTotalPages(response.meta?.totalPages || 1);
        setTotalAgencies(response.meta?.totalCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch agencies:', error);
    } finally {
      setLoading({
        isLoading: false,
        message: '',
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedAgency) return;
    
    try {
      const response = await deleteAgency(selectedAgency.id);
      if (response.success) {
        fetchAgencies();
        setIsDeleteDialogOpen(false);
        setSelectedAgency(null);
      }
    } catch (error) {
      console.error('Failed to delete agency:', error);
    }
  };

  const filteredAgencies = agencies.filter(agency => {
    const matchesSearch = 
      agency.agencyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agency.agencyEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agency.iataCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || agency.agencyType === typeFilter;
    const matchesCommission = commissionFilter === 'all' || agency.commissionType === commissionFilter;
    
    return matchesSearch && matchesType && matchesCommission;
  });

if (loading.isLoading) {
    return (
      <div className="min-h-screen w-full flex justify-center items-center">
        <Loader text={loading.message} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t('Agency.title')}</h1>
          <p className="text-gray-500 mt-1">{t('Agency.subtitle')}</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('Agency.createAgency')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">{t('Agency.totalAgencies')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAgencies}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">{t('Agency.travelAgencies')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {agencies.filter(a => a.agencyType === 'travel_agency').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">{t('Agency.corporate')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {agencies.filter(a => a.agencyType === 'corporate').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">{t('Agency.activeAgents')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t('Agency.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder={t('Agency.agencyType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('Agency.allTypes')}</SelectItem>
                <SelectItem value="travel_agency">{t('Agency.travelAgency')}</SelectItem>
                <SelectItem value="corporate">{t('Agency.corporate')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={commissionFilter} onValueChange={setCommissionFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder={t('Agency.commissionType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('Agency.allCommissions')}</SelectItem>
                <SelectItem value="percentage">{t('Agency.percentage')}</SelectItem>
                <SelectItem value="fixed">{t('Agency.fixed')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('Agency.agencyName')}</TableHead>
                <TableHead>{t('Agency.type')}</TableHead>
                <TableHead>{t('Agency.email')}</TableHead>
                <TableHead>{t('Agency.contact')}</TableHead>
                <TableHead>{t('Agency.iataCode')}</TableHead>
                <TableHead>{t('Agency.commission')}</TableHead>
                <TableHead>{t('Agency.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAgencies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    {t('Agency.noAgencies')}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAgencies.map((agency) => (
                  <TableRow key={agency.id}>
                    <TableCell className="font-medium">{agency.agencyName}</TableCell>
                    <TableCell>
                      <Badge variant={agency.agencyType === 'travel_agency' ? 'default' : 'secondary'}>
                        {agency.agencyType === 'travel_agency' ? t('Agency.travelAgency') : t('Agency.corporate')}
                      </Badge>
                    </TableCell>
                    <TableCell>{agency.agencyEmail}</TableCell>
                    <TableCell>{agency.contactNo}</TableCell>
                    <TableCell>{agency.iataCode}</TableCell>
                    <TableCell>
                      {agency.commissionType === 'percentage' 
                        ? `${agency.commissionValue}%` 
                        : `${agency.commissionCurrency || ''} ${agency.commissionValue}`}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => navigate(`/app/agency/${agency.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            {t('Agency.viewDetails')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedAgency(agency);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            {t('Agency.editAgency')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedAgency(agency);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t('Agency.deleteAgency')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              {t('Agency.paginationInfo', { start: ((page - 1) * limit) + 1, end: Math.min(page * limit, totalAgencies), total: totalAgencies })}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                {t('Agency.previous')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                {t('Agency.next')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateAgencyDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={fetchAgencies}
      />

      {selectedAgency && (
        <>
          <EditAgencyDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            agency={selectedAgency}
            onSuccess={fetchAgencies}
          />

          <DeleteConfirmDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onConfirm={handleDelete}
            title={t('Agency.deleteConfirmTitle')}
            description={t('Agency.deleteConfirmDesc', { name: selectedAgency?.agencyName })}
          />
        </>
      )}
    </div>
  );
};

export default AgenciesListPage;
