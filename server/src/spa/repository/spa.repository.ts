import {prisma} from "../../config";
import {ICSpaR,ISpa, ISpaO, ISpaWSlots, IUSpaR} from "../types";


export class SpaRepository {
    public async createSpa(data: ICSpaR): Promise<ISpaO> {
        try {
            return await prisma.spa.create({
                data:{
                    ...data,
                    isActive: true
                }
            })
        } catch (error) {
            throw new Error("Error occur while creating spa")
        }
    }
    public async getSpaByCode(code:string,propertyId:string): Promise<ISpaO | null> {
        try {
            return await prisma.spa.findUnique({
                where: {
                    itemCode_propertyId:{
                        itemCode: code,
                        propertyId: propertyId
                    }
                }
            })
        } catch (error) {
            throw new Error("Error occur while fetching spa")
        }
    }
    public async getByName(name:string,propertyId:string): Promise<ISpaO | null> {
        try {
            return await prisma.spa.findUnique({
                where: {
                    name_propertyId:{
                        name: name,
                        propertyId: propertyId
                    }
                }
            })
        } catch (error) {
            throw new Error("Error occur while fetching spa")
        }
    }
    public async getById(id:string): Promise<ISpaO | null> {
        try {
            return await prisma.spa.findUnique({
                where: {
                    id: id
                }
            })
        } catch (error) {
            throw new Error("Error occur while fetching spa")
        }
    }
    public async updateSpa(id:string, data: IUSpaR): Promise<ISpaO> {
        try {
            return await prisma.spa.update({
                where: {
                    id: id
                },
                data: {
                    ...data
                }
            })
        } catch (error) {
            throw new Error("Error occur while updating spa")
        }
    }
    public async deleteSpa(id:string): Promise<ISpaO> {
        try {
            return await prisma.spa.delete({
                where: {
                    id: id
                }
            })
        } catch (error) {
            throw new Error("Error occur while deleting spa")
        }
    }
    public async getSpaForProperty(propertyId:string):Promise<ISpaWSlots[]> {
        try {
            return await prisma.spa.findMany({
                where: {
                    propertyId: propertyId
                },include:{
                    Category: true,
                    SubCategory: true,
                    User:{
                        select:{
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true
                        }
                    },
                    SpaDates:{
                        include:{
                            Slots:true
                        }
                    }
                }
            })
        } catch (error) {
            throw new Error("Error occur while fetching spas for property")
        }
    }
    
}