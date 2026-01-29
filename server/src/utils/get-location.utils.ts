import geoip from "geoip-lite";
import { Request } from "express";
import { CustomRequest,PropertyCustomRequest,PropertyRequest } from "./customRequest";

export const getGeoLocationDetails = (req: Request|CustomRequest|PropertyCustomRequest|PropertyRequest) => {
    let ip = (req.headers['x-forwarded-for'] as string || req.ip || "").split(',')[0].trim();

    if (ip.includes('::ffff:')) {
        ip = ip.split(':').reverse()[0];
    }

    const isLocal = !ip || ip === '::1' || ip === '127.0.0.1';
    
    if (isLocal) {
        return { ip: 'localhost', city: 'Unknown', country: 'Unknown', coordinates: [0, 0] };
    }

    const geo = geoip.lookup(ip);

    return geo ? {
        success: true,
        ip: ip,
        city: geo.city || 'Unknown',
        country: geo.country,
        coordinates: geo.ll
    } : {
        success: false,
        ip: ip,
        city: 'Unknown',
        country: 'Unknown',
        coordinates: [0, 0]
    };
};
