// utils/activityLogger.ts

import { Request, Response, NextFunction } from 'express';
import { CustomRequest } from './customRequest';
import { activityService } from '../logs/services/logs.services';
import { ActivityAction, ActivityEntity, ActivitySeverity, IChangeLog } from '../logs/model/activity.model';
import { ICreateActivityInput } from '../logs/types/types';
import { AgentRequest } from '../agent-paltform/utils';

// Union type for all possible request types
type AnyCustomRequest = CustomRequest | AgentRequest;

// Type guard to check if request is CustomRequest
function isCustomRequest(req: AnyCustomRequest): req is CustomRequest {
  return 'user' in req && req.user !== undefined;
}

// Type guard to check if request is AgentRequest
function isAgentRequest(req: AnyCustomRequest): req is AgentRequest {
  return 'agent' in req && req.agent !== undefined;
}

interface IActivityConfig {
  action: ActivityAction | ((req: AnyCustomRequest) => ActivityAction);
  entity: ActivityEntity | ((req: AnyCustomRequest) => ActivityEntity);
  
  getEntityId?: (req: AnyCustomRequest, resBody?: any) => string;
  getEntityName?: (req: AnyCustomRequest, resBody?: any) => string;
  getDescription?: (req: AnyCustomRequest, resBody?: any, statusCode?: number) => string;
  
  trackChanges?: boolean;
  getChanges?: (req: AnyCustomRequest, resBody?: any) => IChangeLog[];
  getOldState?: (req: AnyCustomRequest) => any;
  getNewState?: (req: AnyCustomRequest, resBody?: any) => any;
  
  getRelatedEntities?: (req: AnyCustomRequest, resBody?: any) => Array<{
    entityType: string;
    entityId: string;
    entityName?: string;
  }>;
  
  tags?: string[];
  shouldLog?: (req: AnyCustomRequest, resBody?: any, statusCode?: number) => boolean;
}

// Export type guards for use in configurations
export { isCustomRequest, isAgentRequest, AnyCustomRequest };

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
  
  static logActivity(config: IActivityConfig) {
    return (req: Request, res: Response, next: NextFunction) => {
      const customReq = req as CustomRequest;
      const startTime = Date.now();
      
      const capturedRequest = ActivityLogger.captureRequest(customReq);
      
      const originalJson = res.json.bind(res);
      const originalSend = res.send.bind(res);
      
      let responseBody: any;
      let isResponseSent = false;
      
      res.json = function (body: any) {
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
              customReq
            );
          });
        }
        
        return originalJson(body);
      };
      
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
              customReq
            );
          });
        }
        
        return originalSend(body);
      };
      
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
              customReq
            );
          });
        }
      });
      
      next();
    };
  }
  
  private static captureRequest(req: CustomRequest): ICapturedRequest {
    return {
      method: req.method,
      url: req.originalUrl || req.url,
      path: req.path,
      query: req.query,
      params: req.params,
      body: req.body,
      headers: req.headers,
      cookies: req.cookies
    };
  }
  
  // private static sanitizeBody(body: any): any {
  //   if (!body || typeof body !== 'object') return body;
    
    // const sanitized = { ...body };
    // const sensitiveFields = ['password', 'newPassword', 'oldPassword', 'confirmPassword', 'token', 'accessToken', 'refreshToken', 'apiKey', 'secret', 'cardNumber', 'cvv', 'pin'];
    
    // for (const field of sensitiveFields) {
    //   if (sanitized[field]) {
    //     sanitized[field] = '***REDACTED***';
    //   }
    // }
    
  //   return sanitized;
  // }
  
  // private static sanitizeHeaders(headers: any): Record<string, any> {
  //   if (!headers || typeof headers !== 'object') return {};
    
  //   const sanitized = { ...headers };
  //   const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];
    
  //   for (const header of sensitiveHeaders) {
  //     if (sanitized[header]) {
  //       sanitized[header] = '***REDACTED***';
  //     }
  //   }
    
  //   return sanitized;
  // }
  
  private static isSuccess(statusCode: number): boolean {
    return statusCode >= 200 && statusCode < 300;
  }
  
  private static getSeverity(statusCode: number): ActivitySeverity {
    if (statusCode >= 500) return ActivitySeverity.ERROR;
    if (statusCode >= 400) return ActivitySeverity.WARNING;
    return ActivitySeverity.INFO;
  }
  
  private static async performLogging(
    config: IActivityConfig,
    request: ICapturedRequest,
    response: ICapturedResponse,
    req: CustomRequest
  ): Promise<void> {
    try {
      const isSuccess = ActivityLogger.isSuccess(response.statusCode);
      const severity = ActivityLogger.getSeverity(response.statusCode);
      
      if (config.shouldLog && !config.shouldLog(req, response.body, response.statusCode)) {
        return;
      }
      
      const action = typeof config.action === 'function' ? config.action(req) : config.action;
      const entity = typeof config.entity === 'function' ? config.entity(req) : config.entity;
      
      const entityId = config.getEntityId 
        ? config.getEntityId(req, response.body)
        : response.body?.data?.id || response.body?.data?._id || 'unknown';
      
      const entityName = config.getEntityName
        ? config.getEntityName(req, response.body)
        : response.body?.data?.name || undefined;
      
      let description: string;
      if (config.getDescription) {
        description = config.getDescription(req, response.body, response.statusCode);
      } else {
        description = isSuccess
          ? `${entity} ${action} successful`
          : `${entity} ${action} failed`;
      }
      
      let changes: IChangeLog[] | undefined;
      let oldState: any;
      let newState: any;
      
      if (config.trackChanges) {
        changes = config.getChanges ? config.getChanges(req, response.body) : undefined;
        oldState = config.getOldState ? config.getOldState(req) : undefined;
        newState = config.getNewState ? config.getNewState(req, response.body) : undefined;
      }
      
      const relatedEntitiesResult = config.getRelatedEntities
        ? config.getRelatedEntities(req, response.body)
        : undefined;
      
      const relatedEntities = relatedEntitiesResult && relatedEntitiesResult.length > 0
        ? relatedEntitiesResult.map(entity => ({
            entityType: entity.entityType,
            entityId: entity.entityId,
            entityName: entity.entityName,
            entityCode: undefined
          }))
        : undefined;
      let ip=req.ip || req.socket.remoteAddress || (request.headers['x-forwarded-for'] as string)
      console.log('User IP:', ip);
      if(ip && typeof ip === 'string' && (ip==="::ffff:127.0.0.1"||ip==="::1") ) {
        ip="127.0.0.1"
      }
      const activityData: ICreateActivityInput = {
        action,
        entity,
        entityId,
        entityName,
        
        userId: req.user?.id,
        userEmail: req.user?.email,
        userName: req.user?.email,
        userRole: req.user?.role,
        userLevel: req.user?.level,
        
        creationId: req.user?.creationId || request.body?.creationId,
        
        description,
        shortMessage: `${entity} ${action} - ${isSuccess ? 'Success' : 'Failed'}`,
        
        requestUrl: `${request.method} ${request.url}`,
        requestPayload: {
          method: request.method,
          path: request.path,
          query: request.query,
          params: request.params,
          body: request.body,
          headers: request.headers
        },
        
        apiStatus: isSuccess ? 'success' : 'error',
        
        changes,
        oldState,
        newState,
        
        metadata: {
          ipAddress: ip,
          userAgent: req.get('user-agent'),
          
          requestId: (request.headers['x-request-id'] as string),
          
          statusCode: response.statusCode,
          statusMessage: response.statusMessage,
          responseBody: response.body,
          responseHeaders: response.headers,
          
          executionTimeMs: response.executionTimeMs,
          
          deviceType: ActivityLogger.getDeviceType(req.get('user-agent')),
          browser: ActivityLogger.getBrowser(req.get('user-agent')),
          os: ActivityLogger.getOS(req.get('user-agent')),
          
          referer: req.get('referer'),
          origin: req.get('origin'),
          acceptLanguage: req.get('accept-language')
        },
        
        isError: !isSuccess,
        errorDetails: !isSuccess ? {
          errorCode: response.body?.errorCode || `HTTP_${response.statusCode}`,
          errorMessage: response.body?.message || response.body?.error || response.statusMessage,
          recoverable: response.statusCode < 500
        } : undefined,
        
        severity,
        relatedEntities,
        
        tags: [
          ...(config.tags || []),
          `method:${request.method.toLowerCase()}`,
          `status:${response.statusCode}`,
          isSuccess ? 'success' : 'failure'
        ],
        
        timestamp: new Date()
      };
      
      await activityService.logActivity(activityData);
      
    } catch (logError) {
      console.error('❌ ActivityLogger failed:', logError);
    }
  }
  
  private static getDeviceType(userAgent?: string): 'mobile' | 'tablet' | 'desktop' | undefined {
    if (!userAgent) return undefined;
    
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
      return 'tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(userAgent)) {
      return 'mobile';
    }
    return 'desktop';
  }
  
  private static getBrowser(userAgent?: string): string | undefined {
    console.log('User-Agent:', userAgent);  
    if (!userAgent) return undefined;
    
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    
    return 'Unknown';
  }
  
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

export type { IActivityConfig };