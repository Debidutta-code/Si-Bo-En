import { errorResponse } from '../../utils/return';
import { CustomRequest } from '../../utils/customRequest';
import { Request, Response } from 'express';
import { ICAgency } from '../types';
import { AgencyService } from '../services';

export class AgencyController {
    private agencyService: AgencyService;

    constructor() {
        this.agencyService = new AgencyService();
    }

    public async getAgencies(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const { page, limit } = req.query;
            const pageNum = page ? Number(page) : 1;
            const limitNum = limit ? Number(limit) : 10;
            const result = await this.agencyService.getAgencies(
                pageNum,
                limitNum
            );
            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'failed to retrieve agencies',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Internal Server Error',
                        'failed to retrieve agencies'
                    )
                );
        }
    }

    public async createAgency(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const {
                agencyName,
                agencyType,
                agencyEmail,
                contactNo,
                taxNo,
                commissionType,
                commissionValue,
                commissionCurrency,
                iataCode,
                address,
            } = req.body;
            if (
                !agencyName ||
                !agencyType ||
                !agencyEmail ||
                !contactNo ||
                !taxNo ||
                !commissionType ||
                commissionValue === undefined ||
                !iataCode ||
                !address
            ) {
                return res
                    .status(400)
                    .json(errorResponse('All fields are required'));
            }
            const result = await this.agencyService.createAgency({
                agencyName,
                agencyType,
                agencyEmail,
                contactNo,
                taxNo,
                commissionType,
                commissionValue,
                commissionCurrency,
                iataCode,
                address,
            });
            return res.status(result.success ? 201 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse('failed to create agency', error.message)
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Internal Server Error',
                        'failed to create agency'
                    )
                );
        }
    }

    public async updateAgency(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const { agencyId } = req.params;
            const {
                agencyName,
                agencyType,
                agencyEmail,
                contactNo,
                taxNo,
                commissionType,
                commissionValue,
                commissionCurrency,
                iataCode,
                address,
            } = req.body;
            if (!agencyId) {
                return res
                    .status(400)
                    .json(errorResponse('Agency id is required'));
            }
            if (
                !agencyName ||
                !agencyType ||
                !agencyEmail ||
                !contactNo ||
                !taxNo ||
                !commissionType ||
                commissionValue === undefined ||
                !iataCode ||
                !address
            ) {
                return res
                    .status(400)
                    .json(errorResponse('All fields are required'));
            }
            const updateData: ICAgency = {
                agencyName,
                agencyType,
                agencyEmail,
                contactNo,
                taxNo,
                commissionType,
                commissionValue,
                commissionCurrency,
                iataCode,
                address,
            };
            const result = await this.agencyService.updateAgency(
                agencyId,
                updateData
            );
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse('failed to update agency', error.message)
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Internal Server Error',
                        'failed to update agency'
                    )
                );
        }
    }

    public async deleteAgency(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const { agencyId } = req.params;
            if (!agencyId) {
                return res
                    .status(400)
                    .json(errorResponse('Agency id is required'));
            }
            const result = await this.agencyService.deleteAgency(agencyId);
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse('failed to delete agency', error.message)
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Internal Server Error',
                        'failed to delete agency'
                    )
                );
        }
    }

    public async getAgencyById(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const { agencyId } = req.params;
            if (!agencyId) {
                return res
                    .status(400)
                    .json(errorResponse('Agency id is required'));
            }
            const result = await this.agencyService.getAgencyById(agencyId);
            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(errorResponse('failed to get agency', error.message));
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Internal Server Error',
                        'failed to get agency'
                    )
                );
        }
    }

    public async getReservationsForAgency(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const { agencyId } = req.params;
            const { page, limit } = req.query;
            if (!agencyId) {
                return res
                    .status(400)
                    .json(errorResponse('Agency id is required'));
            }
            const pageNum = page ? Number(page) : 1;
            const limitNum = limit ? Number(limit) : 10;
            const result = await this.agencyService.getReservationsForAgency(
                agencyId,
                pageNum,
                limitNum
            );
            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'failed to get reservations',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Internal Server Error',
                        'failed to get reservations'
                    )
                );
        }
    }
}
