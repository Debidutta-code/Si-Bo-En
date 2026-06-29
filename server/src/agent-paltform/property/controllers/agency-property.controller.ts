import { AgentRequest } from '../../utils';
import { errorResponse } from '../../../utils';
import { Response } from 'express';
import { AgencyPropertyService } from '../services';
export class AgenticPropertyController {
    private agencyPropertyService: AgencyPropertyService;

    constructor() {
        this.agencyPropertyService = new AgencyPropertyService();
    }

public async getProperties(
    req: AgentRequest,
    res: Response
): Promise<Response> {
    try {
        const agencyId = req.agent?.agencyId;
        if (!agencyId) {
            return res
                .status(400)
                .json(
                    errorResponse(
                        'Agency not found',
                        'agent is not assigned or unauthorized'
                    )
                );
        }

        const location = req.query.location as string | undefined;
        const country = req.query.country as string | undefined;

        const properties =
            await this.agencyPropertyService.getAgenticProperties(
                agencyId,
                location,
                country
            );

        return res.status(properties.success ? 200 : 400).json(properties);
    } catch (error) {
        if (error instanceof Error) {
            return res
                .status(500)
                .json(errorResponse('Internal Server Error', error.message));
        }
        return res
            .status(500)
            .json(
                errorResponse(
                    'Internal Server Error',
                    'An unexpected error occurred'
                )
            );
    }
}

}