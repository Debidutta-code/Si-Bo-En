// group-search.controller.ts

import { Request, Response } from 'express';
import { errorResponse, IApiResponse } from '../../utils';
import { GroupSearchService } from '../service';
import { IGroupSearchQuery } from '../types';
import { GroupSearchInterceptor } from '../../multi-language/interceptors/booking-engine/group-search.interceptor';

export class GroupSearchController {
    private groupSearchService: GroupSearchService;

    constructor() {
        this.groupSearchService = new GroupSearchService();
    }

    // POST /:groupId
    public async getPropertiesByGroup(
        req: Request,
        res: Response
    ): Promise<Response<IApiResponse>> {
        try {
            const { groupId } = req.params;
            if (!groupId) {
                return res
                    .status(400)
                    .json(errorResponse('groupId is required'));
            }

            const body: IGroupSearchQuery = req.body;
            if (!body.startDate || !body.endDate || !body.guests) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'startDate, endDate and guests are required'
                        )
                    );
            }

            const locale = req.headers['accept-language']?.slice(0, 2) || 'en';
            let result = await this.groupSearchService.getPropertiesByGroup(
                groupId,
                body
            );
            result = await GroupSearchInterceptor.intercept(result, locale);
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to get properties',
                        error instanceof Error ? error.message : 'Unknown error'
                    )
                );
        }
    }



    // POST /brand/:brandId
    public async getPropertiesByBrand(
        req: Request,
        res: Response
    ): Promise<Response<IApiResponse>> {
        try {
            const { brandId } = req.params;
            if (!brandId) {
                return res
                    .status(400)
                    .json(errorResponse('brandId is required'));
            }

            const body: IGroupSearchQuery = req.body;
            if (!body.startDate || !body.endDate || !body.guests) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'startDate, endDate and guests are required'
                        )
                    );
            }

            const locale = req.headers['accept-language']?.slice(0, 2) || 'en';
            let result = await this.groupSearchService.getPropertiesByBrand(
                brandId,
                body
            );
            result = await GroupSearchInterceptor.intercept(result, locale);
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to get properties',
                        error instanceof Error ? error.message : 'Unknown error'
                    )
                );
        }
    }
        // GET /brand
    // GET /:groupId/brands
    public async getBrandsByGroup(
        req: Request,
        res: Response
    ): Promise<Response<IApiResponse>> {
        try {
            const { groupId } = req.params; // ← from path now, not query
            if (!groupId) {
                return res
                    .status(400)
                    .json(errorResponse('groupId is required'));
            }

            const result =
                await this.groupSearchService.getBrandsByGroup(groupId);
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to get brands',
                        error instanceof Error ? error.message : 'Unknown error'
                    )
                );
        }
    }
}
