export interface ICPropertyVideo {
    propertyId: string;
    url: string;
    thumbnail: string | null;
}
export interface IPropertyVideo extends ICPropertyVideo {
    id: string;
}
export interface ICRoomVideo {
    roomId: string;
    url: string;
    thumbnail: string | null;
}
export interface IRoomVideo extends ICRoomVideo {
    id: string;
}
