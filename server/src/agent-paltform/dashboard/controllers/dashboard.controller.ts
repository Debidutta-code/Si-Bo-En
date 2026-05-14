import { Response } from 'express';
import { errorResponse, successResponse } from '../../../utils/return';
import { AgentRequest } from '../../utils';
import { AgentDashboardService } from '../services';
import { IAgentDashboardFilters } from '../types';
import { BookingStatus } from '../../../reservation/types';

export class AgentDashboardController {
    private dashboardService: AgentDashboardService;

    constructor() {
        this.dashboardService = new AgentDashboardService();
    }

    public async getAnalytics(
        req: AgentRequest,
        res: Response
    ): Promise<Response> {
        try {
            const agencyId = req.agent?.agencyId;
            const agentId = req.agent?.id;

            if (!agencyId || !agentId) {
                return res
                    .status(401)
                    .json(
                        errorResponse(
                            'Unauthorized user',
                            'Agent not authenticated or agency not found'
                        )
                    );
            }
            // console.log('agencyId', agencyId, 'agentId', agentId);
            const filters: IAgentDashboardFilters = {};

            if (req.query.propertyId) {
                filters.propertyId = req.query.propertyId as string;
            }

            if (req.query.bookingStatus) {
                filters.bookingStatus = req.query
                    .bookingStatus as BookingStatus;
            }

            if (req.query.startDate) {
                filters.startDate = new Date(req.query.startDate as string);
            }

            if (req.query.endDate) {
                filters.endDate = new Date(req.query.endDate as string);
            }

            const result = await this.dashboardService.getAgencyAnalytics(
                agencyId,
                agentId,
                filters
            );

            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to fetch analytics',
                            error.message
                        )
                    );
            }
            return res.status(500).json(errorResponse('Internal Server Error'));
        }
    }

    public async getProperties(
        req: AgentRequest,
        res: Response
    ): Promise<Response> {
        try {
            const agencyId = req.agent?.agencyId;

            if (!agencyId) {
                return res
                    .status(401)
                    .json(
                        errorResponse(
                            'Unauthorized',
                            'Agent not authenticated or agency not found'
                        )
                    );
            }

            const result =
                await this.dashboardService.getAgencyProperties(agencyId);

            return res.status(result.success ? 200 : 400).json(result);
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
}
