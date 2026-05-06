
import { RateTigerDao } from '../../rate-tiger/dao'; // adjust path to your actual RateTiger dao
import { SiteMinderXmlParser } from '../utils/xml-parser';

export class SiteMinderRoomsRatesService {

    public static async getRoomsRates(params: {
        hotelCode: string;
        echoToken: string;
        version: string;
    }): Promise<string> {
        const { hotelCode, echoToken, version } = params;

        try {
            // Reuse exact same dao you already have for RateTiger
            const mappingData = await RateTigerDao.getPropertyMappingData(hotelCode);

            if (!mappingData) {
                return SiteMinderXmlParser.buildRoomsRatesResponse({
                    echoToken,
                    version,
                    roomStays: [],
                    error: { type: 3, code: 392, text: `Property ${hotelCode} not found` },
                });
            }

            // Build one RoomStay per room+rate combination
            // SiteMinder spec requires each combination to be its own RoomStay
            const roomStays: Array<{
                roomTypeCode: string;
                roomTypeName: string;
                maxOccupancy: number;
                ratePlanCode: string;
                ratePlanName: string;
            }> = [];

            for (const roomRate of mappingData.roomRates) {
                if (roomRate.status !== 'Active') continue;

                // Find room details
                const room = mappingData.roomTypes.find(
                    r => r.roomTypeCode === roomRate.roomTypeCode
                );
                // Find rate plan details
                const ratePlan = mappingData.ratePlans.find(
                    rp => rp.ratePlanCode === roomRate.ratePlanCode
                );

                if (!room || !ratePlan) continue;

                roomStays.push({
                    roomTypeCode: room.roomTypeCode,
                    roomTypeName: room.roomTypeName,
                    maxOccupancy: room.maxNumberOfAdults,  // Critical for OBP
                    ratePlanCode: ratePlan.ratePlanCode,
                    ratePlanName: ratePlan.ratePlanName,
                });
            }

            return SiteMinderXmlParser.buildRoomsRatesResponse({
                echoToken,
                version,
                roomStays,
            });

        } catch (error: any) {
            return SiteMinderXmlParser.buildRoomsRatesResponse({
                echoToken,
                version,
                roomStays: [],
                error: { type: 3, text: error?.message ?? 'Failed to retrieve rooms and rates' },
            });
        }
    }
}