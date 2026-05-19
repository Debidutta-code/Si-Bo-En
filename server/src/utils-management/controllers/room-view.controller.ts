import { Response } from 'express';
import { errorResponse, CustomRequest } from '../../utils';
import { ICMasterRoomView, IMasterRoomView } from '../types';
import { MasterRoomViewService } from '../services';
import { MasterRoomViewInterceptor } from '../../multi-language/interceptors/masters/master-room-view.interceptor';
export class MasterRoomViewController {
    private masterRoomViewService: MasterRoomViewService;
    constructor() {
        this.masterRoomViewService = new MasterRoomViewService();
    }
    public async createMasterRoomView(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const data: ICMasterRoomView = req.body;
            if (!data.viewName) {
                return res
                    .status(400)
                    .json(errorResponse('View Name is required'));
            }
            const serRes =
                await this.masterRoomViewService.createRoomView(data);

            return res.status(serRes.success ? 200 : 400).json(serRes);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Error occurred while creating RoomView',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Error occurred while creating RoomView',
                        'Unknown error occurred'
                    )
                );
        }
    }
    public async getAllMasterRoomViews(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const locale = req.headers['accept-language']?.slice(0, 2).toLowerCase() || 'en';
            let serRes = await this.masterRoomViewService.getAllRoomViews();
            serRes = await MasterRoomViewInterceptor.intercept(serRes, locale);
            return res.status(serRes.success ? 200 : 400).json(serRes);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Error occurred while fetching RoomViews',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Error occurred while fetching RoomViews',
                        'Unknown error occurred'
                    )
                );
        }
    }
    public async getMasterRoomViewById(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const roomId = req.params.id;
            const locale = req.headers['accept-language']?.slice(0, 2).toLowerCase() || 'en';
            let serRes =
                await this.masterRoomViewService.getRoomViewById(roomId);
            serRes = await MasterRoomViewInterceptor.intercept(serRes, locale);
            return res.status(serRes.success ? 200 : 400).json(serRes);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Error occurred while fetching RoomView',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Error occurred while fetching RoomView',
                        'Unknown error occurred'
                    )
                );
        }
    }
    public async updateMasterRoomView(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const roomId = req.params.id;
            const data: ICMasterRoomView = req.body;
            const serRes = await this.masterRoomViewService.updateRoomView(
                roomId,
                data
            );
            return res.status(serRes.success ? 200 : 400).json(serRes);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Error occurred while updating RoomView',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Error occurred while updating RoomView',
                        'Unknown error occurred'
                    )
                );
        }
    }
    public async deleteMasterRoomView(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const roomId = req.params.id;
            const serRes =
                await this.masterRoomViewService.deleteRoomView(roomId);
            return res.status(serRes.success ? 200 : 400).json(serRes);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Error occurred while deleting RoomView',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Error occurred while deleting RoomView',
                        'Unknown error occurred'
                    )
                );
        }
    }
}
