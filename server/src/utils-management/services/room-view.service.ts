import { IApiResponse, successResponse, errorResponse } from "../../utils";
import { ICMasterRoomView, IMasterRoomView } from "../types";
import { MasterRoomView } from "../repository";
export class MasterRoomViewService {
    private masterRoomViewRepository: MasterRoomView;

    constructor() {
        this.masterRoomViewRepository = new MasterRoomView();
    }
    public async createRoomView(data: ICMasterRoomView): Promise<IApiResponse<IMasterRoomView>> {
        try {
            const existingView = await this.masterRoomViewRepository.getRoomViewByName(data.viewName);
            if (existingView) {
                return errorResponse("RoomView with this name already exists");
            }
            const roomView = await this.masterRoomViewRepository.createRoomView(data);
            if (roomView) {
                return successResponse("RoomView created successfully");
            }
            return errorResponse("Error creating room view");
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Error occurred while creating RoomView", error.message);
            }
            return errorResponse("Error occurred while creating RoomView", "Unknown error occurred");
        }
    }
    public async getAllRoomViews(): Promise<IApiResponse<IMasterRoomView[]>> {
        try {
            const roomViews = await this.masterRoomViewRepository.getAllRoomViews();
            return successResponse("RoomViews fetched successfully", roomViews);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Error occurred while fetching RoomViews", error.message);
            }
            return errorResponse("Error occurred while fetching RoomViews", "Unknown error occurred");
        }
    }
    public async getRoomViewById(id: string): Promise<IApiResponse<IMasterRoomView>> {
        try {
            const roomView = await this.masterRoomViewRepository.getRoomViewById(id);
            if (roomView) {
                return successResponse("RoomView fetched successfully", roomView);
            }
            return errorResponse("RoomView not found");
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Error occurred while fetching RoomView", error.message);
            }
            return errorResponse("Error occurred while fetching RoomView", "Unknown error occurred");
        }
    
    }
    public async updateRoomView(id: string, data: ICMasterRoomView): Promise<IApiResponse<IMasterRoomView>> {
        try {
            const [isExistById,isExistByName] = await Promise.all([
                this.masterRoomViewRepository.getRoomViewById(id),
                this.masterRoomViewRepository.getRoomViewByName(data.viewName)
            ]);
            if (!isExistById) {
                return errorResponse("RoomView not found");
            }
            if(isExistByName && isExistByName.id !== id) {
                return errorResponse("RoomView with this name already exists");
            }
            const roomView = await this.masterRoomViewRepository.updateRoomView(id, data);
            if (roomView) {
                return successResponse("RoomView updated successfully", roomView);
            }
            return errorResponse("RoomView not found");
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Error occurred while updating RoomView", error.message);
            }
            return errorResponse("Error occurred while updating RoomView", "Unknown error occurred");
        }
    }
    public async deleteRoomView(id: string): Promise<IApiResponse<IMasterRoomView>> {
        try {
            const isExist = await this.masterRoomViewRepository.getRoomViewById(id);
            if (!isExist) {
                return errorResponse("RoomView not found");
            }
            const roomView = await this.masterRoomViewRepository.deleteRoomView(id);
            if (roomView) {
                return successResponse("RoomView deleted successfully", roomView);
            }
            return errorResponse("RoomView not found");
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Error occurred while deleting RoomView", error.message);
            }
            return errorResponse("Error occurred while deleting RoomView", "Unknown error occurred");
        }
    }
}