// middleware/siteminder.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { config } from '../../../config';
import { SiteMinderXmlParser } from '../utils/xml-parser';

export class SiteMinderMiddleware {

    /**
     * Reads raw XML body and validates SOAP Security header credentials.
     * Attaches parsed credentials to req for downstream use.
     * Returns SOAP Fault on auth failure.
     */
    public static validateSoapCredentials(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const rawXml = req.body as string;

            if (!rawXml || typeof rawXml !== 'string') {
                const fault = SiteMinderXmlParser.buildSoapFault(
                    'SOAP-ENV:Client',
                    'Empty or non-XML request body'
                );
                return res
                    .status(400)
                    .set('Content-Type', 'text/xml; charset=utf-8')
                    .send(fault);
            }

            // Parse just enough to extract credentials
            let parsed: ReturnType<typeof SiteMinderXmlParser.parseIncoming>;
            try {
                parsed = SiteMinderXmlParser.parseIncoming(rawXml);
            } catch (parseError: any) {
                const fault = SiteMinderXmlParser.buildSoapFault(
                    'SOAP-ENV:Client',
                    `XML parse error: ${parseError?.message ?? 'Invalid XML'}`
                );
                return res
                    .status(400)
                    .set('Content-Type', 'text/xml; charset=utf-8')
                    .send(fault);
            }

            const { username, password } = parsed.security;

            const expectedUsername = config.siteMinderUsername;
            const expectedPassword = config.siteMinderPassword;

            if (!expectedUsername || !expectedPassword) {
                const fault = SiteMinderXmlParser.buildSoapFault(
                    'SOAP-ENV:Server',
                    'SiteMinder credentials not configured on server'
                );
                return res
                    .status(500)
                    .set('Content-Type', 'text/xml; charset=utf-8')
                    .send(fault);
            }

            if (username !== expectedUsername || password !== expectedPassword) {
                const fault = SiteMinderXmlParser.buildSoapFault(
                    'wsse:FailedAuthentication',
                    'Invalid credentials'
                );
                return res
                    .status(401)
                    .set('Content-Type', 'text/xml; charset=utf-8')
                    .send(fault);
            }

            // Attach the fully parsed request to req for the controller
            (req as any).siteMinderParsed = parsed;

            next();
        } catch (error: any) {
            const fault = SiteMinderXmlParser.buildSoapFault(
                'SOAP-ENV:Server',
                error?.message ?? 'Internal server error during authentication'
            );
            return res
                .status(500)
                .set('Content-Type', 'text/xml; charset=utf-8')
                .send(fault);
        }
    }
}