import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { Role } from '../../utils/jwtHelper';

export type Payload = {
    id: string;
    email: string;
    role: Role;
    level: number;
    creationId?: string | null;
};
export interface agentPayload {
    id: string;
    agentEmail: string;
    agencyId: string;
}
export interface OtaPayload {
    id: string;
    email: string;
}
export interface CustomerPayload {
    id: string;
    email: string;
}

const expiresInSeconds = (days: number) => days * 24 * 60 * 60;
const expiresInSecondsFromHours = (hours: number) => hours * 60 * 60;

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
export const assignAgentAccessToken = (
    agentPayload: agentPayload,
    secret: string,
    expiresIn: string
) => {
    return jwt.sign(agentPayload, secret, {
        expiresIn: expiresInSeconds(parseInt(expiresIn?.split('d')[0]!)),
    });
};
export const assignOtaAccessToken = (
    otaPayload: OtaPayload,
    secret: string,
    expiresIn: string
) => {
    return jwt.sign(otaPayload, secret, {
        expiresIn: expiresInSecondsFromHours(
            parseInt(expiresIn?.split('h')[0]!)
        ),
    });
};
export const assignCustomerToken = (
    payload: CustomerPayload,
    secret: string,
    expiresIn: string
) => {
    return jwt.sign(payload, secret, {
        expiresIn: expiresInSeconds(parseInt(expiresIn?.split('d')[0]!)),
    });
};

export { assignToken, decodeToken };
