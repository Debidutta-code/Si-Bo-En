import { prisma } from '../../../config';
import { ICharges } from '../types';
export class ChargesRepository {
    public async getChargesByPropertyId(
        propertyCode: string,
        roomTypeCodes: string[],
        ratePlanCodes: string[],
        startDate: Date,
        endDate: Date
    ): Promise<ICharges[]> {
        try {
            return await prisma.charge.findMany({
                where: {
                    propertyCode,
                    roomTypeCode: {
                        in: roomTypeCodes,
                    },
                    ratePlanCode: {
                        in: ratePlanCodes,
                    },
                    isSaleStopped: false,
                    date: {
                        gte: startDate,
                        lt: endDate,
                    },
                },
                include: {
                    additionalGuestAmounts: true,
                    baseGuestAmounts: true,
                },
            });
        } catch (error) {
            throw new Error('Failed to retrieve charges');
        }
    }
}
