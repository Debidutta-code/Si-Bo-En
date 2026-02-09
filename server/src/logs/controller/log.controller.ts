import { Request, Response } from 'express';
import { activityService } from '../services/logs.services';
import { ICreateActivityInput, IBulkCreateActivityInput } from '../types/types';


export class ActivityController {
  
  async createActivity(req: Request, res: Response) {
    try {
      const activityData: ICreateActivityInput = req.body;
      
      const result = await activityService.logActivity(activityData);
      
      return res.status(result.success ? 201 : 400).json(result);
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
  

  
  async getAllActivities(req: Request, res: Response) {
    try {
      let page = parseInt(req.query.page as string) || 1;
      let limit = parseInt(req.query.limit as string) || 25;
      
     
      if(page<1)page=1;
        if(limit<1)limit=1;
        if(limit>100)limit=100;
      
      const result = await activityService.getAllActivities(page, limit);
      
      return res.status(result.success ? 200 : 500).json(result);
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
}

export const activityController = new ActivityController();