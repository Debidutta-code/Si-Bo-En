// middleware/ratetiger.middleware.ts

import {  Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { RateTigerTokenPayload } from '../types';
import { RateTigerRequest } from '../../../utils';
import { config } from '../../../config';

export class RateTigerMiddleware {
 public static validateAuthCredentials(
    req: RateTigerRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      // ✅ Check both — BasicAuth (RT standard) and Authorization (fallback for testing)
      const authHeader = 
        (req.headers['basicauth'] as string) ?? 
        (req.headers['authorization'] as string);
      
      if (!authHeader || !authHeader.startsWith('Basic ')) {
        return res.status(401).json({
          success: false,
          message: 'Missing or invalid Authorization header'
        });
      }

      const base64Credentials = authHeader.split(' ')[1];
      // console.log("base cred", base64Credentials);

      const decoded = Buffer.from(base64Credentials, 'base64').toString('utf-8');

      // ✅ Safe split — handles passwords containing ':'
      const colonIndex = decoded.indexOf(':');
      const username = decoded.substring(0, colonIndex);
      const password = decoded.substring(colonIndex + 1);

      // console.log({ username, password });

      // Validate credentials
      const expectedUsername = config.rateTigerUsername;
      const expectedPassword = config.rateTigerPassword;

      if (!expectedUsername || !expectedPassword) {
        return res.status(500).json({
          success: false,
          message: 'RateTiger credentials not configured on server'
        });
      }

      if (username !== expectedUsername || password !== expectedPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid RateTiger credentials'
        });
      }

      // Validate request body
      const { 'API-Key': apiKey, partner_id: partnerId } = req.body;

      if (!apiKey || !partnerId) {
        return res.status(400).json({
          success: false,
          message: 'Missing API-Key or partner_id in request body'
        });
      }

      // Validate against configured values
      const expectedApiKey = config.rateTigerApiKey;
      const expectedPartnerId = config.rateTigerPartnerId;

      if (apiKey !== expectedApiKey || partnerId !== expectedPartnerId) {
        return res.status(401).json({
          success: false,
          message: 'Invalid API-Key or partner_id'
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  }

  public static validateBearerToken(
    req: RateTigerRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const apiKey = req.headers['api-key'] as string;
      
      if (!apiKey) {
        return res.status(401).json({
          success: false,
          message: 'Missing API-Key header'
        });
      }

      // Validate API-Key
      const expectedApiKey = config.rateTigerApiKey;
      if (apiKey !== expectedApiKey) {
        return res.status(401).json({
          success: false,
          message: 'Invalid API-Key'
        });
      }

      // Check Authorization header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Missing or invalid Authorization header'
        });
      }

      const token = authHeader.split(' ')[1];

      // Verify JWT token
      const jwtSecret = config.rateTigerJwtSecret || 'your-secret-key';
      
      const decoded = jwt.verify(token, jwtSecret) as RateTigerTokenPayload;

      // Attach decoded data to request
      req.rateTiger = {
        partnerId: decoded.partnerId,
        apiKey: decoded.apiKey
      };

      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }
      next(error);
    }
  }

}