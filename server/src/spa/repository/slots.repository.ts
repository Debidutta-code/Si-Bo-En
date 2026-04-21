import { prisma } from "../../config";
import { BatchPayload, ICSpaSlot, ISpaSlot } from "../types";
export class SpaSlots {
    public async createSlots(data: ICSpaSlot[]): Promise<BatchPayload> {
        try {
            return await prisma.spaSlots.createMany({
                data: {
                    ...data
                }
            })
        } catch (error) {
            throw new Error("Error occur while creating spa slot")
        }
    }
    public async getSlotsByModuleId(spaModuleId: string): Promise<ISpaSlot[]> {
        try {
            return await prisma.spaSlots.findMany({
                where: {
                    spaModuleId
                }
            })
        } catch (error) {
            throw new Error("Error occur while fetching spa slots by module id")
        }
    }
    
    public async getSlotById(id: string): Promise<ISpaSlot | null> {
        try {
            return await prisma.spaSlots.findUnique({
                where: {
                    id
                }
            })
        } catch (error) {
            throw new Error("Error occur while fetching spa slot by id")
        }
    }
    public async deleteSlot(id: string): Promise<ISpaSlot> {
        try {
            return await prisma.spaSlots.delete({
                where: {
                    id
                }
            })
        } catch (error) {
            throw new Error("Error occur while deleting spa slot")
        }
    }
    public async markSlotAsBooked(id: string): Promise<ISpaSlot> {
        try {
            return await prisma.spaSlots.update({
                where: {
                    id
                },
                data: {
                    isBooked: true
                }
            })
        } catch (error) {
            throw new Error("Error occur while marking spa slot as booked")
        }
    }
    public async markSlotAsAvailable(id: string): Promise<ISpaSlot> {
        try {
            return await prisma.spaSlots.update({
                where: {
                    id
                },
                data: {
                    isBooked: false
                }
            })
        } catch (error) {
            throw new Error("Error occur while marking spa slot as available")
        }
    }
}