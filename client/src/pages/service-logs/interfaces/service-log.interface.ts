// ── Sub-types ──────────────────────────────────────────────────────────────

export interface IRepoCall {
  repoName: string;
  method: string;
  input?: Record<string, any>;
  response?: Record<string, any>;
  success: boolean;
  durationMs?: number;
  error?: { message: string };
}

export interface ILogMessage {
  text: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  timestamp: string;
  data?: Record<string, any>;
}

export interface IServiceError {
  message: string;
  stack?: string;
  code?: string | number;
}

export interface IServiceResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  meta?: any;
  timestamp?: string;
  requestId?: string;
}

// ── Main log shape ─────────────────────────────────────────────────────────

export interface IServiceLog {
  _id: string;
  requestId: string;
  timestamp: string;
  service: string;
  method: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  incomingData?: Record<string, any>;
  repoCalls: IRepoCall[];
  messages: ILogMessage[];
  serviceResponse?: IServiceResponse;
  error?: IServiceError;
  meta?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// ── Error summary ──────────────────────────────────────────────────────────

export interface IErrorSummaryItem {
  _id: { service: string; method: string };
  errorCount: number;
  lastSeen: string;
  sample?: IServiceError;
}

// ── Pagination meta ───────────────────────────────────────────────────────

export interface IPaginationMeta {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ── API response wrappers ──────────────────────────────────────────────────

export interface IServiceLogListResponse {
  success: boolean;
  message: string;
  data: IServiceLog[];
  meta?: IPaginationMeta;
  requestId?: string;
  timestamp?: string;
}

export interface IServiceLogDetailResponse {
  success: boolean;
  message: string;
  data: IServiceLog | null;
}

export interface IServiceLogTraceResponse {
  success: boolean;
  message: string;
  data: IServiceLog[];
}

export interface IErrorSummaryResponse {
  success: boolean;
  message: string;
  data: IErrorSummaryItem[];
}

// ── Query params ───────────────────────────────────────────────────────────

export interface IServiceLogQueryParams {
  page?: number;
  limit?: number;
  service?: string;
  method?: string;
  level?: 'info' | 'warn' | 'error' | 'debug';
  requestId?: string;
  repoName?: string;
  repoSuccess?: boolean;
  messageText?: string;
  fromDate?: string;
  toDate?: string;
}
