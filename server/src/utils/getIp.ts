// utils/ip.util.ts or utils/getIp.ts

import { CustomRequest } from './customRequest';

export const getIp = (req: CustomRequest): string => {
  if (req.ip) {
    return req.ip;
  }

  const xForwardedFor = req.headers['x-forwarded-for'];
  if (typeof xForwardedFor === 'string') {
    const ips = xForwardedFor.split(',').map(ip => ip.trim());
    if (ips.length > 0) return ips[0]; // First IP is the original client
  }

  return (
    req.socket?.remoteAddress ||
    req.connection?.remoteAddress ||
    'IP_UNKNOWN'
  );
};