import { ActivityV2, IActivity } from '../model/activity.model';
import { ICreateActivityInput, IBulkCreateActivityInput } from '../types/types';


export class ActivityRepository {
  
  async create(input: ICreateActivityInput): Promise<IActivity | null> {
    try {
      const activity = new ActivityV2(input);
      await activity.save();
      return activity;
    } catch (error) {
      console.error('ActivityRepository.create error:', error);
      return null;
    }
  }
  

  
  async fetchAll(page: number = 1, limit: number = 25): Promise<{
    data: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      
      const [data, total] = await Promise.all([
        ActivityV2.find()
          .sort({ timestamp: -1 }) // Latest first
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        ActivityV2.countDocuments()
      ]);
      
      const totalPages = Math.ceil(total / limit);
      
      return {
        data,
        total,
        page,
        limit,
        totalPages
      };
    } catch (error) {
      console.error('ActivityRepository.fetchAll error:', error);
      throw error;
    }
  }
}

export const activityRepository = new ActivityRepository();