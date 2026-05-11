export interface ICPropertyWishListR {
    otaGuestId: string;
    propertyId: string;
    propertyCode: string;
    propertyName: string;
}
export interface ICRoomWishListR {
    wishlistId: string;
    roomId: string;
    roomType: string;
    roomName: string;
}
export interface IRoomWishlist extends ICRoomWishListR {
    id: string;
    createdAt: Date;
}
export interface IPropertyWishlist extends ICPropertyWishListR {
    id: string;
    createdAt: Date;
}
export interface IRoomWishlistWRooms extends IPropertyWishlist {
    Property: IProperty;
    RoomWishList: IRoomWishlist[];
}
export interface IProperty {
    id: string;
    propertyName: string;
    propertyCode: string;
    image: string[];
}
export interface IRoom {
    id: string;
    roomName: string;
    roomType: string;
    image: string[];
    propertyId: string;
}
