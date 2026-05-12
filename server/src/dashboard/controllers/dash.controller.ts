import { DashBoardServices } from '../services';
import {
    CustomRequest,
    PropertyCustomRequest,
} from '../../utils/customRequest';
import { successResponse, errorResponse } from '../../utils/return';
import { Response } from 'express';
import { CurrencyCode } from '../../tax-system/interfaces';
export class DashBoardController {
    private dashboardServices: DashBoardServices;
    constructor() {
        this.dashboardServices = new DashBoardServices();
    }

    public async getPropertyNames(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            if (!req.user?.creationId || req.user.level === undefined) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'user is not Assigned to any creation',
                            'Creation Id Not found'
                        )
                    );
            }
            const serRes = await this.dashboardServices.getPropertyNames(
                req.user.creationId,
                req.user.level
            );
            return res.status(serRes.success ? 200 : 400).json(serRes);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to fetch Analytics',
                            error.message
                        )
                    );
            }
            return res.status(500).json(errorResponse('Internal Server Error'));
        }
    }
    public async getPropertyByCreationId(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const creationId = req.query.creationId as string;

            if (!creationId) {
                return res
                    .status(400)
                    .json(
                        errorResponse('creationId is required in query params')
                    );
            }

            const serRes =
                await this.dashboardServices.getPropertyNamesByCreationId(
                    creationId
                );
            return res.status(serRes.success ? 200 : 400).json(serRes);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to fetch properties',
                            error.message
                        )
                    );
            }
            return res.status(500).json(errorResponse('Internal Server Error'));
        }
    }
    public async getAnalytics(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            if (!req.user?.creationId || req.user.level === undefined) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'user is not Assigned to any creation',
                            'Creation Id Not found'
                        )
                    );
            }
            const { propertyId, propertyCode, propertyName, selectedCurrency } =
                req.query; // ← add currencyCode
            const serRes =
                await this.dashboardServices.getPropertyIdsAndCodesServices(
                    req.user.creationId,
                    req.user.level,
                    propertyId?.toString(),
                    propertyCode?.toString(),
                    propertyName?.toString(),
                    selectedCurrency as CurrencyCode
                );
            return res.status(serRes.success ? 200 : 400).json(serRes);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to fetch Analytics',
                            error.message
                        )
                    );
            }
            return res.status(500).json(errorResponse('Internal Server Error'));
        }
    }

    public async getStatisticsComparison(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            if (!req.user?.creationId || req.user.level === undefined) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'User is not assigned to any creation',
                            'Creation ID not found'
                        )
                    );
            }
            const {
                comparisonType = 'date',
                selectedDate = new Date().toISOString(),
                propertyId,
                propertyCode,
                propertyName,
                selectedCurrency,
            } = req.query;

            if (!['date', 'month', 'year'].includes(comparisonType as string)) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Invalid comparison type',
                            "Must be 'date', 'month', or 'year'"
                        )
                    );
            }

            const serRes =
                await this.dashboardServices.getStatisticsComparisonServices(
                    req.user.creationId,
                    req.user.level,
                    comparisonType as 'date' | 'month' | 'year',
                    new Date(selectedDate as string),
                    propertyId?.toString(),
                    propertyCode?.toString(),
                    propertyName?.toString(),
                    selectedCurrency as CurrencyCode
                );

            return res.status(serRes.success ? 200 : 400).json(serRes);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to fetch statistics comparison',
                            error.message
                        )
                    );
            }
            return res.status(500).json(errorResponse('Internal Server Error'));
        }
    }
}
