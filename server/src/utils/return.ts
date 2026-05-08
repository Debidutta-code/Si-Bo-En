// responses.ts
import { IApiResponse, IPaginationMeta } from './return.types';

export function successResponse<T = any>(
    message: string,
    data?: T,
    meta?: any,
    requestId?: string
): IApiResponse<T> {
    return {
        success: true,
        message,
        data,
        meta,
        timestamp: new Date().toISOString(),
        requestId,
    };
}

export function errorResponse<T = any>(
    message: string,
    error?: string,
    data?: T,
    meta?: any,
    requestId?: string
): IApiResponse<T> {
    return {
        success: false,
        message,
        error,
        data,
        meta,
        timestamp: new Date().toISOString(),
        requestId,
    };
}

export function generatePaginationMeta(
    currentPage: number,
    totalPages: number,
    totalCount: number,
    limit: number
): IPaginationMeta {
    return {
        currentPage,
        totalPages,
        totalCount,
        limit,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
    };
}

export function paginatedSuccessResponse<T = any>(
    message: string,
    data: T[],
    pagination: IPaginationMeta,
    requestId?: string
): IApiResponse<T[]> {
    return successResponse(message, data, pagination, requestId);
}
export function paginatedErrorResponse<T = any>(
    message: string,
    error: string,
    pagination: IPaginationMeta,
    data?: T[],
    requestId?: string
): IApiResponse<T[]> {
    return errorResponse(message, error, data, pagination, requestId);
}
export interface IPaginatedResponse<T> {
    data: T[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalResults: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        resultsPerPage: number;
    };
}
