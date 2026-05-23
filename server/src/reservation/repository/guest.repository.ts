import { prisma } from '../../config';
import {
    GuestType,
    IAddGuestDocument,
    ICGuest,
    IGuests,
} from '../types/guest.type';
export class GuestRepository {
    public async createGuest(guestData: ICGuest): Promise<IGuests | Error> {
        try {
            return await prisma.guests.create({ data: guestData }) as unknown as IGuests;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error('Failed to create Guest');
        }
    }
    public async createNNumberOfGuests(
        guestData: ICGuest[]
    ): Promise<IGuests[] | Error> {
        try {
            return await prisma.$transaction(
                guestData.map(item => prisma.guests.create({ data: item }))
            ) as unknown as IGuests[];
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error('Failed to create Guest');
        }
    }
    public async getGuestByEmail(
        guestEmail: string
    ): Promise<IGuests | null | Error> {
        try {
            return await prisma.guests.findFirst({
                where: { email: guestEmail },
            }) as unknown as IGuests | null;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error('Failed to fetch Guest');
        }
    }
    public async findGuestById(id: string): Promise<IGuests | null> {
        try {
            return await prisma.guests.findUnique({ where: { id } }) as unknown as IGuests | null;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error('Failed to fetch Guest');
        }
    }
    //add document to guest
    public async addDocumentToGuests(
        guestId: string,
        guestDocument: IAddGuestDocument
    ): Promise<IGuests | Error> {
        try {
            return await prisma.guests.update({
                where: { id: guestId },
                data: {
                    userIdentityCardType: guestDocument.userIdentityCardType,
                    identityCardNumber: guestDocument.identityCardNumber,
                    identityCardImage: guestDocument.identityCardImage,
                },
            }) as unknown as IGuests;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error('Failed to add Document to guest');
        }
    }
    public async updateGuestData(
        guestId: string,
        guestData: ICGuest
    ): Promise<IGuests | Error> {
        try {
            return await prisma.guests.update({
                where: { id: guestId },
                data: guestData,
            }) as unknown as IGuests;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error('Failed to update guest');
        }
    }

    // public async getTotalReservationsForAGuest(guestEmail: string): Promise<number | Error> {
    //     try {
    //         const guest = await prisma.guests.findFirst({
    //             where: { email: guestEmail },
    //             include: { reservations: true }
    //         });
    //         const count = guest?.reservations.length ?? 0;
    //         return count
    //     } catch (error) {
    //         if (error instanceof Error) {
    //             throw new Error(error.message)
    //         }
    //         throw new Error("Failed to get totalreservations for guest")
    //     }
    // }
    public async removeGuest(id: string): Promise<IGuests | Error> {
        try {
            return await prisma.guests.delete({ where: { id } }) as unknown as IGuests;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error('Failed to remove guest');
        }
    }
    public async getGuestsForProperty(
        propertyId: string
    ): Promise<IGuests[] | any | Error> {
        try {
            return await prisma.guests.findMany({
                where: {
                    propertyId: propertyId,
                },
                orderBy: { createdAt: 'desc' },
            }) as unknown as IGuests[];
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error('Failed to getuest By Property');
        }
    }
}
