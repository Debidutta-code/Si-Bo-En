import { prisma } from '../../config';
import { ICTouristTax, IGetTouristTax } from '../interfaces';
const mapTouristTax = (tax: any): IGetTouristTax => ({
    ...tax,
    discountValue: tax.discountValue,
});
export class TouristTaxRepository {
    public async createTouristTax(
        roomId: string,
        touristTaxData: ICTouristTax
    ): Promise<IGetTouristTax> {
        try {
            const createdTouristTax = await prisma.touristTaxes.create({
                data: {
                    name: touristTaxData.name,
                    roomId,
                    discountType: touristTaxData.discountType,
                    discountValue:
                        touristTaxData.discountValue !== undefined &&
                        touristTaxData.discountValue !== null
                            ? touristTaxData.discountValue
                            : null,
                    currencyCode: touristTaxData.currencyCode ?? 'USD',
                },
                include: {
                    Room: {
                        select: {
                            id: true,
                            roomName: true,
                            roomType: true,
                            propertyId: true,
                        },
                    },
                },
            });
            return mapTouristTax(createdTouristTax);
        } catch (error) {
            throw new Error('Failed to create tourist tax');
        }
    }

    public async getTouristTaxesByPropertyId(
        propertyId: string
    ): Promise<IGetTouristTax[]> {
        try {
            const touristTaxes = await prisma.touristTaxes.findMany({
                where: {
                    Room: {
                        propertyId: propertyId,
                    },
                },
                include: {
                    Room: {
                        select: {
                            id: true,
                            roomName: true,
                            roomType: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
            return touristTaxes.map(mapTouristTax);
        } catch (error) {
            throw new Error('Failed to fetch tourist taxes');
        }
    }

    public async getTouristTaxById(
        touristTaxId: string
    ): Promise<IGetTouristTax | null> {
        try {
            const touristTax = await prisma.touristTaxes.findUnique({
                where: { id: touristTaxId },
                include: {
                    Room: {
                        select: {
                            id: true,
                            roomName: true,
                            roomType: true,
                            propertyId: true,
                        },
                    },
                },
            });
            return touristTax;
        } catch (error) {
            throw new Error('Failed to fetch tourist tax');
        }
    }

    public async getTouristTaxByRoomType(
        roomId: string,
        propertyId: string
    ): Promise<IGetTouristTax | null | Error> {
        try {
            const touristTax = await prisma.touristTaxes.findFirst({
                where: {
                    roomId,
                    Room: {
                        propertyId,
                    },
                },
                include: {
                    Room: {
                        select: {
                            id: true,
                            roomName: true,
                            roomType: true,
                        },
                    },
                },
            });

            if (!touristTax) {
                return null; // ✅ THIS WAS MISSING
            }

            return mapTouristTax(touristTax);
        } catch (error) {
            throw new Error('Failed to fetch tourist tax by rate plan code');
        }
    }

    public async updateTouristTax(
        touristTaxId: string,
        updateData: Partial<ICTouristTax>
    ): Promise<IGetTouristTax | Error> {
        try {
            const updatedTouristTax = await prisma.touristTaxes.update({
                where: { id: touristTaxId },
                data: updateData,
                include: {
                    Room: {
                        select: {
                            id: true,
                            roomName: true,
                            roomType: true,
                        },
                    },
                },
            });
            return mapTouristTax(updatedTouristTax);
        } catch (error) {
            throw new Error('Failed to update tourist tax');
        }
    }

    public async deleteTouristTax(
        touristTaxId: string
    ): Promise<IGetTouristTax | Error> {
        try {
            const deletedTouristTax = await prisma.touristTaxes.delete({
                where: { id: touristTaxId },
                include: {
                    Room: {
                        select: {
                            id: true,
                            roomName: true,
                            roomType: true,
                        },
                    },
                },
            });
            return mapTouristTax(deletedTouristTax);
        } catch (error) {
            throw new Error('Failed to delete tourist tax');
        }
    }
}
