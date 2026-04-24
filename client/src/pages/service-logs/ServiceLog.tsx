import { useState } from 'react';
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

// ─── Level badge ─────────────────────────────────────────────────────────────

function LevelBadge({ level }: { level: IServiceLog['level'] }) {
  return (
    <Badge variant="outline" className={`${getLevelColor(level)} capitalize font-medium`}>
      <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${getLevelDot(level)}`} />
      {level}
    </Badge>
  );
}

// ─── Repo calls mini-table ────────────────────────────────────────────────────

function RepoCallsTable({ calls }: { calls: IServiceLog['repoCalls'] }) {
  if (!calls?.length) return <p className="text-sm text-muted-foreground">No repo calls recorded.</p>;
  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Repo</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {calls.map((c, i) => (
            <TableRow key={i}>
              <TableCell className="font-mono text-xs">{c.repoName}</TableCell>
              <TableCell className="font-mono text-xs">{c.method}</TableCell>
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
  if (!log) return null;
  const { date, time } = formatTs(log.timestamp);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LevelBadge level={log.level} />
            <span className="font-mono text-sm text-muted-foreground">{log.service}</span>
            <span className="text-muted-foreground">›</span>
            <span className="font-mono text-sm">{log.method}</span>
          </DialogTitle>
          <DialogDescription>
            {date} at {time} — requestId: <span className="font-mono">{log.requestId}</span>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[65vh] pr-4">
          <div className="space-y-6">

            {/* Error block */}
            {log.error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <h3 className="mb-2 flex items-center gap-2 font-semibold text-red-700">
                  <XCircle className="h-4 w-4" /> Error
                </h3>
                <p className="text-sm font-medium text-red-800">{log.error.message}</p>
                {log.error.code && (
                  <p className="text-xs text-red-600 mt-1">Code: {log.error.code}</p>
                )}
                {log.error.stack && (
                  <pre className="mt-2 overflow-auto rounded bg-red-100 p-3 text-xs text-red-700 whitespace-pre-wrap">
                    {log.error.stack}
                  </pre>
                )}
              </div>
            )}

            {/* Messages */}
            {log.messages?.length > 0 && (
              <div>
                <h3 className="mb-3 font-semibold">Messages</h3>
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

            {/* Repo calls */}
            <div>
              <h3 className="mb-3 font-semibold">Repository Calls</h3>
              <RepoCallsTable calls={log.repoCalls} />
            </div>

            {/* Incoming data */}
            {log.incomingData && (
              <div>
                <h3 className="mb-3 font-semibold">Incoming Data</h3>
                <pre className="overflow-auto rounded-md bg-muted p-4 text-xs whitespace-pre-wrap">
                  {JSON.stringify(log.incomingData, null, 2)}
                </pre>
              </div>
            )}

            {/* Service response */}
            {log.serviceResponse && (
              <div>
                <h3 className="mb-3 font-semibold">Service Response</h3>
                <pre className="overflow-auto rounded-md bg-muted p-4 text-xs whitespace-pre-wrap">
                  {JSON.stringify(log.serviceResponse, null, 2)}
                </pre>
              </div>
            )}

            {/* Meta */}
            {log.meta && (
              <div>
                <h3 className="mb-3 font-semibold">Meta</h3>
                <pre className="overflow-auto rounded-md bg-muted p-4 text-xs whitespace-pre-wrap">
                  {JSON.stringify(log.meta, null, 2)}
                </pre>
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
  const { data, isLoading } = useErrorSummary();
  const items = data?.data ?? [];

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold">
          <BarChart3 className="h-4 w-4 text-red-500" /> Error Summary
        </h3>
        <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
      </div>
      {isLoading ? (
        <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">🎉 No errors recorded.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
              <div>
                <span className="font-mono font-medium">{item._id.service}</span>
                <span className="mx-1 text-muted-foreground">›</span>
                <span className="font-mono">{item._id.method}</span>
              </div>
              <Badge variant="destructive">{item.errorCount} errors</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ServiceLog() {
  const [params, setParams] = useState<IServiceLogQueryParams>({ page: 1, limit: 20 });
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState<IServiceLog | null>(null);
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  const { data, isLoading, isError, error, refetch } = useServiceLogs(params, true);
  const { mutate: deleteLog } = useDeleteServiceLog();

  // Real shape: data.data = IServiceLog[], data.meta = IPaginationMeta
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
          <h1 className="text-3xl font-bold tracking-tight">Service Logs</h1>
          <p className="text-muted-foreground mt-1">
            Internal service call traces, messages, and repo interactions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowErrorSummary((v) => !v)}
          >
            <BarChart3 className="h-4 w-4 mr-2 text-red-500" />
            Error Summary
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error summary panel */}
      {showErrorSummary && <ErrorSummaryPanel onClose={() => setShowErrorSummary(false)} />}

      {/* Stats */}
      {meta && (
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: 'Total Logs', value: meta.totalCount, icon: '📊' },
            { label: 'Current Page', value: meta.currentPage, icon: '📄' },
            { label: 'Total Pages', value: meta.totalPages, icon: '📑' },
            { label: 'Per Page', value: limit, icon: '⚙️' },
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
              <CardTitle>Service Trace Log</CardTitle>
              <CardDescription>All recorded service calls, ordered by newest first</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative w-56">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="service-log-search"
                  placeholder="Search service, method…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              {/* Level filter */}
              <Select onValueChange={setLevel} defaultValue="all">
                <SelectTrigger className="w-28" id="service-log-level-filter">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All levels</SelectItem>
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
              <span className="ml-2 text-muted-foreground">Loading logs…</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold">Failed to load logs</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {error?.message || 'An error occurred while fetching service logs'}
              </p>
              <Button onClick={() => refetch()} variant="outline" className="mt-4">Try Again</Button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="text-6xl mb-4">🔍</span>
              <h3 className="text-lg font-semibold">No Logs Found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {search ? 'Try adjusting your search or filters.' : 'No service logs recorded yet.'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Timestamp</TableHead>
                    <TableHead className="w-[90px]">Level</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="w-[80px] text-center">Repos</TableHead>
                    <TableHead className="w-[80px] text-center">Msgs</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
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
                Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, meta.totalCount)} of{' '}
                {meta.totalCount.toLocaleString()} logs
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
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
                  Next <ChevronRight className="h-4 w-4 ml-1" />
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
