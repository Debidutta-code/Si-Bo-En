import "express";
import { IPaginationMeta } from "../utils/return.types";

declare global {
  namespace Express {
    interface Response {
      apiSuccess: <T>(
        message: string,
        data?: T,
        meta?: any
      ) => this;

      apiError: (
        message: string,
        error?: string,
        statusCode?: number,
        data?: any,
        meta?: any
      ) => this;

      apiPaginatedSuccess: <T>(
        message: string,
        data: T[],
        pagination: IPaginationMeta
      ) => this;
    }
  }
}
