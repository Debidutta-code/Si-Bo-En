import { Types } from 'mongoose';
import ActivityDAO from '../repository/activity.repository';
import type {
    IActivityDocument,
    ActivityFilters,
    CreateActivityData,
    DateRangeFilter,
    PaginatedResult,
    IBookingActivity,
    IFailedActivity,
    IInventory,
    IPolicy,
    IPropertyActivity,
    IRateAmount,
    IRateplan,
    IRoomActivity,
    IUser,
    ActivityServiceResponse,
    ActivityStatsResponse,
    CreateActivityRequest,
    GetActivitiesRequest

} from '../types/types';
import { errorResponse, successResponse } from '../../utils/return';


export class ActivityService {
    public static async createActivity(request: CreateActivityRequest) {
        try {
            // Validate required fields
            const validation = this.validateCreateRequest(request);
            if (!validation.isValid) {
                return errorResponse('Validation failed', validation.errors.join(', '))
            }

            // Prepare activity data based on type
            const activityData = this.prepareActivityData(request);

            // Create activity through DAO
            const createdActivity = await ActivityDAO.createActivity(activityData);
            return successResponse("Activity created successfully", createdActivity)


        } catch (error) {
            return errorResponse('Failed to create activity', error instanceof Error ? error.message : 'Unknown error')

        }
    }
    //
    public static async getActivities(request: GetActivitiesRequest = {}) {
        try {
            const {
                filters = {},
                page = 1,
                itemsPerPage = 10,
                sortBy = 'timestamp',
                sortOrder = 'desc'
            } = request;

            // Validate pagination parameters
            const validatedPage = Math.max(1, page);
            const validatedLimit = Math.min(Math.max(1, itemsPerPage), 100);

            // Apply business rules to filters
            const processedFilters = this.processFilters(filters);

            // Get activities through DAO
            const result = await ActivityDAO.getActivities(
                processedFilters,
                validatedPage,
                validatedLimit
            );

            // Enhance data with business logic
            const enhancedData = this.enhanceActivityData(result.data);

            return successResponse("Activities retrieved successfully", {
                ...result,
                data: enhancedData
            })

        } catch (error) {
            console.error('Error getting activities:', error);
            return {
                success: false,
                message: 'Failed to retrieve activities',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    public static async getBookingActivities(
        status?: 'Confirmed' | 'Pending' | 'Cancelled' | 'Modified',
        dateRange?: DateRangeFilter,
        page: number = 1,
        itemsPerPage: number = 10
    ) {
        try {
            const filters: ActivityFilters = {
                activityType: 'booking'
            };

            if (status) {
                filters.bookingStatus = status;
            }

            if (dateRange) {
                filters.dateRange = dateRange;
            }

            return this.getActivities({ filters, page, itemsPerPage });

        } catch (error) {
            console.error('Error getting booking activities:', error);
            return errorResponse("Failed to retrieve booking activities", error instanceof Error ? error.message : 'Unknown error')
        }
    }
    public static async getActivitiesByProperty(
        propertyCode: string,
        page: number = 1,
        itemsPerPage: number = 10
    ): Promise<ActivityServiceResponse<PaginatedResult<IActivityDocument>>> {
        try {
            if (!propertyCode || propertyCode.trim().length === 0) {
                return errorResponse("Property code is required", "Invalid property code provided")

            }

            const result = await ActivityDAO.getActivitiesByPropertyCode(
                propertyCode.trim(),
                page,
                itemsPerPage
            );
            return successResponse("Property activities retrieved successfully", result)


        } catch (error) {
            return errorResponse("Failed to retrieve property activities", error instanceof Error ? error.message : 'Unknown error')
        }
    }
    public static async getUserActivityHistory(
        userId: string | Types.ObjectId,
        page: number = 1,
        itemsPerPage: number = 10
    ): Promise<ActivityServiceResponse<PaginatedResult<IActivityDocument>>> {
        try {
            if (!userId) {
                return errorResponse('User ID is required', 'Invalid user ID provided')
            }

            const result = await ActivityDAO.getActivitiesByUser(
                userId,
                page,
                itemsPerPage
            );
            return successResponse('User activity history retrieved successfully', result)


        } catch (error) {
            return errorResponse('Failed to retrieve user activity history', error instanceof Error ? error.message : 'Unknown error')

        }
    }
    public static async searchActivities(
        searchTerm: string,
        page: number = 1,
        itemsPerPage: number = 10
    ): Promise<ActivityServiceResponse<PaginatedResult<IActivityDocument>>> {
        try {
            if (!searchTerm || searchTerm.trim().length < 2) {
                return errorResponse('Search term must be at least 2 characters long', 'Invalid search term')

            }

            const result = await ActivityDAO.searchActivities(
                searchTerm.trim(),
                page,
                itemsPerPage
            );
            return successResponse('Search completed successfully', result)


        } catch (error) {
            console.error('Error searching activities:', error);
            return errorResponse('Search failed', error instanceof Error ? error.message : 'Unknown error')

        }
    }
    public static async getActivityStatistics(
        dateRange?: DateRangeFilter
    ): Promise<ActivityServiceResponse<ActivityStatsResponse>> {
        try {
            // Validate date range
            if (dateRange && dateRange.startDate && dateRange.endDate) {
                if (dateRange.startDate > dateRange.endDate) {
                    return errorResponse('Start date cannot be after end date', 'Invalid date range')

                }
            }

            const stats = await ActivityDAO.getActivityStats(dateRange);

            // Enhance statistics with business insights
            const enhancedStats: ActivityStatsResponse = {
                ...stats,
                // Add more business logic here for enhanced stats
            };
            return successResponse('Activity statistics retrieved successfully', enhancedStats)


        } catch (error) {
            return errorResponse('Failed to retrieve activity statistics', error instanceof Error ? error.message : 'Unknown error')

        }
    }
    public static async getRecentActivities(
        hours: number = 24,
        page: number = 1,
        itemsPerPage: number = 10
    ): Promise<ActivityServiceResponse<PaginatedResult<IActivityDocument>>> {
        try {
            // Validate hours parameter
            if (hours <= 0 || hours > 168) { // Max 1 week
                return errorResponse('Hours must be between 1 and 168 (1 week)', 'Invalid time range')

            }

            const result = await ActivityDAO.getRecentActivities(
                hours,
                page,
                itemsPerPage
            );

            return successResponse(`Recent activities (last ${hours} hours) retrieved successfully`, result)



        } catch (error) {
            return errorResponse('Failed to retrieve recent activities', error instanceof Error ? error.message : 'Unknown error')
        }
    }
    //
    public static async getActivityById(activityId: string): Promise<ActivityServiceResponse<IActivityDocument>> {
        try {
            if (!Types.ObjectId.isValid(activityId)) {
                return errorResponse('Invalid activity ID format', 'Provided ID is not a valid MongoDB ObjectId')

            }

            const activity = await ActivityDAO.getActivityById(activityId);

            if (!activity) {
                return errorResponse('Activity not found', `No activity found with ID: ${activityId}`)
            }
            return successResponse('Activity retrieved successfully', activity)

        } catch (error) {
            return errorResponse('Failed to retrieve activity', error instanceof Error ? error.message : 'Unknown error')
        }
    }
    public static async createBookingActivity(
        initiatedBy: string | Types.ObjectId,
        bookingData: IBookingActivity,
        ipAddress?: string,
        userAgent?: string
    ): Promise<ActivityServiceResponse<IActivityDocument>> {
        const request: CreateActivityRequest = {
            initiatedBy,
            activityType: 'booking',
            activityData: bookingData,
            ipAddress,
            userAgent
        };

        return this.createActivity(request);
    }
    public static async logFailedActivity(
        initiatedBy: string | Types.ObjectId,
        failedActivityType: string,
        reason: string,
        ipAddress?: string,
        userAgent?: string
    ): Promise<ActivityServiceResponse<IActivityDocument>> {
        const failedData: IFailedActivity = {
            failedActivityType,
            reason
        };

        const request: CreateActivityRequest = {
            initiatedBy,
            activityType: 'failed',
            activityData: failedData,
            ipAddress,
            userAgent
        };

        return this.createActivity(request);
    }
    public static async createBulkActivities(
        activities: CreateActivityRequest[]
    ): Promise<ActivityServiceResponse<IActivityDocument[]>> {
        try {
            if (!activities || activities.length === 0) {
                return errorResponse("No activities provided for bulk creation", "Empty activities array");
            }

            if (activities.length > 100) {

                return errorResponse("Bulk creation limited to 100 activities at a time", "Too many activities in bulk request");
            }

            // Validate all activities
            const validationErrors: string[] = [];
            const validActivities: CreateActivityData[] = [];

            for (let i = 0; i < activities.length; i++) {
                const validation = this.validateCreateRequest(activities[i]);
                if (!validation.isValid) {
                    validationErrors.push(`Activity ${i + 1}: ${validation.errors.join(', ')}`);
                } else {
                    validActivities.push(this.prepareActivityData(activities[i]));
                }
            }

            if (validationErrors.length > 0) {
                return errorResponse('Validation failed for some activities', validationErrors.join('; '))

            }

            const createdActivities = await ActivityDAO.createBulkActivities(validActivities);
            return successResponse(`Successfully created ${createdActivities.length} activities`, createdActivities)

        } catch (error) {
            console.error('Error creating bulk activities:', error);
            return errorResponse('Failed to create bulk activities', error instanceof Error ? error.message : 'Unknown error')

        }
    }
    private static validateCreateRequest(request: CreateActivityRequest): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!request.initiatedBy) {
            errors.push('initiatedBy is required');
        }

        if (!request.activityType) {
            errors.push('activityType is required');
        }

        if (!request.activityData) {
            errors.push('activityData is required');
        }

        // Validate ObjectId format if it's a string
        if (typeof request.initiatedBy === 'string' && !Types.ObjectId.isValid(request.initiatedBy)) {
            errors.push('initiatedBy must be a valid ObjectId');
        }

        // Activity type specific validations
        if (request.activityType && request.activityData) {
            const activityValidation = this.validateActivityTypeData(request.activityType, request.activityData);
            errors.push(...activityValidation);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
    private static validateActivityTypeData(activityType: string, activityData: any): string[] {
        const errors: string[] = [];

        switch (activityType) {
            case 'booking':
                if (!activityData.bookingCode) errors.push('bookingCode is required for booking activity');
                if (!activityData.amount) errors.push('amount is required for booking activity');
                if (!activityData.guests || !Array.isArray(activityData.guests) || activityData.guests.length === 0) {
                    errors.push('at least one guest is required for booking activity');
                }
                break;
            case 'property':
                if (!activityData.propertyName) errors.push('propertyName is required for property activity');
                if (!activityData.creator) errors.push('creator is required for property activity');
                break;
            case 'user':
                if (!activityData.email) errors.push('email is required for user activity');
                if (!activityData.role) errors.push('role is required for user activity');
                break;
            // Add more validations as needed
        }

        return errors;
    }
    private static prepareActivityData(request: CreateActivityRequest): CreateActivityData {
        const baseData: CreateActivityData = {
            initiatedBy: new Types.ObjectId(request.initiatedBy as string),
            activityType: request.activityType,
            ipAddress: request.ipAddress,
            userAgent: request.userAgent
        };

        // Map activity data based on type
        switch (request.activityType) {
            case 'booking':
                baseData.bookingActivity = request.activityData as IBookingActivity;
                break;
            case 'property':
                baseData.propertyActivity = request.activityData as IPropertyActivity;
                break;
            case 'room':
                baseData.roomActivity = request.activityData as IRoomActivity;
                break;
            case 'policy':
                baseData.policy = request.activityData as IPolicy;
                break;
            case 'inventory':
                baseData.inventory = request.activityData as IInventory;
                break;
            case 'user':
                baseData.userActivity = request.activityData as IUser;
                break;
            case 'rateAmount':
                baseData.rateAmount = request.activityData as IRateAmount;
                break;
            case 'ratePlan':
                baseData.ratePlan = request.activityData as IRateplan;
                break;
            case 'failed':
                baseData.failedActivity = request.activityData as IFailedActivity;
                break;
        }

        return baseData;
    }
    private static processFilters(filters: ActivityFilters): ActivityFilters {
        const processed: ActivityFilters = { ...filters };

        // Clean string fields
        if (processed.propertyCode) {
            processed.propertyCode = processed.propertyCode.trim();
        }
        if (processed.bookingCode) {
            processed.bookingCode = processed.bookingCode.trim();
        }
        if (processed.userEmail) {
            processed.userEmail = processed.userEmail.trim().toLowerCase();
        }
        if (processed.search) {
            processed.search = processed.search.trim();
        }

        // Validate date ranges
        if (processed.dateRange) {
            if (processed.dateRange.startDate && processed.dateRange.endDate) {
                if (processed.dateRange.startDate > processed.dateRange.endDate) {
                    // Swap dates if start is after end
                    const temp = processed.dateRange.startDate;
                    processed.dateRange.startDate = processed.dateRange.endDate;
                    processed.dateRange.endDate = temp;
                }
            }
        }

        return processed;
    }
    private static enhanceActivityData(activities: IActivityDocument[]): IActivityDocument[] {
        return activities.map(activity => {
            // Add business logic enhancements here
            // For example, calculate derived fields, format data, etc.
            return activity;
        });
    }
    //
    public static async deleteActivity(id: Types.ObjectId) {
        try {

            const daoRes = await ActivityDAO.deleteActivity(id)
            if (daoRes) {
                return successResponse("Activity deleted successfully")
            } else {
                return errorResponse("Failed to delete Activity")
            }
        } catch (error: any) {
            return errorResponse("Failed to delete Activity", error?.message)
        }
    }
}

export default ActivityService;