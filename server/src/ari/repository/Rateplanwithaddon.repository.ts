import { IRatePlanWithAddon } from '../types';
import { prisma } from '../../config';
export class RatePlanWithAddonRepository {
    /**
     * Add an addon to a rate plan
     */
    public static async addAddonToRatePlan(
        ratePlanCode: string,
        addonId: string
    ): Promise<IRatePlanWithAddon> {
        try {
            // First, get the rate plan ID from the code
            const ratePlan = await prisma.ratePlan.findUnique({
                where: { ratePlanCode },
                select: { id: true },
            });

            if (!ratePlan) {
                throw new Error(
                    `Rate plan with code ${ratePlanCode} not found`
                );
            }

            // Check if the addon exists
            const addon = await prisma.addon.findUnique({
                where: { id: addonId },
            });

            if (!addon) {
                throw new Error(`Addon with ID ${addonId} not found`);
            }

            // Check if the relationship already exists
            const existingRelation = await prisma.ratePlanWithAddon.findUnique({
                where: {
                    ratePlanId_addonId: {
                        ratePlanId: ratePlan.id,
                        addonId: addonId,
                    },
                },
            });

            if (existingRelation) {
                throw new Error('This addon is already added to the rate plan');
            }

            // Create the relationship
            const relation = await prisma.ratePlanWithAddon.create({
                data: {
                    ratePlanId: ratePlan.id,
                    addonId: addonId,
                },
            });

            return relation;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(
                    `Failed to add addon to rate plan: ${error.message}`
                );
            }
            throw new Error(
                'Unknown error occurred while adding addon to rate plan'
            );
        }
    }

    /**
     * Remove an addon from a rate plan
     */
    public static async removeAddonFromRatePlan(
        ratePlanCode: string,
        addonId: string
    ): Promise<IRatePlanWithAddon> {
        try {
            // First, get the rate plan ID from the code
            const ratePlan = await prisma.ratePlan.findUnique({
                where: { ratePlanCode },
                select: { id: true },
            });

            if (!ratePlan) {
                throw new Error(
                    `Rate plan with code ${ratePlanCode} not found`
                );
            }

            // Delete the relationship
            const deleted = await prisma.ratePlanWithAddon.delete({
                where: {
                    ratePlanId_addonId: {
                        ratePlanId: ratePlan.id,
                        addonId: addonId,
                    },
                },
            });

            return deleted;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(
                    `Failed to remove addon from rate plan: ${error.message}`
                );
            }
            throw new Error(
                'Unknown error occurred while removing addon from rate plan'
            );
        }
    }

    /**
     * Get all addons for a specific rate plan
     */
    public static async getAddonsByRatePlanCode(
        ratePlanCode: string
    ): Promise<any[]> {
        try {
            const ratePlan = await prisma.ratePlan.findUnique({
                where: { ratePlanCode },
                select: {
                    id: true,
                    Addons: {
                        include: {
                            addon: {
                                include: {
                                    category: true,
                                    subCategory: true,
                                    addonVariant: true,
                                },
                            },
                        },
                    },
                },
            });

            if (!ratePlan) {
                throw new Error(
                    `Rate plan with code ${ratePlanCode} not found`
                );
            }

            return ratePlan.Addons.map(relation => relation.addon);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(
                    `Failed to fetch addons for rate plan: ${error.message}`
                );
            }
            throw new Error(
                'Unknown error occurred while fetching addons for rate plan'
            );
        }
    }

    /**
     * Get all rate plans for a specific addon
     */
    public static async getRatePlansByAddonId(addonId: string): Promise<any[]> {
        try {
            const addon = await prisma.addon.findUnique({
                where: { id: addonId },
                select: {
                    id: true,
                    ratePlans: {
                        include: {
                            ratePlan: true,
                        },
                    },
                },
            });

            if (!addon) {
                throw new Error(`Addon with ID ${addonId} not found`);
            }

            return addon.ratePlans.map(relation => relation.ratePlan);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(
                    `Failed to fetch rate plans for addon: ${error.message}`
                );
            }
            throw new Error(
                'Unknown error occurred while fetching rate plans for addon'
            );
        }
    }
}
