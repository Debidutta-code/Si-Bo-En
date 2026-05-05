import axios from "axios";
import { Request } from "express";
import { CustomRequest, PropertyCustomRequest, PropertyRequest } from "./customRequest";

export const getGeoLocationDetails = async (
    req: Request | CustomRequest | PropertyCustomRequest | PropertyRequest
) => {
    let ip = (req.headers['x-forwarded-for'] as string || req.ip || "")
        .split(',')[0]
        .trim();

    if (ip.startsWith('::ffff:')) {
        ip = ip.replace('::ffff:', '');
    }

    const isLocal = !ip || ip === '::1' || ip === '127.0.0.1';

    console.log("Detected IP:", ip);

    if (isLocal) {
        console.log("Local call detected");
        return {
            success: true,
            ip: '49.36.0.1',
            city: 'Mumbai',
            country: 'IN',
            coordinates: [19.0760, 72.8777],
        };
    }

    // ✅ 1. Try ipapi (PRIMARY)
    try {
        console.log("Trying ipapi...");

        const res = await axios.get(`https://ipapi.co/${ip}/json/`, {
            timeout: 3000,
        });

        return {
            success: true,
            ip,
            city: res.data?.city ?? 'Unknown',
            country: res.data?.country_code ?? 'Unknown',
            coordinates: [res.data?.latitude ?? 0, res.data?.longitude ?? 0],
        };

    } catch (err) {
        console.error("ipapi failed, trying fallback...", err);
    }

    // 🔁 2. Fallback to ip-api (your current one)
    try {
        console.log("Trying ip-api fallback...");

        const res = await axios.get(`http://ip-api.com/json/${ip}`, {
            timeout: 3000,
            headers: {
                "User-Agent": "Mozilla/5.0",
            },
        });

        return {
            success: true,
            ip,
            city: res.data?.city ?? 'Unknown',
            country: res.data?.countryCode ?? 'Unknown',
            coordinates: [res.data?.lat ?? 0, res.data?.lon ?? 0],
        };

    } catch (err) {
        console.error("Fallback geo lookup failed:", err);
    }

    // ❌ Final fallback
    return {
        success: false,
        ip,
        city: 'Unknown',
        country: 'Unknown',
        coordinates: [0, 0],
    };
};