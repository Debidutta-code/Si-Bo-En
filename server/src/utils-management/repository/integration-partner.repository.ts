import { prisma } from '../../config';
import {
    ICMasterIntegrations,
    IMasterIntegrations,
    ICMasterIntegrationIntegrationFields,
    IMasterIntegrationFields,
    ICMasterIntegrationUrlFields,
    IMasterIntegrationUrlFields,
    platformType,
} from '../types';
export class InragrationManagement {
    public async createMasterIntegrations(
        data: ICMasterIntegrations
    ): Promise<IMasterIntegrations> {
        try {
            return await prisma.masterIntegrations.create({
                data: {
                    ...data,
                    isActive: true,
                },
                include: {
                    masterIntegrationURLFields: true,
                    requiredFieldsForMasterIntegration: true,
                },
            });
        } catch (error) {
            throw new Error('Failed to create master integration');
        }
    }
    public async getByName(
        name: string,
        type: platformType
    ): Promise<IMasterIntegrations | null> {
        try {
            return await prisma.masterIntegrations.findUnique({
                where: {
                    name_type: {
                        name,
                        type,
                    },
                },
                include: {
                    masterIntegrationURLFields: true,
                    requiredFieldsForMasterIntegration: true,
                },
            });
        } catch (error) {
            throw new Error('Failed to get master integration by name');
        }
    }
    public async getAllMasterIntegrations(): Promise<IMasterIntegrations[]> {
        try {
            return await prisma.masterIntegrations.findMany({
                include: {
                    masterIntegrationURLFields: true,
                    requiredFieldsForMasterIntegration: true,
                },
            });
        } catch (error) {
            throw new Error('Failed to fetch all partner integrations');
        }
    }
    public async updateMasterIntegrations(
        id: string,
        data: ICMasterIntegrations
    ): Promise<IMasterIntegrations> {
        try {
            return await prisma.masterIntegrations.update({
                where: {
                    id,
                },
                data: data,
                include: {
                    masterIntegrationURLFields: true,
                    requiredFieldsForMasterIntegration: true,
                },
            });
        } catch (error) {
            throw new Error('Failed to update partner integrations');
        }
    }
    public async deleteMasterIntegrations(id: string): Promise<boolean> {
        try {
            const returnRes = await prisma.masterIntegrations.delete({
                where: { id },
            });
            return returnRes ? true : false;
        } catch (error) {
            return false;
        }
    }
    public async getById(id: string): Promise<IMasterIntegrations | null> {
        try {
            return await prisma.masterIntegrations.findUnique({
                where: { id },
                include: {
                    masterIntegrationURLFields: true,
                    requiredFieldsForMasterIntegration: true,
                },
            });
        } catch (error) {
            throw new Error('Failed to get master integration by ID');
        }
    }
}

export class IMasterIntegrationFieldsRepository {
    public async createMasterIntegrationFields(
        data: ICMasterIntegrationIntegrationFields[],
        masterIntegrationId: string
    ): Promise<IMasterIntegrationFields[]> {
        try {
            return await prisma.$transaction(async tx => {
                const createdFields: IMasterIntegrationFields[] = [];

                for (const field of data) {
                    // Check if field already exists
                    const exists =
                        await tx.masterIntegrationRequiredFields.findFirst({
                            where: {
                                name: field.name,
                                masterIntegrationId,
                            },
                        });

                    // Only create if it doesn't exist
                    if (!exists) {
                        const created =
                            await tx.masterIntegrationRequiredFields.create({
                                data: {
                                    name: field.name,
                                    masterIntegrationId,
                                },
                            });
                        createdFields.push(created);
                    }
                }

                return createdFields;
            });
        } catch (error) {
            throw new Error(
                'Failed to add required fields to master integration'
            );
        }
    }
    public async deleteMasterIntegrationField(id: string): Promise<boolean> {
        try {
            const deleted = await prisma.masterIntegrationRequiredFields.delete(
                {
                    where: {
                        id,
                    },
                }
            );
            return deleted ? true : false;
        } catch (error) {
            throw new Error('Failed to delete field');
        }
    }
    public async getFieldByName(
        name: string,
        masterIntegrationId: string
    ): Promise<ICMasterIntegrationIntegrationFields | null> {
        try {
            return await prisma.masterIntegrationRequiredFields.findUnique({
                where: {
                    masterIntegrationId_name: {
                        masterIntegrationId,
                        name,
                    },
                },
            });
        } catch (error) {
            throw new Error('Failed to get by name');
        }
    }
}

export class IMasterIntegrationUrlFieldRepository {
    public async createMasterIntegrationUrlFields(
        data: ICMasterIntegrationUrlFields[],
        masterIntegrationId: string
    ): Promise<IMasterIntegrationUrlFields[]> {
        try {
            return await prisma.$transaction(async tx => {
                const createdFields: IMasterIntegrationFields[] = [];

                for (const field of data) {
                    // Check if field already exists
                    const exists =
                        await tx.masterIntegrationURLFields.findFirst({
                            where: {
                                name: field.name,
                                url: field.url,
                                masterIntegrationId,
                            },
                        });

                    if (!exists) {
                        const created =
                            await tx.masterIntegrationURLFields.create({
                                data: {
                                    name: field.name,
                                    url: field.url,

                                    masterIntegrationId,
                                },
                            });
                        createdFields.push(created);
                    }
                }

                return createdFields;
            });
        } catch (error) {
            throw new Error('Failed to create master integration fileds');
        }
    }
    public async deleteMasterIntegrationFields(id: string): Promise<boolean> {
        try {
            const deleted = await prisma.masterIntegrationURLFields.delete({
                where: {
                    id,
                },
            });
            return deleted ? true : false;
        } catch (error) {
            throw new Error('Failed to delete master url fields');
        }
    }
    public async getFieldByName(
        name: string,
        masterIntegrationId: string
    ): Promise<IMasterIntegrationUrlFields | null> {
        try {
            return await prisma.masterIntegrationRequiredFields.findUnique({
                where: {
                    masterIntegrationId_name: {
                        masterIntegrationId,
                        name,
                    },
                },
            });
        } catch (error) {
            throw new Error('Failed to get by name');
        }
    }
}
export class PropertyConfigRepository {
    public async getPropertyConfig(propertyId: string) {
        try {
            return await prisma.propertyConfigs.findUnique({
                where: { propertyId },
            });
        } catch (error) {
            throw new Error('Failed to fetch property config');
        }
    }
}
