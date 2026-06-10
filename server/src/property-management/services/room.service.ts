import { successResponse, errorResponse } from '../../utils/return';
import { IApiResponse } from '../../utils/return.types';
import { RoomDao, RoomAmenityDao, PropertyDao, DeleteRoomRepository } from '../repository';
import { RatePlanRepository } from '../../ari/repository/ratePlan.repository';
import { ICRoom } from '../types';
import { deleteFileByUrl } from '../../utils/delete-images.utils';
import { property } from '../../promocode/utils';

export class RoomService {
    private roomDao: RoomDao;
    private deleteRoomRepository: DeleteRoomRepository;

    constructor() {
        this.roomDao = new RoomDao();
        this.deleteRoomRepository = new DeleteRoomRepository();
    }

    public async create(roomData: ICRoom): Promise<IApiResponse> {
        try {
            const [roomByName, roomByCode, roomsByProperty, draftedProperty] = await Promise.all(
                [
                    this.roomDao.findByRoomName(
                        roomData.propertyId,
                        roomData.roomName
                    ),
                    this.roomDao.findByRoomType(
                        roomData.propertyId,
                        roomData.roomType
                    ),
                    this.roomDao.getRoomsByPropertyId(
                        roomData.propertyId,
                        false
                    ),
                    PropertyDao.getPropertyById(roomData.propertyId, false),

                ]
            );
            if (roomByName || roomByCode) {
                return errorResponse(
                    `Room with Name ${roomData.roomName} or Type ${roomData.roomType} already exists for this property`
                );
            }
            if (draftedProperty && roomsByProperty.length > 0) {
                return errorResponse(
                    'Complete Property setup to create multiple rooms'
                );
            }
            const createdRoom = await this.roomDao.create(roomData);
            await this.roomDao.createRoomView({
                roomId: createdRoom.id,
                masterViewId: roomData.RoomViews!.MasterRoomView.id,
            });
            if (createdRoom) {
                return successResponse(
                    'Room created successfully',
                    createdRoom
                );
            } else {
                return errorResponse('Failed to create room');
            }
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('failed to create room', error.message);
            }
            return errorResponse('Failed to create room');
        }
    }
    public async findById(id: string): Promise<IApiResponse> {
        try {
            const room = await this.roomDao.findByRoomId(id,false);
            if (room) {
                return successResponse('Room fetched successfully', room);
            } else {
                return errorResponse('Room not found');
            }
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('failed to fetch room', error.message);
            }
            return errorResponse('Failed to fetch room');
        }
    }

    public async update(id: string, roomData: ICRoom): Promise<IApiResponse> {
        try {
            const isExists = await this.roomDao.findByRoomId(id,false);
            if (!isExists) {
                return errorResponse('Room Does not exists');
            }

            const oldImages: string[] = isExists.image || [];
            const newImages: string[] = roomData.image || [];

            const imagesToDelete = oldImages.filter(
                img => !newImages.includes(img)
            );

            if (imagesToDelete.length > 0) {
                await Promise.all(
                    imagesToDelete.map(img =>
                        deleteFileByUrl(img).catch(err =>
                            console.error(
                                'Failed to delete room image:',
                                img,
                                err
                            )
                        )
                    )
                );
            }

            const updatedRoom = await this.roomDao.updateRoom(id, roomData);
            await this.roomDao.updateRoomView({
                roomId: id,
                masterViewId: roomData.RoomViews!.MasterRoomView.id,
            });
            if (updatedRoom) {
                return successResponse(
                    'Room updated successfully',
                    updatedRoom
                );
            } else {
                return errorResponse('Room not found or failed to update');
            }
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('failed to update room', error.message);
            }
            return errorResponse('Failed to update room');
        }
    }
    public async delete(id: string): Promise<any> {
        try {
            const room = await this.roomDao.findByRoomId(id,false);
            if (!room) {
                return errorResponse('Room not found');
            }
            const propertyCode = room?.property.propertyCode;
            if (!propertyCode) {
                return errorResponse('Property code not found');
            }
            await RatePlanRepository.deleteCharges(
                room?.roomType,
                propertyCode
            );
            const deletedRoom = await this.roomDao.delete(id);
            await Promise.all([
                this.deleteRoomRepository.deleteRoomInventory(room.roomType, propertyCode),
                this.deleteRoomRepository.deleteCharges(room.roomType, propertyCode),
                this.deleteRoomRepository.deleteGeoRatePlan(room.roomType, room.propertyId),
                this.deleteRoomRepository.deletePromotions(room.roomType, room.propertyId),
                this.deleteRoomRepository.deleteCustomizableDeals(room.roomType, room.propertyId),
                this.deleteRoomRepository.deleteTouristTax(id),
            ]);
            if (deletedRoom) {
                return successResponse('Room successfully', deletedRoom);
            } else {
                return errorResponse('Room not found or already deleted');
            }
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('failed to delete room', error.message);
            }
            return errorResponse('Failed to delete room');
        }
    }
    public async findByPropertyId(
        propertyId: string,
        isDeleted: boolean = true
    ): Promise<IApiResponse> {
        try {
            const rooms = await this.roomDao.getRoomsByPropertyId(
                propertyId,
                isDeleted
            );
            if (rooms) {
                return successResponse('Rooms fetched successfully', rooms);
            } else {
                return successResponse('No rooms found for this property');
            }
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'failed to fetch rooms for property',
                    error.message
                );
            }
            return errorResponse('failed to fetch rooms for property');
        }
    }
    public async findAvailableRoomsForInv(
        propertyId: string
    ): Promise<IApiResponse> {
        try {
            const rooms =
                await this.roomDao.getAllPropertyRoomsForInvSetup(propertyId);
            if (rooms) {
                return successResponse(
                    'Available Rooms fetched successfully',
                    rooms
                );
            } else {
                return successResponse(
                    'No available rooms found for this property',
                    []
                );
            }
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'failed to fetch rooms for property',
                    error.message
                );
            }
            return errorResponse('failed to fetch rooms for property');
        }
    }
    public async view360ImageToRoom(
        roomId: string,
        link: string
    ): Promise<IApiResponse> {
        try {
            const updatedRoom = await this.roomDao.add360ViewLinkToRoom(
                roomId,
                link
            );
            if (updatedRoom) {
                return successResponse(
                    '360 view link added successfully',
                    updatedRoom
                );
            } else {
                return errorResponse('Failed to add 360 view link');
            }
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'failed to add 360 view link to room',
                    error.message
                );
            }
            return errorResponse('failed to add 360 view link to room');
        }
    }
    public async recoveryRoom(id:string):Promise<IApiResponse> {
        try {
            const isRoomDeleted=await this.roomDao.findByRoomId(id,true);
            if(isRoomDeleted && isRoomDeleted.isDeleted){
                const recoveredRoom = await this.roomDao.recoveryRoom(id);
                return successResponse('Room recovered successfully', recoveredRoom);
            }
            return errorResponse('Room is not deleted');
        } catch (error) {
            if(error instanceof Error){
                return errorResponse('Failed to recovery room',error.message);
            }
            return errorResponse('Failed to recovery room');
        }
    }
}
export class RoomAminityService {
    private roomAmenityDao: RoomAmenityDao;

    constructor() {
        this.roomAmenityDao = new RoomAmenityDao();
    }

    public async createAminityService(
        roomId: string,
        amenities: Record<string, boolean>
    ) {
        try {
            //console.log("roomId", roomId, "amenities", amenities);
            const isExists = await this.roomAmenityDao.existsByRoomId(roomId);
            if (isExists) {
                return errorResponse('Amenity already exists for this room');
            }
            const daoRes = await this.roomAmenityDao.createAmenities(
                roomId,
                amenities
            );
            if (daoRes) {
                return successResponse(
                    'Room aminity created successfully',
                    daoRes
                );
            } else {
                return errorResponse('Failed to add room aminity');
            }
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'failed to add amenity to room',
                    error.message
                );
            }
            return errorResponse('failed to add amenity to room');
        }
    }
    public async findAminityByRoomId(roomId: string) {
        try {
            const daoRes = await this.roomAmenityDao.getActiveAmenities(roomId);
            if (daoRes) {
                if (daoRes.length == 0) {
                    return errorResponse('No Aminity available FOr this room');
                }
                return successResponse(
                    'Room Aminity fetched successfully',
                    daoRes
                );
            } else {
                return errorResponse('Failed to fetch room aminity');
            }
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'failed to fetch amenity for room',
                    error.message
                );
            }
            return errorResponse('failed to fetch amenity for room');
        }
    }
    public async updateAminityByRoomId(
        roomId: string,
        amenities: Record<string, boolean>
    ) {
        try {
            const daoRes = await this.roomAmenityDao.updateByRoomId(
                roomId,
                amenities
            );
            if (daoRes) {
                return successResponse(
                    'Room Aminity Updated successfully',
                    daoRes
                );
            } else {
                return errorResponse('Failed to update room aminity');
            }
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'failed to update amenity for room',
                    error.message
                );
            }
            return errorResponse('failed to update amenity for room');
        }
    }
    public async deleteAminityByRoomId(roomId: string) {
        try {
            const daoRes = await this.roomAmenityDao.deleteByRoomId(roomId);
            if (daoRes) {
                return successResponse(
                    'Room Aminity deleted successfully',
                    daoRes
                );
            } else {
                return errorResponse('Failed to fetch room aminity');
            }
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'failed to delete amenity for room',
                    error.message
                );
            }
            return errorResponse('failed to delete amenity for room');
        }
    }
}
