import axios from "axios";
import { Request } from "express";
import { CustomRequest, PropertyCustomRequest, PropertyRequest } from "./customRequest";

export const getGeoLocationDetails = async (
    req: Request | CustomRequest | PropertyCustomRequest | PropertyRequest
) => {
    let ip = (req.headers['x-forwarded-for'] as string || req.ip || "").split(',')[0].trim();

    if (ip.startsWith('::ffff:')) {
        ip = ip.replace('::ffff:', '');
    }


    // const isLocal = !ip || ip === '::1' || ip === '127.0.0.1';

    // if (isLocal) {
    //     return { success: false, ip: 'localhost', city: 'Unknown', country: 'Unknown', coordinates: [0, 0] };
    // }
   const isLocal = !ip || ip === '::1' || ip === '127.0.0.1';

    // Skip API call in local — return India directly
    if (isLocal) {
        return {
            success: true,
            ip: '49.36.0.1',
            city: 'Mumbai',
            country: 'IN',
            coordinates: [19.0760, 72.8777],
        };
    }
    try {
        const response = await axios.get(`http://ip-api.com/json/${ip}`);
        return {
            success: true,
            ip,
            city: response.data?.city ?? 'Unknown',
            country: response.data?.countryCode ?? 'Unknown',
            coordinates: [response.data?.lat ?? 0, response.data?.lon ?? 0],
        };
    } catch (e) {
        console.error('Geo lookup failed:', e);
        return { success: false, ip, city: 'Unknown', country: 'Unknown', coordinates: [0, 0] };
    }
};