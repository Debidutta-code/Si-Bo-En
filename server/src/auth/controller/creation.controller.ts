import { Response } from 'express';
import { CustomRequest } from '../../utils/customRequest';
import { errorResponse } from '../../utils/return';
import CreationService, {
    FetchByCreationId,
    FetchByUserId,
} from '../services/creation.service';
import { CreationInterceptor } from '../../multi-language/interceptors/creation/creation.interceptor';
export default class CreationController {
    public static async createController(req: CustomRequest, res: Response) {
        try {
            const {
                type,
                name,
                creationId,
                level,
                images,
                assignTo,
                isCustom,
            } = req.body;
            if (!type || !name) {
                return res
                    .status(400)
                    .json(errorResponse('Fill all the fields'));
            }
            const userId = req.user?.id;
            let userLevel = level ? level : req.user?.level;
            if (req.user?.role === 'regional_admin') {
                userLevel = 3;
            }

            const usersCreation = creationId
                ? creationId
                : req.user?.creationId;
            if (!userId || !userLevel || !usersCreation) {
                return res.status(400).json(errorResponse('UnAuthorized user'));
            }
            if (isCustom && !assignTo) {
                return res
                    .status(400)
                    .json(errorResponse('Choose a regional creation'));
            }
            const serRes = await CreationService.create(
                type,
                name,
                userId,
                userLevel,
                usersCreation,
                images,
                isCustom,
                assignTo
            );
            return res.status(serRes.success ? 200 : 400).json(serRes);
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal server error', error?.message));
        }
    }
    public static async updateController(req: CustomRequest, res: Response) {
        try {
            const id = req.params.id;
            const { name, images, isActive } = req.body;
            if (!name) {
                return res.status(400).json(errorResponse('Name is required'));
            }
            const serRes = await CreationService.update(
                id,
                name,
                images,
                isActive
            );
            return res.status(serRes.success ? 200 : 400).json(serRes);
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal server error', error?.message));
        }
    }
    public static async deleteCreation(req: CustomRequest, res: Response) {
        try {
            const id = req.params.id;
            const serRes = await CreationService.deleteCreation(id);
            return res.status(serRes.success ? 200 : 400).json(serRes);
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal server error', error?.message));
        }
    }
    public static async toggleDraftController(
        req: CustomRequest,
        res: Response
    ) {
        try {
            const { val } = req.body;
            const id = req.params.id;
            const serRes = await CreationService.toggleDraft(id, val);
            return res.status(serRes.success ? 200 : 400).json(serRes);
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal server error', error?.message));
        }
    }
    public static async getAllController(req: CustomRequest, res: Response) {
        try {
            const type = req.query.type as
                | 'group'
                | 'property'
                | 'brand'
                | 'super'
                | 'regional';
            const isActive = req.query.isActive;
            const serRes = await CreationService.getAll(
                type ? type : 'property',
                isActive?.toString() === 'true' ? true : false
            );
            return res.status(serRes.success ? 200 : 400).json(serRes);
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal server error', error?.message));
        }
    }
    public static async getAllDeletedController(
        req: CustomRequest,
        res: Response
    ) {
        try {
            const type = req.query.type as
                | 'group'
                | 'property'
                | 'brand'
                | 'super';
            const serRes = await CreationService.getAll(
                type ? type : 'property'
            );
            return res.status(serRes.success ? 200 : 400).json(serRes);
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal server error', error?.message));
        }
    }
    public static async getCrationByRole(req: CustomRequest, res: Response) {
        try {
            const requestUserLevel = req.user?.level;
            const creationId = req.user?.creationId;
            if (!requestUserLevel || !creationId) {
                return res
                    .status(400)
                    .json(errorResponse('Insufficient user data'));
            }
            // Call the service without page and limit
            let serRes = await CreationService.getPropertyByRole(
                requestUserLevel,
                creationId
            );

            const locale = req.headers['accept-language']?.slice(0, 2).toLowerCase() || 'en';
            serRes = await CreationInterceptor.interceptGetCreationByRole(serRes, locale);

            if (serRes.success) {
                return res.status(200).json(serRes);
            } else {
                return res.status(400).json(serRes);
            }
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal Server Error', error?.message));
        }
    }
    public static async getSpecificCreation(req: CustomRequest, res: Response) {
        try {
            const id = req.params.creationId;
            let serRes = await CreationService.getSpecificCreation(id);

            const locale = req.headers['accept-language']?.slice(0, 2).toLowerCase() || 'en';
            serRes = await CreationInterceptor.interceptGetSpecificCreation(serRes, locale);

            return res.status(serRes.success ? 200 : 400).json(serRes);
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal server error', error?.message));
        }
    }
}
export class fetchCreationAndPropertyDetails {
    public static async byCreationId(req: CustomRequest, res: Response) {
        try {
            const { id, type } = req.query;
            const userLevel = req.user?.level;
            const userRole = req.user?.role?.toString();
            if (!id || !type) {
                return res
                    .status(400)
                    .json(errorResponse('failed to get id or type'));
            }
            switch (userLevel) {
                case 0:
                    if (type != 'property') {
                        return res
                            .status(400)
                            .json(
                                errorResponse(
                                    `${userRole?.toString()} can only access property`
                                )
                            );
                    }
                    const serRes = await FetchByCreationId.getPropertyManagers(
                        id.toString(),
                        type
                    );
                    return res.status(serRes.success ? 200 : 400).json(serRes);
                case 1:
                    if (type != 'property' || type != 'property') {
                        return res
                            .status(400)
                            .json(
                                errorResponse(
                                    `${userRole?.toString()} can only access property`
                                )
                            );
                    }
                    const serPRes = await FetchByCreationId.getPropertyManagers(
                        id.toString(),
                        type
                    );
                    return res
                        .status(serPRes.success ? 200 : 400)
                        .json(serPRes);
                case 2:
                    if (type != 'property' && type != 'brand') {
                        return res
                            .status(400)
                            .json(
                                errorResponse(
                                    `${userRole?.toString()} can only access property or brand`
                                )
                            );
                    }
                    const serBRes = await FetchByCreationId.getBrandManagers(
                        id.toString(),
                        type
                    );
                    return res
                        .status(serBRes.success ? 200 : 400)
                        .json(serBRes);
                case 3:
                    if (
                        type != 'property' &&
                        type != 'brand' &&
                        type != 'group'
                    ) {
                        return res
                            .status(400)
                            .json(
                                errorResponse(
                                    `${userRole?.toString()} can only access property`
                                )
                            );
                    }
                    const serGRes = await FetchByCreationId.getBrandManagers(
                        id.toString(),
                        type
                    );
                    return res
                        .status(serGRes.success ? 200 : 400)
                        .json(serGRes);
                    break;

                default:
                    break;
            }
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal server error', error?.message));
        }
    }
    public static async byUserId(req: CustomRequest, res: Response) {
        try {
            const { type } = req.query;
            const userLevel = req.user?.level;
            const userRole = req.user?.role?.toString();
            const id = req.user?.id.toString();
            if (!id || !type) {
                return res
                    .status(400)
                    .json(errorResponse('failed to get id or type'));
            }
            switch (userLevel) {
                case 0:
                    if (type != 'property') {
                        return res
                            .status(400)
                            .json(
                                errorResponse(
                                    `${userRole?.toString()} can only access property`
                                )
                            );
                    }
                    const serRes = await FetchByUserId.getPropertyManagers(
                        id.toString(),
                        type
                    );
                    return res.status(serRes.success ? 200 : 400).json(serRes);
                case 1:
                    if (type != 'property' || type != 'property') {
                        return res
                            .status(400)
                            .json(
                                errorResponse(
                                    `${userRole?.toString()} can only access property`
                                )
                            );
                    }
                    const serPRes = await FetchByUserId.getPropertyManagers(
                        id.toString(),
                        type
                    );
                    return res
                        .status(serPRes.success ? 200 : 400)
                        .json(serPRes);
                case 2:
                    if (type != 'property' && type != 'brand') {
                        return res
                            .status(400)
                            .json(
                                errorResponse(
                                    `${userRole?.toString()} can only access property or brand `
                                )
                            );
                    }
                    const serBRes = await FetchByUserId.getBrandManagers(
                        id.toString(),
                        type
                    );
                    return res
                        .status(serBRes.success ? 200 : 400)
                        .json(serBRes);
                case 3:
                    if (
                        type != 'property' &&
                        type != 'brand' &&
                        type != 'group'
                    ) {
                        return res
                            .status(400)
                            .json(
                                errorResponse(
                                    `${userRole?.toString()} can only access property or group or brand`
                                )
                            );
                    }
                    const serGRes = await FetchByUserId.getBrandManagers(
                        id.toString(),
                        type
                    );
                    return res
                        .status(serGRes.success ? 200 : 400)
                        .json(serGRes);
                    break;

                default:
                    break;
            }
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal server error', error?.message));
        }
    }
}
