const UAParser = require('ua-parser-js');
import { Request } from 'express';
import {
    CustomRequest,
    PropertyCustomRequest,
    PropertyRequest,
} from './customRequest';

export const getDeviceInfo = (
    req: Request | CustomRequest | PropertyCustomRequest | PropertyRequest
) => {
    const userAgent = req.headers['user-agent'] || '';
    const result = UAParser(userAgent);

    const deviceType = result.device.type || 'desktop';
    return {
        deviceType: deviceType,
        browser: result.browser.name,
        os: result.os.name,
        fullDetails: result,
    };
};
