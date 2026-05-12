import { errorResponse, successResponse } from './return';
import { prisma } from '../config';

export default async function getUsersGBP(userId: string, level: number) {
    try {
        let creation;

        switch (level) {
            case 0: {
                creation = await prisma.creation.findFirst({
                    where: {
                        level0Users: {
                            some: {
                                id: userId,
                            },
                        },
                    },
                });
                return successResponse('', creation);
            }

            case 1: {
                creation = await prisma.creation.findFirst({
                    where: {
                        level1Users: {
                            some: {
                                id: userId,
                            },
                        },
                    },
                });
                return successResponse('', creation);
            }

            case 2: {
                creation = await prisma.creation.findFirst({
                    where: {
                        level2Users: {
                            some: {
                                id: userId,
                            },
                        },
                    },
                });
                return successResponse('', creation);
            }

            case 3: {
                creation = await prisma.creation.findFirst({
                    where: {
                        level3Users: {
                            some: {
                                id: userId,
                            },
                        },
                    },
                });
                return successResponse('', creation);
            }

            default: {
                return errorResponse('Invalid user level provided');
            }
        }
    } catch (error) {
        console.error('Error in getUsersGBP:', error);
        return errorResponse('Failed to get Group/Brand/Property data');
    }
}
