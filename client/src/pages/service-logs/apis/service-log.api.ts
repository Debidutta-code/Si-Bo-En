import createAxiosInstance from '@/components/axiosInstance';
import type {
  IServiceLogListResponse,
  IServiceLogDetailResponse,
  IServiceLogTraceResponse,
  IErrorSummaryResponse,
  IServiceLogQueryParams,
} from '../interfaces';

const axios = createAxiosInstance();

// ── Get paginated / filtered logs ──────────────────────────────────────────

export const getServiceLogs = async (
  params: IServiceLogQueryParams = {}
): Promise<IServiceLogListResponse> => {
  try {
    const { page = 1, limit = 25, ...rest } = params;
    const response = await axios.get('/service-logs', {
      params: { page, limit, ...rest },
    });
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) return error.response.data;
    return {
      success: false,
      message: error?.message || 'Failed to fetch service logs',
      data: [],
    };
  }
};

// ── Get single log by ID ───────────────────────────────────────────────────

export const getServiceLogById = async (
  id: string
): Promise<IServiceLogDetailResponse> => {
  try {
    const response = await axios.get(`/service-logs/${id}`);
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) return error.response.data;
    return {
      success: false,
      message: error?.message || 'Failed to fetch log',
      data: null,
    };
  }
};

// ── Get full trace for a requestId ─────────────────────────────────────────

export const getRequestTrace = async (
  requestId: string
): Promise<IServiceLogTraceResponse> => {
  try {
    const response = await axios.get(`/service-logs/trace/${requestId}`);
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) return error.response.data;
    return {
      success: false,
      message: error?.message || 'Failed to fetch request trace',
      data: [],
    };
  }
};

// ── Get error summary ──────────────────────────────────────────────────────

export const getErrorSummary = async (): Promise<IErrorSummaryResponse> => {
  try {
    const response = await axios.get('/service-logs/errors/summary');
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) return error.response.data;
    return {
      success: false,
      message: error?.message || 'Failed to fetch error summary',
      data: [],
    };
  }
};

// ── Delete a log ───────────────────────────────────────────────────────────

export const deleteServiceLog = async (
  id: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.delete(`/service-logs/${id}`);
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) return error.response.data;
    return { success: false, message: error?.message || 'Failed to delete log' };
  }
};
