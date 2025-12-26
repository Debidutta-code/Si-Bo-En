import { prisma } from "../../config";
import { createHash } from "../utills/bcryptHelper";
export class InitializeDB {
    public async initDb() {
        try {
            const password = await createHash("Admin@123")
            const userRes = await prisma.user.create({
                data: {
                    email: "superadmin.pms@gmail.com",
                    //Admin@123
                    password: password,
                    firstName: "Sandeep",
                    lastName: "Mohapatra",
                    role: "super_admin",
                    userLevel: 4
                }
            })
            const creation = await prisma.creation.create({
                data: {
                    name: "Super Group",
                    type: "super",
                    isActive: true,
                    isDeleted: false,
                    createdAt: new Date(),
                    createdBy: {
                        connect: {
                            id: userRes.id
                        }
                    }
                }
            })
            await prisma.user.update({
                where: {
                    id: userRes.id
                },
                data: {
                    creationId: creation.id
                }
            })
            await prisma.accessControl.create({
                data: {
                    role: "super_admin",
                    level: 4,
                    isActive: true,
                    canModifyAccess: true,
                    canViewAccess: true,
                    canAddInventory: true,
                    canCDAmenity: true,
                    canCDCategory: true,
                    canCDDestinationType: true,
                    canCDPropertyType: true,
                    canCreateHotel: true,
                    canCreateLevel0User: true,
                    canCreateLevel1User: true,
                }
            })
            await prisma.accessControl.create({
                data: {
                    role: "group_manager",
                    level: 3,
                    isActive: true,
                    canModifyAccess: true,
                    canViewAccess: true,
                    canAddInventory: true,
                    canCDAmenity: true,
                    canCDCategory: true,
                    canCDDestinationType: true,
                    canCDPropertyType: true,
                    canCreateHotel: true,
                    canCreateLevel0User: true,
                    canCreateLevel1User: true,
                }
            })
            await prisma.accessControl.create({
                data: {
                    role: "brand_manager",
                    level: 2,
                    isActive: true,
                    canModifyAccess: true,
                    canViewAccess: true,
                    canAddInventory: true,
                    canCDAmenity: true,
                    canCDCategory: true,
                    canCDDestinationType: true,
                    canCDPropertyType: true,
                    canCreateHotel: true,
                    canCreateLevel0User: true,
                    canCreateLevel1User: true,
                }
            })
            await prisma.accessControl.create({
                data: {
                    role: "hotel_manager",
                    level: 1,
                    isActive: true,
                    canModifyAccess: true,
                    canViewAccess: true,
                    canAddInventory: true,
                    canCDAmenity: true,
                    canCDCategory: true,
                    canCDDestinationType: true,
                    canCDPropertyType: true,
                    canCreateHotel: true,
                    canCreateLevel0User: true,
                    canCreateLevel1User: true,
                }
            })
            await prisma.accessControl.create({
                data: {
                    role: "staff",
                    level: 0,
                    isActive: true,
                    canModifyAccess: true,
                    canViewAccess: true,
                    canAddInventory: true,
                    canCDAmenity: true,
                    canCDCategory: true,
                    canCDDestinationType: true,
                    canCDPropertyType: true,
                    canCreateHotel: true,
                    canCreateLevel0User: true,
                    canCreateLevel1User: true,
                }
            })

            await prisma.masterDestinationType.create({
                data: {
                    id: "39b60d48-74a0-46a5-9cad-bb178de4cbc3",
                    destinationTypeName: "Villa",
                    destinationDescription: "A private luxury house, often with a garden, pool, and exclusive amenities, ideal for families or groups.",

                }
            })
            return userRes
        } catch (error) {
            throw new Error("Failed to init db")
        }
    }
}