import {prisma} from "../../../../config";

export const getRoomType=async(roomTypeId:string)=>{
    try {
        const roomType=await prisma.room.findUnique({
            where:{id:roomTypeId}
        })
        return roomType
    }
    catch (error) {
        return new Error("Failed to fetch Room Type")
    }
}
export const getTotalRoomsForThisRoomType=async(roomTypeId:string)=>{
    try {
        const totalRooms=await prisma.room.findUnique({
            where:{id:roomTypeId}
        })
        return totalRooms?.totalRoom
    }catch (error) {
        return new Error("Failed to fetch total rooms for this room type")
    }
}
