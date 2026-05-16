import { CustomRequest } from '../../utils/customRequest';
import { errorResponse } from '../../utils/return';
import { AminityServices, CategoryService } from '../services';
import { Response } from 'express';
import { MasterAmenityInterceptor } from '../../multi-language/interceptors/masters/master-amenity.interceptor';

export class AminityController {
    private aminityServices: AminityServices;
    constructor() {
        this.aminityServices = new AminityServices();
    }
    public async createAminity(req: CustomRequest, res: Response) {
        try {
            const { amenities } = req.body;
            if (!amenities || amenities.length == 0) {
                return res.status(400).json(errorResponse('Aminity is empty'));
            }
            const serRes = await this.aminityServices.createCategory(amenities);
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
    public async getAmenities(req: CustomRequest, res: Response) {
        try {
            const type = req.query.type as string | 'property';
            const locale = req.headers['accept-language']?.slice(0, 2).toLowerCase() || 'en';

            let serRes = await this.aminityServices.getCategory(type);
            serRes = await MasterAmenityInterceptor.intercept(serRes as any, locale);

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
    public async deleteAmenities(req: CustomRequest, res: Response) {
        try {
            const { amenities } = req.body;
            if (!amenities) {
                return res
                    .status(400)
                    .json(errorResponse('Aminity is required to delete'));
            }
            const serRes = await this.aminityServices.deleteCategory(amenities);
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
}
