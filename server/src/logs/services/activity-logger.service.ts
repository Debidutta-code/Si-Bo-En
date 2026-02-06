import { Request } from 'express';
import { ActivityV2, ActivityAction, ActivityEntity, ActivitySeverity, IActivity, IChangeLog } from '../model/activity.model.v2';

/**
 * Activity Logger Service
 * Industry-standard logging service for all system activities
 */
export class ActivityLogger {
  
  /**
   * Extract metadata from Express request
   */
  private static extractMetadata(req?: Request) {
    if (!req) return {};
    
    return {
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.get('user-agent'),
      sessionId: (req as any).session?.id,
      requestId: req.headers['x-request-id'] as string,
      deviceType: this.detectDeviceType(req.get('user-agent')),
      browser: this.detectBrowser(req.get('user-agent')),
      os: this.detectOS(req.get('user-agent'))
    };
  }
  
  /**
   * Detect device type from user agent
   */
  private static detectDeviceType(userAgent?: string): 'mobile' | 'tablet' | 'desktop' {
    if (!userAgent) return 'desktop';
    
    const ua = userAgent.toLowerCase();
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  }
  
  /**
   * Detect browser from user agent
   */
  private static detectBrowser(userAgent?: string): string {
    if (!userAgent) return 'unknown';
    
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    
    return 'unknown';
  }
  
  /**
   * Detect OS from user agent
   */
  private static detectOS(userAgent?: string): string {
    if (!userAgent) return 'unknown';
    
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    
    return 'unknown';
  }
  
  /**
   * Calculate changes between old and new state
   */
  private static calculateChanges(oldState: any, newState: any): IChangeLog[] {
    const changes: IChangeLog[] = [];
    
    if (!oldState || !newState) return changes;
    
    const allKeys = new Set([...Object.keys(oldState), ...Object.keys(newState)]);
    
    for (const key of allKeys) {
      const oldValue = oldState[key];
      const newValue = newState[key];
      
      // Skip if values are the same
      if (JSON.stringify(oldValue) === JSON.stringify(newValue)) continue;
      
      // Skip sensitive fields
      if (['password', 'token', 'secret', 'apiKey'].includes(key)) continue;
      
      changes.push({
        field: key,
        oldValue,
        newValue,
        dataType: typeof newValue
      });
    }
    
    return changes;
  }
  
  /**
   * Main logging method
   */
  static async log(params: {
    action: ActivityAction;
    entity: ActivityEntity;
    entityId: string;
    entityName?: string;
    description: string;
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
    oldState?: any;
    newState?: any;
    changes?: IChangeLog[];
    metadata?: any;
    businessImpact?: any;
    severity?: ActivitySeverity;
    tags?: string[];
    relatedEntities?: any[];
    req?: Request;
  }): Promise<any> {
    try {
      const metadata = {
        ...this.extractMetadata(params.req),
        ...params.metadata
      };
      
      // Auto-calculate changes if old and new state provided
      let changes = params.changes;
      if (!changes && params.oldState && params.newState) {
        changes = this.calculateChanges(params.oldState, params.newState);
      }
      
      const activity = {
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        entityName: params.entityName,
        description: params.description,
        shortMessage: params.description.substring(0, 255),
        userId: params.userId,
        userEmail: params.userEmail,
        userName: params.userName,
        userRole: params.userRole,
        userLevel: params.userLevel,
        propertyId: params.propertyId,
        propertyCode: params.propertyCode,
        propertyName: params.propertyName,
        creationId: params.creationId,
        creationName: params.creationName,
        creationType: params.creationType,
        oldState: params.oldState,
        newState: params.newState,
        changes,
        metadata,
        businessImpact: params.businessImpact,
        severity: params.severity || ActivitySeverity.INFO,
        tags: params.tags,
        relatedEntities: params.relatedEntities,
        isError: false,
        timestamp: new Date()
      };
      
      return await ActivityV2.create(activity);
    } catch (error) {
      console.error('ActivityLogger: Failed to log activity', error);
      // Never throw - logging should not break the main application flow
      return null;
    }
  }
  
  /**
   * Log error
   */
  static async logError(params: {
    action: ActivityAction;
    entity: ActivityEntity;
    entityId?: string;
    description: string;
    error: Error | any;
    userId?: string;
    userEmail?: string;
    propertyId?: string;
    severity?: ActivitySeverity;
    req?: Request;
  }): Promise<any> {
    try {
      const metadata = {
        ...this.extractMetadata(params.req)
      };
      
      const activity = {
        action: params.action,
        entity: params.entity,
        entityId: params.entityId || 'unknown',
        description: params.description,
        shortMessage: params.description.substring(0, 255),
        userId: params.userId,
        userEmail: params.userEmail,
        propertyId: params.propertyId,
        metadata,
        isError: true,
        severity: params.severity || ActivitySeverity.ERROR,
        errorDetails: {
          errorCode: params.error.code,
          errorMessage: params.error.message,
          stackTrace: params.error.stack,
          recoverable: params.error.recoverable || false
        },
        timestamp: new Date()
      };
      
      return await ActivityV2.create(activity);
    } catch (error) {
      console.error('ActivityLogger: Failed to log error', error);
      return null;
    }
  }
  
  // ==================== CONVENIENCE METHODS ====================
  
  /**
   * Log reservation creation
   */
  static async logReservationCreated(params: {
    reservation: any;
    userId?: string;
    userEmail?: string;
    propertyId: string;
    propertyCode: string;
    amount: number;
    currencyCode: string;
    req?: Request;
  }) {
    return this.log({
      action: ActivityAction.CREATE,
      entity: ActivityEntity.RESERVATION,
      entityId: params.reservation.id,
      entityName: params.reservation.bookingCode,
      description: `New reservation ${params.reservation.bookingCode} created for ${params.propertyCode}`,
      userId: params.userId,
      userEmail: params.userEmail || params.reservation.bookingUserEmail,
      propertyId: params.propertyId,
      propertyCode: params.propertyCode,
      newState: params.reservation,
      businessImpact: {
        revenueImpact: params.amount,
        currencyCode: params.currencyCode,
        affectedReservations: [params.reservation.id]
      },
      tags: ['booking', 'revenue', 'conversion'],
      req: params.req
    });
  }
  
  /**
   * Log reservation cancellation
   */
  static async logReservationCancelled(params: {
    reservation: any;
    oldReservation: any;
    reason: string;
    userId?: string;
    propertyId: string;
    refundAmount?: number;
    req?: Request;
  }) {
    return this.log({
      action: ActivityAction.CANCEL,
      entity: ActivityEntity.RESERVATION,
      entityId: params.reservation.id,
      entityName: params.reservation.bookingCode,
      description: `Reservation ${params.reservation.bookingCode} cancelled. Reason: ${params.reason}`,
      userId: params.userId,
      propertyId: params.propertyId,
      oldState: params.oldReservation,
      newState: params.reservation,
      businessImpact: {
        revenueImpact: -(params.refundAmount || 0),
        affectedReservations: [params.reservation.id]
      },
      severity: ActivitySeverity.WARNING,
      tags: ['booking', 'cancellation', 'refund'],
      req: params.req
    });
  }
  
  /**
   * Log property creation
   */
  static async logPropertyCreated(params: {
    property: any;
    userId: string;
    userName: string;
    creationId: string;
    req?: Request;
  }) {
    return this.log({
      action: ActivityAction.CREATE,
      entity: ActivityEntity.PROPERTY,
      entityId: params.property.id,
      entityName: params.property.propertyName,
      description: `New property "${params.property.propertyName}" (${params.property.propertyCode}) created`,
      userId: params.userId,
      userName: params.userName,
      propertyId: params.property.id,
      propertyCode: params.property.propertyCode,
      propertyName: params.property.propertyName,
      creationId: params.creationId,
      newState: params.property,
      tags: ['property', 'onboarding'],
      req: params.req
    });
  }
  
  /**
   * Log property update
   */
  static async logPropertyUpdated(params: {
    propertyId: string;
    propertyCode: string;
    propertyName: string;
    oldState: any;
    newState: any;
    userId: string;
    changes?: IChangeLog[];
    req?: Request;
  }) {
    return this.log({
      action: ActivityAction.UPDATE,
      entity: ActivityEntity.PROPERTY,
      entityId: params.propertyId,
      entityName: params.propertyName,
      description: `Property "${params.propertyName}" updated`,
      userId: params.userId,
      propertyId: params.propertyId,
      propertyCode: params.propertyCode,
      propertyName: params.propertyName,
      oldState: params.oldState,
      newState: params.newState,
      changes: params.changes,
      req: params.req
    });
  }
  
  /**
   * Log user login
   */
  static async logUserLogin(params: {
    userId: string;
    userEmail: string;
    userName: string;
    userRole: string;
    userLevel: number;
    req?: Request;
  }) {
    return this.log({
      action: ActivityAction.LOGIN,
      entity: ActivityEntity.USER,
      entityId: params.userId,
      entityName: params.userName,
      description: `User ${params.userEmail} logged in`,
      userId: params.userId,
      userEmail: params.userEmail,
      userName: params.userName,
      userRole: params.userRole,
      userLevel: params.userLevel,
      tags: ['authentication', 'security'],
      req: params.req
    });
  }
  
  /**
   * Log rate plan update
   */
  static async logRatePlanUpdated(params: {
    ratePlan: any;
    oldState: any;
    userId: string;
    propertyId: string;
    propertyCode: string;
    req?: Request;
  }) {
    return this.log({
      action: ActivityAction.UPDATE,
      entity: ActivityEntity.RATE_PLAN,
      entityId: params.ratePlan.id,
      entityName: params.ratePlan.ratePlanName,
      description: `Rate plan "${params.ratePlan.ratePlanName}" updated`,
      userId: params.userId,
      propertyId: params.propertyId,
      propertyCode: params.propertyCode,
      oldState: params.oldState,
      newState: params.ratePlan,
      tags: ['pricing', 'revenue-management'],
      req: params.req
    });
  }
  
  /**
   * Log inventory update
   */
  static async logInventoryUpdated(params: {
    inventoryId: string;
    roomTypeCode: string;
    date: Date;
    oldAvailability: number;
    newAvailability: number;
    userId: string;
    propertyId: string;
    propertyCode: string;
    req?: Request;
  }) {
    return this.log({
      action: ActivityAction.UPDATE,
      entity: ActivityEntity.INVENTORY,
      entityId: params.inventoryId,
      description: `Inventory for ${params.roomTypeCode} on ${params.date.toISOString().split('T')[0]} updated from ${params.oldAvailability} to ${params.newAvailability}`,
      userId: params.userId,
      propertyId: params.propertyId,
      propertyCode: params.propertyCode,
      businessImpact: {
        inventoryChange: params.newAvailability - params.oldAvailability,
        roomTypeCode: params.roomTypeCode
      },
      tags: ['inventory', 'availability'],
      req: params.req
    });
  }
  
  /**
   * Log agency creation
   */
  static async logAgencyCreated(params: {
    agency: any;
    userId: string;
    req?: Request;
  }) {
    return this.log({
      action: ActivityAction.CREATE,
      entity: ActivityEntity.AGENCY,
      entityId: params.agency.id,
      entityName: params.agency.agencyName,
      description: `New agency "${params.agency.agencyName}" created`,
      userId: params.userId,
      newState: params.agency,
      tags: ['agency', 'b2b'],
      req: params.req
    });
  }
  
  /**
   * Log agency application approval
   */
  static async logAgencyApplicationApproved(params: {
    application: any;
    userId: string;
    req?: Request;
  }) {
    return this.log({
      action: ActivityAction.APPROVE,
      entity: ActivityEntity.AGENT_APPLICATION,
      entityId: params.application.id,
      entityName: params.application.agencyName,
      description: `Agency application for "${params.application.agencyName}" approved`,
      userId: params.userId,
      newState: params.application,
      tags: ['agency', 'approval', 'b2b'],
      req: params.req
    });
  }
  
  /**
   * Log promo code usage
   */
  static async logPromoCodeUsed(params: {
    promoCode: any;
    reservationId: string;
    discountAmount: number;
    currencyCode: string;
    userId?: string;
    userEmail: string;
    propertyId: string;
    req?: Request;
  }) {
    return this.log({
      action: ActivityAction.UPDATE,
      entity: ActivityEntity.PROMO_CODE,
      entityId: params.promoCode.id,
      entityName: params.promoCode.code,
      description: `Promo code "${params.promoCode.code}" used in reservation`,
      userId: params.userId,
      userEmail: params.userEmail,
      propertyId: params.propertyId,
      businessImpact: {
        revenueImpact: -params.discountAmount,
        currencyCode: params.currencyCode,
        affectedReservations: [params.reservationId]
      },
      tags: ['promo', 'discount', 'marketing'],
      relatedEntities: [{
        entityType: 'reservation',
        entityId: params.reservationId
      }],
      req: params.req
    });
  }
  
  /**
   * Query activities with filters
   */
  static async query(filters: {
    entity?: ActivityEntity;
    action?: ActivityAction;
    userId?: string;
    propertyId?: string;
    creationId?: string;
    startDate?: Date;
    endDate?: Date;
    isError?: boolean;
    severity?: ActivitySeverity;
    tags?: string[];
    limit?: number;
    skip?: number;
  }) {
    const query: any = {};
    
    if (filters.entity) query.entity = filters.entity;
    if (filters.action) query.action = filters.action;
    if (filters.userId) query.userId = filters.userId;
    if (filters.propertyId) query.propertyId = filters.propertyId;
    if (filters.creationId) query.creationId = filters.creationId;
    if (filters.isError !== undefined) query.isError = filters.isError;
    if (filters.severity) query.severity = filters.severity;
    if (filters.tags && filters.tags.length > 0) query.tags = { $in: filters.tags };
    
    if (filters.startDate || filters.endDate) {
      query.timestamp = {};
      if (filters.startDate) query.timestamp.$gte = filters.startDate;
      if (filters.endDate) query.timestamp.$lte = filters.endDate;
    }
    
    return ActivityV2.find(query)
      .sort({ timestamp: -1 })
      .limit(filters.limit || 100)
      .skip(filters.skip || 0)
      .lean();
  }
  
  /**
   * Get activity statistics
   */
  static async getStats(filters: {
    propertyId?: string;
    creationId?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const matchStage: any = {};
    
    if (filters.propertyId) matchStage.propertyId = filters.propertyId;
    if (filters.creationId) matchStage.creationId = filters.creationId;
    
    if (filters.startDate || filters.endDate) {
      matchStage.timestamp = {};
      if (filters.startDate) matchStage.timestamp.$gte = filters.startDate;
      if (filters.endDate) matchStage.timestamp.$lte = filters.endDate;
    }
    
    return ActivityV2.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$entity',
          totalActivities: { $sum: 1 },
          errors: {
            $sum: { $cond: ['$isError', 1, 0] }
          },
          totalRevenueImpact: {
            $sum: { $ifNull: ['$businessImpact.revenueImpact', 0] }
          }
        }
      },
      { $sort: { totalActivities: -1 } }
    ]);
  }
}

export default ActivityLogger;
