import {prisma} from "../../config";
import { IReservation } from "../../reservation/types";
import {IAgency, IAgenticProperty, IAgenticPropertyWR, ICAgenticProperties, ICAgenticProperty, IProperty} from "../types";
export class AgenticPropertyRepository {
   public async createAgenticProperty(data: ICAgenticProperty): Promise<IAgenticProperty> {
    try {
            return await prisma.agenticProperty.create({
                data,
            
            });
        } catch (error) {
            throw new Error(`Failed to create property`);
        }
    }
    public async getAgenticPropertyByProperty(agencyId:string,propertyId:string):Promise<IAgenticProperty|null>{
        try {
            return await prisma.agenticProperty.findFirst({
                where: {
                    agencyId: agencyId,
                    propertyId: propertyId
                }
            });
        } catch (error) {
            throw new Error(`Failed to get property by agency and property ID: ${agencyId}, ${propertyId}`);
        }
    }
    public async getAgenticPropertyById(id: string): Promise<IAgenticPropertyWR | null> {
        try {
            return await prisma.agenticProperty.findUnique({
                where: { id },
                include:{
                    AgenticRooms:{
                        where:{
                            isDeleted:false
                        }
                    }
                }
            });
        } catch (error) {
            throw new Error(`Failed to get property by ID: ${id}`);
        }
    }

    public async updateAgenticProperty(id: string, isActive:boolean): Promise<IAgenticProperty | null> {
        try {
            
            return   await prisma.agenticProperty.update({
                where: { id },
                data: { isActive }
            });
        } catch (error) {
            throw new Error(`Failed to update property: ${id}`);
        }
    }

    public async deleteAgenticProperty(id: string): Promise<IAgenticProperty | null> {
        try {
            return await prisma.agenticProperty.update({
                where: { id },
                data: { isDeleted: true,     }
            });
        } catch (error) {
            throw new Error(`Failed to delete property: ${id}`);
        }
    }
    public async recoverDeletedAgenticProperty(id: string): Promise<IAgenticProperty | null> {
        try {
            return await prisma.agenticProperty.update({
                where: { id },
                data: { isDeleted: false }
            });
        } catch (error) {
            throw new Error(`Failed to recover property: ${id}`);
        }
    }
    public async getReservationsByAgents(agencyId:string,propertyId:string,skip:number=0,take:number=10): Promise<IReservation[] | null> {
        try {

            return await prisma.reservation.findMany({
                where: {
                    agencyId,
                    propertyId
                },
                skip,
                take
            });
        } catch (error) {
            throw new Error(`Failed to get reservations by agents`);
        }
    }
    public async countAllReservations(agencyId:string,propertyCode:string): Promise<number> {
        try {
            
            const count = await prisma.agenticProperty.count({
                where: {
                    agencyId,
                    propertyCode
                }
            });
            return count > 0 ? count : 0;
        } catch (error) {
            throw new Error(`Failed to count all reservations`);
        }
    }
    public async getAvailableProperties():Promise<IProperty[]>{
        try {
            return await prisma.property.findMany({
                where: {
                    propertyConfigs:{
                        isB2bAvailable:true
                    },
                    isDraft:false,  // ✅ Get published properties (not drafts)
                    isDeleted:false,
                    isAvailable:true
                },
                select: {
                    id: true,
                    propertyCode: true,
                    propertyName: true
                }
            });
        } catch (error) {
            throw new Error(`Failed to get available properties`);
        }
    }
    public async getPropertiesForAgent(agencyId: string): Promise<IProperty[]> {
        try {
            return await prisma.property.findMany({
                where: {
                    propertyConfigs: {
                        isB2bAvailable: true
                    },
                    isDraft: true,  // ✅ Get published properties (not drafts)
                    isDeleted: false,
                    isAvailable: true,
                    agenticProperties: {
                        none: {
                            agencyId: agencyId,
                            isDeleted: false 
                        }
                    }
                },
                select: {
                    id: true,
                    propertyCode: true,
                    propertyName: true
                }
            });
        } catch (error) {
            throw new Error(`Failed to get properties for agent: ${agencyId}`);
        }
    }
    public async createAgenticProperties(agencyId: string, propertyIds: ICAgenticProperties[]): Promise<any> {
        try {
            return  await prisma.agenticProperty.createMany({
                data: propertyIds.map(({ id, propertyCode, propertyName }) => ({
                    agencyId,
                    propertyId: id,
                    propertyCode,
                    propertyName,
                    isActive: true
                }))
            });
            
        } catch (error) {
            throw new Error(`Failed to create agentic properties for agency: ${agencyId}`);
        }
    }
    public async disconnectProperty(agencyId:string,agenticPropertyId:string): Promise<IAgency | null> {
        try {
            return await prisma.agency.update({
                where: { id: agencyId },
                data: {
                    AgenticProperties:{
                        disconnect:{
                            id:agenticPropertyId
                        }
                    }
                }
            });
        } catch (error) {
            throw new Error(`Failed to disconnect property`);
        }
    }
    public async connectProperty(agencyId:string,agenticPropertyId:string): Promise<IAgency | null> {
        try {
            return await prisma.agency.update({
                where: { id: agencyId },
                data: {
                    AgenticProperties:{
                        connect:{
                            id:agenticPropertyId
                        }
                    }
                }
            });
        } catch (error) {
            throw new Error(`Failed to connect property`);
        }
    }
    
    public async getAgenciesByPropertyId(propertyId: string): Promise<IAgency[]> {
        try {
            return await prisma.agency.findMany({
                where: {
                    isDeleted: false,
                    AgenticProperties: {
                        some: {
                            propertyId: propertyId,
                            isDeleted: false
                        }
                    }
                },
                include: {
                    AgenticProperties: {
                        where: {
                            propertyId: propertyId,
                            isDeleted: false
                        },
                        include: {
                            AgenticRooms: {
                                where: {
                                    isDeleted: false
                                }
                            }
                        }
                    }
                }
            });
        } catch (error) {
            throw new Error(`Failed to get agencies by property ID: ${propertyId}`);
        }
    }
}