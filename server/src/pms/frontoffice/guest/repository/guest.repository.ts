import prisma from "../../../../config/prisma.client";
import {
    GuestType,
    IAddGuestDocument,
    ICGuest,
    IGuests,
} from "../types";
export class GuestRepository {
    public async createGuest(guestData: ICGuest): Promise<IGuests | Error> {
        try {
            return await prisma.guests.create({ data: guestData })
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message)
            }
            throw new Error("Failed to create Guest")
        }
    }
    public async createNNumberOfGuests(guestData: ICGuest[]): Promise<IGuests[] | Error> {
        try {
            return await prisma.$transaction(
                guestData.map((item) => prisma.guests.create({ data: item }))
            )
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message)
            }
            throw new Error("Failed to create Guest")
        }
    }
    public async getGuestByEmail(guestEmail: string): Promise<IGuests | null | Error> {
        try {
            return await prisma.guests.findFirst({ where: { email: guestEmail } })
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message)
            }
            throw new Error("Failed to fetch Guest")
        }
    }
    public async findGuestById(id: string): Promise<IGuests | null | Error> {
        try {
            return await prisma.guests.findUnique({ where: { id } })
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message)
            }
            throw new Error("Failed to fetch Guest")
        }
    }
    //add document to guest
    public async addDocumentToGuests(guestId: string, guestDocument: IAddGuestDocument): Promise<IGuests | Error> {
        try {
            return await prisma.guests.update({
                where: { id: guestId }, data: {
                    userIdentityCardType: guestDocument.userIdentityCardType,
                    identityCardNumber: guestDocument.identityCardNumber,
                    identityCardImage: guestDocument.identityCardImage,
                }
            })
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message)
            }
            throw new Error("Failed to add Document to guest")
        }
    }
    public async updateGuestData(guestId: string, guestData: ICGuest): Promise<IGuests | Error> {
        try {
            return await prisma.guests.update({ where: { id: guestId }, data: guestData })
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message)
            }
            throw new Error("Failed to update guest")
        }

    }

    public async getTotalReservationsForAGuest(guestEmail: string): Promise<number | Error> {
        try {
            const guest = await prisma.guests.findFirst({
                where: { email: guestEmail },
                include: { reservations: true }
            });
            const count = guest?.reservations.length ?? 0;
            return count
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message)
            }
            throw new Error("Failed to get totalreservations for guest")
        }
    }
    public async removeGuest(id: string): Promise<IGuests | Error> {
        try {
            return await prisma.guests.delete({ where: { id } })
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message)
            }
            throw new Error("Failed to remove guest")
        }
    }
    public async getGuestsForProperty(propertyId:string):Promise<IGuests[]|any|Error>{
        try {
            return await prisma.guests.findMany({
                where:{
                    propertyId:propertyId
                },
                                orderBy: { createdAt: 'desc' },

            })
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message)
            }
            throw new Error("Failed to getuest By Property")
        }
    }
}
