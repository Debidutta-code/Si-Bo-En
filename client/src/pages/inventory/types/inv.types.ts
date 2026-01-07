export interface RoomTypes {
    id: string;
    roomName: string;
    roomType: string;
    totalRoom: number;

}


export interface SelectedRoom {
    id: string;
    roomName: string;
    roomType: string;
    totalRoom: number;
    availableRooms: number;
    startDate: string;
    endDate: string;
    pushFromCalender?: boolean; // Add this

}


export interface Loader{
    isLoading: boolean;
    text: string;
}