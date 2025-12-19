// controllers/ActivityController.ts

import { Response } from 'express';
import { CustomRequest } from '../../utils/customRequest';
import { ActivityService } from '../services/activity.service';
import {
  GetActivitiesRequest,
  DateRangeFilter,
  ActivityFilters
} from '../types/types';
import { errorResponse } from '../../utils/return';
import { Types } from 'mongoose';

class ActivityController {


  public static async getActivities(req: CustomRequest, res: Response) {
    try {
      const {
        filters,
        page = 1,
        itemsPerPage = 10,
        sortBy,
        sortOrder,
        startDate,
        endDate,
      } = req.query;

      // Safely parse filters
      let parsedFilters: ActivityFilters = {};

      if (typeof filters === 'object' && filters !== null && !Array.isArray(filters)) {
        // Copy only valid filter fields (optional: whitelist keys for security)
        parsedFilters = { ...filters };
      }

      // Add dateRange if present
      if (startDate || endDate) {
        parsedFilters.dateRange = {
          startDate: startDate ? new Date(startDate as string) : undefined,
          endDate: endDate ? new Date(endDate as string) : undefined,
        };
      }

      const request: GetActivitiesRequest = {
        filters: parsedFilters,
        page: Number(page),
        itemsPerPage: Number(itemsPerPage),
        sortBy: sortBy as any,
        sortOrder: sortOrder as any,
      };

      const result = await ActivityService.getActivities(request);
      return res.status(200).json(result);
    } catch (error) {
      return res
        .status(500)
        .json(errorResponse('Failed to retrieve activities', (error as Error)?.message));
    }
  }
  public static async getActivityById(req: CustomRequest, res: Response) {
    try {
      const { id } = req.params;
      const result = await ActivityService.getActivityById(id);
      return res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      return res
        .status(500)
        .json(errorResponse('Internal server error', (error as Error)?.message));
    }
  }
  //
  public static async searchActivities(req: CustomRequest, res: Response) {
    try {
      const { term, page = 1, limit = 10 } = req.query;

      if (!term || (term as string).trim().length < 2) {
        return res.status(400).json(errorResponse('Search term must be at least 2 characters'));
      }

      const result = await ActivityService.searchActivities(
        term as string,
        Number(page),
        Number(limit)
      );
      return res.status(200).json(result);
    } catch (error) {
      return res
        .status(500)
        .json(errorResponse('Search failed', (error as Error)?.message));
    }
  }
  //
  public static async getBookingActivitiesByStatus(req: CustomRequest, res: Response) {
    try {
      const { status } = req.params;
      const { startDate, endDate, page = 1, limit = 10 } = req.query;

      const dateRange: DateRangeFilter | undefined = (startDate || endDate)
        ? {
          startDate: startDate ? new Date(startDate as string) : undefined,
          endDate: endDate ? new Date(endDate as string) : undefined,
        }
        : undefined;

      const result = await ActivityService.getBookingActivities(
        status as any,
        dateRange,
        Number(page),
        Number(limit)
      );
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json(
        errorResponse('Failed to retrieve booking activities', (error as Error)?.message)
      );
    }
  }
  //
  public static async getActivitiesByProperty(req: CustomRequest, res: Response) {
    try {
      const { propertyCode } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const result = await ActivityService.getActivitiesByProperty(
        propertyCode,
        Number(page),
        Number(limit)
      );
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json(
        errorResponse('Failed to retrieve property activities', (error as Error)?.message)
      );
    }
  }
  //
  public static async getUserActivityHistory(req: CustomRequest, res: Response) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const result = await ActivityService.getUserActivityHistory(
        userId,
        Number(page),
        Number(limit)
      );
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json(
        errorResponse('Failed to retrieve user activity history', (error as Error)?.message)
      );
    }
  }
  //
  public static async getRecentActivities(req: CustomRequest, res: Response) {
    try {
      const { hours = 24, page = 1, limit = 10 } = req.query;

      const result = await ActivityService.getRecentActivities(
        Number(hours),
        Number(page),
        Number(limit)
      );
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json(
        errorResponse('Failed to retrieve recent activities', (error as Error)?.message)
      );
    }
  }
  //
  public static async getActivityStats(req: CustomRequest, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      const dateRange: DateRangeFilter | undefined = (startDate || endDate)
        ? {
          startDate: startDate ? new Date(startDate as string) : undefined,
          endDate: endDate ? new Date(endDate as string) : undefined,
        }
        : undefined;

      const result = await ActivityService.getActivityStatistics(dateRange);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json(
        errorResponse('Failed to retrieve activity statistics', (error as Error)?.message)
      );
    }
  }
  //
  public static async deleteActivity(req: CustomRequest, res: Response) {
    try {
      const id = req.params.id;
      if (!id) {
        return res.status(200).json(errorResponse("Activity Id is Not provides"))
      }
      const serRes = await ActivityService.deleteActivity(new Types.ObjectId(id))
      return res.status(serRes.success ? 200 : 400).json(serRes)
    } catch (error) {
      return res.status(500).json(
        errorResponse('Failed to delete activity', (error as Error)?.message)
      );
    }
  }
}

export default ActivityController;