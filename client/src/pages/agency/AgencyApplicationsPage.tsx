import React, { useEffect, useState } from 'react';
import { Eye, CheckCircle, XCircle, Search } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Loader from '@/components/Loader/Loader';
import { getAgencyApplications, updateApplicationStatus } from './api/agency-application.api';
import type { IAgencyApplication, fAgencyApplicationStatus } from './interfaces';
import ApplicationDetailsDialog from './components/ApplicationDetailsDialog';
import ApproveApplicationDialog from './components/ApproveApplicationDialog';
import RejectApplicationDialog from './components/RejectApplicationDialog';
import type { ILoader } from '../dashboard/interface';
import { useTranslation } from 'react-i18next';

const AgencyApplicationsPage: React.FC = () => {
    const { t } = useTranslation();

  const [applications, setApplications] = useState<IAgencyApplication[]>([]);
  const [loading, setLoading] = useState<ILoader>({
    isLoading: true,
    message: t('AgencyApplication.loading'),
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<fAgencyApplicationStatus>('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalApplications, setTotalApplications] = useState(0);

  const [selectedApplication, setSelectedApplication] = useState<IAgencyApplication | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [page, limit, statusFilter]);

  const fetchApplications = async () => {
    setLoading({
      isLoading: true,
      message: t('AgencyApplication.loading'),
    });
    try {
      const response = await getAgencyApplications(statusFilter, page, limit);
      if (response.success) {
        setApplications(response.data || []);
        setTotalPages(response.meta?.totalPages || 1);
        setTotalApplications(response.meta?.totalCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading({
        isLoading: false,
        message: '',
      });
    }
  };

  const handleApprove = async () => {
    if (!selectedApplication) return;

    try {
      const response = await updateApplicationStatus(selectedApplication.id, 'approved');
      if (response.success) {
        fetchApplications();
        setIsApproveOpen(false);
        setSelectedApplication(null);
      }
    } catch (error) {
      console.error('Failed to approve application:', error);
    }
  };

  const handleReject = async (rejectionReason: string) => {
    if (!selectedApplication) return;

    try {
      const response = await updateApplicationStatus(
        selectedApplication.id,
        'rejected',
        rejectionReason
      );
      if (response.success) {
        fetchApplications();
        setIsRejectOpen(false);
        setSelectedApplication(null);
      }
    } catch (error) {
      console.error('Failed to reject application:', error);
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch =
      app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.agencyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicantEmail.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'pending':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

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
          <h1 className="text-3xl font-bold">{t('AgencyApplication.title')}</h1>
          <p className="text-gray-500 mt-1">{t('AgencyApplication.subtitle')}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">{t('AgencyApplication.totalApplications')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApplications}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">{t('AgencyApplication.pending')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {applications.filter(a => a.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">{t('AgencyApplication.approved')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {applications.filter(a => a.status === 'approved').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">{t('AgencyApplication.rejected')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {applications.filter(a => a.status === 'rejected').length}
            </div>
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
                placeholder={t('AgencyApplication.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value: fAgencyApplicationStatus) => {
                setStatusFilter(value);
                setPage(1);
              }}
            >
               <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder={t('AgencyApplication.status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('AgencyApplication.allStatus')}</SelectItem>
                <SelectItem value="pending">{t('AgencyApplication.pending')}</SelectItem>
                <SelectItem value="approved">{t('AgencyApplication.approved')}</SelectItem>
                <SelectItem value="rejected">{t('AgencyApplication.rejected')}</SelectItem>
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
                 <TableHead>{t('AgencyApplication.applicationNo')}</TableHead>
                <TableHead>{t('AgencyApplication.applicantName')}</TableHead>
                <TableHead>{t('AgencyApplication.agencyName')}</TableHead>
                <TableHead>{t('AgencyApplication.email')}</TableHead>
                <TableHead>{t('AgencyApplication.phone')}</TableHead>
                <TableHead>{t('AgencyApplication.status')}</TableHead>
                <TableHead>{t('AgencyApplication.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    {t('AgencyApplication.noApplications')}
                  </TableCell>
                </TableRow>
              ) : (
                filteredApplications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>{application.id}</TableCell>
                    <TableCell>{application.applicantName}</TableCell>
                    <TableCell>{application.agencyName}</TableCell>
                    <TableCell>{application.applicantEmail}</TableCell>
                    <TableCell>{application.applicantPhone}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(application.status)}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedApplication(application);
                            setIsDetailsOpen(true);
                          }}
                          title={t('AgencyApplication.viewDetails')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {application.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedApplication(application);
                                setIsApproveOpen(true);
                              }}
                              title={t('AgencyApplication.approve')}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedApplication(application);
                                setIsRejectOpen(true);
                              }}
                              title={t('AgencyApplication.reject')}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              {t('AgencyApplication.paginationInfo', { start: ((page - 1) * limit) + 1, end: Math.min(page * limit, totalApplications), total: totalApplications })}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                {t('AgencyApplication.previous')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                {t('AgencyApplication.previous')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      {selectedApplication && (
        <>
          <ApplicationDetailsDialog
            open={isDetailsOpen}
            onOpenChange={setIsDetailsOpen}
            application={selectedApplication}
          />

          <ApproveApplicationDialog
            open={isApproveOpen}
            onOpenChange={setIsApproveOpen}
            application={selectedApplication}
            onConfirm={handleApprove}
          />

          <RejectApplicationDialog
            open={isRejectOpen}
            onOpenChange={setIsRejectOpen}
            application={selectedApplication}
            onConfirm={handleReject}
          />
        </>
      )}
    </div>
  );
};

export default AgencyApplicationsPage;
