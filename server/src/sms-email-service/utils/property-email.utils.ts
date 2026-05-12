import { prisma } from '../../config';

export const getPropertyByPropertyAndRoom = async (
    propertyCode: string,
    roomTypeCode: string
) => {
    return await prisma.property.findUnique({
        where: { propertyCode },
        include: {
            propertyAddress: true,
            propertyEmails: true,
            propertyRooms: {
                where: {
                    roomType: roomTypeCode,
                },
                select: {
                    id: true,
                    roomName: true,
                    roomType: true,
                    roomView: true,
                    maxOccupancy: true,
                    image: true,
                    description: true,
                    numberOfBedrooms: true,
                    roomAmenities: true,
                },
            },
        },
    });
};
export const getPropertyByPropertyCode = async (propertyCode: string) => {
    return await prisma.property.findUnique({
        where: { propertyCode },
        include: {
            propertyAddress: true,
        },
    });
};
export const getBookingDetails = async (bookingCode: string) => {
    return await prisma.reservation.findUnique({
        where: { id: bookingCode },
        include: {
            property: {
                include: {
                    propertyAddress: true,
                },
            },
            addOns: true,
            PricingBrakeDown: true,
            primaryGuest: true,
        },
    });
};
export const getRoomTypeDetails = async (
    roomTypeCode: string,
    propertyId: string
) => {
    return await prisma.room.findFirst({
        where: { roomType: roomTypeCode, propertyId: propertyId },
    });
};
