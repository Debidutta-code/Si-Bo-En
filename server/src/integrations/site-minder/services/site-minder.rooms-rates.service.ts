import { RateTigerDao } from '../../rate-tiger/dao';
import { SiteMinderDao } from '../dao';
import { SiteMinderXmlParser } from '../utils/xml-parser';
import { ServiceLogger, LogBuilder } from '../../../logs/services/service-log.service';

const logger = new ServiceLogger('SiteMinderARI');

export class SiteMinderRoomsRatesService {

    public static async getRoomsRates(params: {
        hotelCode: string;
        echoToken: string;
        version: string;
    }, log: LogBuilder): Promise<string> {
        const { hotelCode, echoToken, version } = params;

        try {
            // ── Repo: getProperty ─────────────────────────────────────────────
            let property: any;
            const t0 = Date.now();
            try {
                property = await SiteMinderDao.getProperty(hotelCode);
                log.addRepoCall({
                    repoName: 'SiteMinderDao',
                    method: 'getProperty',
                    input: { hotelCode },
                    response: property ?? null,
                    success: !!property,
                    durationMs: Date.now() - t0,
                });
            } catch (err: any) {
                log.addRepoCall({
                    repoName: 'SiteMinderDao',
                    method: 'getProperty',
                    input: { hotelCode },
                    success: false,
                    durationMs: Date.now() - t0,
                    error: { message: err?.message },
                });
                throw err;
            }

            if (!property) {
                log.pushMessage(`Property ${hotelCode} not found`, 'error');
                return SiteMinderXmlParser.buildRoomsRatesResponse({
                    echoToken, version, roomStays: [],
                    error: { type: 6, code: 392, text: `Hotel not found for HotelCode=${hotelCode}` },
                });
            }

            // ── Repo: getPropertyMappingData ──────────────────────────────────
            let mappingData: any;
            const t1 = Date.now();
            try {
                mappingData = await RateTigerDao.getPropertyMappingData(property.propertyCode);
                log.addRepoCall({
                    repoName: 'RateTigerDao',
                    method: 'getPropertyMappingData',
                    input: { propertyCode: property.propertyCode },
                    response: mappingData ? {
                        roomTypesCount: mappingData.roomTypes?.length ?? 0,
                        ratePlansCount: mappingData.ratePlans?.length ?? 0,
                        roomRatesCount: mappingData.roomRates?.length ?? 0,
                    } : undefined,
                    success: !!mappingData,
                    durationMs: Date.now() - t1,
                });
            } catch (err: any) {
                log.addRepoCall({
                    repoName: 'RateTigerDao',
                    method: 'getPropertyMappingData',
                    input: { propertyCode: property.propertyCode },
                    success: false,
                    durationMs: Date.now() - t1,
                    error: { message: err?.message },
                });
                throw err;
            }

            if (!mappingData) {
                log.pushMessage(`Mapping data not found for property ${property.propertyCode}`, 'error');
                return SiteMinderXmlParser.buildRoomsRatesResponse({
                    echoToken, version, roomStays: [],
                    error: { type: 6, code: 392, text: `Hotel not found for HotelCode=${hotelCode}` },
                });
            }

            const roomStays: Array<{
                roomTypeCode: string;
                roomTypeName: string;
                maxOccupancy: number;
                ratePlanCode: string;
                ratePlanName: string;
            }> = [];

            for (const roomRate of mappingData.roomRates) {
                const room = mappingData.roomTypes.find(
                    (r: any) => r.roomTypeCode === roomRate.roomTypeCode
                );
                const ratePlan = mappingData.ratePlans.find(
                    (rp: any) => rp.ratePlanCode === roomRate.ratePlanCode
                );
                if (!room || !ratePlan) continue;

                roomStays.push({
                    roomTypeCode: room.roomTypeCode,
                    roomTypeName: room.roomTypeName,
                    maxOccupancy: room.maxNumberOfAdults,
                    ratePlanCode: ratePlan.ratePlanCode,
                    ratePlanName: ratePlan.ratePlanName,
                });
            }

            log.pushMessage(`Built ${roomStays.length} room+rate combinations`, 'info', { roomStays });

            return SiteMinderXmlParser.buildRoomsRatesResponse({ echoToken, version, roomStays });

        } catch (error: any) {
            log.setError(error);
            return SiteMinderXmlParser.buildRoomsRatesResponse({
                echoToken, version, roomStays: [],
                error: { type: 6, code: 392, text: `Hotel not found for HotelCode=${hotelCode}` },
            });
        }
    }
}