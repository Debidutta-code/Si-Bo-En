import {prisma} from "../../config";
import { IReservation } from "../../reservation/types";
import {ICAgenticRoom,IAgenticRoom, IRooms} from "../types";
export class AgenticRoomRepository {
    public async createRoom(data: ICAgenticRoom): Promise<IAgenticRoom> {
        try {
            
            return await prisma.agenticRoom.create({
                data
            });
        } catch (error) {
            throw new Error(`Failed to create room`);
        }
    }
    public async getAgenticRoomById(agenticPropertyId:string, roomId:string): Promise<IAgenticRoom | null> {
        try {
            return await prisma.agenticRoom.findFirst({
                where: {
                    roomId,
                    agenticPropertyId
                }
            });
        } catch (error) {
            throw new Error(`Failed to get agentic room by ID: ${roomId}`);
        }
    }
    public async getRoomById(id: string): Promise<IAgenticRoom | null> {
        try {
            return await prisma.agenticRoom.findUnique({
                where: { id }
            });
        } catch (error) {
            throw new Error(`Failed to get room by ID: ${id}`);
        }
    }

    public async updateRoomAvailability(id: string, isAvailable: boolean): Promise<IAgenticRoom | null> {
        try {
            return await prisma.agenticRoom.update({
                where: { id },
                data: { isActive:isAvailable }
            });
        } catch (error) {
            throw new Error(`Failed to update room: ${id}`);
        }
    }

    public async deleteRoom(agenticRoomId: string): Promise<IAgenticRoom | null> {
        try {
            return await prisma.agenticRoom.update({
                where: { id: agenticRoomId },
                data: { isDeleted: true }
            });
        } catch (error) {
            throw new Error(`Failed to delete room`);
        }
    }
    public async recoverAgenticRoom(agenticRoomId: string): Promise<IAgenticRoom | null> {
        try {
            return await prisma.agenticRoom.update({
                where: { id: agenticRoomId },
                data: { isDeleted: false }
            });
        } catch (error) {
            throw new Error(`Failed to recover room`);
        }
    }
    public async getReservationByAgenticRooms(agentId:string,propertyId:string,roomType:string,skip:number=0,take:number=10):Promise<IReservation[]>{
        try {
            return await prisma.reservation.findMany({
                where: {
                    agencyId:agentId,
                    propertyId,
                    roomTypeCode:roomType
                },
                skip,
                take
            });
        } catch (error) {
            throw new Error(`Failed to get reservations by agentic rooms`);
        }
    }
    public async connectRooms(agenticPropertyId:string, agenticRoomId:string){
        try {
            return await prisma.agenticProperty.update({
                where: { id: agenticPropertyId },
                data: {
                    AgenticRooms: {
                        connect: {
                            id: agenticRoomId
                        }
                    }
                }
            });
        } catch (error) {
            throw new Error(`Failed to connect rooms`);
        }
    }
    public async disconnectRooms(agenticPropertyId:string, agenticRoomId:string){
        try {
            return await prisma.agenticProperty.update({
                where: { id: agenticPropertyId },
                data: {
                    AgenticRooms: {
                        disconnect: {
                            id: agenticRoomId
                        }
                    }
                }
            });
        } catch (error) {
            throw new Error(`Failed to connect rooms`);
        }
    }
    public async getRoomsForAgency(agenticPropertyId:string,propertyId:string):Promise<IRooms[]>{
        try {
            return await prisma.room.findMany({
                where:{
                    propertyId,
                    agenticRooms:{
                        none:{
                            agenticPropertyId:agenticPropertyId
                        }
                    }
                }
            });
        } catch (error) {
            throw new Error(`Failed to get rooms for agency`);
        }
    }
    public async addRoomsForAgenticProperty(agenticPropertyId:string,roomIds:IRooms[]):Promise<any>{
        try {
            return  await prisma.agenticRoom.createMany({
                    data: roomIds.map(({ id, roomType, roomName }) => ({
                        agenticPropertyId,
                        roomId: id,
                        roomType,
                        roomName,
                        isActive: true
                    }))
                });
        } catch (error) {
            throw new Error(`Failed to add rooms for agentic property`);
        }
    }
    
}