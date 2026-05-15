export interface IApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
    meta?: any;
    timestamp?: string;
    requestId?: string;
}

export interface IPaginationMeta {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}
