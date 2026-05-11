import { errorResponse } from '../../utils/return';
import { CustomRequest } from '../../utils/customRequest';
import { Request, Response } from 'express';
import { AgencyApplicationStatus } from '../types';
import { AgencyApplicationService } from '../services';

export class AgencyApplicationController {
    private agencyApplicationService: AgencyApplicationService;

    constructor() {
        this.agencyApplicationService = new AgencyApplicationService();
    }

    public async createAgencyApplication(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const {
                applicantEmail,
                applicantName,
                applicantPhone,
                applicantPassword,
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

            // Validate required fields
            if (
                !applicantEmail ||
                !applicantName ||
                !applicantPhone ||
                !applicantPassword ||
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

            const result =
                await this.agencyApplicationService.createAgencyApplication({
                    applicantEmail,
                    applicantName,
                    applicantPhone,
                    applicantPassword,
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
                    applicationNoForThisUser: 1,
                    status: 'pending',
                });

            return res.status(result.success ? 201 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'failed to create agency application',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Internal Server Error',
                        'failed to create agency application'
                    )
                );
        }
    }

    public async updateApplicationStatus(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const { applicationId } = req.params;
            const { status, rejectionReason } = req.body;

            if (!applicationId) {
                return res
                    .status(400)
                    .json(errorResponse('Application id is required'));
            }

            if (!status) {
                return res
                    .status(400)
                    .json(errorResponse('Status is required'));
            }

            // Validate status enum
            if (!['pending', 'approved', 'rejected'].includes(status)) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Invalid status. Must be pending, approved, or rejected'
                        )
                    );
            }

            const result =
                await this.agencyApplicationService.updateApplicationStatus(
                    applicationId,
                    status as AgencyApplicationStatus,
                    rejectionReason
                );

            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'failed to update application status',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Internal Server Error',
                        'failed to update application status'
                    )
                );
        }
    }
    public async getApplications(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const { status, page, limit } = req.query;

            const result =
                await this.agencyApplicationService.getAgencyApplications(
                    status as AgencyApplicationStatus,
                    Number(page),
                    Number(limit)
                );

            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'failed to get applications',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Internal Server Error',
                        'failed to get applications'
                    )
                );
        }
    }
    public async getAgencyApplicationByName(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const { name } = req.params;

            if (!name) {
                return res.status(400).json(errorResponse('Name is required'));
            }

            const result =
                await this.agencyApplicationService.getAgencyApplicationByName(
                    name
                );

            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'failed to get application by name',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Internal Server Error',
                        'failed to get application by name'
                    )
                );
        }
    }
    public async getAgencyApplicationById(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json(errorResponse('Id is required'));
            }

            const result =
                await this.agencyApplicationService.getAgencyApplicationById(
                    id
                );

            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'failed to get application by id',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Internal Server Error',
                        'failed to get application by id'
                    )
                );
        }
    }
}
