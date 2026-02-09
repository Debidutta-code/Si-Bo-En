import mongoose, { Schema, Document } from 'mongoose';

export enum ActivityAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  SOFT_DELETE = 'soft_delete',
  RESTORE = 'restore',
  LOGIN = 'login',
  LOGOUT = 'logout',
  EXPORT = 'export',
  IMPORT = 'import',
  APPROVE = 'approve',
  REJECT = 'reject',
  CANCEL = 'cancel',
  CONFIRM = 'confirm',
  CHECKIN = 'checkin',
  CHECKOUT = 'checkout'
}

export enum ActivityEntity {
  CREATION = 'creation',
  USER = 'user',
  PROPERTY = 'property',
  ROOM = 'room',
  
  RESERVATION = 'reservation',
  PAYMENT = 'payment',
  REFUND = 'refund',
  
  RATE_PLAN = 'rate_plan',
  RATE_PLAN_RULE = 'rate_plan_rule',
  CHARGE = 'charge',
  INVENTORY = 'inventory',
  
  PROMO_CODE = 'promo_code',
  PROMOTION = 'promotion',
  GEO_RATE_PLAN = 'geo_rate_plan',
  
  POLICY = 'policy',
  TAX_RULE = 'tax_rule',
  TAX_GROUP = 'tax_group',
  ADDON = 'addon',
  ADDON_AVAILABILITY = 'addon_availability',
  
  AGENCY = 'agency',
  AGENT = 'agent',
  AGENT_APPLICATION = 'agent_application',
  AGENTIC_PROPERTY = 'agentic_property',
  AGENTIC_ROOM = 'agentic_room',
  
  LOYALTY_CONFIG = 'loyalty_config',
  LOYALTY_GUEST = 'loyalty_guest',
  LOYALTY_CONDITION = 'loyalty_condition',
  
  MASTER_AMENITY = 'master_amenity',
  MASTER_CATEGORY = 'master_category',
  MASTER_TYPE = 'master_type',
  
  ACCESS_CONTROL = 'access_control',
  
  SYSTEM = 'system',
  API = 'api',
  ERROR = 'error'
}

export enum ActivitySeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}


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

const MetadataSchema = new Schema<IMetadata>({
  ipAddress: {
    type: String,
    trim: true,
    match: [/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^(?:[a-fA-F0-9]*:){2,7}[a-fA-F0-9]*$/, 'Invalid IP address']
  },
  userAgent: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  sessionId: String,
  requestId: String,
  country: String,
  city: String,
  timezone: String,
  deviceType: {
    type: String,
    enum: ['mobile', 'tablet', 'desktop']
  },
  browser: String,
  os: String,
  executionTimeMs: Number
}, { _id: false, strict: false });

const ChangeLogSchema = new Schema<IChangeLog>({
  field: {
    type: String,
    required: true,
    trim: true
  },
  oldValue: Schema.Types.Mixed,
  newValue: Schema.Types.Mixed,
  dataType: String
}, { _id: false });


const ErrorDetailsSchema = new Schema<IErrorDetails>({
  errorCode: String,
  errorMessage: String,
  stackTrace: String,
  recoverable: Boolean,
  retryCount: Number
}, { _id: false });

const EntityReferenceSchema = new Schema<IEntityReference>({
  entityType: {
    type: String,
    required: true
  },
  entityId: {
    type: String,
    required: true
  },
  entityName: String,
  entityCode: String
}, { _id: false });


export interface IActivity extends Document {
  action: ActivityAction;
  entity: ActivityEntity;
  entityId: string;
  entityName?: string;
  
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
  
  description: string;
  shortMessage?: string;
  
  requestUrl?: string;
  requestPayload?: any;
  apiStatus?: string;
  
  changes?: IChangeLog[];
  oldState?: any;
  newState?: any;
  
  metadata?: IMetadata;
  
  isError: boolean;
  errorDetails?: IErrorDetails;
  
  severity: ActivitySeverity;
  
  relatedEntities?: IEntityReference[];
  
  tags?: string[];
  
  timestamp: Date;
  createdAt: Date;
  
  expiresAt?: Date;
}

const ActivitySchema = new Schema<IActivity>({
  // Core Fields
  action: {
    type: String,
    enum: Object.values(ActivityAction),
    // required: [true, 'Action is required'],
    index: true
  },
  
  entity: {
    type: String,
    enum: Object.values(ActivityEntity),
    // required: [true, 'Entity type is required'],
    index: true
  },
  
  entityId: {
    type: String,
    // required: [true, 'Entity ID is required'],
    index: true
  },
  
  entityName: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // Actor Information
  userId: {
    type: String,
    index: true
  },
  
  userEmail: {
    type: String,
    trim: true,
    lowercase: true,
    index: true
  },
  
  userName: {
    type: String,
    trim: true,
    maxlength: 200
  },
  
  userRole: {
    type: String,
    enum: ['super_admin', 'group_manager', 'brand_manager', 'hotel_manager', 'staff', 'revenue_manager', 'guest', 'agent', 'system'],
    index: true
  },
  
  userLevel: {
    type: Number,
    min: 0,
    max: 4
  },
  
  // Context
  propertyId: {
    type: String,
    index: true
  },
  
  propertyCode: {
    type: String,
    trim: true,
    index: true
  },
  
  propertyName: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  creationId: {
    type: String,
    index: true
  },
  
  creationName: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  creationType: {
    type: String,
    enum: ['group', 'property', 'brand', 'super']
  },
  
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: 2000
  },
  
  shortMessage: {
    type: String,
    trim: true,
    maxlength: 255
  },
  
  requestUrl: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  
  requestPayload: {
    type: Schema.Types.Mixed
  },
  
  apiStatus: {
    type: String,
    trim: true,
    maxlength: 100
  },
  
  changes: [ChangeLogSchema],
  
  oldState: {
    type: Schema.Types.Mixed
  },
  
  newState: {
    type: Schema.Types.Mixed
  },
  
  metadata: {
    type: MetadataSchema,
    default: () => ({})
  },
  
  isError: {
    type: Boolean,
    default: false,
    index: true
  },
  
  errorDetails: ErrorDetailsSchema,
  
  severity: {
    type: String,
    enum: Object.values(ActivitySeverity),
    default: ActivitySeverity.INFO,
    index: true
  },
  
  relatedEntities: [EntityReferenceSchema],
  
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
    index: true
  },
  
  expiresAt: {
    type: Date,
    index: true
  }
  
}, {
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'activities_v2'
});

ActivitySchema.index({ entity: 1, action: 1, timestamp: -1 });
ActivitySchema.index({ propertyId: 1, entity: 1, timestamp: -1 });
ActivitySchema.index({ userId: 1, timestamp: -1 });
// ActivitySchema.index({ creationI d: 1, timestamp: -1 });
ActivitySchema.index({ entity: 1, entityId: 1, timestamp: -1 });
// ActivitySchema.index({ propertyCode: 1, timestamp: -1 });
// ActivitySchema.index({ userEmail: 1, timestamp: -1 });
// ActivitySchema.index({ tags: 1, timestamp: -1 });

ActivitySchema.index({ isError: 1, severity: 1, timestamp: -1 });

// ActivitySchema.index({ 'metadata.country': 1, 'metadata.city': 1, timestamp: -1 });

ActivitySchema.index({ timestamp: -1, entity: 1, action: 1 });

ActivitySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

ActivitySchema.statics.logActivity = async function(data: Partial<IActivity>) {
  try {
    const activity = new this(data);
    await activity.save();
    return activity;
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Don't throw - logging should never break the main flow
    return null;
  }
};

ActivitySchema.statics.logBulkActivities = async function(activities: Partial<IActivity>[]) {
  try {
    return await this.insertMany(activities, { ordered: false });
  } catch (error) {
    console.error('Failed to log bulk activities:', error);
    return [];
  }
};

ActivitySchema.methods.addRelatedEntity = function(entityType: string, entityId: string, entityName?: string, entityCode?: string) {
  if (!this.relatedEntities) {
    this.relatedEntities = [];
  }
  this.relatedEntities.push({ entityType, entityId, entityName, entityCode });
};

ActivitySchema.methods.addTag = function(tag: string) {
  if (!this.tags) {
    this.tags = [];
  }
  if (!this.tags.includes(tag.toLowerCase())) {
    this.tags.push(tag.toLowerCase());
  }
};

ActivitySchema.pre('save', function(next) {

  // ✅ Set expiration
  if (!this.expiresAt) {
    const retentionDays =30

    this.expiresAt = new Date(Date.now() + retentionDays * 24 * 60 * 60 * 1000);
  }

  // ✅ Ensure tags array exists
  if (!this.tags) {
    this.tags = [];
  }

  // ✅ Prevent duplicate tags
  const baseTag = `${this.entity}:${this.action}`;
  if (!this.tags.includes(baseTag)) {
    this.tags.push(baseTag);
  }

  if (this.isError) {
    if (!this.tags.includes('error')) {
      this.tags.push('error');
    }

    if (this.severity && !this.tags.includes(this.severity)) {
      this.tags.push(this.severity);
    }
  }

  next();
});





export const ActivityV2 = mongoose.model<IActivity>('ActivityV2', ActivitySchema);

export default ActivityV2;
