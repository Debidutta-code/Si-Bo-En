import { DashBoardServices } from "../services";
import { CustomRequest, PropertyCustomRequest } from "../../utils/customRequest";
import { successResponse, errorResponse } from "../../utils/return";
import { Response } from "express";
export class DashBoardController {
    private dashboardServices: DashBoardServices;
    constructor() {
        this.dashboardServices = new DashBoardServices();

    }
    public async getAnalytics(req: PropertyCustomRequest, res: Response): Promise<Response> {
        try {
            if (!req.user?.creationId || !req.user.level) {
                return res.status(400).json(errorResponse("user is not Assigned to any creation", "Creation Id Not found"));
            }
            const { propertyId, propertyCode, propertyName } = req.query
            const serRes = await this.dashboardServices.getPropertyIdsAndCodesServices(req.user.creationId, req.user.level, propertyId && propertyId.toString(), propertyCode && propertyCode.toString(), propertyName && propertyName.toString())
            return res.status(serRes.success ? 200 : 400).json(serRes)
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to fetch Analytics", error.message))
            }
            return res.status(500).json(errorResponse("Internal Server Error"))
        }
    }
    public async getPropertyNames(req: CustomRequest, res: Response): Promise<Response> {
        try {
            if (!req.user?.creationId || !req.user.level) {
                return res.status(400).json(errorResponse("user is not Assigned to any creation", "Creation Id Not found"));
            }
            const serRes = await this.dashboardServices.getPropertyNames(req.user.creationId, req.user.level)
            return res.status(serRes.success ? 200 : 400).json(serRes)
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to fetch Analytics", error.message))
            }
            return res.status(500).json(errorResponse("Internal Server Error"))
        }
    }
    public async getStatisticsComparison(req: PropertyCustomRequest, res: Response): Promise<Response> {
  try {
    if (!req.user?.creationId || req.user.level === undefined) {
      return res.status(400).json(errorResponse("User is not assigned to any creation", "Creation ID not found"));
    }
    
    const { 
      comparisonType = 'date', 
      selectedDate = new Date().toISOString(),
      propertyId, 
      propertyCode, 
      propertyName 
    } = req.query;
    
    // Validate comparison type
    if (!['date', 'month', 'year'].includes(comparisonType as string)) {
      return res.status(400).json(errorResponse("Invalid comparison type", "Must be 'date', 'month', or 'year'"));
    }
    
    const serRes = await this.dashboardServices.getStatisticsComparisonServices(
      req.user.creationId,
      req.user.level,
      comparisonType as 'date' | 'month' | 'year',
      new Date(selectedDate as string),
      propertyId?.toString(),
      propertyCode?.toString(),
      propertyName?.toString()
    );
    
    return res.status(serRes.success ? 200 : 400).json(serRes);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json(errorResponse("Failed to fetch statistics comparison", error.message));
    }
    return res.status(500).json(errorResponse("Internal Server Error"));
  }
}

}
