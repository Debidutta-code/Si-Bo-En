import {prisma} from "../../config";

export const getPropertyDetails = async (propertyCode: string,roomTypeCode:string) => {
    return await prisma.property.findUnique({
        where: { propertyCode: propertyCode },
        include: {
            propertyAddress:true,
            propertyRooms:{
                where:{
                    roomType:roomTypeCode
                },
            }
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
            addOns:true,
            priceBreakdowns:true,
            primaryGuest:true,

        },
    });
};
export const getRoomTypeDetails = async (roomTypeCode: string, propertyId: string) => {
    return await prisma.room.findFirst({
        where: { roomType: roomTypeCode, propertyId: propertyId },
    });
};