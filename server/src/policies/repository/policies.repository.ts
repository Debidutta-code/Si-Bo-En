import { prisma } from '../../config';
import type {
    CreatePolicyData,
    IPolicy,
    PolicyFilters,
    UpdatePolicyData,
    FilterOptions,
    PaginatedResult,
    allPolicies,
} from '../types/type';

const toStringId = (id: any): string => {
    return typeof id === 'string' ? id : String(id);
};

export class PolicyRepository {
    public static async createOne({
        policyName,
        type,
        description,
        propertyId,
    }: CreatePolicyData): Promise<any> {
        try {
            const existed = await prisma.policy.findFirst({
                where: {
                    propertyId: propertyId,
                    policyName,
                    type: type,
                },
            });

            if (existed) {
                throw new Error(
                    `Policy with this name and type already exists`
                );
            }

            const policy = await prisma.policy.create({
                data: {
                    policyName,
                    type: type as any,
                    description,
                    propertyId: propertyId,
                },
            });

            return policy;
        } catch (error: any) {
            throw new Error(`Failed to create policy: ${error.message}`);
        }
    }

    public static async findOne({
        ratePlanCode,
        propertyId,
    }: PolicyFilters): Promise<IPolicy | null> {
        try {
            const ratePlan = await prisma.ratePlan.findUnique({
                where: { ratePlanCode, propertyId },
            });

            if (!ratePlan) {
                return null;
            }

            const policyId =
                ratePlan.depositPolicyId ||
                ratePlan.cancellationPolicyId ||
                ratePlan.guaranteePolicyId;

            if (!policyId) {
                return null;
            }

            const policy = await prisma.policy.findUnique({
                where: { id: policyId },
            });

            if (policy) {
                return {
                    ...policy,
                    propertyId: policy.propertyId || '',
                };
            }
            return null;
        } catch (error: any) {
            throw new Error(`Failed to find policy: ${error.message}`);
        }
    }

    public static async deleteOne(id: string): Promise<IPolicy | null> {
        try {
            return await prisma.policy.delete({
                where: { id: id },
            });
        } catch (error: any) {
            throw new Error(`Failed to delete policy: ${error.message}`);
        }
    }

    public static async MapPolicyDao(id: string, data: UpdatePolicyData) {
        const { ratePlanCode } = data;
        try {
            const policy = await prisma.policy.findUnique({
                where: { id: toStringId(id) },
            });

            if (!policy) {
                throw new Error('No Policy Found');
            }

            const ratePlan = await prisma.ratePlan.findUnique({
                where: { ratePlanCode },
            });

            if (!ratePlan) {
                throw new Error('No Rate Plan Found');
            }
            //The logic seems off here. Please review.
            let currentPolicy: string;

            if (ratePlan.depositPolicyId === id) {
                await prisma.ratePlan.update({
                    where: { ratePlanCode },
                    data: {
                        depositPolicyId: id,
                    },
                });
            }
            if (ratePlan.cancellationPolicyId === id) {
                await prisma.ratePlan.update({
                    where: { ratePlanCode },
                    data: {
                        cancellationPolicyId: id,
                    },
                });
            }
            if (ratePlan.guaranteePolicyId === id) {
                await prisma.ratePlan.update({
                    where: { ratePlanCode },
                    data: {
                        guaranteePolicyId: id,
                    },
                });
            }

            return {};
        } catch (error: any) {
            throw new Error(`Failed to update policy: ${error.message}`);
        }
    }

    public static async getPoliciesByHotelCode(propertyId: string) {
        try {
            const ratePlans = await prisma.ratePlan.findMany({
                where: { propertyId: propertyId },
            });

            const allPolicies: allPolicies[] = [];
            const mappedPolicyIds: string[] = [];

            if (ratePlans && ratePlans.length > 0) {
                for (const ratePlan of ratePlans) {
                    if (ratePlan.depositPolicyId) {
                        const depositPolicy = await prisma.policy.findUnique({
                            where: { id: toStringId(ratePlan.depositPolicyId) },
                        });
                        if (depositPolicy) {
                            mappedPolicyIds.push(depositPolicy.id);
                            allPolicies.push({
                                id: depositPolicy.id,
                                policyName: depositPolicy.policyName,
                                type: 'deposit',
                                description: depositPolicy.description,
                                ratePlanCode: ratePlan.ratePlanCode,
                                propertyId: depositPolicy.propertyId || '',
                                ratePlanName: ratePlan.ratePlanName,
                            });
                        }
                    }

                    // Process guarantee policy
                    if (ratePlan.guaranteePolicyId) {
                        const guaranteePolicy = await prisma.policy.findUnique({
                            where: {
                                id: toStringId(ratePlan.guaranteePolicyId),
                            },
                        });
                        if (guaranteePolicy) {
                            mappedPolicyIds.push(guaranteePolicy.id);
                            allPolicies.push({
                                id: guaranteePolicy.id,
                                policyName: guaranteePolicy.policyName,
                                type: 'guarantee',
                                description: guaranteePolicy.description,
                                ratePlanCode: ratePlan.ratePlanCode,
                                propertyId: guaranteePolicy.propertyId || '',
                                ratePlanName: ratePlan.ratePlanName,
                            });
                        }
                    }
                    if (ratePlan.cancellationPolicyId) {
                        const cancellationPolicy =
                            await prisma.policy.findUnique({
                                where: {
                                    id: toStringId(
                                        ratePlan.cancellationPolicyId
                                    ),
                                },
                            });
                        if (cancellationPolicy) {
                            mappedPolicyIds.push(cancellationPolicy.id);
                            allPolicies.push({
                                id: cancellationPolicy.id,
                                policyName: cancellationPolicy.policyName,
                                type: 'cancellation',
                                description: cancellationPolicy.description,
                                ratePlanCode: ratePlan.ratePlanCode,
                                propertyId: cancellationPolicy.propertyId || '',
                                ratePlanName: ratePlan.ratePlanName,
                            });
                        }
                    }
                }
            }

            // Get non-mapped policies
            const nonMappedPolicies = await prisma.policy.findMany({
                where: {
                    propertyId: propertyId,
                    id: {
                        notIn:
                            mappedPolicyIds.length > 0
                                ? mappedPolicyIds
                                : undefined,
                    },
                },
            });

            // Add non-mapped policies to the result
            nonMappedPolicies.forEach((policy: any) => {
                allPolicies.push({
                    id: policy.id,
                    policyName: policy.policyName,
                    type: policy.type,
                    description: policy.description,
                    ratePlanCode: '', // Empty for non-mapped policies
                    propertyId: policy.propertyId || '',
                    ratePlanName: '', // Empty for non-mapped policies
                });
            });

            return {
                success: true,
                message: 'Policies retrieved successfully',
                allPolicies,
            };
        } catch (error: any) {
            throw new Error(
                `Failed to get policies with rate plans: ${error.message}`
            );
        }
    }
    public static async getPolicyById(id: string): Promise<IPolicy | null> {
        try {
            return await prisma.policy.findUnique({
                where: { id: toStringId(id) },
            });
        } catch (error: any) {
            throw new Error(`Failed to get policy by ID: ${error.message}`);
        }
    }

    public static async updatePolicyDetails(
        id: string,
        data: { policyName?: string; description?: string }
    ): Promise<IPolicy | null> {
        try {
            const policy = await prisma.policy.findUnique({
                where: { id: toStringId(id) },
            });

            if (!policy) {
                throw new Error('Policy not found');
            }

            const updatedPolicy = await prisma.policy.update({
                where: { id: toStringId(id) },
                data: {
                    ...(data.policyName && { policyName: data.policyName }),
                    ...(data.description !== undefined && {
                        description: data.description,
                    }),
                },
            });

            return updatedPolicy;
        } catch (error: any) {
            throw new Error(
                `Failed to update policy details: ${error.message}`
            );
        }
    }

    public static async AddPolicyToRatePlan(
        policyId: string,
        ratePlanId: string,
        policyType: 'deposit' | 'guarantee' | 'cancellation'
    ) {
        try {
            const ratePlan = await prisma.ratePlan.findUnique({
                where: { id: toStringId(ratePlanId) },
            });

            if (!ratePlan) {
                throw new Error('Rate Plan not found');
            }

            const updateData: any = {};
            if (policyType === 'deposit') {
                updateData.depositPolicyId = policyId;
            } else if (policyType === 'guarantee') {
                updateData.guaranteePolicyId = policyId;
            } else if (policyType === 'cancellation') {
                updateData.cancellationPolicyId = policyId;
            } else {
                throw new Error('Invalid policy type');
            }

            await prisma.ratePlan.update({
                where: { id: toStringId(ratePlanId) },
                data: updateData,
            });

            return true;
        } catch (error: any) {
            throw new Error(
                `Failed to add policy to rate plan: ${error.message}`
            );
        }
    }
    public static async RemovePolicyFromRatePlans(
        policyId: string,
        ratePlanIds: string[]
    ): Promise<void> {
        try {
            const policy = await prisma.policy.findUnique({
                where: { id: toStringId(policyId) },
            });

            if (!policy) {
                throw new Error('Policy not found');
            }

            const policyType = policy.type;

            for (const ratePlanId of ratePlanIds) {
                const ratePlan = await prisma.ratePlan.findUnique({
                    where: { id: toStringId(ratePlanId) },
                });

                if (!ratePlan) {
                    throw new Error(`Rate Plan with id ${ratePlanId} not found`);
                }

                const updateData: any = {};
                if (policyType === 'deposit') {
                    updateData.depositPolicyId = null;
                } else if (policyType === 'guarantee') {
                    updateData.guaranteePolicyId = null;
                } else if (policyType === 'cancellation') {
                    updateData.cancellationPolicyId = null;
                }

                await prisma.ratePlan.update({
                    where: { id: toStringId(ratePlanId) },
                    data: updateData,
                });
            }
        } catch (error: any) {
            throw new Error(
                `Failed to remove policy from rate plans: ${error.message}`
            );
        }
    }
}
