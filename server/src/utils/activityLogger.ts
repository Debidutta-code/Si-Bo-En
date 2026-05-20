// utils/activityLogger.ts - Updated version

import { Request, Response, NextFunction } from 'express';
import { CustomRequest } from './customRequest';
import { activityService } from '../logs/services/logs.services';
import {
    ActivityAction,
    ActivityEntity,
    ActivitySeverity,
    IChangeLog,
} from '../logs/model/activity.model';
import { ICreateActivityInput } from '../logs/types/types';
import { AgentRequest } from '../agent-paltform/utils';

type AnyCustomRequest = CustomRequest | AgentRequest;

function isCustomRequest(req: AnyCustomRequest): req is CustomRequest {
    return 'user' in req && req.user !== undefined;
}

function isAgentRequest(req: AnyCustomRequest): req is AgentRequest {
    return 'agent' in req && req.agent !== undefined;
}

interface IActivityConfig {
    action: ActivityAction | ((req: AnyCustomRequest) => ActivityAction);
    entity: ActivityEntity | ((req: AnyCustomRequest) => ActivityEntity);

    getEntityId?: (req: AnyCustomRequest, resBody?: any) => string;
    getEntityName?: (req: AnyCustomRequest, resBody?: any) => string;
    getDescription?: (
        req: AnyCustomRequest,
        resBody?: any,
        statusCode?: number
    ) => string;

    trackChanges?: boolean;
    getChanges?: (req: AnyCustomRequest, resBody?: any) => IChangeLog[];
    getOldState?: (req: AnyCustomRequest) => any;
    getNewState?: (req: AnyCustomRequest, resBody?: any) => any;

    getRelatedEntities?: (
        req: AnyCustomRequest,
        resBody?: any
    ) => Array<{
        entityType: string;
        entityId: string;
        entityName?: string;
    }>;

    tags?: string[];
    shouldLog?: (
        req: AnyCustomRequest,
        resBody?: any,
        statusCode?: number
    ) => boolean;
    
    // New: Custom body processor for special formats like XML
    processBody?: (body: any, contentType?: string) => any;
}

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
    private static readonly MAX_BODY_SIZE = 10000; // 10KB limit for storage
    private static readonly XML_CONTENT_TYPES = ['text/xml', 'application/xml', 'application/soap+xml'];
    private static readonly JSON_CONTENT_TYPES = ['application/json', 'application/json; charset=utf-8'];

    static logActivity(config: IActivityConfig) {
        return (req: Request, res: Response, next: NextFunction) => {
            const customReq = req as CustomRequest;
            const startTime = Date.now();

            const capturedRequest = ActivityLogger.captureRequest(customReq, config);

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
                                executionTimeMs: executionTime,
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
                                executionTimeMs: executionTime,
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
                                executionTimeMs: executionTime,
                            },
                            customReq
                        );
                    });
                }
            });

            next();
        };
    }

    private static captureRequest(req: CustomRequest, config: IActivityConfig): ICapturedRequest {
        let body = req.body;
        const contentType = req.headers['content-type'] as string;
        
        // Use custom processor if provided
        if (config.processBody) {
            body = config.processBody(body, contentType);
        } 
        // Auto-detect and process based on content type
        else {
            body = ActivityLogger.processRequestBody(body, contentType);
        }
        
        return {
            method: req.method,
            url: req.originalUrl || req.url,
            path: req.path,
            query: req.query,
            params: req.params,
            body: body,
            headers: req.headers,
            cookies: req.cookies,
        };
    }

    private static processRequestBody(body: any, contentType?: string): any {
        // Handle null/undefined
        if (body === null || body === undefined) {
            return body;
        }
        
        // Handle Buffer (raw data)
        if (Buffer.isBuffer(body)) {
            const bufferString = body.toString('utf-8');
            return ActivityLogger.processXmlString(bufferString, body.length);
        }
        
        // Handle XML string
        if (typeof body === 'string') {
            const trimmed = body.trim();
            const isXml = trimmed.startsWith('<') || 
                         trimmed.startsWith('<?xml') || 
                         trimmed.includes('SOAP-ENV');
            
            if (isXml) {
                return ActivityLogger.processXmlString(body, body.length);
            }
            
            // Try to parse as JSON if it looks like JSON
            if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
                try {
                    return JSON.parse(body);
                } catch (e) {
                    // Not valid JSON, return as is
                    return ActivityLogger.truncateIfNeeded(body);
                }
            }
            
            // Regular string
            return ActivityLogger.truncateIfNeeded(body);
        }
        
        // Handle JSON object/array
        if (typeof body === 'object') {
            return ActivityLogger.processJsonObject(body);
        }
        
        return body;
    }

    private static processXmlString(xmlString: string, originalSize: number): any {
        const isTruncated = originalSize > ActivityLogger.MAX_BODY_SIZE;
        
        // Extract key information from XML
        const extractedInfo = ActivityLogger.extractXmlInfo(xmlString);
        
        const result: any = {
            _type: 'xml',
            _metadata: {
                originalSize: originalSize,
                isTruncated: isTruncated,
                extractedAt: new Date().toISOString()
            }
        };
        
        // Store full XML only if it's small enough
        if (!isTruncated) {
            result._content = xmlString;
        } else {
            result._preview = xmlString.substring(0, ActivityLogger.MAX_BODY_SIZE);
            result._metadata.truncatedMessage = `XML truncated from ${originalSize} to ${ActivityLogger.MAX_BODY_SIZE} characters`;
        }
        
        // Add extracted information for searchability
        if (Object.keys(extractedInfo).length > 0) {
            result.extracted = extractedInfo;
        }
        
        return result;
    }

    private static processJsonObject(obj: any): any {
        // Deep clone to avoid modifying original
        const processed = JSON.parse(JSON.stringify(obj));
        
        // Recursively process nested objects
        const processRecursive = (item: any): any => {
            if (item === null || item === undefined) return item;
            
            if (typeof item === 'string') {
                const trimmed = item.trim();
                // Check if string contains XML
                if (trimmed.startsWith('<') || trimmed.includes('<?xml')) {
                    return ActivityLogger.processXmlString(item, item.length);
                }
                return ActivityLogger.truncateIfNeeded(item);
            }
            
            if (typeof item === 'object') {
                if (Array.isArray(item)) {
                    return item.map(processRecursive);
                }
                const result: any = {};
                for (const key in item) {
                    result[key] = processRecursive(item[key]);
                }
                return result;
            }
            
            return item;
        };
        
        return processRecursive(processed);
    }

    private static truncateIfNeeded(value: string): string {
        if (value && typeof value === 'string' && value.length > ActivityLogger.MAX_BODY_SIZE) {
            return value.substring(0, ActivityLogger.MAX_BODY_SIZE) + '...[TRUNCATED]';
        }
        return value;
    }

    private static extractXmlInfo(xmlString: string): any {
        const info: any = {};
        
        // Extract Hotel/Property codes
        const hotelMatch = xmlString.match(/HotelCode="([^"]+)"/);
        if (hotelMatch) info.hotelCode = hotelMatch[1];
        
        const propertyMatch = xmlString.match(/PropertyCode="([^"]+)"/);
        if (propertyMatch) info.propertyCode = propertyMatch[1];
        
        // Extract Room types
        const roomMatches = [...xmlString.matchAll(/InvTypeCode="([^"]+)"/g)];
        if (roomMatches.length > 0) {
            info.roomTypes = [...new Set(roomMatches.map(m => m[1]))];
        }
        
        // Extract Rate plans
        const rateMatches = [...xmlString.matchAll(/RatePlanCode="([^"]+)"/g)];
        if (rateMatches.length > 0) {
            info.ratePlans = [...new Set(rateMatches.map(m => m[1]))];
        }
        
        // Extract dates
        const startMatch = xmlString.match(/Start="([^"]+)"/);
        if (startMatch) info.startDate = startMatch[1];
        
        const endMatch = xmlString.match(/End="([^"]+)"/);
        if (endMatch) info.endDate = endMatch[1];
        
        // Extract action type
        if (xmlString.includes('RestrictionStatus Status="Close"')) {
            info.action = 'close_inventory';
        } else if (xmlString.includes('RestrictionStatus Status="Open"')) {
            info.action = 'open_inventory';
        } else if (xmlString.includes('BookingLimit="0"')) {
            info.action = 'zero_allotment';
        } else if (xmlString.includes('<LengthOfStay')) {
            info.action = 'update_length_of_stay';
        }
        
        // Check if it's OTA message
        if (xmlString.includes('OTA_HotelAvailNotifRQ')) {
            info.messageType = 'OTA_HotelAvailNotifRQ';
        } else if (xmlString.includes('OTA_HotelResNotifRQ')) {
            info.messageType = 'OTA_HotelResNotifRQ';
        } else if (xmlString.includes('SOAP-ENV:Envelope')) {
            info.messageType = 'SOAP_Envelope';
        }
        
        // Extract username if present (SOAP auth)
        const usernameMatch = xmlString.match(/<wsse:Username>([^<]+)<\/wsse:Username>/);
        if (usernameMatch) info.username = usernameMatch[1];
        
        // Count number of inventory changes
        const changesCount = [...xmlString.matchAll(/<AvailStatusMessage/g)].length;
        if (changesCount > 0) {
            info.numberOfChanges = changesCount;
        }
        
        return info;
    }

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

            if (
                config.shouldLog &&
                !config.shouldLog(req, response.body, response.statusCode)
            ) {
                return;
            }

            const action =
                typeof config.action === 'function'
                    ? config.action(req)
                    : config.action;
            const entity =
                typeof config.entity === 'function'
                    ? config.entity(req)
                    : config.entity;

            const entityId = config.getEntityId
                ? config.getEntityId(req, response.body)
                : ActivityLogger.extractEntityIdFromBody(request.body, response.body);

            const entityName = config.getEntityName
                ? config.getEntityName(req, response.body)
                : ActivityLogger.extractEntityNameFromBody(request.body, response.body);

            let description: string;
            if (config.getDescription) {
                description = config.getDescription(
                    req,
                    response.body,
                    response.statusCode
                );
            } else {
                description = isSuccess
                    ? `${entity} ${action} successful`
                    : `${entity} ${action} failed`;
            }

            let changes: IChangeLog[] | undefined;
            let oldState: any;
            let newState: any;

            if (config.trackChanges) {
                changes = config.getChanges
                    ? config.getChanges(req, response.body)
                    : undefined;
                oldState = config.getOldState
                    ? config.getOldState(req)
                    : undefined;
                newState = config.getNewState
                    ? config.getNewState(req, response.body)
                    : undefined;
            }

            const relatedEntitiesResult = config.getRelatedEntities
                ? config.getRelatedEntities(req, response.body)
                : ActivityLogger.extractRelatedEntitiesFromBody(request.body);

            const relatedEntities =
                relatedEntitiesResult && relatedEntitiesResult.length > 0
                    ? relatedEntitiesResult.map(entity => ({
                          entityType: entity.entityType,
                          entityId: entity.entityId,
                          entityName: entity.entityName,
                          entityCode: undefined,
                      }))
                    : undefined;
                    
            let ip = req.ip ||
                req.socket.remoteAddress ||
                (request.headers['x-forwarded-for'] as string);
                
            if (ip && typeof ip === 'string' && (ip === '::ffff:127.0.0.1' || ip === '::1')) {
                ip = '127.0.0.1';
            }

            // Detect if body contains XML
            const isXmlBody = request.body && typeof request.body === 'object' && request.body._type === 'xml';
            const bodyType = isXmlBody ? 'xml' : 'json';

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
                    headers: request.headers,
                    bodyType: bodyType,
                    ...(isXmlBody && request.body._metadata && {
                        xmlMetadata: request.body._metadata
                    })
                },

                apiStatus: isSuccess ? 'success' : 'error',

                changes,
                oldState,
                newState,

                metadata: {
                    ipAddress: ip,
                    userAgent: req.get('user-agent'),
                    requestId: request.headers['x-request-id'] as string,
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
                    acceptLanguage: req.get('accept-language'),
                    // Add body type info
                    payloadType: bodyType,
                    ...(isXmlBody && request.body.extracted && {
                        extractedXmlInfo: request.body.extracted
                    })
                },

                isError: !isSuccess,
                errorDetails: !isSuccess
                    ? {
                          errorCode: response.body?.errorCode || `HTTP_${response.statusCode}`,
                          errorMessage: response.body?.message || response.body?.error || response.statusMessage,
                          recoverable: response.statusCode < 500,
                      }
                    : undefined,

                severity,
                relatedEntities,

                tags: [
                    ...(config.tags || []),
                    `method:${request.method.toLowerCase()}`,
                    `status:${response.statusCode}`,
                    isSuccess ? 'success' : 'failure',
                    bodyType, // Add 'xml' or 'json' tag
                    ...(isXmlBody && request.body.extracted?.messageType ? [request.body.extracted.messageType.toLowerCase()] : [])
                ],

                timestamp: new Date(),
            };

            await activityService.logActivity(activityData);
        } catch (logError) {
            console.error('❌ ActivityLogger failed:', logError);
        }
    }

    private static extractEntityIdFromBody(requestBody: any, responseBody: any): string {
        // Try response body first
        if (responseBody?.data?.id) return responseBody.data.id;
        if (responseBody?.data?._id) return responseBody.data._id;
        if (responseBody?.data?.propertyId) return responseBody.data.propertyId;
        if (responseBody?.data?.hotelCode) return responseBody.data.hotelCode;
        
        // Try request body
        if (requestBody?.id) return requestBody.id;
        if (requestBody?._id) return requestBody._id;
        if (requestBody?.propertyId) return requestBody.propertyId;
        
        // Try XML extracted info
        if (requestBody?.extracted?.hotelCode) return requestBody.extracted.hotelCode;
        if (requestBody?.extracted?.propertyCode) return requestBody.extracted.propertyCode;
        
        return 'unknown';
    }

    private static extractEntityNameFromBody(requestBody: any, responseBody: any): string | undefined {
        if (responseBody?.data?.name) return responseBody.data.name;
        if (responseBody?.data?.propertyName) return responseBody.data.propertyName;
        if (requestBody?.name) return requestBody.name;
        
        if (requestBody?.extracted?.roomTypes) {
            return requestBody.extracted.roomTypes.join(', ');
        }
        
        return undefined;
    }

    private static extractRelatedEntitiesFromBody(requestBody: any): Array<{ entityType: string; entityId: string; entityName?: string }> {
        const entities = [];
        
        if (requestBody?.extracted?.hotelCode) {
            entities.push({
                entityType: ActivityEntity.PROPERTY,
                entityId: requestBody.extracted.hotelCode,
                entityName: requestBody.extracted.hotelCode
            });
        }
        
        if (requestBody?.extracted?.roomTypes) {
            for (const roomType of requestBody.extracted.roomTypes) {
                entities.push({
                    entityType: ActivityEntity.ROOM,
                    entityId: roomType,
                    entityName: roomType
                });
            }
        }
        
        return entities;
    }

    private static getDeviceType(userAgent?: string): 'mobile' | 'tablet' | 'desktop' | undefined {
        if (!userAgent) return undefined;
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) return 'tablet';
        if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(userAgent)) return 'mobile';
        return 'desktop';
    }

    private static getBrowser(userAgent?: string): string | undefined {
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