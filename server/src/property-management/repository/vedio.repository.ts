import { prisma } from '../../config';
import {
    IPropertyVideo,
    ICPropertyVideo,
    ICRoomVideo,
    IRoomVideo,
} from '../types';
export class PropertyVideoRepository {
    public async addPropertyVideo(
        data: ICPropertyVideo
    ): Promise<IPropertyVideo> {
        return await prisma.propertyVideo.create({
            data,
        });
    }

    async getVideoById(propertyId: string): Promise<IPropertyVideo | null> {
        return await prisma.propertyVideo.findUnique({
            where: { propertyId },
        });
    }

    async updateVideo(
        propertyId: string,
        url: string,
        thumbnailUrl: string | null
    ): Promise<IPropertyVideo | null> {
        return await prisma.propertyVideo.update({
            where: { propertyId },
            data: { url, thumbnail: thumbnailUrl },
        });
    }

    async deleteVideo(propertyId: string): Promise<boolean> {
        const deletedVideo = await prisma.propertyVideo.delete({
            where: { propertyId },
        });
        return !!deletedVideo;
    }
}
export class RoomVideoRepository {
    public async addRoomVideo(data: ICRoomVideo): Promise<IRoomVideo> {
        return await prisma.roomVideo.create({
            data,
        });
    }

    async getVideoById(roomId: string): Promise<IRoomVideo | null> {
        return await prisma.roomVideo.findUnique({
            where: { roomId },
        });
    }

    async updateVideo(
        roomId: string,
        url: string,
        thumbnailUrl: string | null
    ): Promise<IRoomVideo | null> {
        return await prisma.roomVideo.update({
            where: { roomId },
            data: { url, thumbnail: thumbnailUrl },
        });
    }

    async deleteVideo(roomId: string): Promise<boolean> {
        const deletedVideo = await prisma.roomVideo.delete({
            where: { roomId },
        });
        return !!deletedVideo;
    }
}
