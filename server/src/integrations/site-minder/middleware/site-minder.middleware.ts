import { Request, Response, NextFunction } from 'express';
import { config } from '../../../config';
import { SiteMinderXmlParser } from '../utils/xml-parser';

export class SiteMinderMiddleware {

    public static validateSoapCredentials(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const rawXml = req.body as string;

            if (!rawXml || typeof rawXml !== 'string') {
                return res
                    .status(200)
                    .set('Content-Type', 'text/xml; charset=utf-8')
                    .send(SiteMinderXmlParser.buildCredentialsError('roomsRates', ''));
            }

            let parsed: ReturnType<typeof SiteMinderXmlParser.parseIncoming>;
            try {
                parsed = SiteMinderXmlParser.parseIncoming(rawXml);
            } catch (parseError: any) {
                return res
                    .status(200)
                    .set('Content-Type', 'text/xml; charset=utf-8')
                    .send(SiteMinderXmlParser.buildCredentialsError('roomsRates', ''));
            }

            const expectedUsername = config.siteMinderUsername;
            const expectedPassword = config.siteMinderPassword;

            if (!expectedUsername || !expectedPassword) {
                return res
                    .status(200)
                    .set('Content-Type', 'text/xml; charset=utf-8')
                    .send(SiteMinderXmlParser.buildCredentialsError('roomsRates', ''));
            }

            const { username, password } = parsed.security;

            if (username !== expectedUsername || password !== expectedPassword) {
                const typeMap: Record<string, 'avail' | 'rates' | 'roomsRates'> = {
                    availability: 'avail',
                    rates: 'rates',
                    roomsRates: 'roomsRates',
                };
                const echoToken =
                    parsed.availPayload?.echoToken ??
                    parsed.ratesPayload?.echoToken ??
                    parsed.roomsRatesPayload?.echoToken ??
                    '';

                return res
                    .status(200)
                    .set('Content-Type', 'text/xml; charset=utf-8')
                    .send(SiteMinderXmlParser.buildCredentialsError(typeMap[parsed.type], echoToken));
            }

            (req as any).siteMinderParsed = parsed;
            next();

        } catch (error: any) {
            return res
                .status(200)
                .set('Content-Type', 'text/xml; charset=utf-8')
                .send(SiteMinderXmlParser.buildCredentialsError('roomsRates', ''));
        }
    }
}