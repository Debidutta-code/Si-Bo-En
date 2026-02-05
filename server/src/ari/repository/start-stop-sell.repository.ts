import { prisma } from "../../config";
import { IstartStopSellR } from "../types";
export class StartStopSellRepository {
    public async createStartStopSell(
        propertyCode: string,
        startStopSellData: IstartStopSellR[],
    ): Promise<any[] | Error> {
        try {
            //console.log("Creating start-stop-sell for propertyCode:", propertyCode, "with data:", startStopSellData);
            return await prisma.$transaction(
                startStopSellData.map((item) => {
                    const whereClause: any = {
                        propertyCode: propertyCode,
                        date: {
                            gte: item.date,
                            lt: new Date(new Date(item.date).getTime() + 24 * 60 * 60 * 1000) // next day
                        }
                    };
                    
                    // Add optional fields to where clause if provided
                    if (item.ratePlanCode) {
                        whereClause.ratePlanCode = item.ratePlanCode;
                    }
                    if (item.roomTypeCode) {
                        whereClause.roomTypeCode = item.roomTypeCode;
                    }

                    return prisma.charge.updateMany({
                        where: whereClause,
                        data: {
                            isSaleStopped: item.isSellStop
                        }
                    });
                })
            );
        } catch (error) {
            //console.log("Error creating start-stop-sell record:", error);
            throw new Error('Failed to create start-stop-sell record');
        }
    }
}
