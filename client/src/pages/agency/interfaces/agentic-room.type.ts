export interface ICAgenticRoom {
    agenticPropertyId: string;
    roomId: string;
    roomType: string;
    roomName: string;
    isActive: boolean;
    _translations?: {
        roomName: string;
        description: string;
    }
}
export interface IAgenticRoom extends ICAgenticRoom {
    id: string;
    isDeleted: boolean;
}
export interface IRooms {
    id: string;
    roomType: string;
    roomName: string;
}