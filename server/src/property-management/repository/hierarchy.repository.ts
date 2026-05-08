import { prisma } from '../../config';

export class UserDao {
    // Get users created by a specific user with a specific role
    public static async getUsersByHierarchy(
        creatorId: string,
        targetRole: string
    ): Promise<string[]> {
        try {
            const users = await prisma.user.findMany({
                where: {
                    createdById: creatorId,
                    role: targetRole as any,
                },
                select: {
                    id: true,
                },
            });

            return users.map((user: any) => user.id);
        } catch (error: any) {
            throw new Error(
                `Failed to get users by hierarchy: ${error.message}`
            );
        }
    }

    // Get users under multiple managers with a specific role
    public static async getUsersUnderManagers(
        managerIds: string[],
        targetRole: string
    ): Promise<string[]> {
        try {
            const users = await prisma.user.findMany({
                where: {
                    createdById: {
                        in: managerIds,
                    },
                    role: targetRole as any,
                },
                select: {
                    id: true,
                },
            });

            return users.map((user: any) => user.id);
        } catch (error: any) {
            throw new Error(
                `Failed to get users under managers: ${error.message}`
            );
        }
    }

    // Get all users in a hierarchy chain (recursive)
    public static async getAllUsersInHierarchy(
        rootUserId: string,
        targetRole?: string
    ): Promise<string[]> {
        try {
            const allUsers: string[] = [];
            const queue = [rootUserId];
            const visited = new Set<string>();

            while (queue.length > 0) {
                const currentCreatorId = queue.shift()!;

                if (visited.has(currentCreatorId)) {
                    continue;
                }
                visited.add(currentCreatorId);

                const whereClause: any = { createdById: currentCreatorId };
                if (targetRole) {
                    whereClause.role = targetRole as any;
                }

                const users = await prisma.user.findMany({
                    where: whereClause,
                    select: {
                        id: true,
                        role: true,
                    },
                });

                for (const user of users) {
                    if (targetRole && user.role === targetRole) {
                        allUsers.push(user.id);
                    }

                    // Add to queue for further exploration if not target role or no target role specified
                    if (!targetRole || user.role !== targetRole) {
                        queue.push(user.id);
                    }
                }
            }

            return allUsers;
        } catch (error: any) {
            throw new Error(
                `Failed to get all users in hierarchy: ${error.message}`
            );
        }
    }
}
