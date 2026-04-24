import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import {
  getServiceLogs,
  getServiceLogById,
  getRequestTrace,
  getErrorSummary,
  deleteServiceLog,
} from '../apis';
import type {
  IServiceLog,
  IServiceLogQueryParams,
  IServiceLogListResponse,
  IErrorSummaryResponse,
  IServiceLogTraceResponse,
} from '../interfaces';

// ── Hook: paginated log list ───────────────────────────────────────────────

export const useServiceLogs = (
  params: IServiceLogQueryParams = {},
  enabled = true
): UseQueryResult<IServiceLogListResponse, Error> =>
  useQuery({
    queryKey: ['serviceLogs', params],
    queryFn: () => getServiceLogs(params),
    enabled,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

// ── Hook: single log detail ────────────────────────────────────────────────

export const useServiceLogById = (id: string | null) =>
  useQuery({
    queryKey: ['serviceLog', id],
    queryFn: () => getServiceLogById(id!),
    enabled: !!id,
    staleTime: 60_000,
  });

// ── Hook: request trace ────────────────────────────────────────────────────

export const useRequestTrace = (
  requestId: string | null
): UseQueryResult<IServiceLogTraceResponse, Error> =>
  useQuery({
    queryKey: ['serviceLogTrace', requestId],
    queryFn: () => getRequestTrace(requestId!),
    enabled: !!requestId,
    staleTime: 60_000,
  });

// ── Hook: error summary ────────────────────────────────────────────────────

export const useErrorSummary = (): UseQueryResult<IErrorSummaryResponse, Error> =>
  useQuery({
    queryKey: ['serviceLogErrorSummary'],
    queryFn: getErrorSummary,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

// ── Mutation: delete log ───────────────────────────────────────────────────

export const useDeleteServiceLog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteServiceLog(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['serviceLogs'] });
    },
  });
};

// ── Helpers ────────────────────────────────────────────────────────────────

export const getLevelColor = (level: IServiceLog['level']): string => {
  switch (level) {
    case 'error': return 'text-red-600 bg-red-50 border-red-200';
    case 'warn':  return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'debug': return 'text-purple-600 bg-purple-50 border-purple-200';
    default:      return 'text-blue-600 bg-blue-50 border-blue-200';
  }
};

export const getLevelDot = (level: IServiceLog['level']): string => {
  switch (level) {
    case 'error': return 'bg-red-500';
    case 'warn':  return 'bg-yellow-500';
    case 'debug': return 'bg-purple-500';
    default:      return 'bg-blue-500';
  }
};

export const formatDuration = (ms?: number): string =>
  ms == null ? '-' : ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`;

export const formatTs = (ts: string): { date: string; time: string } => {
  const d = new Date(ts);
  return {
    date: d.toLocaleDateString(),
    time: d.toLocaleTimeString(),
  };
};
