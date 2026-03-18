import { AddonAvailability } from "../../../prisma/generated/prisma/client";
import { prisma } from "../../config";
import { ICreateAddonAvailability, IAddonAvailability } from "../interfaces"

export class AddonDateWiseDao {

    /**
     * ✅ NEW: Upsert addon availability
     * Updates existing records, creates new ones for missing dates
     */
    public async upsertAddonDateWise(data: ICreateAddonAvailability[]): Promise<IAddonAvailability[]> {
        try {
            const results: IAddonAvailability[] = [];

            // Process in batches for better performance
            for (const item of data) {
                const result = await prisma.addonAvailability.upsert({
                    where: {
                        addonId_date: {
                            addonId: item.addonId,
                            date: item.date
                        }
                    },
                    update: {
                        price: item.price,
                        currencyCode: item.currencyCode,
                        isAvailable: item.isAvailable
                    },
                    create: {
                        addonId: item.addonId,
                        date: item.date,
                        price: item.price,
                        currencyCode: item.currencyCode,
                        isAvailable: item.isAvailable
                    }
                });
                results.push(result);
            }

            return results;
        } catch (error: any) {
            throw new Error(error?.message || "Failed to upsert addon date-wise availability");
        }
    }

    /**
     * ✅ ALTERNATIVE: Check which dates exist, then decide
     * Returns metadata about what was created vs updated
     */
    public async upsertAddonDateWiseWithMetadata(
        data: ICreateAddonAvailability[]
    ): Promise<{ 
        records: IAddonAvailability[], 
        created: number, 
        updated: number 
    }> {
        try {
            // Find existing records
            const existingRecords = await prisma.addonAvailability.findMany({
                where: {
                    OR: data.map(item => ({
                        addonId: item.addonId,
                        date: item.date
                    }))
                },
                select: {
                    addonId: true,
                    date: true
                }
            });

            // Create a Set for fast lookup
            const existingKeys = new Set(
                existingRecords.map((r:any )=> `${r.addonId}_${r.date.toISOString()}`)
            );

            let createdCount = 0;
            let updatedCount = 0;
            const results: IAddonAvailability[] = [];

            // Upsert each record
            for (const item of data) {
                const key = `${item.addonId}_${item.date.toISOString()}`;
                const exists = existingKeys.has(key);

                const result = await prisma.addonAvailability.upsert({
                    where: {
                        addonId_date: {
                            addonId: item.addonId,
                            date: item.date
                        }
                    },
                    update: {
                        price: item.price,
                        currencyCode: item.currencyCode,
                        isAvailable: item.isAvailable
                    },
                    create: {
                        addonId: item.addonId,
                        date: item.date,
                        price: item.price,
                        currencyCode: item.currencyCode,
                        isAvailable: item.isAvailable
                    }
                });

                results.push(result);
                if (exists) {
                    updatedCount++;
                } else {
                    createdCount++;
                }
            }

            return {
                records: results,
                created: createdCount,
                updated: updatedCount
            };
        } catch (error: any) {
            throw new Error(error?.message || "Failed to upsert addon date-wise availability");
        }
    }

    // Keep existing create method for backward compatibility
    public async createAddOnDateWise(data: ICreateAddonAvailability[]): Promise<IAddonAvailability[] | Error> {
        try {
            return await prisma.$transaction(
                data.map((item) => prisma.addonAvailability.create({ data: item }))
            )
        } catch (error: any) {
            throw new Error(error?.message || "Failed to create addon date-wise availability")
        }
    }

    // ... keep all your other existing methods unchanged
    public async getAddonDateWiseById(addonId: string): Promise<IAddonAvailability[] | Error> {
        try {
            return await prisma.addonAvailability.findMany({ where: { addonId: addonId } })
        } catch (error) {
            throw new Error("Failed to get addon date-wise by ID")
        }
    }

    public async updateAddonByAddonId(addonId: string, data: { price: number, currencyCode: string, isAvailable: boolean }): Promise<{ count: number } | Error> {
        try {
            return await prisma.addonAvailability.updateMany({
                where: { addonId: addonId }, 
                data: { price: data.price, currencyCode: data.currencyCode, isAvailable: data.isAvailable }
            })
        } catch (error) {
            throw new Error("Failed to update addon")
        }
    }

    public async updateAddonForSingleDate(id: string, data: { price: number, currencyCode: string, isAvailable: boolean }): Promise<IAddonAvailability | Error> {
        try {
            return await prisma.addonAvailability.update({
                where: { id: id },
                data: { price: data.price, currencyCode: data.currencyCode, isAvailable: data.isAvailable }
            })
        } catch (error) {
            throw new Error("Update addon for single date")
        }
    }

    public async deleteAddonByAddonId(id: string): Promise<{ count: number } | Error> {
        try {
            return await prisma.addonAvailability.deleteMany({ where: { addonId: id } })
        } catch (error) {
            throw new Error("Failed to delete multiple addon.")
        }
    }

    public async deleteAddonForParticularDate(id: string): Promise<IAddonAvailability | Error> {
        try {
            return await prisma.addonAvailability.delete({ where: { id: id } })
        } catch (error) {
            throw new Error("failed to delete add on")
        }
    }

    public static async getAddonByDate(addonId: string, date: Date): Promise<IAddonAvailability[] | Error> {
        try {
            const start = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            const end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 2);
            return await prisma.addonAvailability.findMany({
                where: {
                    addonId: addonId,
                    date: { gte: start, lte: end }
                }, 
                include: {
                    addon: true
                }
            });
        } catch (error) {
            throw new Error(`Error fetching addons with property id for ${date}`);
        }
    }

    public static async findAddOnForDateWise(dateWiseId: string): Promise<IAddonAvailability | null | Error> {
        try {
            return await prisma.addonAvailability.findFirst({
                where: {
                    id: dateWiseId
                }
            })
        } catch (error) {
            throw new Error(`Error fetching addons `);
        }
    }

    public static async getAvailableAddonsByDateRange(
        propertyId: string,
        startDate: Date,
        endDate: Date,
        ratePlanCode: string
    ): Promise<AddonAvailability[]> {
        try {
            const availabilityRecords = await prisma.addonAvailability.findMany({
                where: {
                    addon: {
                        propertyId: propertyId,
                        isActive: true,
                        ratePlans: {
                            none: {
                                ratePlan: {
                                    ratePlanCode: ratePlanCode,
                                    propertyId: propertyId
                                }
                            }
                        }
                    },
                    date: {
                        gte: startDate,
                        lte: endDate
                    },
                    isAvailable: true
                },
                include: {
                    addon: {
                        include: {
                            category: {
                                select: { code: true, name: true }
                            },
                            subCategory: {
                                select: { code: true, name: true }
                            },
                            addonVariant: {
                                select: { code: true, name: true }
                            }
                        }
                    }
                },
                orderBy: [
                    { addonId: 'asc' },
                    { date: 'asc' }
                ]
            });

            return availabilityRecords;
        } catch (error: any) {
            throw new Error(`Error fetching available addons for date range: ${error?.message}`);
        }
    }
}