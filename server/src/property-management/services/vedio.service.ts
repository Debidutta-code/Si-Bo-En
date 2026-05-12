import { IApiResponse } from '../../utils';
import { successResponse, errorResponse } from '../../utils';
import {
    ICRoomVideo,
    ICPropertyVideo,
    IPropertyVideo,
    IRoomVideo,
} from '../types';
import { PropertyVideoRepository, RoomVideoRepository } from '../repository';
import { deleteFileByUrl } from '../../utils/delete-images.utils';
export class PropertyVideoService {
    private propertyVideoRepo = new PropertyVideoRepository();
    constructor() {
        this.propertyVideoRepo = new PropertyVideoRepository();
    }
    public async createVideo(data: ICPropertyVideo): Promise<IApiResponse> {
        try {
            if (!data.url) {
                throw new Error('Missing video URL is missing');
            }
            if (!data.propertyId) {
                throw new Error('Missing property ID');
            }
            const existingVideo = await this.propertyVideoRepo.getVideoById(
                data.propertyId
            );
            if (existingVideo) {
                return this.updateVideo(data.propertyId, data);
            }
            const video = await this.propertyVideoRepo.addPropertyVideo(data);
            return successResponse('Property video added successfully', video);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(error.message);
            }
            return errorResponse('An unknown error occurred');
        }
    }
    private async updateVideo(
        propertyId: string,
        { url, thumbnail }: ICPropertyVideo
    ): Promise<IApiResponse> {
        try {
            if (!url) {
                throw new Error('Missing video URL is missing');
            }
            if (!propertyId) {
                throw new Error('Missing property ID');
            }
            const existingVideo =
                await this.propertyVideoRepo.getVideoById(propertyId);
            if (!existingVideo) {
                throw new Error('Property video does not exist');
            }

            if (existingVideo.url !== url) {
                await deleteFileByUrl(existingVideo.url).catch(err =>
                    console.error(
                        'Failed to delete property video:',
                        existingVideo.url,
                        err
                    )
                );
            }
            if (
                thumbnail &&
                existingVideo.thumbnail &&
                existingVideo.thumbnail !== thumbnail
            ) {
                await deleteFileByUrl(existingVideo.thumbnail).catch(err =>
                    console.error(
                        'Failed to delete property thumbnail:',
                        existingVideo.thumbnail,
                        err
                    )
                );
            }

            const video = await this.propertyVideoRepo.updateVideo(
                propertyId,
                url,
                thumbnail
            );
            return successResponse(
                'Property video updated successfully',
                video
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(error.message);
            }
            return errorResponse('An unknown error occurred');
        }
    }
    public async deletePropertyVideo(
        propertyId: string
    ): Promise<IApiResponse> {
        try {
            const existingVideo =
                await this.propertyVideoRepo.getVideoById(propertyId);
            if (!existingVideo) {
                throw new Error('Property video does not exist');
            }
            const deleted =
                await this.propertyVideoRepo.deleteVideo(propertyId);
            if (!deleted) {
                throw new Error('Failed to delete property video');
            }
            return successResponse('Property video deleted successfully');
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(error.message);
            }
            return errorResponse('An unknown error occurred');
        }
    }
    public async getPropertyVideo(propertyId: string): Promise<IApiResponse> {
        try {
            const video = await this.propertyVideoRepo.getVideoById(propertyId);
            if (!video) {
                throw new Error('Property video does not exist');
            }
            return successResponse(
                'Property video retrieved successfully',
                video
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(error.message);
            }
            return errorResponse('An unknown error occurred');
        }
    }
}
export class RoomVideoService {
    private roomVideoRepo = new RoomVideoRepository();
    constructor() {
        this.roomVideoRepo = new RoomVideoRepository();
    }
    public async createVideo(data: ICRoomVideo): Promise<IApiResponse> {
        try {
            if (!data.url) {
                throw new Error('Missing video URL is missing');
            }
            if (!data.roomId) {
                throw new Error('Missing room ID');
            }
            const existingVideo = await this.roomVideoRepo.getVideoById(
                data.roomId
            );
            if (existingVideo) {
                return this.updateVideo(data.roomId, data);
            }
            const video = await this.roomVideoRepo.addRoomVideo(data);
            return successResponse('Room video added successfully', video);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(error.message);
            }
            return errorResponse('An unknown error occurred');
        }
    }
    private async updateVideo(
        roomId: string,
        { url, thumbnail }: ICRoomVideo
    ): Promise<IApiResponse> {
        try {
            if (!url) {
                throw new Error('Missing video URL is missing');
            }
            if (!roomId) {
                throw new Error('Missing room ID');
            }
            const existingVideo = await this.roomVideoRepo.getVideoById(roomId);
            if (!existingVideo) {
                throw new Error('Room video does not exist');
            }

            if (existingVideo.url !== url) {
                await deleteFileByUrl(existingVideo.url).catch(err =>
                    console.error(
                        'Failed to delete room video:',
                        existingVideo.url,
                        err
                    )
                );
            }
            if (
                thumbnail &&
                existingVideo.thumbnail &&
                existingVideo.thumbnail !== thumbnail
            ) {
                await deleteFileByUrl(existingVideo.thumbnail).catch(err =>
                    console.error(
                        'Failed to delete room thumbnail:',
                        existingVideo.thumbnail,
                        err
                    )
                );
            }

            const video = await this.roomVideoRepo.updateVideo(
                roomId,
                url,
                thumbnail
            );
            return successResponse('Room video updated successfully', video);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(error.message);
            }
            return errorResponse('An unknown error occurred');
        }
    }
    public async getRoomVideo(roomId: string): Promise<IApiResponse> {
        try {
            const video = await this.roomVideoRepo.getVideoById(roomId);
            if (!video) {
                throw new Error('Room video does not exist');
            }
            return successResponse('Room video retrieved successfully', video);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(error.message);
            }
            return errorResponse('An unknown error occurred');
        }
    }
    public async deleteRoomVideo(roomId: string): Promise<IApiResponse> {
        try {
            const deleted = await this.roomVideoRepo.deleteVideo(roomId);
            if (!deleted) {
                throw new Error('Failed to delete room video');
            }
            return successResponse('Room video deleted successfully');
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(error.message);
            }
            return errorResponse('An unknown error occurred');
        }
    }
}
