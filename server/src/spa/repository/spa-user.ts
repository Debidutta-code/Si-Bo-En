import {prisma} from "../../config";
import { ISpaWUser } from "../types";

export class SpaUserRepository {
    public async getSpaUsersForProperty(propertyId: string) {
        try {
            return await prisma.creation.findFirst({
                where: { propertyId },
                include:{
                    level0Users:{
                        where:{
                            role:"spa_manager"
                        }
                    }
                }
            });
        } catch (error) {
            throw new Error(`Failed to get spa managers for property `);
        }
    }
    public async assignSpaToUser(spaId: string, userId: string):Promise<ISpaWUser>{
        try {
            return await prisma.userAssignedSpa.create({
                data: {
                    spaId,
                    userId
                },
                include:{
                    User:true
                }
            });
        } catch (error) {
            throw new Error(`Failed to add spa user for property`);
        }
    }
    public async isAlreadySpaAssignedtoUser(spaId: string, userId: string):Promise<ISpaWUser|null> {
        try {
            return await prisma.userAssignedSpa.findUnique({
                where: {
                    userId_spaId: {
                        userId,
                        spaId
                    }
                },
                include:{
                    User:true
                }
            });
        } catch (error) {
            throw new Error(`Failed to check spa assignment for user`);
        }
    }
    public async removeUserFromSpa(spaId: string, userId: string):Promise<ISpaWUser> {
        try {
            return await prisma.userAssignedSpa.delete({
                where:{
                    userId_spaId: {
                        userId,
                        spaId
                    }
                },
                include:{
                    User:true
                }
            });
        } catch (error) {
            throw new Error(`Failed to remove spa user for property`);
        }
    }
}