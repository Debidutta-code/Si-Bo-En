import { PropertyWishList } from '../repository';
import { IApiResponse, successResponse, errorResponse } from '../../../utils';
import { OtaUserRepository } from '../../user/repository';
import { IRoomWishlistWRooms } from '../types';
export class PropertyWishService {
    private propertyWishList: PropertyWishList;
    private otaUserRepository: OtaUserRepository;

    constructor() {
        this.propertyWishList = new PropertyWishList();
        this.otaUserRepository = new OtaUserRepository();
    }

    public async addToWishlist(
        propertyId: string,
        userId: string
    ): Promise<IApiResponse> {
        try {
            const propertyDetails =
                await this.propertyWishList.getPropertyById(propertyId);
            if (!propertyDetails) {
                return errorResponse('Property not found');
            }
            const wishlist = await this.propertyWishList.createPropertyWishList(
                {
                    propertyId,
                    customerId: userId,
                    propertyCode: propertyDetails.propertyCode,
                    propertyName: propertyDetails.propertyName,
                }
            );

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
    public async removeFromWishlist(
        propertyId: string,
        userId: string
    ): Promise<IApiResponse> {
        try {
            const propertyDetails =
                await this.propertyWishList.getPropertyById(propertyId);

            if (!propertyDetails) {
                return errorResponse('Property not found');
            }

            const removedItem =
                await this.propertyWishList.removePropertyFromUserWishList(
                    userId,
                    propertyId
                );

            if (!removedItem) {
                return errorResponse('Error removing property from wishlist');
            }

            return successResponse(
                'Property removed from wishlist successfully'
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Error removing property from wishlist',
                    error.message
                );
            }
            return errorResponse('Error removing property from wishlist');
        }
    }
    public async getWishlistForUser(
        userId: string
    ): Promise<IApiResponse<IRoomWishlistWRooms[]>> {
        try {
            const wishlist =
                await this.propertyWishList.getPropertyWishListForGuest(userId);
            return successResponse('Wishlist fetched successfully', wishlist);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Error fetching wishlist for user',
                    error.message
                );
            }
            return errorResponse('Error fetching wishlist for user');
        }
    }
}
