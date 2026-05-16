import { prisma } from '../../config';
import { IAddon, ICAddon } from '../interfaces';
export default class AddonRepository {
    public static async createAddon(data: ICAddon): Promise<IAddon> {
        try {
            return await prisma.addon.create({ data });
        } catch (error: any) {
            throw new Error(error.message);
        }
    }
    public static async getAllAddonsByPropertyId(
        propertyId: string
    ): Promise<IAddon[]> {
        try {
            return await prisma.addon.findMany({ where: { propertyId } });
        } catch (error) {
            throw new Error('Error fetching addons by property ID');
        }
    }
    public static async updateAddon(
        addonId: string,
        updateData: Partial<IAddon>
    ): Promise<IAddon | null> {
        try {
            return await prisma.addon.update({
                where: { id: addonId },
                data: updateData,
            });
        } catch (error) {
            throw new Error('Error updating addon');
        }
    }
    public static async getAddonById(addonId: string): Promise<IAddon | null> {
        try {
            return await prisma.addon.findUnique({ where: { id: addonId } });
        } catch (error) {
            throw new Error('Error fetching addon by ID');
        }
    }
    public static async deleteAddon(addonId: string): Promise<IAddon | null> {
        try {
            const results = await prisma.$transaction([
                prisma.bookingAddon.deleteMany({ where: { addonId } }),
                prisma.addonAvailability.deleteMany({ where: { addonId } }),
                prisma.addon.delete({ where: { id: addonId } }),
            ]);
            return results[2] as IAddon;
        } catch (error) {
            throw new Error(
                'Error deleting addon: dependent records may exist or database error'
            );
        }
    }

    public static async getAddonsWithDetails(
        propertyId: string
    ): Promise<any[]> {
        try {
            return await prisma.addon.findMany({
                where: { propertyId },
                include: {
                    category: {
                        select: { code: true, name: true },
                    },
                    subCategory: {
                        select: { code: true, name: true },
                    },
                    addonVariant: {
                        select: { code: true, name: true },
                    },
                },
            });
        } catch (error) {
            throw new Error('Error fetching addons with details');
        }
    }
}
