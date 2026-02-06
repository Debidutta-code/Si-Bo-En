import { successResponse, errorResponse } from "../../utils/return";
import { IApiResponse } from "../../utils/return.types";
import { AgenticRoomRepository, AgenticPropertyRepository } from "../repository"
import { ICAgenticRoom, IRooms } from "../types";
export class AgenticRoomService {
    private agenticRoomRepository: AgenticRoomRepository;
    private agenticPropertyRepository: AgenticPropertyRepository;

    constructor() {
        this.agenticRoomRepository = new AgenticRoomRepository();
        this.agenticPropertyRepository = new AgenticPropertyRepository();
    }
    public async createAgenticRoom(data: ICAgenticRoom): Promise<IApiResponse> {
        try {
            const agenticProperty = await this.agenticPropertyRepository.getAgenticPropertyById(data.agenticPropertyId);
            if (!agenticProperty) {
                return errorResponse("Agentic property not found");
            }
            if (!agenticProperty.isActive) {
                return errorResponse("Agentic property is not active");
            }
            if (agenticProperty.isDeleted) {
                return errorResponse("Agentic property is not available");
            }

            if (agenticProperty.AgenticRooms.some(room => room.roomId === data.roomId && !room.isDeleted)) {
                return errorResponse("Room is already connected to this agency");
            }

            const isAlreadyExists = await this.agenticRoomRepository.getAgenticRoomById(data.agenticPropertyId, data.roomId);
            if (isAlreadyExists && isAlreadyExists.isDeleted) {
                const [result] = await Promise.all([
                    this.agenticRoomRepository.recoverAgenticRoom(isAlreadyExists.id),
                    this.agenticRoomRepository.connectRooms(data.agenticPropertyId, data.roomId)
                ]);
                return successResponse("Room reconnected to agency", result);
            }
            const result = await this.agenticRoomRepository.createRoom(data);
            return successResponse("Added rooms for Agencies", result);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to add rooms to Agencies");
            }
            return errorResponse("Unknown error");
        }
    }
    public async removeAgenticRoom(agenticPropertyId: string, agenticRoomId: string): Promise<IApiResponse> {
        try {
            const agenticRoom = await this.agenticRoomRepository.getRoomById(agenticRoomId);
            if (!agenticRoom) {
                return errorResponse("Room not found");
            }
            if (agenticRoom.agenticPropertyId !== agenticPropertyId) {
                return errorResponse("Room does not belong to this agency property");
            }
            if (agenticRoom.isDeleted) {
                return errorResponse("Room is already removed from this agency");
            }

            const [result] = await Promise.all([
                this.agenticRoomRepository.deleteRoom(agenticRoomId),
                this.agenticRoomRepository.disconnectRooms(agenticPropertyId, agenticRoomId)
            ]);

            return successResponse("Removed rooms for Agencies", result);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to remove rooms from Agencies");
            }
            return errorResponse("Unknown error");
        }
    }
    public async updateAgenticRoomAvailability(id: string, isAvailable: boolean): Promise<IApiResponse> {
        try {
            const agenticRoom = await this.agenticRoomRepository.getRoomById(id);
            if (!agenticRoom) {
                return errorResponse("Room not found");
            }
            if (agenticRoom.isDeleted) {
                return errorResponse("Room is not allocated to the agencies");
            }
            const result = await this.agenticRoomRepository.updateRoomAvailability(id, isAvailable);
            return successResponse("Updated room availability", result);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to update room availability");
            }
            return errorResponse("Unknown error");
        }
    }
    public async getRoomsForAgencies(agenticPropertyId: string, propertyId: string): Promise<IApiResponse> {
        try {
            const agenticProperty = await this.agenticPropertyRepository.getAgenticPropertyById(agenticPropertyId);
            if (!agenticProperty) {
                return errorResponse("Agentic property not found");
            }
            
            const result = await this.agenticRoomRepository.getRoomsForAgency(agenticPropertyId, propertyId);
            return successResponse("Retrieved rooms for agencies", result);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to retrieve rooms for agencies");
            }
            return errorResponse("Unknown error");
        }
    }
    public async addRoomsToAgencies(agenticPropertyId:string,roomIds:IRooms[]):Promise<IApiResponse>{
        try {
            const res = await this.agenticRoomRepository.addRoomsForAgenticProperty(agenticPropertyId, roomIds);
            return successResponse("Added rooms to agencies", res);
        } catch (error) {
            // console.log(error)
            if (error instanceof Error) {
                return errorResponse("Failed to add rooms to agencies", error.message);
            }
            return errorResponse("Unknown error");
        }
    }
}