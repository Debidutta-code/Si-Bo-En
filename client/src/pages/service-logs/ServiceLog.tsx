import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useServiceLogs,
  useErrorSummary,
  useDeleteServiceLog,
  getLevelColor,
  getLevelDot,
  formatDuration,
  formatTs,
} from './services';
import type { IServiceLog, IServiceLogQueryParams } from './interfaces';

import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Loader2, RefreshCw, ChevronLeft, ChevronRight,
  Search, AlertCircle, Eye, Trash2, BarChart3,
  CheckCircle2, XCircle,
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

// ─── Level badge ─────────────────────────────────────────────────────────────

function LevelBadge({ level }: { level: IServiceLog['level'] }) {
  return (
    <Badge variant="outline" className={`${getLevelColor(level)} capitalize font-medium`}>
      <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${getLevelDot(level)}`} />
      {level}
    </Badge>
  );
}

// ─── Repo calls table ─────────────────────────────────────────────────────────

function RepoCallsTable({ calls }: { calls: IServiceLog['repoCalls'] }) {
  const { t } = useTranslation();

  if (!calls?.length) return (
    <p className="text-sm text-muted-foreground">{t('ServiceLog.repoCalls.noRecords')}</p>
  );

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('ServiceLog.repoCalls.repo')}</TableHead>
            <TableHead>{t('ServiceLog.repoCalls.method')}</TableHead>
            <TableHead>{t('ServiceLog.repoCalls.inputSent')}</TableHead>
            <TableHead>{t('ServiceLog.repoCalls.responseReceived')}</TableHead>
            <TableHead>{t('ServiceLog.repoCalls.duration')}</TableHead>
            <TableHead>{t('ServiceLog.repoCalls.status')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {calls.map((c, i) => (
            <TableRow key={i}>
              <TableCell className="font-mono text-xs">{c.repoName}</TableCell>
              <TableCell className="font-mono text-xs">{c.method}</TableCell>
              <TableCell>
                <pre className="overflow-auto rounded bg-muted p-2 text-xs whitespace-pre-wrap max-h-24">
                  {JSON.stringify(c.input, null, 2)}
                </pre>
              </TableCell>
              <TableCell>
                <pre className="overflow-auto rounded bg-muted p-2 text-xs whitespace-pre-wrap max-h-24">
                  {c.response ? JSON.stringify(c.response, null, 2) : c.error ? JSON.stringify(c.error, null, 2) : '—'}
                </pre>
              </TableCell>
              <TableCell className="text-xs">{formatDuration(c.durationMs)}</TableCell>
              <TableCell>
                {c.success
                  ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                  : <XCircle className="h-4 w-4 text-red-500" />}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ─── Log detail dialog ────────────────────────────────────────────────────────

function LogDetailDialog({
  log,
  open,
  onClose,
}: {
  log: IServiceLog | null;
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  if (!log) return null;
  const { date, time } = formatTs(log.timestamp);
const handleDownloadTxt = () => {
    const txt = JSON.stringify(log, null, 2);
    const blob = new Blob([txt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `service-log-${log.requestId ?? log._id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LevelBadge level={log.level} />
            <span className="font-mono text-sm text-muted-foreground">{log.service}</span>
            <span className="text-muted-foreground">›</span>
            <span className="font-mono text-sm">{log.method}</span>
          <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadTxt}
            >
              ⬇ TXT
            </Button>
          </DialogTitle>

          <DialogDescription>
            {date} {t('ServiceLog.dialog.at')} {time} — {t('ServiceLog.dialog.requestId')}{' '}
            <span className="font-mono">{log.requestId}</span>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[65vh] pr-4">
          <div className="space-y-6">

            {/* 1. Incoming Data */}
            {log.incomingData && (
              <div>
                <h3 className="mb-3 font-semibold">{t('ServiceLog.dialog.incomingData')}</h3>
                <pre className="overflow-auto rounded-md bg-muted p-4 text-xs whitespace-pre-wrap">
                  {JSON.stringify(log.incomingData, null, 2)}
                </pre>
              </div>
            )}

            {/* 2. Repository Calls */}
            <div>
              <h3 className="mb-3 font-semibold">{t('ServiceLog.dialog.repositoryCalls')}</h3>
              <RepoCallsTable calls={log.repoCalls} />
            </div>

            {/* 3. Messages */}
            {log.messages?.length > 0 && (
              <div>
                <h3 className="mb-3 font-semibold">{t('ServiceLog.dialog.messages')}</h3>
                <div className="space-y-2">
                  {log.messages.map((m, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-md border p-3 text-sm">
                      <LevelBadge level={m.level} />
                      <div className="flex-1 min-w-0">
                        <p>{m.text}</p>
                        {m.data && (
                          <pre className="mt-1 overflow-auto rounded bg-muted p-2 text-xs whitespace-pre-wrap">
                            {JSON.stringify(m.data, null, 2)}
                          </pre>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTs(m.timestamp).time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Service Response */}
            {log.serviceResponse && (
              <div>
                <h3 className="mb-3 font-semibold">{t('ServiceLog.dialog.serviceResponse')}</h3>
                <pre className="overflow-auto rounded-md bg-muted p-4 text-xs whitespace-pre-wrap">
                  {JSON.stringify(log.serviceResponse, null, 2)}
                </pre>
              </div>
            )}

            {/* 5. Meta */}
            {log.meta && (
              <div>
                <h3 className="mb-3 font-semibold">{t('ServiceLog.dialog.meta')}</h3>
                <pre className="overflow-auto rounded-md bg-muted p-4 text-xs whitespace-pre-wrap">
                  {JSON.stringify(log.meta, null, 2)}
                </pre>
              </div>
            )}

            {/* 6. Error — always last */}
            {log.error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <h3 className="mb-2 flex items-center gap-2 font-semibold text-red-700">
                  <XCircle className="h-4 w-4" /> {t('ServiceLog.dialog.error')}
                </h3>
                <p className="text-sm font-medium text-red-800">{log.error.message}</p>
                {log.error.code && (
                  <p className="text-xs text-red-600 mt-1">
                    {t('ServiceLog.dialog.code')} {log.error.code}
                  </p>
                )}
                {log.error.stack && (
                  <pre className="mt-2 overflow-auto rounded bg-red-100 p-3 text-xs text-red-700 whitespace-pre-wrap">
                    {log.error.stack}
                  </pre>
                )}
              </div>
            )}

          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// ─── Error summary panel ──────────────────────────────────────────────────────

function ErrorSummaryPanel({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const { data, isLoading } = useErrorSummary();
  const items = data?.data ?? [];

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold">
          <BarChart3 className="h-4 w-4 text-red-500" /> {t('ServiceLog.errorSummaryPanel.title')}
        </h3>
        <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
      </div>
      {isLoading ? (
        <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> {t('ServiceLog.errorSummaryPanel.loading')}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          {t('ServiceLog.errorSummaryPanel.noErrors')}
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
              <div>
                <span className="font-mono font-medium">{item._id.service}</span>
                <span className="mx-1 text-muted-foreground">›</span>
                <span className="font-mono">{item._id.method}</span>
              </div>
              <Badge variant="destructive">
                {item.errorCount} {t('ServiceLog.errorSummaryPanel.errors')}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ServiceLog() {
  const { t } = useTranslation();
  const [params, setParams] = useState<IServiceLogQueryParams>({ page: 1, limit: 20 });
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState<IServiceLog | null>(null);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [searchParams] = useSearchParams();

  const { data, isLoading, isError, error, refetch } = useServiceLogs(params, true);
  const { mutate: deleteLog } = useDeleteServiceLog();

  const logs: IServiceLog[] = data?.data ?? [];
  const meta = data?.meta;
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;

  const filtered = logs.filter((log) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      log.service?.toLowerCase().includes(q) ||
      log.method?.toLowerCase().includes(q) ||
      log.requestId?.toLowerCase().includes(q) ||
      log.level?.toLowerCase().includes(q)
    );
  });
  useEffect(() => {
    const queryPage = searchParams.get('page');
    if (queryPage) setPage(Number(queryPage));
  }, []);

  const setPage = (p: number) => setParams((prev) => ({ ...prev, page: p }));
  const setLimit = (l: string) => setParams((prev) => ({ ...prev, limit: parseInt(l), page: 1 }));
  const setLevel = (v: string) =>
    setParams((prev) => ({
      ...prev,
      level: v === 'all' ? undefined : (v as IServiceLogQueryParams['level']),
      page: 1,
    }));

  return (
    <div className="container mx-auto p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('ServiceLog.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('ServiceLog.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowErrorSummary((v) => !v)}
          >
            <BarChart3 className="h-4 w-4 mr-2 text-red-500" />
            {t('ServiceLog.errorSummaryBtn')}
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {t('ServiceLog.refresh')}
          </Button>
        </div>
      </div>

      {/* Error summary panel */}
      {showErrorSummary && <ErrorSummaryPanel onClose={() => setShowErrorSummary(false)} />}

      {/* Stats */}
      {meta && (
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: t('ServiceLog.stats.totalLogs'), value: meta.totalCount, icon: '📊' },
            { label: t('ServiceLog.stats.currentPage'), value: meta.currentPage, icon: '📄' },
            { label: t('ServiceLog.stats.totalPages'), value: meta.totalPages, icon: '📑' },
            { label: t('ServiceLog.stats.perPage'), value: limit, icon: '⚙️' },
          ].map(({ label, value, icon }) => (
            <Card key={label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{label}</CardTitle>
                <span className="text-xl">{icon}</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Main Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('ServiceLog.card.title')}</CardTitle>
              <CardDescription>{t('ServiceLog.card.description')}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative w-56">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="service-log-search"
                  placeholder={t('ServiceLog.searchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              {/* Level filter */}
              <Select onValueChange={setLevel} defaultValue="all">
                <SelectTrigger className="w-28" id="service-log-level-filter">
                  <SelectValue placeholder={t('ServiceLog.allLevels')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('ServiceLog.allLevels')}</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warn">Warn</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="debug">Debug</SelectItem>
                </SelectContent>
              </Select>
              {/* Per page */}
              <Select value={limit.toString()} onValueChange={setLimit}>
                <SelectTrigger className="w-20" id="service-log-limit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['10', '20', '50', '100'].map((v) => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">{t('ServiceLog.loadingLogs')}</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold">{t('ServiceLog.failedToLoad')}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {error?.message || t('ServiceLog.errorFetching')}
              </p>
              <Button onClick={() => refetch()} variant="outline" className="mt-4">
                {t('ServiceLog.tryAgain')}
              </Button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="text-6xl mb-4">🔍</span>
              <h3 className="text-lg font-semibold">{t('ServiceLog.noLogsFound')}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {search ? t('ServiceLog.tryAdjusting') : t('ServiceLog.noLogsYet')}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">{t('ServiceLog.columns.timestamp')}</TableHead>
                    <TableHead className="w-[90px]">{t('ServiceLog.columns.level')}</TableHead>
                    <TableHead>{t('ServiceLog.columns.service')}</TableHead>
                    <TableHead>{t('ServiceLog.columns.method')}</TableHead>
                    <TableHead className="w-[80px] text-center">{t('ServiceLog.columns.repos')}</TableHead>
                    <TableHead className="w-[80px] text-center">{t('ServiceLog.columns.msgs')}</TableHead>
                    <TableHead className="w-[80px]">{t('ServiceLog.columns.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((log) => {
                    const { date, time } = formatTs(log.timestamp);
                    const hasError = log.level === 'error';
                    return (
                      <TableRow
                        key={log._id}
                        className={hasError ? 'bg-red-50/40 hover:bg-red-50/60' : undefined}
                      >
                        <TableCell className="font-mono text-xs">
                          <div>{date}</div>
                          <div className="text-muted-foreground">{time}</div>
                        </TableCell>
                        <TableCell><LevelBadge level={log.level} /></TableCell>
                        <TableCell className="font-mono text-sm">{log.service}</TableCell>
                        <TableCell className="font-mono text-sm">{log.method}</TableCell>
                        <TableCell className="text-center text-sm">
                          <span className="font-medium">{log.repoCalls?.length ?? 0}</span>
                          {(log.repoCalls ?? []).some((r) => !r.success) && (
                            <XCircle className="inline ml-1 h-3 w-3 text-red-400" />
                          )}
                        </TableCell>
                        <TableCell className="text-center text-sm">
                          {log.messages?.length ?? 0}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              id={`view-log-${log._id}`}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => setSelectedLog(log)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              id={`delete-log-${log._id}`}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              onClick={() => deleteLog(log._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {t('ServiceLog.showing', {
                  from: ((page - 1) * limit) + 1,
                  to: Math.min(page * limit, meta.totalCount),
                  total: meta.totalCount.toLocaleString(),
                })}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> {t('ServiceLog.previous')}
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                    let p: number;
                    if (meta.totalPages <= 5) p = i + 1;
                    else if (page <= 3) p = i + 1;
                    else if (page >= meta.totalPages - 2) p = meta.totalPages - 4 + i;
                    else p = page - 2 + i;
                    return (
                      <Button
                        key={p}
                        variant={page === p ? 'default' : 'outline'}
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === meta.totalPages}
                >
                  {t('ServiceLog.next')} <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail dialog */}
      <LogDetailDialog
        log={selectedLog}
        open={!!selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
}