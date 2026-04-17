import {prisma} from "../../config";
import { ICMasterRoomView, IMasterRoomView } from "../types";
export class MasterRoomView{
    public async createRoomView(data: ICMasterRoomView): Promise<IMasterRoomView> {
        try {
            
            const roomView = await prisma.masterRoomView.create({
                data: {
                    viewName: data.viewName.toLocaleLowerCase(),
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });
            return roomView;
        } catch (error) {
            throw new Error("Error creating room view");
        }
    }
    public async getRoomViewByName(name:string): Promise<IMasterRoomView | null> {
        try {
            const roomView = await prisma.masterRoomView.findFirst({
                where: { viewName:name },
            });
            return roomView;
        } catch (error) {
            throw new Error("Error fetching room view");
        }
    }
    public async getRoomViewById(id: string): Promise<IMasterRoomView | null> {
        try {
            const roomView = await prisma.masterRoomView.findUnique({
                where: { id },
            });
            return roomView;
        } catch (error) {
            throw new Error("Error fetching room view");
        }
    }
    public async updateRoomView(id: string, data: ICMasterRoomView): Promise<IMasterRoomView | null> {
        try {
            const roomView = await prisma.masterRoomView.update({
                where: { id },
                data: {
                    ...data,
                    viewName: data.viewName.toLocaleLowerCase(),
                    updatedAt: new Date(),
                },
            });
            return roomView;
        } catch (error) {
            throw new Error("Error updating room view");
        }
    }
    public async deleteRoomView(id: string): Promise<IMasterRoomView | null> {
        try {
            const roomView = await prisma.masterRoomView.delete({
                where: { id },
            });
            return roomView;
        } catch (error) {
            throw new Error("Error deleting room view");
        }
    }
    public async getAllRoomViews(): Promise<IMasterRoomView[]> {
        try {
            const roomViews = await prisma.masterRoomView.findMany();
            return roomViews;
        } catch (error) {
            throw new Error("Error fetching all room views");
        }
    }
}