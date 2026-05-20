import { NextFunction, Response } from 'express';
import { decodeToken } from '../auth/utills/jwtHelper';
import { CustomRequest } from '../utils/customRequest';
import { errorResponse } from '../utils/return';
import { config } from '../config';

/**
 * Protects routes that require customer login (spa, loyalty).
 * Reads customerToken cookie → verifies → attaches req.customer = { id, email }
 */
export const customerProtect = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const token = req.cookies?.customerToken;
    if (!token) {
        return res
            .status(401)
            .json(errorResponse('Please log in to access this feature'));
    }
    try {
        const decoded = await decodeToken(token, config.loyaltyJWTSecret!);
        if (!decoded?.id || !decoded?.email) {
            return res
                .status(401)
                .json(errorResponse('Invalid token. Please log in again.'));
        }
        req.customer = { id: decoded.id, email: decoded.email };
        next();
    } catch (error: any) {
        if (error?.name === 'TokenExpiredError') {
            return res
                .status(401)
                .json(errorResponse('Session expired. Please log in again.'));
        }
        return res
            .status(401)
            .json(errorResponse('Invalid token. Please log in again.'));
    }
};