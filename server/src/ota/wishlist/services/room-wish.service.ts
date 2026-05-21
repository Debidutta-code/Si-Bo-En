import { PropertyWishList, RoomWishList } from '../repository';
import { IApiResponse, successResponse, errorResponse } from '../../../utils';
import { OtaUserRepository } from '../../user/repository';
import { IRoomWishlistWRooms } from '../types';
export class RoomWishService {
    private propertyWishList: PropertyWishList;
    private otaUserRepository: OtaUserRepository;
    private roomWishList: RoomWishList;
    constructor() {
        this.propertyWishList = new PropertyWishList();
        this.otaUserRepository = new OtaUserRepository();
        this.roomWishList = new RoomWishList();
    }

    public async addRoomToWishlist(
        roomId: string,
        userId: string
    ): Promise<IApiResponse> {
        try {
            const roomDetails = await this.roomWishList.getRoomById(roomId);
            if (!roomDetails) {
                return errorResponse('Room not found');
            }
            const [propertyWishList, propertyDetails] = await Promise.all([
                this.propertyWishList.checkIfPropertyWishListExists(
                    userId,
                    roomDetails.propertyId
                ),
                this.propertyWishList.getPropertyById(roomDetails.propertyId),
            ]);
            if (!propertyDetails) {
                return errorResponse('Property not found /un available');
            }
            if (!propertyWishList) {
                const newPropertyWishList =
                    await this.propertyWishList.createPropertyWishList({
                        customerId: userId,
                        propertyId: propertyDetails.id,
                        propertyCode: propertyDetails.propertyCode,
                        propertyName: propertyDetails.propertyName,
                    });
                await this.roomWishList.addRoomToWishList({
                    roomId,
                    roomName: roomDetails.roomName,
                    roomType: roomDetails.roomType,
                    wishlistId: newPropertyWishList.id,
                });
                return successResponse('Room added to wishlist successfully');
            }
            await this.roomWishList.addRoomToWishList({
                roomId,
                roomName: roomDetails.roomName,
                roomType: roomDetails.roomType,
                wishlistId: propertyWishList.id,
            });

            return successResponse('Property added to wishlist successfully');
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Error adding property to wishlist',
                    error.message
                );
            }
            return errorResponse('Error adding property to wishlist');
        }
    }
    public async removeRoomFromWishlist(
        roomId: string,
        userId: string
    ): Promise<IApiResponse> {
        try {
            const roomDetails = await this.roomWishList.getRoomById(roomId);

            if (!roomDetails) {
                return errorResponse('Room not found');
            }
            const propertyWishlist =
                await this.propertyWishList.checkIfPropertyWishListExists(
                    userId,
                    roomDetails.propertyId
                );
            if (!propertyWishlist) {
                return errorResponse('Property not found in wishlist');
            }
            const alreadyAdded =
                await this.roomWishList.checkIfRoomExistsInWishlist(
                    propertyWishlist.id,
                    roomId
                );
            if (alreadyAdded) {
                return errorResponse('Room already added to wishlist');
            }
            const removedItem = await this.roomWishList.removeRoomFromWishList(
                propertyWishlist.id,
                roomId
            );

            if (!removedItem) {
                return errorResponse('Error removing room from wishlist');
            }

            return successResponse('Room removed from wishlist successfully');
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Error removing room from wishlist',
                    error.message
                );
            }
            return errorResponse('Error removing room from wishlist');
        }
    }
    public async getRoomsInWishlist(roomId: string): Promise<IApiResponse> {
        try {
            const rooms = await this.roomWishList.getRoomsInWishlist(roomId);
            return successResponse("Wishlist's fetched successfully", rooms);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Error fetching rooms from wishlist',
                    error.message
                );
            }
            return errorResponse('Error fetching rooms from wishlist');
        }
    }
}
