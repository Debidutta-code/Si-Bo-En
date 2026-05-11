import { NextFunction, Response } from 'express';
import { decodeToken } from '../utils/jwtHelper';
import { CustomRequest } from '../utils/customRequest';
import { errorResponse } from '../utils/return';
import { config } from '../config';

/**
 * Middleware that reads the `loyaltyToken` httpOnly cookie, verifies it
 * and attaches `req.loyaltyUser = { id, email }` for downstream handlers.
 */
export const loyaltyProtect = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    const token = req.cookies?.loyaltyToken;
    if (!token) {
        return res
            .status(401)
            .json(errorResponse('Not authenticated. Please log in.'));
    }
    try {
        const decoded = await decodeToken(token, config.loyaltyJWTSecret!);
        if (!decoded || !decoded.id || !decoded.email) {
            return res
                .status(401)
                .json(
                    errorResponse('Invalid loyalty token. Please log in again.')
                );
        }
        req.loyaltyUser = { id: decoded.id, email: decoded.email };
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
