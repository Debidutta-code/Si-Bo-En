import { 
  ActivityAction, 
  ActivityEntity, 
  ActivitySeverity,
  IMetadata,
  IChangeLog,
  IErrorDetails,
  IEntityReference
} from '../model/activity.model';


export interface ICreateActivityInput {
  // Core fields
  action: ActivityAction;
  entity: ActivityEntity;
  entityId: string;
  entityName?: string;
  
  // Actor information
  userId?: string;
  userEmail?: string;
  userName?: string;
  userRole?: string;
  userLevel?: number;
  
  // Context
  propertyId?: string;
  propertyCode?: string;
  propertyName?: string;
  creationId?: string;
  creationName?: string;
  creationType?: 'group' | 'property' | 'brand' | 'super'|undefined;
  
  // Description
  description: string;
  shortMessage?: string;
  
  // API details
  requestUrl?: string;
  requestPayload?: any;
  apiStatus?: string;
  
  // Changes
  changes?: IChangeLog[];
  oldState?: any;
  newState?: any;
  
  // Metadata
  metadata?: IMetadata;
  
  // Error handling
  isError?: boolean;
  errorDetails?: IErrorDetails;
  
  // Severity
  severity?: ActivitySeverity;
  
  // Related entities
  relatedEntities?: IEntityReference[];
  
  // Tags
  tags?: string[];
  
  // Timestamp
  timestamp?: Date;
  expiresAt?: Date;
}

export interface IBulkCreateActivityInput {
  activities: ICreateActivityInput[];
}


export interface IActivityFilters {
  // Core filters
  action?: ActivityAction | ActivityAction[];
  entity?: ActivityEntity | ActivityEntity[];
  entityId?: string | string[];
  
  // Actor filters
  userId?: string | string[];
  userEmail?: string;
  userRole?: string | string[];
  
  // Context filters
  propertyId?: string | string[];
  propertyCode?: string;
  creationId?: string | string[];
  
  // Error filters
  isError?: boolean;
  severity?: ActivitySeverity | ActivitySeverity[];
  
  // Tag filters
  tags?: string | string[];
  
  // Date range filters
  startDate?: Date;
  endDate?: Date;
  
  // Search
  search?: string; // Search in description, shortMessage, entityName
  
  // Custom filters
  [key: string]: any;
}

export interface IActivityPagination {
  page?: number;
  limit?: number;
  skip?: number;
}

export interface IActivitySort {
  field?: string;
  order?: 'asc' | 'desc' | 1 | -1;
}

export interface IFetchActivitiesInput {
  filters?: IActivityFilters;
  pagination?: IActivityPagination;
  sort?: IActivitySort;
  select?: string | string[]; // Fields to select
  populate?: string | string[]; // Fields to populate (if any)
}

export interface IFetchActivitiesResponse {
  data: any[]; // Array of activities
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface IFetchActivityByIdInput {
  activityId: string;
  select?: string | string[];
}


export interface IActivityCountByEntityInput {
  entity?: ActivityEntity;
  propertyId?: string;
  creationId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface IActivityCountByActionInput {
  action?: ActivityAction;
  entity?: ActivityEntity;
  propertyId?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface IActivityErrorStatsInput {
  propertyId?: string;
  creationId?: string;
  startDate?: Date;
  endDate?: Date;
  severity?: ActivitySeverity;
}

export interface IUserActivityStatsInput {
  userId: string;
  startDate?: Date;
  endDate?: Date;
  entity?: ActivityEntity;
}

export interface IPropertyActivityStatsInput {
  propertyId: string;
  startDate?: Date;
  endDate?: Date;
  entity?: ActivityEntity;
  action?: ActivityAction;
}


export interface IActivityResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface ICreateActivityResponse extends IActivityResponse {
  data?: {
    activityId: string;
    timestamp: Date;
  };
}

export interface IBulkCreateActivityResponse extends IActivityResponse {
  data?: {
    createdCount: number;
    failedCount: number;
    activityIds: string[];
  };
}


export interface IActivityAggregation {
  groupBy: string | string[]; // Fields to group by
  count?: boolean;
  sum?: string; // Field to sum
  avg?: string; // Field to average
  min?: string; // Field to get minimum
  max?: string; // Field to get maximum
  filters?: IActivityFilters;
}

export interface IRecentActivitiesInput {
  limit?: number;
  entity?: ActivityEntity;
  propertyId?: string;
  userId?: string;
  excludeErrors?: boolean;
}

export interface IActivityTimelineInput {
  entityType: ActivityEntity;
  entityId: string;
  startDate?: Date;
  endDate?: Date;
  includeRelated?: boolean;
}

export interface IExportActivitiesInput {
  filters?: IActivityFilters;
  format?: 'json' | 'csv' | 'excel';
  fields?: string[];
  startDate?: Date;
  endDate?: Date;
}


export type ActivitySortField = 
  | 'timestamp'
  | 'createdAt'
  | 'entity'
  | 'action'
  | 'severity'
  | 'userId'
  | 'propertyId';

export type ActivitySelectFields = 
  | 'action'
  | 'entity'
  | 'entityId'
  | 'entityName'
  | 'userId'
  | 'userEmail'
  | 'userName'
  | 'description'
  | 'shortMessage'
  | 'timestamp'
  | 'severity'
  | 'isError'
  | 'metadata'
  | 'changes'
  | 'tags';


export interface IRequestContext {
  userId?: string;
  userEmail?: string;
  userName?: string;
  userRole?: string;
  userLevel?: number;
  
  propertyId?: string;
  propertyCode?: string;
  propertyName?: string;
  
  creationId?: string;
  creationName?: string;
  creationType?: string;
  
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  requestId?: string;
}



export interface IQuickLogReservationInput {
  action: ActivityAction.CREATE | ActivityAction.UPDATE | ActivityAction.CANCEL | ActivityAction.CONFIRM;
  reservationId: string;
  reservationCode?: string;
  guestName?: string;
  propertyId?: string;
  changes?: IChangeLog[];
  context?: IRequestContext;
}

export interface IQuickLogPaymentInput {
  action: ActivityAction.CREATE | ActivityAction.UPDATE | ActivityAction.APPROVE | ActivityAction.REJECT;
  paymentId: string;
  amount?: number;
  currency?: string;
  propertyId?: string;
  reservationId?: string;
  context?: IRequestContext;
}

export interface IQuickLogLoyaltyInput {
  action: ActivityAction.CREATE | ActivityAction.UPDATE;
  loyaltyGuestId?: string;
  loyaltyConfigId?: string;
  email?: string;
  propertyId?: string;
  context?: IRequestContext;
}

export interface IQuickLogUserInput {
  action: ActivityAction.CREATE | ActivityAction.UPDATE | ActivityAction.LOGIN | ActivityAction.LOGOUT;
  userId: string;
  userEmail?: string;
  userName?: string;
  context?: IRequestContext;
}

export interface IQuickLogErrorInput {
  entity: ActivityEntity;
  entityId?: string;
  errorMessage: string;
  errorCode?: string;
  stackTrace?: string;
  severity?: ActivitySeverity;
  context?: IRequestContext;
}