export interface ICMasterRoomView {
    viewName: string;
}
export interface IMasterRoomView extends ICMasterRoomView {
    id: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
