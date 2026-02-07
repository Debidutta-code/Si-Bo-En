// middleware/globalActivityLogger.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { ActivityLogger, IActivityConfig } from '../utils/activityLogger';
import { ACTIVITY_LOGGER_ROUTES } from '../utils/activityLoggerConfig';

export const globalActivityLogger = (req: Request, res: Response, next: NextFunction) => {
  const skipPaths = [
    '/health',
    '/ping',
    '/metrics',
    '/favicon.ico',
    '/api/activities' 
  ];
  
  if (skipPaths.some(path => req.path.includes(path))) {
    return next();
  }
  
  // Find matching route configuration
  const matchedRoute = ACTIVITY_LOGGER_ROUTES.find(route => {
    const pathMatches = route.pattern.test(req.path);
    const methodMatches = !route.method || 
      (Array.isArray(route.method) 
        ? route.method.includes(req.method)
        : route.method === req.method
      );
    
    return pathMatches && methodMatches;
  });
  
  if (!matchedRoute) {
    return next();
  }
  
  // Resolve dynamic action/entity if functions
  const config: IActivityConfig = {
    ...matchedRoute.config,
    action: typeof matchedRoute.config.action === 'function'
      ? matchedRoute.config.action(req)
      : matchedRoute.config.action,
    entity: typeof matchedRoute.config.entity === 'function'
      ? matchedRoute.config.entity(req)
      : matchedRoute.config.entity
  };
  
  // Apply the activity logger
  return ActivityLogger.logActivity(config)(req, res, next);
};