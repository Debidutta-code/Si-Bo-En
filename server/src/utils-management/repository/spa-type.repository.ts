import {prisma} from "../../config";
import {
    ICSpaCatrgory,
    ICSpaSubCategory,
    ISpaCategory,
    ISpaSubCategory,
    IUSpaSubCategory
} from "../types/spa.type";


export class SpaCategory{
    public async createSpaCategory(data:ICSpaCatrgory):Promise<ISpaCategory>{
        try {
            return await prisma.spaCategory.create({
                data:data
            })
        } catch (error) {
            throw new Error("Error occuring while creating Spa Category")
        }
    }
    public async getByName(name:string):Promise<ISpaCategory | null>{
        try {
            return await prisma.spaCategory.findUnique({
                where: {
                    name: name
                }
            })
        } catch (error) {
            throw new Error("Error occuring while fetching Spa Category")
        }
    }
    public async getById(id:string):Promise<ISpaCategory | null>{
        try {
            return await prisma.spaCategory.findUnique({
                where: {
                    id: id
                }
            })
        } catch (error) {
            throw new Error("Error occuring while fetching Spa Category")
        }
    }
    public async update(id:string, data:ICSpaCatrgory):Promise<ISpaCategory | null>{
        try {
            return await prisma.spaCategory.update({
                where: {
                    id: id
                },
                data: data
            })
        } catch (error) {
            throw new Error("Error occuring while updating Spa Category")
        }
    }
    public async delete(id:string):Promise<ISpaCategory | null>{
        try {
            return await prisma.spaCategory.delete({
                where: {
                    id: id
                }
            })
        } catch (error) {
            throw new Error("Error occuring while deleting Spa Category")
        }
    }
    public async getSpaCategories(): Promise<ISpaCategory[]> {
        try {
            return await prisma.spaCategory.findMany();
        } catch (error) {
            throw new Error("Error occuring while fetching Spa Categories")
        }
    }
}

export class SpaSubCategory{
    public async createSpaSubCategory(data:ICSpaSubCategory):Promise<ISpaSubCategory>{
        try {
            return await prisma.spaSubCategory.create({
                data:{
                    name: data.name,
                    categoryId: data.categoryId,
                    isActive: true
                }
            })
        } catch (error) {
            throw new Error("Error occuring while creating Spa Sub Category")
        }
    }
    public async getByName(name:string, categoryId:string):Promise<ISpaSubCategory | null>{
        try {
            return await prisma.spaSubCategory.findUnique({
                where: {
                    categoryId_name: {
                        categoryId: categoryId,
                        name: name
                    }
                }
            })
        } catch (error) {
            throw new Error("Error occuring while fetching Spa Sub Category")
        }
    }
    public async getById(id:string):Promise<ISpaSubCategory | null>{
        try {
            return await prisma.spaSubCategory.findUnique({
                where: {
                    id: id
                }
            })
        } catch (error) {
            throw new Error("Error occuring while fetching Spa Sub Category")
        }
    }
    public async update(id:string, data:IUSpaSubCategory):Promise<ISpaSubCategory | null>{
        try {
            return await prisma.spaSubCategory.update({
                where: {
                    id: id
                },
                data: data
            })
        } catch (error) {
            throw new Error("Error occuring while updating Spa Sub Category")
        }
    }
    public async delete(id:string):Promise<ISpaSubCategory | null>{
        try {
            return await prisma.spaSubCategory.delete({
                where: {
                    id: id
                }
            })
        } catch (error) {
            throw new Error("Error occuring while deleting Spa Sub Category")
        }
    }
    public async getByCategoryId(categoryId:string):Promise<ISpaSubCategory[]>{
        
        try {
            return await prisma.spaSubCategory.findMany({
                where: {
                    categoryId: categoryId
                }
            })
        } catch (error) {
            throw new Error("Error occuring while fetching Spa Sub Categories")
        }
    }
    public async getSubCategories(): Promise<ISpaSubCategory[]> {
        try {
            return await prisma.spaSubCategory.findMany();
        } catch (error) {
            throw new Error("Error occuring while fetching Spa Sub Categories")
        }
    }
}