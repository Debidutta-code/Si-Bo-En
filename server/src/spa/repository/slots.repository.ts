import { prisma } from "../../config";
import { BatchPayload, ICSpaSlotR, ISpaSlot,ICSpaDatesR,ISpaDates } from "../types";
export class SpaDatesRepo{
    public async createDate(data: ICSpaDatesR): Promise<ISpaDates> {
        try {
            return await prisma.spaDates.create({
                data: {
                    ...data
                },include: {
                    Slots: true
                }
            })
        } catch (error) {
            throw new Error("Error occur while creating spa date")
        }
    }
    public async getDateById(id: string): Promise<ISpaDates | null> {
        try {
            return await prisma.spaDates.findUnique({
                where: {
                    id
                },
                include: {
                    Slots: true
                }
            })
        } catch (error) {
            throw new Error("Error occur while fetching spa date by id")
        }
    }
    public async getForDateRange(spaModuleId: string, startDate: Date, endDate: Date): Promise<ISpaDates[]> {
        try {
            return await prisma.spaDates.findMany({
                where: {
                    spaModuleId,
                    date: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                include: {
                    Slots: true
                }
            })
        } catch (error) {
            throw new Error("Error occur while fetching spa dates for date range")
        }
    }
    public async getSpaForDate(spaModuleId: string,date: Date): Promise<ISpaDates | null> {
        try {
            return await prisma.spaDates.findFirst({
                where: {
                    spaModuleId,
                    date:{
                        equals: date
                    }
                },
                include: {
                    Slots: true
                }
            })
        } catch (error) {
            throw new Error("Error occur while fetching spa for date")
        }
    }
    public async deleteDate(id: string): Promise<ICSpaDatesR> {
        try {
            return await prisma.spaDates.delete({
                where: {
                    id
                },include:{
                    Slots: true
                }
                    
            })
        } catch (error) {
            throw new Error("Error occur while deleting spa date")
        }
    }
}
export class SpaSlotsRepo {
    public async createSlots(data: ICSpaSlotR): Promise<ICSpaSlotR> {
        try {
            return await prisma.spaSlots.create({
                data: {
                    ...data
                }
            })
        } catch (error) {
            throw new Error("Error occur while creating spa slot")
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