import { NextFunction, Response } from 'express';
import { decodeToken } from '../utils/jwtHelper';
import { IOtaCustomRequest, errorResponse } from '../utils';
import { config } from '../config';

export const otaProtect = async (
    req: IOtaCustomRequest,
    res: Response,
    next: NextFunction
) => {
    if (!req.cookies.revvChillOtaAccess) {
        return res
            .status(401)
            .json(errorResponse('Authorization failed, Login again'));
    }
    const token = req.cookies.revvChillOtaAccess;
    try {
        const decoded = await decodeToken(token, config.otaJWTSecret!);

        if (!decoded || !decoded.id || !decoded.email) {
            return res
                .status(401)
                .json(errorResponse('Authorization failed, Login again'));
        }
        req.otaUser = {
            id: decoded.id,
            email: decoded.email,
        };
        next();
    } catch (error: any) {
        if (error instanceof Error && error.name === 'TokenExpiredError') {
            return res
                .status(401)
                .json(
                    errorResponse(
                        'Authorization failed, Login again to continue',
                        error?.message
                    )
                );
        }
        return res
            .status(401)
            .json(
                errorResponse(
                    'Authorization failed, Login again to continue',
                    error?.message
                )
            );
    }
};
