import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useActivityLogs, formatActivityLog, getActionColor, getSeverityColor, getEntityIcon } from './services/logs.services';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, RefreshCw, ChevronLeft, ChevronRight, Search, AlertCircle, Eye, Monitor, Smartphone, Tablet, Laptop } from 'lucide-react';
import type { IActivityLog } from './interfaces';

export default function LogsPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState<IActivityLog | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const queryPage = searchParams.get('page');
    if (queryPage) setPage(Number(queryPage));
  }, []);

  const { data, isLoading, isError, error, refetch } = useActivityLogs(
    { page, limit },
    true
  );
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && data?.data && newPage <= data.data.totalPages) {
      setPage(newPage);
    }
  };

  const handleLimitChange = (value: string) => {
    setLimit(parseInt(value));
    setPage(1);
  };

  const handleViewDetails = (log: IActivityLog) => {
    setSelectedLog(log);
    setIsDialogOpen(true);
  };

  const getDeviceIcon = (deviceType?: string) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      case 'desktop':
        return <Monitor className="h-4 w-4" />;
      default:
        return <Laptop className="h-4 w-4" />;
    }
  };

  const filteredLogs = data?.data?.data?.filter((log: IActivityLog) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      log.description?.toLowerCase().includes(searchLower) ||
      log.entityName?.toLowerCase().includes(searchLower) ||
      log.userName?.toLowerCase().includes(searchLower) ||
      log.userEmail?.toLowerCase().includes(searchLower) ||
      log.action?.toLowerCase().includes(searchLower) ||
      log.entity?.toLowerCase().includes(searchLower)
    );
  }) || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('ApiLogs.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('ApiLogs.subtitle')}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {t('ApiLogs.refresh')}
        </Button>
      </div>

      {/* Stats Cards */}
      {data?.data && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('ApiLogs.totalLogs')}</CardTitle>
              <span className="text-2xl">📊</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.data.total.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {t('ApiLogs.pagesTotal', { count: data.data.totalPages })}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('ApiLogs.currentPage')}</CardTitle>
              <span className="text-2xl">📄</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.data.page}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {t('ApiLogs.showingLogs', { count: data.data.data.length })}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('ApiLogs.perPage')}</CardTitle>
              <span className="text-2xl">⚙️</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.data.limit}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {t('ApiLogs.adjustBelow')}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('ApiLogs.activityTimeline')}</CardTitle>
              <CardDescription>{t('ApiLogs.recentActivities')}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('ApiLogs.searchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              {/* Items per page */}
              <Select value={limit.toString()} onValueChange={handleLimitChange}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">{t('ApiLogs.loadingLogs')}</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold">{t('ApiLogs.failedToLoad')}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {error?.message || t('ApiLogs.errorFetching')}
              </p>
              <Button onClick={() => refetch()} variant="outline" className="mt-4">
                {t('ApiLogs.tryAgain')}
              </Button>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="text-6xl mb-4">📝</span>
              <h3 className="text-lg font-semibold">{t('ApiLogs.noLogsFound')}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {search ? t('ApiLogs.tryAdjustingSearch') : t('ApiLogs.noLogsYet')}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">{t('ApiLogs.columns.timestamp')}</TableHead>
                    <TableHead className="w-[100px]">{t('ApiLogs.columns.action')}</TableHead>
                    <TableHead className="w-[120px]">{t('ApiLogs.columns.entity')}</TableHead>
                    <TableHead>{t('ApiLogs.columns.description')}</TableHead>
                    <TableHead className="w-[150px]">{t('ApiLogs.columns.performedBy')}</TableHead>
                    <TableHead className="w-[120px]">{t('ApiLogs.columns.ipAddress')}</TableHead>
                    <TableHead className="w-[100px]">{t('ApiLogs.columns.device')}</TableHead>
                    <TableHead className="w-[100px]">{t('ApiLogs.columns.severity')}</TableHead>
                    <TableHead className="w-[80px]">{t('ApiLogs.columns.details')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log: IActivityLog) => {
                    const formatted = formatActivityLog(log);
                    return (
                      <TableRow key={log._id}>
                        <TableCell className="font-mono text-xs">
                          <div>{formatted.formattedDate}</div>
                          <div className="text-muted-foreground">{formatted.formattedTime}</div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${getActionColor(log.action)} font-medium`}
                          >
                            {formatted.actionDisplay}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getEntityIcon(log.entity)}</span>
                            <span className="text-sm capitalize">
                              {log.entity.replace('_', ' ')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-md">
                            <div className="font-medium text-sm truncate">
                              {log.shortMessage || formatted.entityDisplay}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {log.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium truncate">{formatted.actorDisplay}</div>
                            {log.userRole && (
                              <div className="text-xs text-muted-foreground capitalize">
                                {log.userRole.replace('_', ' ')}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs font-mono">
                            {log.metadata?.ipAddress || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getDeviceIcon(log.metadata?.deviceType)}
                            <div className="text-xs">
                              <div className="capitalize">{log.metadata?.deviceType || t('ApiLogs.unknown')}</div>
                              {log.metadata?.browser && (
                                <div className="text-muted-foreground">{log.metadata.browser}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${getSeverityColor(log.severity)} capitalize`}
                          >
                            {log.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(log)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {data?.data && data.data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                {t('ApiLogs.showing', {
                  from: ((page - 1) * limit) + 1,
                  to: Math.min(page * limit, data.data.total),
                  total: data.data.total,
                })}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  {t('ApiLogs.previous')}
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, data.data.totalPages) }, (_, i) => {
                    let pageNum;
                    if (data.data.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= data.data.totalPages - 2) {
                      pageNum = data.data.totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === data.data.totalPages}
                >
                  {t('ApiLogs.next')}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{t('ApiLogs.dialog.title')}</DialogTitle>
            <DialogDescription>
              {t('ApiLogs.dialog.description')}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            {selectedLog && (() => {
              const formatted = formatActivityLog(selectedLog);
              return (
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <span className="text-2xl">{getEntityIcon(selectedLog.entity)}</span>
                      {t('ApiLogs.dialog.basicInfo')}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-muted-foreground">{t('ApiLogs.dialog.action')}</span>
                        <div className="mt-1">
                          <Badge variant="outline" className={`${getActionColor(selectedLog.action)} font-medium`}>
                            {formatted.actionDisplay}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">{t('ApiLogs.dialog.entity')}</span>
                        <div className="mt-1 capitalize">{selectedLog.entity.replace('_', ' ')}</div>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">{t('ApiLogs.dialog.entityId')}</span>
                        <div className="mt-1 font-mono text-xs">{selectedLog.entityId}</div>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">{t('ApiLogs.dialog.entityName')}</span>
                        <div className="mt-1">{selectedLog.entityName || '-'}</div>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">{t('ApiLogs.dialog.timestamp')}</span>
                        <div className="mt-1">{formatted.formattedTimestamp}</div>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">{t('ApiLogs.dialog.severity')}</span>
                        <div className="mt-1">
                          <Badge variant="outline" className={`${getSeverityColor(selectedLog.severity)} capitalize`}>
                            {selectedLog.severity}
                          </Badge>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium text-muted-foreground">{t('ApiLogs.columns.description')}</span>
                        <div className="mt-1">{selectedLog.description}</div>
                      </div>
                      {selectedLog.shortMessage && (
                        <div className="col-span-2">
                          <span className="font-medium text-muted-foreground">{t('ApiLogs.dialog.shortMessage')}</span>
                          <div className="mt-1">{selectedLog.shortMessage}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* User Details */}
                  {(selectedLog.userId || selectedLog.userEmail || selectedLog.userName) && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        👤 {t('ApiLogs.dialog.userDetails')}
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {selectedLog.userName && (
                          <div>
                            <span className="font-medium text-muted-foreground">{t('ApiLogs.dialog.name')}</span>
                            <div className="mt-1">{selectedLog.userName}</div>
                          </div>
                        )}
                        {selectedLog.userEmail && (
                          <div>
                            <span className="font-medium text-muted-foreground">{t('ApiLogs.dialog.email')}</span>
                            <div className="mt-1">{selectedLog.userEmail}</div>
                          </div>
                        )}
                        {selectedLog.userId && (
                          <div>
                            <span className="font-medium text-muted-foreground">{t('ApiLogs.dialog.userId')}</span>
                            <div className="mt-1 font-mono text-xs">{selectedLog.userId}</div>
                          </div>
                        )}
                        {selectedLog.userRole && (
                          <div>
                            <span className="font-medium text-muted-foreground">{t('ApiLogs.dialog.role')}</span>
                            <div className="mt-1 capitalize">{selectedLog.userRole.replace('_', ' ')}</div>
                          </div>
                        )}
                        {selectedLog.userLevel !== undefined && (
                          <div>
                            <span className="font-medium text-muted-foreground">{t('ApiLogs.dialog.level')}</span>
                            <div className="mt-1">{selectedLog.userLevel}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Property Context */}
                  {(selectedLog.propertyId || selectedLog.propertyName) && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        🏨 {t('ApiLogs.dialog.propertyContext')}
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {selectedLog.propertyName && (
                          <div>
                            <span className="font-medium text-muted-foreground">{t('ApiLogs.dialog.propertyName')}</span>
                            <div className="mt-1">{selectedLog.propertyName}</div>
                          </div>
                        )}
                        {selectedLog.propertyCode && (
                          <div>
                            <span className="font-medium text-muted-foreground">{t('ApiLogs.dialog.propertyCode')}</span>
                            <div className="mt-1">{selectedLog.propertyCode}</div>
                          </div>
                        )}
                        {selectedLog.propertyId && (
                          <div>
                            <span className="font-medium text-muted-foreground">{t('ApiLogs.dialog.propertyId')}</span>
                            <div className="mt-1 font-mono text-xs">{selectedLog.propertyId}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Device & Network Information */}
                  {selectedLog.metadata && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        💻 {t('ApiLogs.dialog.deviceNetwork')}
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {selectedLog.metadata.ipAddress && (
                          <div>
                            <span className="font-medium text-muted-foreground">{t('ApiLogs.dialog.ipAddress')}</span>
                            <div className="mt-1 font-mono">{selectedLog.metadata.ipAddress}</div>
                          </div>
                        )}
                        {selectedLog.metadata.deviceType && (
                          <div>
                            <span className="font-medium text-muted-foreground">{t('ApiLogs.dialog.deviceType')}</span>
                            <div className="mt-1 flex items-center gap-2 capitalize">
                              {getDeviceIcon(selectedLog.metadata.deviceType)}
                              {selectedLog.metadata.deviceType}
                            </div>
                          </div>
                        )}
                        {selectedLog.metadata.browser && (
                          <div>
                            <span className="font-medium text-muted-foreground">{t('ApiLogs.dialog.browser')}</span>
                            <div className="mt-1">{selectedLog.metadata.browser}</div>
                          </div>
                        )}
                        {selectedLog.metadata.os && (
                          <div>
                            <span className="font-medium text-muted-foreground">{t('ApiLogs.dialog.os')}</span>
                            <div className="mt-1">{selectedLog.metadata.os}</div>
                          </div>
                        )}
                        {selectedLog.metadata.country && (
                          <div>
                            <span className="font-medium text-muted-foreground">{t('ApiLogs.dialog.country')}</span>
                            <div className="mt-1">{selectedLog.metadata.country}</div>
                          </div>
                        )}
                        {selectedLog.metadata.city && (
                          <div>
                            <span className="font-medium text-muted-foreground">{t('ApiLogs.dialog.city')}</span>
                            <div className="mt-1">{selectedLog.metadata.city}</div>
                          </div>
                        )}
                        {selectedLog.metadata.timezone && (
                          <div>
                            <span className="font-medium text-muted-foreground">{t('ApiLogs.dialog.timezone')}</span>
                            <div className="mt-1">{selectedLog.metadata.timezone}</div>
                          </div>
                        )}
                        {selectedLog.metadata.userAgent && (
                          <div className="col-span-2">
                            <span className="font-medium text-muted-foreground">{t('ApiLogs.dialog.userAgent')}</span>
                            <div className="mt-1 text-xs font-mono break-all">{selectedLog.metadata.userAgent}</div>
                          </div>
                        )}
                        {selectedLog.metadata.sessionId && (
                          <div>
                            <span className="font-medium text-muted-foreground">{t('ApiLogs.dialog.sessionId')}</span>
                            <div className="mt-1 text-xs font-mono">{selectedLog.metadata.sessionId}</div>
                          </div>
                        )}
                        {selectedLog.metadata.requestId && (
                          <div>
                            <span className="font-medium text-muted-foreground">{t('ApiLogs.dialog.requestId')}</span>
                            <div className="mt-1 text-xs font-mono">{selectedLog.metadata.requestId}</div>
                          </div>
                        )}
                        {selectedLog.metadata.executionTimeMs !== undefined && (
                          <div>
                            <span className="font-medium text-muted-foreground">{t('ApiLogs.dialog.executionTime')}</span>
                            <div className="mt-1">{selectedLog.metadata.executionTimeMs}ms</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* API Context */}
                  {(selectedLog.requestUrl || selectedLog.apiStatus) && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        🔗 {t('ApiLogs.dialog.apiContext')}
                      </h3>
                      <div className="grid grid-cols-1 gap-4 text-sm">
                        {selectedLog.requestUrl && (
                          <div>
                            <span className="font-medium text-muted-foreground">{t('ApiLogs.dialog.requestUrl')}</span>
                            <div className="mt-1 font-mono text-xs break-all">{selectedLog.requestUrl}</div>
                          </div>
                        )}
                        {selectedLog.apiStatus && (
                          <div>
                            <span className="font-medium text-muted-foreground">{t('ApiLogs.dialog.apiStatus')}</span>
                            <div className="mt-1">{selectedLog.apiStatus}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Request Payload */}
                  {selectedLog.requestPayload && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        📦 {t('ApiLogs.dialog.requestPayload')}
                      </h3>
                      <div className="bg-muted p-4 rounded-lg">
                        <pre className="text-xs overflow-auto">
                          {JSON.stringify(selectedLog.requestPayload, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* State Changes */}
                  {selectedLog.changes && selectedLog.changes.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        🔄 {t('ApiLogs.dialog.stateChanges')}
                      </h3>
                      <div className="space-y-2">
                        {selectedLog.changes.map((change, index) => (
                          <div key={index} className="border rounded-lg p-3 text-sm">
                            <div className="font-medium mb-2">{change.field}</div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-xs text-muted-foreground">{t('ApiLogs.dialog.oldValue')}</span>
                                <div className="mt-1 bg-muted p-2 rounded text-xs font-mono">
                                  {JSON.stringify(change.oldValue, null, 2)}
                                </div>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground">{t('ApiLogs.dialog.newValue')}</span>
                                <div className="mt-1 bg-muted p-2 rounded text-xs font-mono">
                                  {JSON.stringify(change.newValue, null, 2)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Error Details */}
                  {selectedLog.isError && selectedLog.errorDetails && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-destructive">
                        ❌ {t('ApiLogs.dialog.errorDetails')}
                      </h3>
                      <div className="border-destructive border rounded-lg p-4 bg-destructive/5">
                        <div className="space-y-3 text-sm">
                          {selectedLog.errorDetails.errorCode && (
                            <div>
                              <span className="font-medium text-muted-foreground">{t('ApiLogs.dialog.errorCode')}</span>
                              <div className="mt-1">{selectedLog.errorDetails.errorCode}</div>
                            </div>
                          )}
                          {selectedLog.errorDetails.errorMessage && (
                            <div>
                              <span className="font-medium text-muted-foreground">{t('ApiLogs.dialog.errorMessage')}</span>
                              <div className="mt-1">{selectedLog.errorDetails.errorMessage}</div>
                            </div>
                          )}
                          {selectedLog.errorDetails.stackTrace && (
                            <div>
                              <span className="font-medium text-muted-foreground">{t('ApiLogs.dialog.stackTrace')}</span>
                              <div className="mt-1 bg-muted p-2 rounded">
                                <pre className="text-xs overflow-auto">{selectedLog.errorDetails.stackTrace}</pre>
                              </div>
                            </div>
                          )}
                          {selectedLog.errorDetails.recoverable !== undefined && (
                            <div>
                              <span className="font-medium text-muted-foreground">{t('ApiLogs.dialog.recoverable')}</span>
                              <div className="mt-1">
                                {selectedLog.errorDetails.recoverable ? t('ApiLogs.dialog.yes') : t('ApiLogs.dialog.no')}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Related Entities */}
                  {selectedLog.relatedEntities && selectedLog.relatedEntities.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        🔗 {t('ApiLogs.dialog.relatedEntities')}
                      </h3>
                      <div className="space-y-2">
                        {selectedLog.relatedEntities.map((entity, index) => (
                          <div key={index} className="border rounded-lg p-3 text-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-xs text-muted-foreground">{t('ApiLogs.dialog.type')}</span>
                                <div className="mt-1 capitalize">{entity.entityType.replace('_', ' ')}</div>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground">{t('ApiLogs.dialog.id')}</span>
                                <div className="mt-1 font-mono text-xs">{entity.entityId}</div>
                              </div>
                              {entity.entityName && (
                                <div>
                                  <span className="text-xs text-muted-foreground">{t('ApiLogs.dialog.entityNameLabel')}</span>
                                  <div className="mt-1">{entity.entityName}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {selectedLog.tags && selectedLog.tags.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        🏷️ {t('ApiLogs.dialog.tags')}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedLog.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}