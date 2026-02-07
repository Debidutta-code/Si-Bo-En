import { decodeToken, errorResponse } from "../../utils";
import { AgentRequest } from "../utils";
import { config } from "../../config";
import { NextFunction, Response } from 'express';

export const partnerProtected = async (
  req: AgentRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.cookies.agentAccessToken) {
    return res
      .status(401)
      .json(errorResponse('Access token Not found, Login again'));
  }
  const token = req.cookies.agentAccessToken;
  try {
    const decoded:{
        id:string,
        agentEmail:string,
        agencyId:string,
    } = await decodeToken(token, config.agencyJWTSecret!);

    if (
      !decoded ||
      !decoded.id ||
      !decoded.agentEmail ||
      !decoded.agencyId
    ) {
      return res.status(401).json(errorResponse('Login failed'));
    }
    req.agent = {
      id: decoded.id,
      agentEmail: decoded.agentEmail,
      agencyId: decoded.agencyId
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

