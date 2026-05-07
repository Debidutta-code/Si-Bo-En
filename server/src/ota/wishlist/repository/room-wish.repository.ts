import { prisma } from "../../../config";
import { ICRoomWishListR, IRoom, IRoomWishlist } from "../types";

export class RoomWishList{
    public async addRoomToWishList(roomData: ICRoomWishListR): Promise<IRoomWishlist> {
        try {
            return await prisma.roomWishList.create({
                data: {
                    roomName:roomData.roomName,
                    roomType:roomData.roomType,
                    createdAt:new Date(),
                    roomId:roomData.roomId,
                    wishlistId:roomData.wishlistId
                }
            });
        } catch (error) {
            throw new Error("Error adding room to wishlist");
        }
    }
    public async removeRoomFromWishList(wishlistId:string,roomId: string): Promise<IRoomWishlist | null> {
        try {
            return await prisma.roomWishList.delete({
                where: {
                    wishlistId_roomId:{
                        wishlistId,
                        roomId
                    }
                }
            });
        } catch (error) {
            throw new Error("Error removing room from wishlist");
        }
    }
    public async getRoomsInWishlist(roomId:string): Promise<number> {
        try {
            return await prisma.roomWishList.count({
                where: {
                    roomId
                }
            });
        } catch (error) {
            throw new Error("Error fetching rooms for wishlist");
        }
    }
    public async getRoomById(id:string): Promise<IRoom | null> {
        try {
            return await prisma.room.findUnique({
                where: {
                    id,
                    available:true
                },
                select:{
                    id:true,
                    roomName:true,
                    roomType:true,
                    propertyId:true,
                    image:true
                }
            });
        } catch (error) {
            throw new Error("Error fetching room from wishlist");
        }
    }
    public async checkIfRoomExistsInWishlist(wishlistId: string, roomId: string): Promise<IRoomWishlist | null> {
        try {
            return await prisma.roomWishList.findUnique({
                where: {
                    wishlistId_roomId:{
                        wishlistId,
                        roomId
                    }
                }
            });
        } catch (error) {
            throw new Error("Error checking if room exists in wishlist");
        }
    }
}