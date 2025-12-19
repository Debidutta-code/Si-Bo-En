import { Types } from "mongoose";
export interface IGuests {
    firstName: string;
    lastName: string;
    dob: Date;
    type: "Adult" | "Child"

}
export interface IBookingActivity {
    property: {
        code: string;
        id: Types.ObjectId
    };
    room: {
        code: string;
        id: Types.ObjectId
    };
    ratePlanCode: string;
    amount: number;
    currencyCode: string;
    guests: IGuests[];
    bookingUserEmail: string;
    bookingUserPhoneNo: string;
    bookingDate: Date;
    checkInDate: Date;
    checkoutDate: Date;
    paymentType: string;
    bookingStatus: "Confirmed" | "Pending" | "Cancelled" | "Modified";
    finalPrice: any;
    bookingCode: string;
    cancellationReason: string;
    activity: "Create" | "Update" | "Delete";
    message: string;
}
export interface IPropertyActivity {
    propertyName: string;
    creator: {
        firstName: string;
        lastName: string;
        email: string;
        role: string;
    },
    address: string;
    propertyEmail: string;
    activity: "Create" | "Update" | "Delete";
    field: "address" | "propertyCatrgory" | "destinationType" | "propertyType" | "propertyAddress" | "propertyAmenities" | "ratePlan"
    message: string;
}
export interface IRoomActivity {
    propertyName: string;
    propertyContactEmail: string;
    roomName: string;
    activity: "Create" | "Update" | "Delete";
    isRoomActive: boolean;
    field: "room" | "amenities"
    message: string;
}
export interface IPolicy {
    policyName: string;
    type: "Deposit Policies" | "Guarantee Policies" | "Cancellation Policies";
    propertyCode: string;
    activity: "Create" | "Update" | "Delete";
    message: string;
}
export interface IInventory {
    hotelName: string;
    propertyCode: string;
    roomTypeCode: string;
    availability: string;
    activity: "Create" | "Update" | "Delete";
    message: string;

}
export interface IUser{
    firstName:string;
    lastName:string;
    role:string;
    level:number;
    email:string;
    createdBy:Types.ObjectId;
    creatorLevel:number;
    activity: "Create" | "Update" | "Delete";
    message: string;
}
export interface IRateAmount {
    propertyCode: string;
    hotelName: string;
    daterange:{
        from:Date;
        to:Date;
    },
    ratePlanCode:string;
    activity: "Create" | "Update" | "Delete";
    message: string;
}
export interface IRateplan {
    propertyCode:string;
    RatePlanName:string;
    activity: "Create" | "Update" | "Delete";
    message: string;
}
export interface IFailedActivity{
    failedActivityType:string;
    reason:string;
}
export interface IActivityDocument {
    initiatedBy: Types.ObjectId;
    timestamp: Date;
    ipAddress?: string;
    userAgent?: string;
    activityType: 'booking' | 'property' | 'room' | 'policy' | 'inventory' | 'user' | 'rateAmount' | 'ratePlan' | 'failed';
    bookingActivity?: IBookingActivity;
    propertyActivity?: IPropertyActivity;
    roomActivity?: IRoomActivity;
    policy?: IPolicy;
    inventory?: IInventory;
    userActivity?: IUser;
    rateAmount?: IRateAmount;
    ratePlan?: IRateplan;
    failedActivity?: IFailedActivity;
    createdAt: Date;
    updatedAt: Date;
}
export interface PaginatedResult<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Filter interfaces
export interface DateRangeFilter {
    startDate?: Date;
    endDate?: Date;
}

export interface ActivityFilters {
    activityType?: 'booking' | 'property' | 'room' | 'policy' | 'inventory' | 'user' | 'rateAmount' | 'ratePlan' | 'failed';
    initiatedBy?: string | Types.ObjectId;
    dateRange?: DateRangeFilter;
    bookingStatus?: 'Confirmed' | 'Pending' | 'Cancelled' | 'Modified';
    propertyCode?: string;
    bookingCode?: string;
    userEmail?: string;
    propertyEmail?: string;
    ipAddress?: string;
    search?: string; // General search term
}

export interface CreateActivityData {
    initiatedBy: Types.ObjectId;
    activityType: 'booking' | 'property' | 'room' | 'policy' | 'inventory' | 'user' | 'rateAmount' | 'ratePlan' | 'failed';
    ipAddress?: string;
    userAgent?: string;
    bookingActivity?: IBookingActivity;
    propertyActivity?: IPropertyActivity;
    roomActivity?: IRoomActivity;
    policy?: IPolicy;
    inventory?: IInventory;
    userActivity?: IUser;
    rateAmount?: IRateAmount;
    ratePlan?: IRateplan;
    failedActivity?: IFailedActivity;
}
export interface ActivityServiceResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}

export interface CreateActivityRequest {
    initiatedBy: string | Types.ObjectId;
    activityType: 'booking' | 'property' | 'room' | 'policy' | 'inventory' | 'user' | 'rateAmount' | 'ratePlan' | 'failed';
    ipAddress?: string;
    userAgent?: string;
    activityData: IBookingActivity | IPropertyActivity | IRoomActivity | IPolicy | IInventory | IUser | IRateAmount | IRateplan | IFailedActivity;
}

export interface GetActivitiesRequest {
    filters?: ActivityFilters;
    page?: number;
    itemsPerPage?: number;
    sortBy?: 'timestamp' | 'activityType' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
}

export interface ActivityStatsResponse {
    totalActivities: number;
    activityBreakdown: Array<{
        _id: string;
        count: number;
        latestActivity: Date;
    }>;
    dateRange?: DateRangeFilter;
    topUsers?: Array<{
        userId: Types.ObjectId;
        count: number;
        userName?: string;
    }>;
    dailyStats?: Array<{
        date: string;
        count: number;
    }>;
}