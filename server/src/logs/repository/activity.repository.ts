import { Types, FilterQuery } from 'mongoose';
import  Activity  from '../model/activity.model';
import type{ 
    IActivityDocument,
    ActivityFilters,
    CreateActivityData,
    DateRangeFilter,
    PaginatedResult
    
} from '../types/types';


 class ActivityDAO {
    
    public static async createActivity(activityData: CreateActivityData): Promise<IActivityDocument> {
        try {
            const activity = new Activity({
                ...activityData,
                timestamp: new Date()
            });

            const savedActivity = await activity.save();
            return savedActivity;
        } catch (error) {
            throw new Error(`Failed to create activity: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    public static async getActivities(
        filters: ActivityFilters = {},
        page: number = 1,
        itemsPerPage: number = 10
    ): Promise<PaginatedResult<IActivityDocument>> {
        try {
            // Validate pagination parameters
            if (page < 1) page = 1;
            if (itemsPerPage < 1) itemsPerPage = 10;
            if (itemsPerPage > 100) itemsPerPage = 100; // Limit max items per page

            const skip = (page - 1) * itemsPerPage;
            
            // Build query filter
            const query = this.buildQueryFilter(filters);
            
            // Execute query with pagination
            const [data, total] = await Promise.all([
                Activity.find(query)
                    .populate('initiatedBy', 'firstName lastName email role')
                    .sort({ timestamp: -1 }) // Most recent first
                    .skip(skip)
                    .limit(itemsPerPage)
                    .lean(),
                Activity.countDocuments(query)
            ]);

            const totalPages = Math.ceil(total / itemsPerPage);

            return {
                data: data as IActivityDocument[],
                pagination: {
                    page,
                    limit: itemsPerPage,
                    total,
                    totalPages
                }
            };
        } catch (error) {
            throw new Error(`Failed to get activities: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    public static async getActivitiesByBookingCode(
        bookingCode: string,
        page: number = 1,
        itemsPerPage: number = 10
    ): Promise<PaginatedResult<IActivityDocument>> {
        const filters: ActivityFilters = {
            activityType: 'booking',
            bookingCode
        };
        
        return this.getActivities(filters, page, itemsPerPage);
    }
    public static async getActivitiesByPropertyCode(
        propertyCode: string,
        page: number = 1,
        itemsPerPage: number = 10
    ): Promise<PaginatedResult<IActivityDocument>> {
        const filters: ActivityFilters = {
            propertyCode
        };
        
        return this.getActivities(filters, page, itemsPerPage);
    }
    public static async getActivitiesByUserEmail(
        userEmail: string,
        page: number = 1,
        itemsPerPage: number = 10
    ): Promise<PaginatedResult<IActivityDocument>> {
        const filters: ActivityFilters = {
            userEmail
        };
        
        return this.getActivities(filters, page, itemsPerPage);
    }
    public static async getBookingActivitiesByStatus(
        status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Modified',
        page: number = 1,
        itemsPerPage: number = 10,
        dateRange?: DateRangeFilter
    ): Promise<PaginatedResult<IActivityDocument>> {
        const filters: ActivityFilters = {
            activityType: 'booking',
            bookingStatus: status,
            dateRange
        };
        
        return this.getActivities(filters, page, itemsPerPage);
    }
    public static async getActivitiesByDateRange(
        startDate: Date,
        endDate: Date,
        activityType?: string,
        page: number = 1,
        itemsPerPage: number = 10
    ): Promise<PaginatedResult<IActivityDocument>> {
        const filters: ActivityFilters = {
            dateRange: { startDate, endDate }
        };
        
        if (activityType) {
            filters.activityType = activityType as any;
        }
        
        return this.getActivities(filters, page, itemsPerPage);
    }
    public static async getActivitiesByUser(
        userId: string | Types.ObjectId,
        page: number = 1,
        itemsPerPage: number = 10
    ): Promise<PaginatedResult<IActivityDocument>> {
        const filters: ActivityFilters = {
            initiatedBy: userId
        };
        
        return this.getActivities(filters, page, itemsPerPage);
    }
    public static async searchActivities(
        searchTerm: string,
        page: number = 1,
        itemsPerPage: number = 10
    ): Promise<PaginatedResult<IActivityDocument>> {
        const filters: ActivityFilters = {
            search: searchTerm
        };
        
        return this.getActivities(filters, page, itemsPerPage);
    }
    public static async getActivityStats(dateRange?: DateRangeFilter) {
        try {
            const matchStage: any = {};
            
            if (dateRange?.startDate || dateRange?.endDate) {
                matchStage.timestamp = {};
                if (dateRange.startDate) {
                    matchStage.timestamp.$gte = dateRange.startDate;
                }
                if (dateRange.endDate) {
                    matchStage.timestamp.$lte = dateRange.endDate;
                }
            }

            const stats = await Activity.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: '$activityType',
                        count: { $sum: 1 },
                        latestActivity: { $max: '$timestamp' }
                    }
                },
                {
                    $sort: { count: -1 }
                }
            ]);

            const totalActivities = await Activity.countDocuments(matchStage);

            return {
                totalActivities,
                activityBreakdown: stats,
                dateRange
            };
        } catch (error) {
            throw new Error(`Failed to get activity statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    public static async getRecentActivities(
        hours: number = 24,
        page: number = 1,
        itemsPerPage: number = 10
    ): Promise<PaginatedResult<IActivityDocument>> {
        const startDate = new Date();
        startDate.setHours(startDate.getHours() - hours);

        return this.getActivitiesByDateRange(startDate, new Date(), undefined, page, itemsPerPage);
    }
    private static buildQueryFilter(filters: ActivityFilters): FilterQuery<IActivityDocument> {
        const query: FilterQuery<IActivityDocument> = {};

        // Activity type filter
        if (filters.activityType) {
            query.activityType = filters.activityType;
        }

        // User filter
        if (filters.initiatedBy) {
            query.initiatedBy = new Types.ObjectId(filters.initiatedBy as string);
        }

        // Date range filter
        if (filters.dateRange) {
            query.timestamp = {};
            if (filters.dateRange.startDate) {
                query.timestamp.$gte = filters.dateRange.startDate;
            }
            if (filters.dateRange.endDate) {
                query.timestamp.$lte = filters.dateRange.endDate;
            }
        }

        // Booking specific filters
        if (filters.bookingStatus) {
            query['bookingActivity.bookingStatus'] = filters.bookingStatus;
        }

        if (filters.bookingCode) {
            query['bookingActivity.bookingCode'] = filters.bookingCode;
        }

        // Property code filter (works for multiple activity types)
        if (filters.propertyCode) {
            query.$or = [
                { 'bookingActivity.property.code': filters.propertyCode },
                { 'policy.propertyCode': filters.propertyCode },
                { 'inventory.propertyCode': filters.propertyCode },
                { 'rateAmount.propertyCode': filters.propertyCode },
                { 'ratePlan.propertyCode': filters.propertyCode }
            ];
        }

        // Email filters
        if (filters.userEmail) {
            query.$or = [
                { 'bookingActivity.bookingUserEmail': filters.userEmail },
                { 'userActivity.email': filters.userEmail },
                { 'propertyActivity.creator.email': filters.userEmail }
            ];
        }

        if (filters.propertyEmail) {
            query.$or = [
                { 'propertyActivity.propertyEmail': filters.propertyEmail },
                { 'roomActivity.propertyContactEmail': filters.propertyEmail }
            ];
        }

        // IP address filter
        if (filters.ipAddress) {
            query.ipAddress = filters.ipAddress;
        }

        // General search filter
        if (filters.search) {
            const searchRegex = new RegExp(filters.search, 'i');
            query.$or = [
                { 'bookingActivity.bookingCode': searchRegex },
                { 'bookingActivity.bookingUserEmail': searchRegex },
                { 'bookingActivity.property.code': searchRegex },
                { 'propertyActivity.propertyName': searchRegex },
                { 'propertyActivity.propertyEmail': searchRegex },
                { 'roomActivity.roomName': searchRegex },
                { 'roomActivity.propertyName': searchRegex },
                { 'policy.policyName': searchRegex },
                { 'inventory.hotelName': searchRegex },
                { 'userActivity.firstName': searchRegex },
                { 'userActivity.lastName': searchRegex },
                { 'userActivity.email': searchRegex },
                { 'rateAmount.hotelName': searchRegex },
                { 'ratePlan.RatePlanName': searchRegex }
            ];
        }

        return query;
    }
    public static async getActivityById(activityId: string | Types.ObjectId): Promise<IActivityDocument | null> {
        try {
            const activity = await Activity.findById(activityId)
                .populate('initiatedBy', 'firstName lastName email role')
                .lean();
            
            return activity as IActivityDocument;
        } catch (error) {
            throw new Error(`Failed to get activity by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    public static async deleteActivity(activityId: string | Types.ObjectId): Promise<boolean> {
        try {
            const result = await Activity.findByIdAndDelete(activityId);
            return !!result;
        } catch (error) {
            throw new Error(`Failed to delete activity: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    public static async updateActivity(
        activityId: string | Types.ObjectId,
        updateData: Partial<CreateActivityData>
    ): Promise<IActivityDocument | null> {
        try {
            const updatedActivity = await Activity.findByIdAndUpdate(
                activityId,
                { ...updateData, updatedAt: new Date() },
                { new: true, runValidators: true }
            )
            .populate('initiatedBy', 'firstName lastName email role')
            .lean();
            
            return updatedActivity as IActivityDocument;
        } catch (error) {
            throw new Error(`Failed to update activity: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    public static async createBulkActivities(activitiesData: CreateActivityData[]): Promise<IActivityDocument[]> {
        try {
            const activities = activitiesData.map(data => ({
                ...data,
                timestamp: new Date()
            }));

            const savedActivities = await Activity.insertMany(activities);
            return savedActivities;
        } catch (error) {
            throw new Error(`Failed to create bulk activities: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    public static async getActivitiesCount(filters: ActivityFilters = {}): Promise<number> {
        try {
            const query = this.buildQueryFilter(filters);
            return await Activity.countDocuments(query);
        } catch (error) {
            throw new Error(`Failed to get activities count: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}

export default ActivityDAO;