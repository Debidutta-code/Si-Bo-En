import { prisma } from '../config';

export const getRatePlanName = async (
    ratePlanCode: string
): Promise<string> => {
    const ratePlan = await prisma.ratePlan.findFirst({
        where: {
            ratePlanCode,
        },
    });
    return ratePlan?.ratePlanName || '';
};
