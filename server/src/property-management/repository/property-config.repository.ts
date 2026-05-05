import { prisma } from "../../config";
import { IUPropertyConfig } from "../types";
export class PropertyConfigRepo {
    public async updatePropertyConfig(propertyId: string, config: IUPropertyConfig): Promise<IUPropertyConfig | Error> {
        try {
            return await prisma.propertyConfigs.update({
                where: {
                    propertyId: propertyId
                }, data: {
                    channelManagerIntegrationActive: config.channelManagerIntegrationActive,
                    pmsIntegrationActive: config.pmsIntegrationActive,
                    baseCurrency: config.baseCurrency,
                    commission: config.commission,
                    isB2cAvailable: config.isB2cAvailable,
                    isB2bAvailable: config.isB2bAvailable,
                    showVideo:config.showVideo,
                    reservationResetMinutes: config.reservationResetMinutes,
                    selfAriActive: config.selfAriActive,
                    timezone: config.timezone,
                    isAvailableForBooking: config.isAvailableForBooking,
                    isAvailableForOTA: config.isAvailableForOTA,
                    updatedAt: new Date()
                }
            })
        } catch (error: any) {
            throw new Error(error.message || "Failed to update property config")
        }
    }
    public async getConfigByProperty(propertyId: string): Promise<IUPropertyConfig | null | Error> {
        try {
            return await prisma.propertyConfigs.findUnique({
                where: {
                    propertyId: propertyId
                }
            })
        } catch (error) {
            throw new Error("Failed to update property config")
        }
    }
}