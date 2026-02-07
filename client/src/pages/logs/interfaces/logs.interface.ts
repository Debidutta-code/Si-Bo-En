// Activity Log Enums - matching backend enums exactly
export const ActivityAction = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  SOFT_DELETE: 'soft_delete',
  RESTORE: 'restore',
  LOGIN: 'login',
  LOGOUT: 'logout',
  EXPORT: 'export',
  IMPORT: 'import',
  APPROVE: 'approve',
  REJECT: 'reject',
  CANCEL: 'cancel',
  CONFIRM: 'confirm',
  CHECKIN: 'checkin',
  CHECKOUT: 'checkout'
} as const;

export type ActivityAction = typeof ActivityAction[keyof typeof ActivityAction];

export const ActivityEntity = {
  CREATION: 'creation',
  USER: 'user',
  PROPERTY: 'property',
  ROOM: 'room',
  
  RESERVATION: 'reservation',
  PAYMENT: 'payment',
  REFUND: 'refund',
  
  RATE_PLAN: 'rate_plan',
  RATE_PLAN_RULE: 'rate_plan_rule',
  CHARGE: 'charge',
  INVENTORY: 'inventory',
  
  PROMO_CODE: 'promo_code',
  PROMOTION: 'promotion',
  GEO_RATE_PLAN: 'geo_rate_plan',
  
  POLICY: 'policy',
  TAX_RULE: 'tax_rule',
  TAX_GROUP: 'tax_group',
  ADDON: 'addon',
  ADDON_AVAILABILITY: 'addon_availability',
  
  AGENCY: 'agency',
  AGENT: 'agent',
  AGENT_APPLICATION: 'agent_application',
  AGENTIC_PROPERTY: 'agentic_property',
  AGENTIC_ROOM: 'agentic_room',
  
  LOYALTY_CONFIG: 'loyalty_config',
  LOYALTY_GUEST: 'loyalty_guest',
  LOYALTY_CONDITION: 'loyalty_condition',
  
  MASTER_AMENITY: 'master_amenity',
  MASTER_CATEGORY: 'master_category',
  MASTER_TYPE: 'master_type',
  
  ACCESS_CONTROL: 'access_control',
  
  SYSTEM: 'system',
  API: 'api',
  ERROR: 'error'
} as const;

export type ActivityEntity = typeof ActivityEntity[keyof typeof ActivityEntity];

export const ActivitySeverity = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
} as const;

export type ActivitySeverity = typeof ActivitySeverity[keyof typeof ActivitySeverity];

// Sub-interfaces for nested data structures
export interface IMetadata {
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  requestId?: string;
  
  country?: string;
  city?: string;
  timezone?: string;
  
  deviceType?: 'mobile' | 'tablet' | 'desktop';
  browser?: string;
  os?: string;
  
  executionTimeMs?: number;
  
  [key: string]: any;
}

export interface IChangeLog {
  field: string;
  oldValue: any;
  newValue: any;
  dataType?: string;
}

export interface IErrorDetails {
  errorCode?: string;
  errorMessage?: string;
  stackTrace?: string;
  recoverable?: boolean;
  retryCount?: number;
}

export interface IEntityReference {
  entityType: string;
  entityId: string;
  entityName?: string;
  entityCode?: string;
}

// Main Activity Log Interface
export interface IActivityLog {
  _id: string;
  
  // Core Fields
  action: ActivityAction;
  entity: ActivityEntity;
  entityId: string;
  entityName?: string;
  
  // Actor Information
  userId?: string;
  userEmail?: string;
  userName?: string;
  userRole?: string;
  userLevel?: number;
  
  // Property Context
  propertyId?: string;
  propertyCode?: string;
  propertyName?: string;
  
  // Creation Context
  creationId?: string;
  creationName?: string;
  creationType?: string;
  
  // Description Fields
  description: string;
  shortMessage?: string;
  
  // API Context
  requestUrl?: string;
  requestPayload?: any;
  apiStatus?: string;
  
  // State Changes
  changes?: IChangeLog[];
  oldState?: any;
  newState?: any;
  
  // Additional Context
  metadata?: IMetadata;
  
  // Error Handling
  isError: boolean;
  errorDetails?: IErrorDetails;
  
  // Severity & Classification
  severity: ActivitySeverity;
  
  // Related Entities
  relatedEntities?: IEntityReference[];
  
  // Tags for filtering
  tags?: string[];
  
  // Timestamps
  timestamp: Date | string;
  createdAt: Date | string;
  expiresAt?: Date | string;
}

// API Response Types
export interface IActivityLogResponse {
  success: boolean;
  message: string;
  data: {
    data: IActivityLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// API Query Parameters
export interface IActivityLogQueryParams {
  page?: number;
  limit?: number;
  
  // Filters (for future enhancement)
  entity?: ActivityEntity;
  action?: ActivityAction;
  userId?: string;
  propertyId?: string;
  severity?: ActivitySeverity;
  startDate?: string;
  endDate?: string;
  search?: string;
}

// Formatted log for display purposes
export interface IFormattedActivityLog extends IActivityLog {
  formattedTimestamp: string;
  formattedDate: string;
  formattedTime: string;
  actorDisplay: string;
  entityDisplay: string;
  actionDisplay: string;
}
