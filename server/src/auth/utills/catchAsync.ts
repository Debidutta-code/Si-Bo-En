import { Request as BaseRequest, NextFunction, Response } from 'express';

export interface Request<User = unknown, Role = unknown> extends BaseRequest {
  jwt: string;
  user: User;
  role: Role;
}

type CatchAsyncFN<User, Role> = (
  req: Request<User, Role>,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

export const catchAsync = <User, Role>(fn: CatchAsyncFN<User, Role>) => {
  return (req: Request<User, Role>, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
