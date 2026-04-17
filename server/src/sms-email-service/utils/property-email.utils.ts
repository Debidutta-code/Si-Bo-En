import { prisma } from "../../config";

export const getPropertyDetails = async (id: string,roomTypeCode:string) => {
    return await prisma.property.findUnique({
        where: { id },
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
export const getPropertyByPropertyCode = async (propertyCode:string)=>{
    return await prisma.property.findUnique({
        where :{propertyCode}
    })
}
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
            PricingBrakeDown:true,
            primaryGuest:true,

        },
    });
};
export const getRoomTypeDetails = async (roomTypeCode: string, propertyId: string) => {
    return await prisma.room.findFirst({
        where: { roomType: roomTypeCode, propertyId: propertyId },
    });
};