import { activityRepository } from '../repository/logs.repository';
import {
  ICreateActivityInput,
  IBulkCreateActivityInput,
  ICreateActivityResponse,
  IBulkCreateActivityResponse,
  IActivityResponse,
  IQuickLogReservationInput,
  IQuickLogPaymentInput,
  IQuickLogLoyaltyInput,
  IQuickLogUserInput,
  IQuickLogErrorInput,
  IRequestContext
} from '../types/types';
import { ActivityAction, ActivityEntity, ActivitySeverity } from '../model/activity.model';
import { errorResponse, IApiResponse, successResponse } from '../../utils';


export class ActivityService {
  
  async logActivity(input: ICreateActivityInput): Promise<ICreateActivityResponse> {
    try {
      const activity = await activityRepository.create(input);
      
      if (!activity) {
        return {
          success: false,
          message: 'Failed to create activity log'
        };
      }
      
      return {
        success: true,
        message: 'Activity logged successfully',
        data: {
          activityId: activity._id.toString(),
          timestamp: activity.timestamp
        }
      };
    } catch (error: any) {
      console.error('ActivityService.logActivity error:', error);
      return {
        success: false,
        message: 'Failed to log activity',
        error: error.message
      };
    }
  }
  

  
  async getAllActivities(page: number = 1, limit: number = 25): Promise<IApiResponse> {
    try {
      const result = await activityRepository.fetchAll(page, limit);
      
      return successResponse("Activities fetched successfully", result);

    } catch (error) {
        if(error instanceof Error) {
          return errorResponse("Failed to fetch activities", error.message);
        }
      return errorResponse("Failed to fetch activities");
    }
  }
  
  async logReservation(input: IQuickLogReservationInput): Promise<ICreateActivityResponse> {
    const { action, reservationId, reservationCode, guestName, propertyId, changes, context } = input;
    
    const activityInput: ICreateActivityInput = {
      action,
      entity: ActivityEntity.RESERVATION,
      entityId: reservationId,
      entityName: reservationCode || `Reservation ${reservationId}`,
      propertyId,
      description: this.generateReservationDescription(action, guestName, reservationCode),
      shortMessage: `Reservation ${action}`,
      changes,
      ...this.extractContext(context)
    };
    
    return this.logActivity(activityInput);
  }
  
  async logPayment(input: IQuickLogPaymentInput): Promise<ICreateActivityResponse> {
    const { action, paymentId, amount, currency, propertyId, reservationId, context } = input;
    
    const activityInput: ICreateActivityInput = {
      action,
      entity: ActivityEntity.PAYMENT,
      entityId: paymentId,
      entityName: `Payment ${paymentId}`,
      propertyId,
      description: this.generatePaymentDescription(action, amount, currency),
      shortMessage: `Payment ${action}`,
      relatedEntities: reservationId ? [{
        entityType: ActivityEntity.RESERVATION,
        entityId: reservationId
      }] : undefined,
      ...this.extractContext(context)
    };
    
    return this.logActivity(activityInput);
  }
  
  async logLoyalty(input: IQuickLogLoyaltyInput): Promise<ICreateActivityResponse> {
    const { action, loyaltyGuestId, loyaltyConfigId, email, propertyId, context } = input;
    
    const entity = loyaltyGuestId ? ActivityEntity.LOYALTY_GUEST : ActivityEntity.LOYALTY_CONFIG;
    const entityId = loyaltyGuestId || loyaltyConfigId || '';
    
    const activityInput: ICreateActivityInput = {
      action,
      entity,
      entityId,
      entityName: email || `Loyalty ${entityId}`,
      propertyId,
      description: this.generateLoyaltyDescription(action, email),
      shortMessage: `Loyalty ${action}`,
      ...this.extractContext(context)
    };
    
    return this.logActivity(activityInput);
  }
  
  async logUser(input: IQuickLogUserInput): Promise<ICreateActivityResponse> {
    const { action, userId, userEmail, userName, context } = input;
    
    const activityInput: ICreateActivityInput = {
      action,
      entity: ActivityEntity.USER,
      entityId: userId,
      entityName: userName || userEmail || userId,
      description: this.generateUserDescription(action, userName, userEmail),
      shortMessage: `User ${action}`,
      ...this.extractContext(context)
    };
    
    return this.logActivity(activityInput);
  }
  
  async logError(input: IQuickLogErrorInput): Promise<ICreateActivityResponse> {
    const { entity, entityId, errorMessage, errorCode, stackTrace, severity, context } = input;
    
    const activityInput: ICreateActivityInput = {
      action: ActivityAction.UPDATE,
      entity: entity || ActivityEntity.ERROR,
      entityId: entityId || 'system',
      description: errorMessage,
      shortMessage: `Error: ${errorCode || 'Unknown'}`,
      isError: true,
      severity: severity || ActivitySeverity.ERROR,
      errorDetails: {
        errorCode,
        errorMessage,
        stackTrace
      },
      ...this.extractContext(context)
    };
    
    return this.logActivity(activityInput);
  }
  
  private extractContext(context?: IRequestContext): Partial<ICreateActivityInput> {
    if (!context) return {};
    
    return {
      userId: context.userId,
      userEmail: context.userEmail,
      userName: context.userName,
      userRole: context.userRole,
      userLevel: context.userLevel,
      propertyId: context.propertyId ,
      propertyCode: context.propertyCode,
      propertyName: context.propertyName,
      creationId: context.creationId,
      creationName: context.creationName,
      creationType: context.creationType as "group" | "property" | "brand" | "super" ,
      metadata: {
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        sessionId: context.sessionId,
        requestId: context.requestId
      }
    };
  }
  
  private generateReservationDescription(action: ActivityAction, guestName?: string, code?: string): string {
    const guest = guestName || 'Guest';
    const reservation = code || 'Reservation';
    
    switch (action) {
      case ActivityAction.CREATE:
        return `New reservation created for ${guest} (${reservation})`;
      case ActivityAction.UPDATE:
        return `Reservation updated for ${guest} (${reservation})`;
      case ActivityAction.CANCEL:
        return `Reservation cancelled for ${guest} (${reservation})`;
      case ActivityAction.CONFIRM:
        return `Reservation confirmed for ${guest} (${reservation})`;
      case ActivityAction.CHECKIN:
        return `Guest ${guest} checked in (${reservation})`;
      case ActivityAction.CHECKOUT:
        return `Guest ${guest} checked out (${reservation})`;
      default:
        return `Reservation ${action} for ${guest} (${reservation})`;
    }
  }
  
  private generatePaymentDescription(action: ActivityAction, amount?: number, currency?: string): string {
    const amountStr = amount && currency ? `${currency} ${amount}` : 'payment';
    
    switch (action) {
      case ActivityAction.CREATE:
        return `Payment created: ${amountStr}`;
      case ActivityAction.UPDATE:
        return `Payment updated: ${amountStr}`;
      case ActivityAction.APPROVE:
        return `Payment approved: ${amountStr}`;
      case ActivityAction.REJECT:
        return `Payment rejected: ${amountStr}`;
      default:
        return `Payment ${action}: ${amountStr}`;
    }
  }
  
  private generateLoyaltyDescription(action: ActivityAction, email?: string): string {
    const member = email || 'Member';
    
    switch (action) {
      case ActivityAction.CREATE:
        return `Loyalty member registered: ${member}`;
      case ActivityAction.UPDATE:
        return `Loyalty member updated: ${member}`;
      default:
        return `Loyalty ${action}: ${member}`;
    }
  }
  
  private generateUserDescription(action: ActivityAction, name?: string, email?: string): string {
    const user = name || email || 'User';
    
    switch (action) {
      case ActivityAction.CREATE:
        return `User account created: ${user}`;
      case ActivityAction.UPDATE:
        return `User account updated: ${user}`;
      case ActivityAction.LOGIN:
        return `User logged in: ${user}`;
      case ActivityAction.LOGOUT:
        return `User logged out: ${user}`;
      default:
        return `User ${action}: ${user}`;
    }
  }
}

export const activityService = new ActivityService();