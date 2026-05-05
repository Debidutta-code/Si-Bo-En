import { prisma } from "../../config";
export class PropertyEmailsRepository {
    public async create(propertyId: string, email: string) {
        try {

            return await prisma.propertyEmails.create({
                data: {
                    propertyId,
                    email
                }
            })
        } catch (error) {
            throw new Error("Failed to create property email: ");
        }
    }
    public async update(id: string, email: string) {
        try {

            return await prisma.propertyEmails.update({
                where: {
                    id
                },
                data: {
                    email
                }
            })
        } catch (error) {
            throw new Error("Failed to update property email");

        }
    }
    public async delete(id: string) {
        try {

            return await prisma.propertyEmails.delete({
                where: {
                    id
                }
            })
        } catch (error) {
            throw new Error("Failed to delete property email");

        }
    }
    public async getByEmail(propertyId: string, email: string) {
        try {
            return await prisma.propertyEmails.findUnique({
                where: {
                    propertyId_email: {
                        propertyId,
                        email
                    }
                }
            })
            
        } catch (error) {
            throw new Error("Failed to get property email by email");
        }
    }
    public async getById(id: string) {
        try {
            return await prisma.propertyEmails.findUnique({
                where: {
                    id
                }
            })
        } catch (error) {
            throw new Error("Failed to get property email by id");
        }
    }
    public async getByPropertyId(propertyId: string) {
        try {
            return await prisma.propertyEmails.findMany({
                where: {
                    propertyId
                }
            })
        } catch (error) {
            throw new Error("Failed to get property emails by property id");
        }
    }
}