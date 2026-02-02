import { NextFunction, Response } from 'express';
import { decodeToken } from '../utils/jwtHelper';
import { CustomRequest } from '../utils/customRequest';
import { errorResponse } from '../utils/return';

export const protect = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.cookies.accessToken) {
    return res
      .status(401)
      .json(errorResponse('Access token Not found, Login again'));
  }
  const token = req.cookies.accessToken;
  try {
    const decoded = await decodeToken(token, process.env.JWT_SECRET_KEY_DEV!);

    if (
      !decoded ||
      !decoded.id ||
      !decoded.role ||
      !decoded.email     ) {
      return res.status(401).json(errorResponse('Login failed'));
    }
    req.jwt = token;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      level: decoded.level,
      creationId:decoded.creationId
    };
    next();
  } catch (error: any) {
    if (error instanceof Error && error.name === 'TokenExpiredError') {
      return res
        .status(401)
        .json(
          errorResponse(
            'Token Expired ,Login again to continue',
            error?.message
          )
        );
    }
    return res
      .status(401)
      .json(
        errorResponse('Invalid Token ,Login again to continue', error?.message)
      );
  }
};

export const restrictTo =
  (
    ...roles: Array<
      "super_admin"|  "group_manager"|"hotel_manager"| "staff"| "brand_manager"| "revenue_manager"
    >
  ) =>
  (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req?.user?.role || !roles.includes(req?.user?.role as any)) {
     return res.status(403).json(errorResponse('You do not have permission to perform this action'));
      
    }
    next();
  };
