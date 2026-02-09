import { prisma } from "../../../config";
import { IRooms } from "../types";

export class AgenticRoomRepository {
    public async agenticRooms(agenticPropertyId:string):Promise<IRooms[]>{
        try {
            return await prisma.agenticRoom.findMany({
                where:{
                     agenticPropertyId,
                     isActive:true,
                     isDeleted:false
                },
                include:{
                    room:{
                        include:{
                            roomVideos:true,
                            roomAmenities:{
                                include:{
                                    amenity:true
                                }
                            }
                        }
                    }
                }
            })
        } catch (error) {
            throw new Error(`Error fetching agentic rooms`);
        }
    }
    public async getAgenticRoomById(agenticRoomId:string):Promise<IRooms | null>{
        try {
            return await prisma.agenticRoom.findUnique({
                where:{
                    id:agenticRoomId
                },
                include:{
                    room:{
                        include:{
                            roomVideos:true,
                            roomAmenities:{
                                include:{
                                    amenity:true
                                }
                            }
                        }
                    }
                }
            })
        } catch (error) {
            throw new Error(`Error fetching agentic room`);
        }
    }
}