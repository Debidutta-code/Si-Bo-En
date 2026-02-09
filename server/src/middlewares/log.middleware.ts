// utils/activityLogger.ts

import { Request, Response, NextFunction } from 'express';
import { activityService } from '../logs/services/logs.services';
import { ActivityAction, ActivityEntity, ActivitySeverity,IChangeLog } from '../logs/model/activity.model';
import { ICreateActivityInput } from '../logs/types/types';

export interface IActivityConfig {
  action: ActivityAction;
  entity: ActivityEntity;
  
  // Entity extraction
  getEntityId?: (req: Request, resBody?: any) => string;
  getEntityName?: (req: Request, resBody?: any) => string;
  getDescription?: (req: Request, resBody?: any, statusCode?: number) => string;
  
  // Optional: track changes (for UPDATE operations)
  trackChanges?: boolean;
  getChanges?: (req: Request, resBody?: any) => IChangeLog[];
  getOldState?: (req: Request) => any;
  getNewState?: (req: Request, resBody?: any) => any;
  
  // Optional: related entities
  getRelatedEntities?: (req: Request, resBody?: any) => Array<{
    entityType: string;
    entityId: string;
    entityName?: string;
  }>;
  
  // Optional: custom tags
  tags?: string[];
  
  // Optional: conditional logging
  shouldLog?: (req: Request, resBody?: any, statusCode?: number) => boolean;
}

interface ICapturedRequest {
  method: string;
  url: string;
  path: string;
  query: any;
  params: any;
  body: any;
  headers: Record<string, any>;
  cookies?: any;
}

interface ICapturedResponse {
  statusCode: number;
  statusMessage: string;
  body: any;
  headers: Record<string, any>;
  executionTimeMs: number;
}

export class ActivityLogger {
  
  /**
   * Main middleware for automatic activity logging
   */
  static logActivity(config: IActivityConfig) {
    return (req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      
      // Capture request details
      const capturedRequest = ActivityLogger.captureRequest(req);
      
      // Store original res.json
      const originalJson = res.json.bind(res);
      const originalSend = res.send.bind(res);
      
      let responseBody: any;
      let isResponseSent = false;
      
      // Intercept res.json
      res.json = function (body: any) {
        if (!isResponseSent) {
          responseBody = body;
          isResponseSent = true;
          
          const executionTime = Date.now() - startTime;
          
          // Log asynchronously (non-blocking)
          setImmediate(() => {
            ActivityLogger.performLogging(
              config,
              capturedRequest,
              {
                statusCode: res.statusCode,
                statusMessage: res.statusMessage,
                body: responseBody,
                headers: res.getHeaders() as Record<string, any>,
                executionTimeMs: executionTime
              },
              req
            );
          });
        }
        
        return originalJson(body);
      };
      
      // Intercept res.send (for non-JSON responses)
      res.send = function (body: any) {
        if (!isResponseSent) {
          responseBody = body;
          isResponseSent = true;
          
          const executionTime = Date.now() - startTime;
          
          setImmediate(() => {
            ActivityLogger.performLogging(
              config,
              capturedRequest,
              {
                statusCode: res.statusCode,
                statusMessage: res.statusMessage,
                body: responseBody,
                headers: res.getHeaders() as Record<string, any>,
                executionTimeMs: executionTime
              },
              req
            );
          });
        }
        
        return originalSend(body);
      };
      
      // Handle errors/exceptions
      res.on('finish', () => {
        if (!isResponseSent) {
          const executionTime = Date.now() - startTime;
          
          setImmediate(() => {
            ActivityLogger.performLogging(
              config,
              capturedRequest,
              {
                statusCode: res.statusCode,
                statusMessage: res.statusMessage,
                body: responseBody,
                headers: res.getHeaders() as Record<string, any>,
                executionTimeMs: executionTime
              },
              req
            );
          });
        }
      });
      
      next();
    };
  }
  
  /**
   * Capture complete request details
   */
  private static captureRequest(req: Request): ICapturedRequest {
    const customReq = req as any;
    
    return {
      method: req.method,
      url: req.originalUrl || req.url,
      path: req.path,
      query: req.query,
      params: req.params,
      body: ActivityLogger.sanitizeBody(req.body),
      headers: ActivityLogger.sanitizeHeaders(req.headers),
      cookies: req.cookies
    };
  }
  
  /**
   * Sanitize sensitive data from request body
   */
  private static sanitizeBody(body: any): any {
    if (!body) return body;
    
    const sanitized = { ...body };
    const sensitiveFields = [
      'password',
      'newPassword',
      'oldPassword',
      'confirmPassword',
      'token',
      'accessToken',
      'refreshToken',
      'apiKey',
      'secret',
      'cardNumber',
      'cvv',
      'pin'
    ];
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    }
    
    return sanitized;
  }
  
  /**
   * Sanitize sensitive headers
   */
  private static sanitizeHeaders(headers: any): Record<string, any> {
    const sanitized = { ...headers };
    const sensitiveHeaders = [
      'authorization',
      'cookie',
      'x-api-key',
      'x-auth-token'
    ];
    
    for (const header of sensitiveHeaders) {
      if (sanitized[header]) {
        sanitized[header] = '***REDACTED***';
      }
    }
    
    return sanitized;
  }
  
  /**
   * Determine if response was successful
   */
  private static isSuccess(statusCode: number): boolean {
    return statusCode >= 200 && statusCode < 300;
  }
  
  /**
   * Determine severity based on status code
   */
  private static getSeverity(statusCode: number): ActivitySeverity {
    if (statusCode >= 500) return ActivitySeverity.ERROR;
    if (statusCode >= 400) return ActivitySeverity.WARNING;
    return ActivitySeverity.INFO;
  }
  
  /**
   * Perform the actual logging
   */
  private static async performLogging(
    config: IActivityConfig,
    request: ICapturedRequest,
    response: ICapturedResponse,
    req: Request
  ): Promise<void> {
    try {
      const customReq = req as any;
      const isSuccess = ActivityLogger.isSuccess(response.statusCode);
      const severity = ActivityLogger.getSeverity(response.statusCode);
      
      // Check if logging should happen
      if (config.shouldLog && !config.shouldLog(req, response.body, response.statusCode)) {
        return;
      }
      
      // Extract entity details
      const entityId = config.getEntityId 
        ? config.getEntityId(req, response.body)
        : response.body?.data?.id || response.body?.data?._id || 'unknown';
      
      const entityName = config.getEntityName
        ? config.getEntityName(req, response.body)
        : response.body?.data?.name || undefined;
      
      // Generate description
      let description: string;
      if (config.getDescription) {
        description = config.getDescription(req, response.body, response.statusCode);
      } else {
        description = isSuccess
          ? `${config.entity} ${config.action} successful`
          : `${config.entity} ${config.action} failed`;
      }
      
      // Extract changes (for UPDATE operations)
      let changes: IChangeLog[] | undefined;
      let oldState: any;
      let newState: any;
      
      if (config.trackChanges) {
        changes = config.getChanges ? config.getChanges(req, response.body) : undefined;
        oldState = config.getOldState ? config.getOldState(req) : undefined;
        newState = config.getNewState ? config.getNewState(req, response.body) : undefined;
      }
      
      // Extract related entities
      const relatedEntities = config.getRelatedEntities
        ? config.getRelatedEntities(req, response.body)
        : undefined;
      
      // Build activity data
      const activityData: ICreateActivityInput = {
        // Core fields
        action: config.action,
        entity: config.entity,
        entityId,
        entityName,
        
        // User context
        userId: customReq.user?.userId || customReq.user?.id,
        userEmail: customReq.user?.email,
        userName: customReq.user?.name || customReq.user?.username,
        userRole: customReq.user?.role,
        userLevel: customReq.user?.level,
        
        // Property context
        propertyId: customReq.propertyId || request.body?.propertyId,
        propertyCode: customReq.propertyCode || request.body?.propertyCode,
        propertyName: customReq.propertyName || request.body?.propertyName,
        
        // Creation context
        creationId: customReq.creationId || request.body?.creationId,
        creationName: customReq.creationName,
        creationType: customReq.creationType,
        
        // Description
        description,
        shortMessage: `${config.entity} ${config.action} - ${isSuccess ? 'Success' : 'Failed'}`,
        
        // Request details - COMPLETE CAPTURE
        requestUrl: `${request.method} ${request.url}`,
        requestPayload: {
          method: request.method,
          path: request.path,
          query: request.query,
          params: request.params,
          body: request.body,
          headers: request.headers
        },
        
        // Response status
        apiStatus: isSuccess ? 'success' : 'error',
        
        // Changes tracking
        changes,
        oldState,
        newState,
        
        // Metadata - EVERYTHING
        metadata: {
          // Network info
          ipAddress: req.ip || req.socket.remoteAddress || request.headers['x-forwarded-for'],
          userAgent: req.get('user-agent'),
          
          // Request info
          sessionId: customReq.sessionId,
          requestId: customReq.requestId || request.headers['x-request-id'],
          
          // Response info
          statusCode: response.statusCode,
          statusMessage: response.statusMessage,
          responseBody: response.body,
          responseHeaders: response.headers,
          
          // Timing
          executionTimeMs: response.executionTimeMs,
          
          // Device info
          deviceType: ActivityLogger.getDeviceType(req.get('user-agent')),
          browser: ActivityLogger.getBrowser(req.get('user-agent')),
          os: ActivityLogger.getOS(req.get('user-agent')),
          
          // Location (if available from middleware)
          country: customReq.country,
          city: customReq.city,
          timezone: customReq.timezone,
          
          // Additional
          referer: req.get('referer'),
          origin: req.get('origin'),
          acceptLanguage: req.get('accept-language')
        },
        
        // Error handling
        isError: !isSuccess,
        errorDetails: !isSuccess ? {
          errorCode: response.body?.errorCode || `HTTP_${response.statusCode}`,
          errorMessage: response.body?.message || response.body?.error || response.statusMessage,
          recoverable: response.statusCode < 500
        } : undefined,
        
        // Severity
        severity,
        
        // Related entities
        relatedEntities,
        
        // Tags
        tags: [
          ...(config.tags || []),
          `method:${request.method.toLowerCase()}`,
          `status:${response.statusCode}`,
          isSuccess ? 'success' : 'failure'
        ],
        
        timestamp: new Date()
      };
      
      // Log the activity (fire and forget)
      await activityService.logActivity(activityData);
      
    } catch (logError) {
      // NEVER let logging errors affect the main flow
      console.error('❌ ActivityLogger failed:', logError);
    }
  }
  
  /**
   * Helper: Detect device type from user agent
   */
  private static getDeviceType(userAgent?: string): 'mobile' | 'tablet' | 'desktop' | undefined {
    if (!userAgent) return undefined;
    
    const ua = userAgent.toLowerCase();
    
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
      return 'tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(userAgent)) {
      return 'mobile';
    }
    return 'desktop';
  }
  
  /**
   * Helper: Extract browser from user agent
   */
  private static getBrowser(userAgent?: string): string | undefined {
    if (!userAgent) return undefined;
    
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    
    return 'Unknown';
  }
  
  /**
   * Helper: Extract OS from user agent
   */
  private static getOS(userAgent?: string): string | undefined {
    if (!userAgent) return undefined;
    
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
    
    return 'Unknown';
  }
}