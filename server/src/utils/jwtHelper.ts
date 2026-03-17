import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

export type Role = 'super_admin' | 'group_manager' | 'hotel_manager' |'brand_manager'| 'staff' | 'revenue_manager' | 'regional_admin';

export type Payload = {
  id?: Types.ObjectId | string;
  email?: string;
  role?: Role;
};

const expiresInSeconds = (days: number) => days * 24 * 60 * 60;

const assignToken = (payload: Payload, secret: string, expiresIn: string) => {
  return jwt.sign(payload, secret, {
    expiresIn: expiresInSeconds(parseInt(expiresIn?.split('d')[0]!)),
  });
};

const decodeToken = async (
  token: string,
  secret: string
): Promise<string | jwt.JwtPayload | any> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) reject(err);

      resolve(decoded);
    });
  });
};

export { assignToken, decodeToken };
